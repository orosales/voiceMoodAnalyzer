from fastapi import FastAPI, File, UploadFile, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import tempfile
import os
from pathlib import Path
from typing import List, Optional

from core.config import get_settings
from core.database import get_db, init_db
from core.schemas import MoodAnalysisResponse, AnalysisHistoryResponse, FusionMatrixResponse
from models.voice_analysis import VoiceAnalysis
from models.voice_matrix import VoiceMatrix
from services.whisper_local_service import get_whisper_service
from services.audio_emotion import get_audio_emotion_service
from services.text_emotion import get_text_emotion_service
from services.fusion_service import FusionService

# Initialize app
app = FastAPI(
    title="VoiceMoodAnalyzer API",
    description="AI-powered voice mood analysis using Whisper and Hugging Face",
    version="1.0.0"
)

settings = get_settings()

# CORS configuration for mobile/web access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services (lazy-loaded on first use)
# whisper_service loaded via get_whisper_service() singleton


@app.on_event("startup")
async def startup_event():
    """Initialize database and models on startup."""
    init_db()
    # Preload ML models
    get_audio_emotion_service()
    get_text_emotion_service()
    # Faster-whisper model loads on first use (lazy loading)


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "online",
        "service": "VoiceMoodAnalyzer API",
        "version": "1.0.0"
    }


@app.post("/api/analyze", response_model=MoodAnalysisResponse)
async def analyze_voice(
    file: UploadFile = File(...),
    transcribed_text: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Analyze uploaded audio file for mood detection.

    Process:
    1. Transcribe audio using local faster-whisper (much faster than OpenAI API)
    2. Detect emotion from audio using Wav2Vec2
    3. Detect emotion from text using DistilRoBERTa
    4. Fuse emotions using fusion matrix
    5. Save results to database
    6. Return mood analysis

    Args:
        file: Audio file to analyze
        transcribed_text: Optional pre-transcribed text (deprecated, kept for backward compatibility)
        db: Database session
    """
    temp_file_path = None
    import time

    try:
        # Validate file size
        file_size = 0
        chunk_size = 1024 * 1024  # 1MB chunks
        temp_data = []

        while chunk := await file.read(chunk_size):
            file_size += len(chunk)
            if file_size > settings.MAX_UPLOAD_SIZE:
                raise HTTPException(
                    status_code=413,
                    detail=f"File too large. Maximum size is {settings.MAX_UPLOAD_SIZE / (1024*1024)}MB"
                )
            temp_data.append(chunk)

        # Validate file extension
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in settings.ALLOWED_AUDIO_FORMATS:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file format. Allowed formats: {', '.join(settings.ALLOWED_AUDIO_FORMATS)}"
            )

        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as temp_file:
            for chunk in temp_data:
                temp_file.write(chunk)
            temp_file_path = temp_file.name

        # Step 1: Transcribe audio using local faster-whisper
        start_time = time.time()
        print("[INFO] Transcribing audio using local faster-whisper (tiny model)...")
        whisper_service = get_whisper_service()
        text = await whisper_service.transcribe_audio(temp_file_path)
        whisper_time = time.time() - start_time
        print(f"[TIMING] Whisper transcription took: {whisper_time:.2f}s")

        if not text:
            raise HTTPException(
                status_code=400,
                detail="No speech detected in audio file"
            )

        # Step 2: Detect emotion from audio (skip for long recordings to save time)
        start_time = time.time()

        # Check audio duration using torchaudio
        import torchaudio
        waveform, sample_rate = torchaudio.load(temp_file_path)
        duration_seconds = waveform.shape[1] / sample_rate

        # Skip audio emotion for recordings longer than 15 seconds (saves ~15-20s)
        if duration_seconds > 15:
            print(f"[INFO] Audio duration: {duration_seconds:.1f}s - Skipping audio emotion detection (too slow for long recordings)")
            audio_emotion = "neutral"  # Default to neutral for fusion matrix
            audio_confidence = 0.0
            audio_time = time.time() - start_time
            print(f"[TIMING] Audio emotion detection skipped (duration > 10s)")
        else:
            print(f"[INFO] Audio duration: {duration_seconds:.1f}s - Running audio emotion detection")
            audio_emotion_service = get_audio_emotion_service()
            audio_emotion, audio_confidence = await audio_emotion_service.detect_emotion(temp_file_path)
            audio_time = time.time() - start_time
            print(f"[TIMING] Audio emotion detection took: {audio_time:.2f}s")

        # Step 3: Detect emotion from transcribed text
        start_time = time.time()
        text_emotion_service = get_text_emotion_service()
        text_emotion, text_confidence = await text_emotion_service.detect_emotion(text)
        text_time = time.time() - start_time
        print(f"[TIMING] Text emotion detection took: {text_time:.2f}s")

        # Step 4: Fuse emotions using fusion matrix
        fusion_result = FusionService.get_final_mood(
            db=db,
            audio_emotion=audio_emotion,
            text_emotion=text_emotion
        )

        # Step 5: Save to database
        analysis = VoiceAnalysis(
            transcribed_text=text,
            audio_emotion=audio_emotion,
            audio_confidence=audio_confidence,
            text_emotion=text_emotion,
            text_confidence=text_confidence,
            final_mood=fusion_result["final_mood"],
            emoji=fusion_result["emoji"],
            description=fusion_result["description"]
        )

        db.add(analysis)
        db.commit()
        db.refresh(analysis)

        # Step 6: Return response
        return MoodAnalysisResponse(
            transcribed_text=text,
            audio_emotion=audio_emotion,
            audio_confidence=audio_confidence,
            text_emotion=text_emotion,
            text_confidence=text_confidence,
            final_mood=fusion_result["final_mood"],
            emoji=fusion_result["emoji"],
            description=fusion_result["description"]
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

    finally:
        # Clean up temporary file
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
            except Exception:
                pass


@app.get("/api/history", response_model=List[AnalysisHistoryResponse])
async def get_history(
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get analysis history (most recent first)."""
    analyses = db.query(VoiceAnalysis)\
        .order_by(VoiceAnalysis.created_at.desc())\
        .limit(limit)\
        .all()

    return analyses


@app.get("/api/matrix", response_model=List[FusionMatrixResponse])
async def get_fusion_matrix(db: Session = Depends(get_db)):
    """Get all fusion matrix entries."""
    entries = FusionService.get_all_matrix_entries(db)
    return entries


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=settings.BACKEND_PORT)

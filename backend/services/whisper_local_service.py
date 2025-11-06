from pathlib import Path
from faster_whisper import WhisperModel
import os


class WhisperLocalService:
    """Service for transcribing audio using local faster-whisper (whisper.cpp based)."""

    def __init__(self, model_size: str = "tiny"):
        """
        Initialize faster-whisper service.

        Args:
            model_size: Model size to use (tiny, base, small, medium, large-v3)
                       Default: tiny (~75MB, 32x realtime speed, good accuracy for short audios)
        """
        self.model_size = model_size
        self.model = None
        self._model_dir = Path.home() / ".cache" / "faster_whisper_models"
        self._model_dir.mkdir(parents=True, exist_ok=True)

    def _ensure_model_loaded(self):
        """Lazy load the whisper model on first use."""
        if self.model is None:
            print(f"Loading faster-whisper model: {self.model_size}...")
            # WhisperModel will auto-download model from Hugging Face if not exists
            # device="cpu" for CPU-only systems, change to "cuda" for GPU
            # compute_type="int8" for faster inference on CPU
            # num_workers=1 to minimize overhead for short audios
            self.model = WhisperModel(
                self.model_size,
                device="cpu",
                compute_type="int8",
                download_root=str(self._model_dir),
                num_workers=1  # Reduce worker overhead for short audios
            )
            print(f"Faster-whisper model '{self.model_size}' loaded successfully!")

    async def transcribe_audio(self, audio_path: str) -> str:
        """
        Transcribe audio file using local faster-whisper.

        Args:
            audio_path: Path to the audio file

        Returns:
            Transcribed text

        Raises:
            Exception: If transcription fails
        """
        try:
            # Ensure model is loaded
            self._ensure_model_loaded()

            # Transcribe using faster-whisper
            # Optimized for speed with short audios:
            # - beam_size=1: Greedy decoding (much faster than beam_size=5)
            # - vad_filter=False: Skip VAD overhead for short audios
            # - best_of=1: Single candidate (fastest)
            # - temperature=0: Deterministic output (no sampling)
            segments, info = self.model.transcribe(
                audio_path,
                beam_size=1,          # Greedy decoding for speed
                best_of=1,            # Single best candidate
                temperature=0,        # No sampling
                vad_filter=False,     # Skip VAD for short audios
                language="en",        # English for faster processing
                condition_on_previous_text=False  # Don't condition on history
            )

            # Collect all segments into a single string
            transcript_parts = []
            for segment in segments:
                transcript_parts.append(segment.text)

            transcript = " ".join(transcript_parts).strip()

            if not transcript:
                raise Exception("No speech detected in audio file")

            print(f"Transcription completed: {transcript[:100]}..." if len(transcript) > 100 else f"Transcription: {transcript}")
            return transcript

        except Exception as e:
            raise Exception(f"Faster-whisper transcription failed: {str(e)}")


# Global singleton instance
_whisper_service_instance = None


def get_whisper_service() -> WhisperLocalService:
    """
    Get singleton instance of WhisperLocalService.

    Returns:
        Singleton WhisperLocalService instance
    """
    global _whisper_service_instance
    if _whisper_service_instance is None:
        # Use "tiny" model for fast transcription of short audios (5-30 seconds)
        # Change to "base" or "small" if you need better accuracy
        _whisper_service_instance = WhisperLocalService(model_size="tiny")
    return _whisper_service_instance

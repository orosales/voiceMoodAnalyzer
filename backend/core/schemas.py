from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class MoodAnalysisResponse(BaseModel):
    """Response schema for mood analysis."""
    transcribed_text: str
    audio_emotion: str
    audio_confidence: float
    text_emotion: str
    text_confidence: float
    final_mood: str
    emoji: str
    description: str


class AnalysisHistoryResponse(BaseModel):
    """Response schema for analysis history."""
    id: int
    created_at: datetime
    transcribed_text: str
    audio_emotion: str
    audio_confidence: float
    text_emotion: str
    text_confidence: float
    final_mood: str
    emoji: str
    description: str

    class Config:
        from_attributes = True


class FusionMatrixResponse(BaseModel):
    """Response schema for fusion matrix entry."""
    id: int
    audio_emotion: str
    text_emotion: str
    final_mood: str
    emoji: str
    description: str

    class Config:
        from_attributes = True

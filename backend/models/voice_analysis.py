from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.sql import func
from core.database import Base


class VoiceAnalysis(Base):
    """Store individual voice mood analysis results."""
    __tablename__ = "voice_analysis"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    transcribed_text = Column(Text, nullable=False)
    audio_emotion = Column(String(50), nullable=False)
    audio_confidence = Column(Float, nullable=False)
    text_emotion = Column(String(50), nullable=False)
    text_confidence = Column(Float, nullable=False)
    final_mood = Column(String(100), nullable=False)
    emoji = Column(String(10), nullable=False)
    description = Column(Text, nullable=True)

    def __repr__(self):
        return f"<VoiceAnalysis(id={self.id}, mood={self.final_mood}, created={self.created_at})>"

from sqlalchemy import Column, Integer, String, Text
from core.database import Base


class VoiceMatrix(Base):
    """Fusion matrix mapping audio + text emotions to final mood."""
    __tablename__ = "voice_matrix"

    id = Column(Integer, primary_key=True, index=True)
    audio_emotion = Column(String(50), nullable=False, index=True)
    text_emotion = Column(String(50), nullable=False, index=True)
    final_mood = Column(String(100), nullable=False)
    emoji = Column(String(10), nullable=False)
    description = Column(Text, nullable=True)

    def __repr__(self):
        return f"<VoiceMatrix(audio={self.audio_emotion}, text={self.text_emotion}, mood={self.final_mood})>"

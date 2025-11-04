from sqlalchemy.orm import Session
from models.voice_matrix import VoiceMatrix
from typing import Dict, Optional


class FusionService:
    """Service for fusing audio and text emotions using the fusion matrix."""

    @staticmethod
    def get_final_mood(
        db: Session,
        audio_emotion: str,
        text_emotion: str
    ) -> Dict[str, str]:
        """
        Get final mood by looking up fusion matrix.

        Args:
            db: Database session
            audio_emotion: Emotion detected from audio
            text_emotion: Emotion detected from text

        Returns:
            Dictionary with final_mood, emoji, and description

        Raises:
            Exception: If lookup fails
        """
        try:
            # Normalize emotions to lowercase
            audio_emotion = audio_emotion.lower()
            text_emotion = text_emotion.lower()

            # Look up in fusion matrix
            matrix_entry = db.query(VoiceMatrix).filter(
                VoiceMatrix.audio_emotion == audio_emotion,
                VoiceMatrix.text_emotion == text_emotion
            ).first()

            if matrix_entry:
                return {
                    "final_mood": matrix_entry.final_mood,
                    "emoji": matrix_entry.emoji,
                    "description": matrix_entry.description or ""
                }

            # Fallback: if no exact match, try with both as neutral
            matrix_entry = db.query(VoiceMatrix).filter(
                VoiceMatrix.audio_emotion == "neutral",
                VoiceMatrix.text_emotion == "neutral"
            ).first()

            if matrix_entry:
                return {
                    "final_mood": matrix_entry.final_mood,
                    "emoji": matrix_entry.emoji,
                    "description": "No exact match found, defaulting to neutral mood."
                }

            # Ultimate fallback
            return {
                "final_mood": "Unknown",
                "emoji": "😐",
                "description": "Unable to determine mood from fusion matrix."
            }

        except Exception as e:
            raise Exception(f"Fusion matrix lookup failed: {str(e)}")

    @staticmethod
    def get_all_matrix_entries(db: Session):
        """Get all fusion matrix entries."""
        return db.query(VoiceMatrix).all()

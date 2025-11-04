from openai import OpenAI
from pathlib import Path
from core.config import get_settings

settings = get_settings()


class WhisperService:
    """Service for transcribing audio using OpenAI Whisper API."""

    def __init__(self):
        """Initialize OpenAI client."""
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)

    async def transcribe_audio(self, audio_path: str) -> str:
        """
        Transcribe audio file using OpenAI Whisper API.

        Args:
            audio_path: Path to the audio file

        Returns:
            Transcribed text

        Raises:
            Exception: If transcription fails
        """
        try:
            with open(audio_path, "rb") as audio_file:
                transcript = self.client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    response_format="text"
                )

            return transcript.strip() if isinstance(transcript, str) else transcript

        except Exception as e:
            raise Exception(f"Whisper transcription failed: {str(e)}")

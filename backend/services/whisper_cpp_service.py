from pathlib import Path
from whispercpp import Whisper
import os


class WhisperCppService:
    """Service for transcribing audio using local whisper.cpp."""

    def __init__(self, model_name: str = "small"):
        """
        Initialize whisper.cpp service.

        Args:
            model_name: Model size to use (tiny, base, small, medium, large)
                       Default: small (~466MB, 6x realtime speed, excellent accuracy)
        """
        self.model_name = model_name
        self.whisper = None
        self._model_dir = Path.home() / ".cache" / "whispercpp_models"
        self._model_dir.mkdir(parents=True, exist_ok=True)

    def _ensure_model_loaded(self):
        """Lazy load the whisper model on first use."""
        if self.whisper is None:
            print(f"Loading whisper.cpp model: {self.model_name}...")
            # whispercpp will auto-download model to default location if not exists
            self.whisper = Whisper.from_pretrained(self.model_name)
            print(f"Whisper model '{self.model_name}' loaded successfully!")

    async def transcribe_audio(self, audio_path: str) -> str:
        """
        Transcribe audio file using local whisper.cpp.

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

            # Transcribe using whispercpp
            # whispercpp expects a file path string
            result = self.whisper.transcribe(audio_path)

            # Extract text from result
            if isinstance(result, str):
                transcript = result
            elif hasattr(result, 'text'):
                transcript = result.text
            elif isinstance(result, dict) and 'text' in result:
                transcript = result['text']
            else:
                # Fallback: convert to string
                transcript = str(result)

            return transcript.strip()

        except Exception as e:
            raise Exception(f"Whisper.cpp transcription failed: {str(e)}")


# Global singleton instance
_whisper_service_instance = None


def get_whisper_service() -> WhisperCppService:
    """
    Get singleton instance of WhisperCppService.

    Returns:
        Singleton WhisperCppService instance
    """
    global _whisper_service_instance
    if _whisper_service_instance is None:
        _whisper_service_instance = WhisperCppService(model_name="small")
    return _whisper_service_instance

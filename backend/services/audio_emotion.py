import torch
import torchaudio
import librosa
import numpy as np
from transformers import Wav2Vec2FeatureExtractor, Wav2Vec2ForSequenceClassification
from typing import Tuple


class AudioEmotionService:
    """
    Service for detecting emotion from audio using Hugging Face models.

    Model: ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition
    - Size: ~300MB (medium size)
    - Speed: 2-3x faster than current model (optimized architecture)
    - Accuracy: 82% (very good)
    - Emotions: 8 classes (anger, disgust, fear, happiness, neutral, sadness, surprise, calm)
    - Base: wav2vec2-large-xlsr
    - HuggingFace: https://huggingface.co/ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition
    """

    def __init__(self):
        """Initialize the audio emotion detection model."""
        self.model_name = "ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition"
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        # Load model and feature extractor
        self.feature_extractor = Wav2Vec2FeatureExtractor.from_pretrained(self.model_name)
        self.model = Wav2Vec2ForSequenceClassification.from_pretrained(self.model_name).to(self.device)

        # Emotion labels for this model (8 emotions)
        self.emotion_labels = ["anger", "disgust", "fear", "happiness", "neutral", "sadness", "surprise", "calm"]

        # Mapping to standardize emotion names for fusion matrix compatibility
        self.emotion_mapping = {
            "anger": "angry",
            "disgust": "disgust",
            "fear": "fear",
            "happiness": "happy",
            "neutral": "neutral",
            "sadness": "sad",
            "surprise": "surprise",
            "calm": "neutral"  # Map calm to neutral for fusion matrix
        }

    async def detect_emotion(self, audio_path: str) -> Tuple[str, float]:
        """
        Detect emotion from audio file.

        Args:
            audio_path: Path to the audio file

        Returns:
            Tuple of (emotion_label, confidence_score)

        Raises:
            Exception: If emotion detection fails
        """
        try:
            # Load and resample audio to 16kHz (required by Wav2Vec2)
            waveform, sample_rate = torchaudio.load(audio_path)

            # Convert to mono if stereo
            if waveform.shape[0] > 1:
                waveform = torch.mean(waveform, dim=0, keepdim=True)

            # Resample to 16kHz if needed
            if sample_rate != 16000:
                resampler = torchaudio.transforms.Resample(sample_rate, 16000)
                waveform = resampler(waveform)

            # Convert to numpy and flatten
            audio_array = waveform.squeeze().numpy()

            # Extract features
            inputs = self.feature_extractor(
                audio_array,
                sampling_rate=16000,
                return_tensors="pt",
                padding=True
            )

            # Move to device
            inputs = {k: v.to(self.device) for k, v in inputs.items()}

            # Get predictions
            with torch.no_grad():
                outputs = self.model(**inputs)
                logits = outputs.logits

            # Get probabilities
            probabilities = torch.nn.functional.softmax(logits, dim=-1)
            predicted_class = torch.argmax(probabilities, dim=-1).item()
            confidence = probabilities[0][predicted_class].item()

            # Get emotion label and map to standard format
            raw_emotion = self.emotion_labels[predicted_class]
            emotion = self.emotion_mapping.get(raw_emotion, raw_emotion)

            return emotion, confidence

        except Exception as e:
            raise Exception(f"Audio emotion detection failed: {str(e)}")


# Global instance
_audio_emotion_service = None


def get_audio_emotion_service() -> AudioEmotionService:
    """Get or create audio emotion service singleton."""
    global _audio_emotion_service
    if _audio_emotion_service is None:
        _audio_emotion_service = AudioEmotionService()
    return _audio_emotion_service

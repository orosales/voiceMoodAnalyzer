import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from typing import Tuple


class TextEmotionService:
    """Service for detecting emotion from text using Hugging Face models."""

    def __init__(self):
        """Initialize the text emotion detection model."""
        self.model_name = "j-hartmann/emotion-english-distilroberta-base"
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        # Load model and tokenizer
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        self.model = AutoModelForSequenceClassification.from_pretrained(self.model_name).to(self.device)

        # Emotion labels for this model
        self.emotion_labels = ["anger", "disgust", "fear", "joy", "neutral", "sadness", "surprise"]

        # Map to simplified emotions
        self.emotion_mapping = {
            "anger": "angry",
            "disgust": "disgusted",
            "fear": "fearful",
            "joy": "happy",
            "neutral": "neutral",
            "sadness": "sad",
            "surprise": "surprised"
        }

    async def detect_emotion(self, text: str) -> Tuple[str, float]:
        """
        Detect emotion from text.

        Args:
            text: Input text to analyze

        Returns:
            Tuple of (emotion_label, confidence_score)

        Raises:
            Exception: If emotion detection fails
        """
        try:
            if not text or not text.strip():
                return "neutral", 1.0

            # Tokenize input
            inputs = self.tokenizer(
                text,
                return_tensors="pt",
                truncation=True,
                max_length=512,
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

            # Get emotion label
            raw_emotion = self.emotion_labels[predicted_class]
            emotion = self.emotion_mapping.get(raw_emotion, raw_emotion)

            return emotion, confidence

        except Exception as e:
            raise Exception(f"Text emotion detection failed: {str(e)}")


# Global instance
_text_emotion_service = None


def get_text_emotion_service() -> TextEmotionService:
    """Get or create text emotion service singleton."""
    global _text_emotion_service
    if _text_emotion_service is None:
        _text_emotion_service = TextEmotionService()
    return _text_emotion_service

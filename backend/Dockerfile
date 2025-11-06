FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies including curl for healthcheck
RUN apt-get update && apt-get install -y \
    build-essential \
    libsndfile1 \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . /app

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV HF_HOME=/app/.cache/huggingface
ENV TRANSFORMERS_CACHE=/app/.cache/transformers
ENV HOME=/app

# Create cache directory with proper permissions (includes whisper.cpp models)
RUN mkdir -p /app/.cache/huggingface /app/.cache/transformers /app/.cache/whispercpp_models && \
    chmod -R 755 /app/.cache

# Pre-download ML models to bake them into the image
# This increases image size (~3.5GB) but reduces startup time from 15min to <30s
RUN python -c "\
from transformers import Wav2Vec2ForSequenceClassification, Wav2Vec2FeatureExtractor, \
    AutoTokenizer, AutoModelForSequenceClassification; \
from whispercpp import Whisper; \
print('Downloading audio emotion model...'); \
audio_model = Wav2Vec2ForSequenceClassification.from_pretrained('r-f/wav2vec-english-speech-emotion-recognition'); \
audio_extractor = Wav2Vec2FeatureExtractor.from_pretrained('r-f/wav2vec-english-speech-emotion-recognition'); \
print('Downloading text emotion model...'); \
text_tokenizer = AutoTokenizer.from_pretrained('j-hartmann/emotion-english-distilroberta-base'); \
text_model = AutoModelForSequenceClassification.from_pretrained('j-hartmann/emotion-english-distilroberta-base'); \
print('Downloading whisper.cpp small model (~466MB)...'); \
whisper = Whisper('small'); \
print('All models downloaded successfully!')"

# Expose port
EXPOSE 8000

# Health check using curl instead of Python
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8000/ || exit 1

# Run the application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]

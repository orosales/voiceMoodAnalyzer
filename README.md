# VoiceMoodAnalyzer

A production-ready, Dockerized voice mood analysis system that combines OpenAI Whisper for speech transcription with Hugging Face emotion detection models to determine the emotional state of speakers.

## Features

- **Speech Transcription**: OpenAI Whisper API for accurate speech-to-text conversion
- **Audio Emotion Detection**: High-accuracy Wav2Vec2 model (97.5% accuracy) for detecting emotion from voice tone
  - Model: `r-f/wav2vec-english-speech-emotion-recognition`
  - 7 emotions: angry, disgust, fear, happy, neutral, sad, surprise
- **Text Emotion Analysis**: DistilRoBERTa model for analyzing sentiment from transcribed text
- **Emotion Fusion**: Advanced fusion matrix combining audio and text emotions for accurate mood detection
- **Mobile-Friendly UI**: Responsive React interface with audio recording and file upload
- **Real-time Analysis**: Fast processing pipeline with live results
- **Cloud-Ready**: Fully containerized with Docker for easy Azure VM deployment
- **Database Persistence**: PostgreSQL storage for analysis history and fusion matrix

## Architecture

```
┌─────────────────┐
│  React Frontend │  (Mobile-friendly UI with recording/upload)
│   (Port 80)     │  [Docker Container]
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Nginx Reverse  │  (Static serving + API proxy)
│     Proxy       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ FastAPI Backend │  (Python 3.11)
│   (Port 8000)   │  [Docker Container]
│                 │
│  ┌───────────┐  │
│  │  Whisper  │  │  → OpenAI Cloud API
│  │  Service  │  │
│  └───────────┘  │
│                 │
│  ┌───────────┐  │
│  │   Audio   │  │  → Wav2Vec2 (local, 97.5% accuracy)
│  │  Emotion  │  │     7 emotions: angry, disgust, fear,
│  └───────────┘  │     happy, neutral, sad, surprise
│                 │
│  ┌───────────┐  │
│  │   Text    │  │  → DistilRoBERTa (local)
│  │  Emotion  │  │
│  └───────────┘  │
│                 │
│  ┌───────────┐  │
│  │  Fusion   │  │
│  │  Matrix   │  │
│  └───────────┘  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   PostgreSQL    │  (voice_matrix, voice_analysis)
│   (Port 5436)   │  [Existing on Host - NOT in Docker]
└─────────────────┘
```

## Technology Stack

### Backend
- **FastAPI**: Modern async Python web framework
- **OpenAI Whisper API**: Cloud-based speech recognition
- **Hugging Face Transformers**:
  - **Audio Emotion**: `r-f/wav2vec-english-speech-emotion-recognition` (97.5% accuracy)
    - Fine-tuned Wav2Vec2 model trained on 4,720 samples (SAVEE, RAVDESS, TESS datasets)
    - Detects 7 emotions: angry, disgust, fear, happy, neutral, sad, surprise
  - **Text Emotion**: `j-hartmann/emotion-english-distilroberta-base`
    - Detects 7 emotions: anger, disgust, fear, joy, neutral, sadness, surprise
- **PostgreSQL**: Relational database with SQLAlchemy ORM
- **PyTorch**: Deep learning framework for model inference

### Frontend
- **React 18**: Modern UI library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **TailwindCSS**: Utility-first CSS framework
- **Axios**: HTTP client for API calls
- **MediaRecorder API**: Browser audio recording

### Infrastructure
- **Docker & Docker Compose**: Container orchestration
- **Nginx**: Reverse proxy and static file serving
- **PostgreSQL 15**: Production database

## Prerequisites

- Docker and Docker Compose installed
- **PostgreSQL database** running on localhost:5436 (database: `mito_books`)
- OpenAI API key (for Whisper transcription)
- Minimum 4GB RAM (for running ML models)
- 10GB free disk space (for Docker images and models)

## Quick Start

### 1. Clone the Repository

```bash
cd voice-mood-analyzer
```

### 2. Configure Environment

Edit the `.env` file and add your OpenAI API key:

```env
# Database Configuration (already set to match your specs)
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=mito_books
POSTGRES_USER=postgres
POSTGRES_PASSWORD=123

# OpenAI Configuration
OPENAI_API_KEY=your_actual_openai_api_key_here

# Application Configuration
BACKEND_PORT=8000
FRONTEND_PORT=80
ENVIRONMENT=production
```

### 3. Build and Start Services

```bash
# Build and start all containers
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

This will:
- Build the FastAPI backend container (connects to your existing PostgreSQL)
- Build the React frontend container
- Download Hugging Face models (first run only, ~2GB)

**Note**: Ensure your PostgreSQL database has the required tables. Run the initialization scripts manually:
```bash
psql -h localhost -p 5436 -U postgres -d mito_books -f db/init/01-init-tables.sql
psql -h localhost -p 5436 -U postgres -d mito_books -f db/init/02-seed-fusion-matrix.sql
```

### 4. Access the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **PostgreSQL**: localhost:5436

## Usage

### Web Interface

1. Open http://localhost in your browser
2. **Option A - Record Audio**:
   - Click "Start Recording"
   - Speak into your microphone
   - Click "Stop Recording"
   - Wait for analysis results

3. **Option B - Upload Audio**:
   - Click "Choose Audio File"
   - Select an audio file (WAV, MP3, M4A, OGG, FLAC, WebM)
   - Wait for analysis results

4. View the results:
   - Final mood with emoji
   - Transcribed text
   - Audio emotion + confidence
   - Text emotion + confidence

### API Endpoints

#### Analyze Audio
```bash
curl -X POST http://localhost:8000/api/analyze \
  -F "file=@/path/to/audio.mp3"
```

Response:
```json
{
  "transcribed_text": "I am so happy today!",
  "audio_emotion": "happy",
  "audio_confidence": 0.92,
  "text_emotion": "joy",
  "text_confidence": 0.95,
  "final_mood": "Very Happy & Joyful",
  "emoji": "😄",
  "description": "The speaker is genuinely happy in both tone and words."
}
```

#### Get Analysis History
```bash
curl http://localhost:8000/api/history?limit=10
```

#### Get Fusion Matrix
```bash
curl http://localhost:8000/api/matrix
```

## Database Schema

### voice_matrix
Fusion matrix mapping audio + text emotions to final mood.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| audio_emotion | VARCHAR(50) | Emotion from audio (e.g., "happy", "sad") |
| text_emotion | VARCHAR(50) | Emotion from text (e.g., "joy", "anger") |
| final_mood | VARCHAR(100) | Fused mood result |
| emoji | VARCHAR(10) | Mood emoji |
| description | TEXT | Mood description |

### voice_analysis
Historical record of all voice analyses.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| created_at | TIMESTAMP | Analysis timestamp |
| transcribed_text | TEXT | Whisper transcription |
| audio_emotion | VARCHAR(50) | Detected audio emotion |
| audio_confidence | FLOAT | Audio confidence score |
| text_emotion | VARCHAR(50) | Detected text emotion |
| text_confidence | FLOAT | Text confidence score |
| final_mood | VARCHAR(100) | Final fused mood |
| emoji | VARCHAR(10) | Mood emoji |
| description | TEXT | Mood description |

## Deploying to Azure VM

### 1. Provision Azure VM

```bash
# Create Ubuntu 22.04 VM with at least:
# - 4 vCPUs
# - 8GB RAM
# - 50GB SSD
# - Open ports: 80, 443, 8000 (optional)
```

### 2. Install Docker

```bash
# SSH into VM
ssh azureuser@your-vm-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### 3. Deploy Application

```bash
# Clone repository
git clone <your-repo-url>
cd voice-mood-analyzer

# Configure .env with your OpenAI API key
nano .env

# Start services
docker-compose up -d --build

# Check logs
docker-compose logs -f
```

### 4. Configure Firewall (if needed)

```bash
# Allow HTTP traffic
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 5. Access Application

Visit: `http://your-vm-public-ip`

## Mobile Access

The application is fully mobile-optimized:

- **Responsive Design**: Works on all screen sizes
- **Touch-Friendly**: Large buttons and intuitive controls
- **Mobile Browser Recording**: Uses native MediaRecorder API
- **iOS Safari Compatible**: Works on iPhone/iPad
- **Android Chrome Compatible**: Works on Android devices

To access from mobile:
1. Ensure your Azure VM has a public IP
2. Open browser on mobile device
3. Navigate to `http://your-vm-public-ip`
4. Grant microphone permissions when prompted

## Development

### Local Development (without Docker)

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn app:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Project Structure

```
voice-mood-analyzer/
├── backend/
│   ├── app.py                 # FastAPI main application
│   ├── core/
│   │   ├── config.py          # Configuration management
│   │   ├── database.py        # Database connection
│   │   └── schemas.py         # Pydantic models
│   ├── models/
│   │   ├── voice_matrix.py    # Fusion matrix ORM model
│   │   └── voice_analysis.py  # Analysis history ORM model
│   ├── services/
│   │   ├── whisper_service.py # OpenAI Whisper integration
│   │   ├── audio_emotion.py   # HuBERT emotion detection
│   │   ├── text_emotion.py    # DistilRoBERTa sentiment
│   │   └── fusion_service.py  # Emotion fusion logic
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AudioRecorder.tsx
│   │   │   ├── FileUploader.tsx
│   │   │   ├── MoodResult.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── services/
│   │   │   └── api.ts         # API client
│   │   ├── types/
│   │   │   └── index.ts       # TypeScript types
│   │   ├── App.tsx            # Main component
│   │   ├── main.tsx           # Entry point
│   │   └── index.css          # Global styles
│   ├── package.json
│   ├── vite.config.ts
│   ├── nginx.conf
│   └── Dockerfile
├── db/
│   └── init/
│       ├── 01-init-tables.sql       # Table creation
│       └── 02-seed-fusion-matrix.sql # Seed data
├── docker-compose.yml
├── .env
└── README.md
```

## Troubleshooting

### Models not downloading
First-time startup downloads ~2GB of models. This may take 10-15 minutes depending on internet speed.

```bash
# Check backend logs
docker-compose logs -f backend
```

### Database connection errors
```bash
# Restart PostgreSQL
docker-compose restart postgres

# Check PostgreSQL logs
docker-compose logs postgres
```

### CORS errors
Ensure the backend allows your frontend origin in `app.py` CORS settings.

### Audio recording not working
- Grant microphone permissions in browser
- Use HTTPS in production (browsers require secure context for getUserMedia)
- Check browser compatibility (Chrome, Firefox, Safari 14.1+)

### High memory usage
ML models require ~2-4GB RAM. Adjust Docker resource limits if needed.

## Performance Optimization

- **GPU Support**: Add NVIDIA GPU support for faster inference
- **Model Caching**: Models are loaded once at startup and cached in memory
- **Connection Pooling**: PostgreSQL connection pool configured (10 connections)
- **Nginx Caching**: Static assets cached with appropriate headers
- **Gzip Compression**: Enabled for text-based responses

## Security Considerations

- Change default PostgreSQL password in production
- Use HTTPS with SSL certificates (Let's Encrypt recommended)
- Implement rate limiting for API endpoints
- Validate and sanitize all user inputs
- Store OpenAI API key securely (use Azure Key Vault in production)
- Configure firewall rules to restrict access

## License

MIT License

## Support

For issues and questions:
- GitHub Issues: [Create an issue]
- Documentation: This README
- API Docs: http://localhost:8000/docs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

Built with FastAPI, React, PostgreSQL, OpenAI Whisper, and Hugging Face Transformers

# VoiceMoodAnalyzer 🎙️😊

[![Build Status](https://github.com/yourusername/voice-mood-analyzer/actions/workflows/build-and-push.yml/badge.svg)](https://github.com/yourusername/voice-mood-analyzer/actions)
[![Deploy Status](https://github.com/yourusername/voice-mood-analyzer/actions/workflows/deploy-to-oci.yml/badge.svg)](https://github.com/yourusername/voice-mood-analyzer/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A production-ready, Dockerized voice mood analysis system that combines OpenAI Whisper for speech transcription with Hugging Face emotion detection models to determine the emotional state of speakers.

**✨ Now with FREE Oracle Cloud deployment via automated CI/CD!**

## Features

- **Speech Transcription**: Local Whisper.cpp (tiny model) for accurate speech-to-text conversion - no API key required
- **Audio Emotion Detection**: High-accuracy Wav2Vec2 model (97.5% accuracy) for detecting emotion from voice tone
  - Model: `r-f/wav2vec-english-speech-emotion-recognition`
  - 7 emotions: angry, disgust, fear, happy, neutral, sad, surprise
  - **Only runs for recordings ≤15 seconds** (performance optimization for longer files)
- **Text Emotion Analysis**: DistilRoBERTa model for analyzing sentiment from transcribed text (runs for all recordings)
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
│  │  Whisper  │  │  → Local whisper.cpp (tiny model)
│  │  Service  │  │     No API key required
│  └───────────┘  │
│                 │
│  ┌───────────┐  │
│  │   Audio   │  │  → Wav2Vec2 (local, 97.5% accuracy)
│  │  Emotion  │  │     Only for recordings ≤15 seconds
│  └───────────┘  │     7 emotions: angry, disgust, fear,
│                 │     happy, neutral, sad, surprise
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
│   (Port 5432)   │  [Docker Container - Auto-initialized]
└─────────────────┘
```

## Technology Stack

### Backend
- **FastAPI**: Modern async Python web framework
- **Whisper.cpp**: Local speech recognition (tiny model, ~466MB, no API key required)
- **Hugging Face Transformers**:
  - **Audio Emotion**: `r-f/wav2vec-english-speech-emotion-recognition` (97.5% accuracy)
    - Fine-tuned Wav2Vec2 model trained on 4,720 samples (SAVEE, RAVDESS, TESS datasets)
    - Detects 7 emotions: angry, disgust, fear, happy, neutral, sad, surprise
    - **Performance optimization**: Only runs for recordings ≤15 seconds (saves ~15-20s for longer files)
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
- ~~OpenAI API key~~ **NO LONGER REQUIRED** - using local whisper.cpp
- Minimum 8GB RAM (for running ML models)
- 15GB free disk space (for Docker images and ML models)

## Quick Start

### 1. Clone the Repository

```bash
cd voice-mood-analyzer
```

### 2. Configure Environment

Create `.env` file from template (optional - defaults work out of the box):

```bash
cp .env.example .env
```

Edit `.env` to customize database password (optional):

```env
# Optional: Change database password (recommended for production)
POSTGRES_PASSWORD=changeme123
```

**Note**: No API keys required - all models run locally!

See [`.env.example`](./.env.example) for all configuration options.

### 3. Build and Start Services

```bash
# Build and start all containers (PostgreSQL + Backend + Frontend)
docker-compose up -d --build
```

This will:
- Start PostgreSQL container and create database
- Build the FastAPI backend container
- Build the React frontend container
- Download Hugging Face ML models (~2GB, first run only)
- Initialize database tables automatically

**First run:** Model downloads take 10-15 minutes. Monitor progress:
```bash
docker-compose logs -f backend
```

Wait for: `"Application startup complete"`

### 4. Access the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **PostgreSQL**: localhost:5432 (containerized)

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
   - Audio emotion + confidence (only for recordings ≤15 seconds)
   - Text emotion + confidence (always analyzed)

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

## ☁️ Cloud Deployment (Oracle Cloud Free Tier - $0/month!)

Deploy to Oracle Cloud Infrastructure completely **FREE** using automated CI/CD!

### Why Oracle Cloud?

- ✅ **4 ARM CPUs + 24GB RAM** - More powerful than this app needs
- ✅ **100GB boot volume** - Plenty of space for ML models
- ✅ **10TB bandwidth/month** - Generous data transfer
- ✅ **$0/month forever** - No time limits on free tier
- ✅ **Automated CI/CD** - Push to deploy via GitHub Actions

### Quick Deployment Guide

1. **[Set up Oracle Cloud Infrastructure](./docs/OCI_SETUP.md)** (~30 minutes)
   - Create free Oracle Cloud account
   - Generate API keys
   - Deploy infrastructure with Terraform

2. **[Configure CI/CD Pipeline](./docs/CICD.md)** (~20 minutes)
   - Set up GitHub Actions secrets
   - Configure Docker Hub
   - Connect to OCI instance

3. **Deploy** 🚀
   ```bash
   git push origin main
   ```

   GitHub Actions automatically:
   - Builds multi-arch Docker images (ARM64 + AMD64)
   - Pre-bakes ML models into images (~3GB)
   - Pushes to Docker Hub
   - Deploys to OCI instance
   - Runs health checks
   - Notifies you of completion

### Architecture

```
GitHub → GitHub Actions → Docker Hub → Oracle Cloud (ARM64)
                                          ├── Frontend (Nginx + React)
                                          ├── Backend (FastAPI + ML Models)
                                          └── PostgreSQL (Containerized)
```

**Total setup time:** ~1 hour
**Ongoing cost:** $0/month (Free Tier)
**Build time:** 30-40 minutes (first build with ML models)
**Deploy time:** 10-15 minutes

### Terraform Infrastructure

The project includes complete Infrastructure as Code:

```bash
cd terraform/
terraform init
terraform plan
terraform apply
```

Creates:
- Virtual Cloud Network with public subnet
- Compute instance (VM.Standard.A1.Flex)
- Security lists (ports 22, 80, 443)
- Reserved public IP
- Auto-installs Docker & Docker Compose

See [terraform/](./terraform/) for full configuration.

---

## Alternative: Azure/AWS Deployment

For Azure or AWS deployment, follow similar steps:

1. Provision VM (4 vCPUs, 8GB RAM minimum)
2. Install Docker & Docker Compose
3. Clone repository
4. Configure `.env` with secrets
5. Run `docker-compose up -d --build`

Estimated costs:
- **Azure B2ms:** ~$60/month or ~$0.42 for 5 hours
- **Azure Spot:** ~$0.10-0.20 for 5 hours (with eviction risk)
- **AWS t3.large:** ~$60/month or ~$0.42 for 5 hours

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
│   │   ├── whisper_local_service.py # Local whisper.cpp integration
│   │   ├── audio_emotion.py   # Wav2Vec2 emotion detection (≤15s only)
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
- Configure firewall rules to restrict access
- No API keys required - all models run locally

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

Built with FastAPI, React, PostgreSQL, Whisper.cpp (local), and Hugging Face Transformers

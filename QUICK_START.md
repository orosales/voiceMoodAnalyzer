# Quick Start Guide

Get VoiceMoodAnalyzer running in 5 minutes!

## Prerequisites Checklist

- [ ] Docker installed
- [ ] Docker Compose installed
- [ ] ~~OpenAI API key~~ **NO LONGER REQUIRED** - using local whisper.cpp
- [ ] 15GB free disk space (for models ~2.5GB)
- [ ] 4GB available RAM

## 2-Step Setup

### 1. Start Application (No Configuration Needed!)

```bash
# Make start script executable
chmod +x start.sh

# Start all services
./start.sh
```

**First-time startup**: Downloads ~2.5GB of ML models (10-15 minutes)
**Note**: All models run locally - no API keys required!

### 2. Access Application

Open your browser:
- **Main App**: http://localhost
- **API Docs**: http://localhost:8000/docs

## Test It Out

### Option 1: Record Audio
1. Click "Start Recording"
2. Say something like "I'm feeling great today!"
3. Click "Stop Recording"
4. See your mood analysis (recordings ≤15s include audio + text emotion; >15s use text emotion only)

### Option 2: Upload File
1. Click "Choose Audio File"
2. Select an audio file (MP3, WAV, etc.)
3. See your mood analysis

## Common Commands

```bash
# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Restart services
docker-compose restart

# Rebuild after code changes
docker-compose up -d --build
```

## Troubleshooting

### "Cannot connect to Docker daemon"
```bash
# Start Docker service
sudo systemctl start docker

# Or on Mac/Windows, start Docker Desktop
```

### "Port 80 already in use"
```bash
# Find what's using port 80
sudo lsof -i :80

# Kill the process or change frontend port in docker-compose.yml
```

### "Models downloading slowly"
- First startup downloads ~2.5GB
- Wait 10-15 minutes
- Check progress: `docker-compose logs -f backend`

## Mobile Access

To access from your phone/tablet on the same network:

1. Find your computer's IP address:
   ```bash
   # Linux/Mac
   ip addr show | grep inet

   # Or
   ifconfig | grep inet
   ```

2. On your mobile device, open browser and go to:
   `http://YOUR_COMPUTER_IP`

3. Grant microphone permission when prompted

## What's Next?

- **Deploy to Cloud**: See `DEPLOYMENT.md` for Azure VM deployment
- **Customize**: Modify emotion mappings in `db/init/02-seed-fusion-matrix.sql`
- **Integrate**: Check API docs at http://localhost:8000/docs
- **Learn More**: Read full `README.md`

## Architecture Overview

```
Your Browser
    ↓
Nginx (Port 80) ← React Frontend
    ↓
FastAPI (Port 8000)
    ↓
┌─────────────────────────────┐
│ AI Pipeline (All Local):    │
│ 1. Whisper.cpp (tiny model) │ → Transcribe audio
│ 2. Wav2Vec2 Model (≤15s)    │ → Detect audio emotion
│ 3. DistilRoBERTa            │ → Analyze text emotion
│ 4. Fusion Matrix            │ → Combine results
└─────────────────────────────┘
    ↓
PostgreSQL (Port 5436)

All models run locally - no API calls!
```

## Support Files Included

- `README.md` - Full documentation
- `DEPLOYMENT.md` - Azure VM deployment guide
- `.env` - Environment configuration
- `docker-compose.yml` - Container orchestration
- `start.sh` - Easy startup script

## Need Help?

1. Check logs: `docker-compose logs -f`
2. Review `README.md` troubleshooting section
3. Check API health: `curl http://localhost:8000/`

---

**You're all set!** Start recording and analyzing emotions! 🎤😊

# Quick Start Guide

Get VoiceMoodAnalyzer running in 5 minutes!

## Prerequisites Checklist

- [ ] Docker installed
- [ ] Docker Compose installed
- [ ] OpenAI API key (get one at https://platform.openai.com/api-keys)
- [ ] 10GB free disk space
- [ ] 4GB available RAM

## 3-Step Setup

### 1. Configure Environment

Open `.env` and add your OpenAI API key:

```bash
nano .env
```

Find this line:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

Replace with your actual key:
```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
```

Save and exit (Ctrl+X, Y, Enter)

### 2. Start Application

```bash
# Make start script executable
chmod +x start.sh

# Start all services
./start.sh
```

**First-time startup**: Downloads ~2GB of ML models (10-15 minutes)

### 3. Access Application

Open your browser:
- **Main App**: http://localhost
- **API Docs**: http://localhost:8000/docs

## Test It Out

### Option 1: Record Audio
1. Click "Start Recording"
2. Say something like "I'm feeling great today!"
3. Click "Stop Recording"
4. See your mood analysis

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

### "OpenAI API key invalid"
1. Check your .env file
2. Verify key at https://platform.openai.com/api-keys
3. Restart containers: `docker-compose restart`

### "Models downloading slowly"
- First startup downloads ~2GB
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
┌─────────────────────┐
│ AI Pipeline:        │
│ 1. Whisper API      │ → Transcribe audio
│ 2. HuBERT Model     │ → Detect audio emotion
│ 3. DistilRoBERTa    │ → Analyze text emotion
│ 4. Fusion Matrix    │ → Combine results
└─────────────────────┘
    ↓
PostgreSQL (Port 5436)
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

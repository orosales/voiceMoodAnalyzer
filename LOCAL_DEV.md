# Local Development Guide

This guide explains how to run the backend locally (without Docker) while using your existing PostgreSQL database.

## Prerequisites

1. Python 3.10+ installed
2. **PostgreSQL running on localhost:5436** (your existing database)
3. Database `mito_books` exists with tables initialized

## Setup Steps

### 1. Verify PostgreSQL is Running

```bash
# Check if PostgreSQL is accessible
psql -h localhost -p 5436 -U postgres -d mito_books -c "SELECT version();"
# Password: 123
```

If the database or tables don't exist, create them:
```bash
# Create database (if needed)
createdb -h localhost -p 5436 -U postgres mito_books

# Create tables
psql -h localhost -p 5436 -U postgres -d mito_books -f db/init/01-init-tables.sql
psql -h localhost -p 5436 -U postgres -d mito_books -f db/init/02-seed-fusion-matrix.sql
```

### 2. Create Virtual Environment

```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate  # Linux/Mac
# OR
venv\Scripts\activate     # Windows
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

This will take several minutes and install:
- FastAPI and Uvicorn
- OpenAI Python SDK
- PyTorch and Transformers
- Database libraries (SQLAlchemy, psycopg2)
- Audio processing libraries (librosa, soundfile, torchaudio)

### 4. Configure Environment for Local Development

The `.env` file is already configured to use your existing PostgreSQL:
```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5436
POSTGRES_DB=mito_books
```

No additional configuration needed! The backend will automatically find and use this configuration.

### 5. Run the Backend

```bash
cd backend
source venv/bin/activate  # If not already activated

# Option 1: Run with Python directly
python3 app.py

# Option 2: Run with Uvicorn (recommended for hot reload)
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at:
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### 6. First Run - Model Download

On the first run, the backend will download ML models (~2GB):
- HuBERT model: ~95MB
- DistilRoBERTa model: ~82MB

This happens during startup and takes 5-10 minutes. You'll see output like:
```
Downloading (…)solve/main/config.json: 100%
Downloading pytorch_model.bin: 100%
```

**Be patient!** Subsequent runs will be fast.

## Testing the Backend

### Test with curl

```bash
# Health check
curl http://localhost:8000/

# Get fusion matrix
curl http://localhost:8000/api/matrix

# Analyze audio (requires audio file)
curl -X POST http://localhost:8000/api/analyze \
  -F "file=@test_audio.mp3"
```

### Test with API docs

Open http://localhost:8000/docs in your browser and use the interactive Swagger UI.

## Database Access

### Connect to PostgreSQL

```bash
# Connect to your existing PostgreSQL database
psql -h localhost -p 5436 -U postgres -d mito_books
# Password: 123
```

### View Tables

```sql
-- List tables
\dt

-- View fusion matrix
SELECT * FROM voice_matrix LIMIT 10;

-- View analysis history
SELECT id, created_at, final_mood, emoji FROM voice_analysis ORDER BY created_at DESC LIMIT 10;
```

## Running Frontend Locally

The frontend can run independently:

```bash
cd frontend
npm install
npm run dev
```

This starts Vite dev server at http://localhost:3000

**Configure API endpoint:**

The frontend needs to know where the backend is. Edit `frontend/vite.config.ts`:

```typescript
server: {
  host: '0.0.0.0',
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:8000',  // Backend URL
      changeOrigin: true,
    }
  }
}
```

Then access: http://localhost:3000

## Common Issues

### "ModuleNotFoundError: No module named 'pydantic_settings'"

Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

### "Connection refused" to PostgreSQL

Make sure your PostgreSQL is running on port 5436:
```bash
# Check if PostgreSQL is listening on port 5436
sudo netstat -tlnp | grep 5436

# Or check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -h localhost -p 5436 -U postgres -d mito_books
```

### "OPENAI_API_KEY validation error"

Set the environment variable or ensure `.env` file is found:
```bash
export OPENAI_API_KEY=sk-proj-...
```

### Models download slowly

First run downloads ~2GB. Use a good internet connection and wait 10-15 minutes.

### Import errors

Make sure you're running from the `backend` directory so Python can find the modules:
```bash
cd backend
python3 app.py  # ✓ Correct

# NOT from project root:
cd voice-mood-analyzer
python3 backend/app.py  # ✗ Wrong - import errors
```

## Development Workflow

1. **Make code changes** in `backend/` directory
2. **Uvicorn auto-reloads** (if running with `--reload` flag)
3. **Test changes** at http://localhost:8000/docs
4. **Check logs** in terminal

## Debugging

### Enable verbose logging

Edit `backend/app.py` and add:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Use Python debugger

Add breakpoints:
```python
import pdb; pdb.set_trace()
```

### VS Code debugging

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "FastAPI Backend",
      "type": "python",
      "request": "launch",
      "module": "uvicorn",
      "args": ["app:app", "--reload", "--host", "0.0.0.0", "--port", "8000"],
      "cwd": "${workspaceFolder}/backend",
      "env": {
        "POSTGRES_HOST": "localhost",
        "POSTGRES_PORT": "5436"
      }
    }
  ]
}
```

## Environment Variables Reference

| Variable | Docker Value | Local Dev Value | Description |
|----------|--------------|-----------------|-------------|
| POSTGRES_HOST | host.docker.internal | localhost | Database host |
| POSTGRES_PORT | 5436 | 5436 | Database port (your existing PostgreSQL) |
| POSTGRES_DB | mito_books | mito_books | Database name |
| POSTGRES_USER | postgres | postgres | Database user |
| POSTGRES_PASSWORD | 123 | 123 | Database password |
| OPENAI_API_KEY | (your key) | (your key) | OpenAI API key |

**Note**: Both Docker and local dev use the same PostgreSQL instance on localhost:5436

## Switching Between Docker and Local

**To switch to Docker:**
```bash
# Stop local backend (Ctrl+C)
docker-compose up -d
```

**To switch to local:**
```bash
# Stop Docker backend
docker-compose stop backend frontend
# Start local backend as described above
```

## Performance Notes

- Local development may be slower than Docker for model inference (no GPU optimization)
- Database is on the same machine (localhost), so connection is fast
- Hot reload with Uvicorn is faster for development iteration

---

**Quick Start Command**:
```bash
cd backend
source venv/bin/activate
# No need to set environment variables - .env is already configured!
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

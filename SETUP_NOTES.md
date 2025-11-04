# Setup Notes - Using Existing PostgreSQL

This document explains the project configuration for using an existing PostgreSQL database instead of running it in Docker.

## Configuration Summary

### PostgreSQL Setup
- **Host**: localhost
- **Port**: 5436
- **Database**: mito_books
- **User**: postgres
- **Password**: 123

The PostgreSQL database is **NOT** running in Docker - it's an existing instance on your host machine.

## What Was Changed

### 1. Docker Compose (`docker-compose.yml`)
- ✅ **Removed** postgres service
- ✅ **Updated** backend to use `host.docker.internal:5436` to connect to host PostgreSQL
- ✅ Added `extra_hosts` to allow container to access host machine
- ✅ Removed postgres volume

### 2. Environment Configuration (`.env`)
- ✅ Set `POSTGRES_HOST=localhost` (for local development)
- ✅ Set `POSTGRES_PORT=5436` (your existing PostgreSQL port)

### 3. Backend Configuration (`backend/core/config.py`)
- ✅ Added `find_env_file()` function to locate `.env` from multiple locations
- ✅ Now works when running from `backend/` directory or project root

## How to Run

### Option 1: Run Backend Locally (Recommended for Development)

```bash
# 1. Initialize database (first time only)
./init_database.sh

# 2. Install Python dependencies
cd backend
python3 -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# 3. Run the backend
python3 app.py
# OR for hot reload:
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Access at:
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Option 2: Run with Docker

```bash
# 1. Initialize database (first time only)
./init_database.sh

# 2. Start containers
docker-compose up -d --build

# 3. Check logs
docker-compose logs -f backend
```

Access at:
- Frontend: http://localhost
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Database Initialization

Since PostgreSQL is not managed by Docker, you must manually initialize the database:

### Automatic (Recommended)
```bash
./init_database.sh
```

### Manual
```bash
# Create tables
psql -h localhost -p 5436 -U postgres -d mito_books -f db/init/01-init-tables.sql

# Seed fusion matrix
psql -h localhost -p 5436 -U postgres -d mito_books -f db/init/02-seed-fusion-matrix.sql
```

## Troubleshooting

### "Cannot connect to database"

1. Check if PostgreSQL is running:
   ```bash
   sudo systemctl status postgresql
   ```

2. Check if it's listening on port 5436:
   ```bash
   sudo netstat -tlnp | grep 5436
   ```

3. Test connection manually:
   ```bash
   psql -h localhost -p 5436 -U postgres -d mito_books
   ```

### "Database mito_books does not exist"

Create the database:
```bash
createdb -h localhost -p 5436 -U postgres mito_books
```

Then run the initialization:
```bash
./init_database.sh
```

### "OPENAI_API_KEY validation error"

The API key is already set in `.env`. If you get this error, make sure you're running from the correct directory:
```bash
# ✓ Correct
cd backend
python3 app.py

# ✗ Wrong (won't find .env)
python3 backend/app.py
```

### Docker backend can't connect to PostgreSQL

The backend container uses `host.docker.internal` to access the host machine. This is automatically configured in `docker-compose.yml`.

If connection still fails:
1. Check if PostgreSQL allows connections from Docker network
2. Check `pg_hba.conf` for connection permissions
3. Restart PostgreSQL: `sudo systemctl restart postgresql`

## Architecture Diagram

```
┌─────────────────────────────────┐
│     Your Development Machine    │
│                                  │
│  ┌────────────────────────────┐ │
│  │  PostgreSQL (Port 5436)    │ │
│  │  Database: mito_books      │ │
│  └────────────┬───────────────┘ │
│               │                  │
│       ┌───────┴────────┐         │
│       ↓                ↓         │
│  ┌─────────┐     ┌──────────┐   │
│  │ Backend │     │ Backend  │   │
│  │ (Local) │     │ (Docker) │   │
│  │ :8000   │     │ :8000    │   │
│  └─────────┘     └──────────┘   │
│                        ↓         │
│                  ┌──────────┐   │
│                  │ Frontend │   │
│                  │ (Docker) │   │
│                  │ :80      │   │
│                  └──────────┘   │
└─────────────────────────────────┘
```

## Files Modified

1. ✅ `docker-compose.yml` - Removed postgres service, updated backend configuration
2. ✅ `.env` - Set POSTGRES_HOST=localhost, POSTGRES_PORT=5436
3. ✅ `backend/core/config.py` - Added flexible .env file discovery
4. ✅ `README.md` - Updated architecture diagram and setup instructions
5. ✅ `LOCAL_DEV.md` - Updated for existing PostgreSQL setup
6. ✅ `CLAUDE.md` - Updated database connection parameters
7. ✅ Created `init_database.sh` - Database initialization script

## Next Steps

1. ✅ Initialize database: `./init_database.sh`
2. ✅ Choose your development method:
   - Local: `cd backend && uvicorn app:app --reload`
   - Docker: `docker-compose up -d`
3. ✅ Test the API: `curl http://localhost:8000/`
4. ✅ Access the application: http://localhost (Docker) or http://localhost:8000 (Local)

## Important Notes

- The `.env` file is configured for your existing PostgreSQL
- Docker backend uses `host.docker.internal` to connect to host PostgreSQL
- Local backend uses `localhost` to connect to PostgreSQL
- Both connect to the same database instance on port 5436
- Database initialization must be done manually (not automatic via Docker)

---

**Quick Reference**:
```bash
# Initialize database (first time)
./init_database.sh

# Run locally
cd backend && source venv/bin/activate && uvicorn app:app --reload

# Run with Docker
docker-compose up -d && docker-compose logs -f
```

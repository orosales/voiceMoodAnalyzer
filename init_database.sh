#!/bin/bash

# Database Initialization Script
# Initializes the PostgreSQL database with required tables and seed data

set -e

echo "================================================"
echo "  VoiceMoodAnalyzer - Database Initialization"
echo "================================================"
echo ""

# Database connection parameters
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5436}"
DB_NAME="${POSTGRES_DB:-mito_books}"
DB_USER="${POSTGRES_USER:-postgres}"

echo "Database connection:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo "Error: psql is not installed. Please install PostgreSQL client."
    echo "  Ubuntu/Debian: sudo apt-get install postgresql-client"
    echo "  macOS: brew install postgresql"
    exit 1
fi

# Test connection
echo "Testing database connection..."
if ! PGPASSWORD=123 psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" &> /dev/null; then
    echo "Error: Cannot connect to database."
    echo "Please ensure PostgreSQL is running on $DB_HOST:$DB_PORT"
    echo ""
    echo "Try: psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME"
    exit 1
fi

echo "✓ Connection successful"
echo ""

# Create tables
echo "Creating tables..."
if PGPASSWORD=123 psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f db/init/01-init-tables.sql > /dev/null 2>&1; then
    echo "✓ Tables created successfully"
else
    echo "⚠ Tables may already exist (this is OK)"
fi

# Seed fusion matrix
echo "Seeding fusion matrix..."
if PGPASSWORD=123 psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f db/init/02-seed-fusion-matrix.sql > /dev/null 2>&1; then
    echo "✓ Fusion matrix seeded successfully"
else
    echo "✗ Error seeding fusion matrix"
    exit 1
fi

# Verify initialization
echo ""
echo "Verifying initialization..."
MATRIX_COUNT=$(PGPASSWORD=123 psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM voice_matrix;" | tr -d ' ')
echo "  Fusion matrix entries: $MATRIX_COUNT"

ANALYSIS_COUNT=$(PGPASSWORD=123 psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM voice_analysis;" | tr -d ' ')
echo "  Analysis records: $ANALYSIS_COUNT"

echo ""
echo "================================================"
echo "  Database initialized successfully!"
echo "================================================"
echo ""
echo "You can now start the application:"
echo "  Local: cd backend && uvicorn app:app --reload"
echo "  Docker: docker-compose up -d"
echo ""

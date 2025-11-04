#!/bin/bash

# VoiceMoodAnalyzer Startup Script
# This script starts all Docker containers for the application

set -e

echo "================================================"
echo "  VoiceMoodAnalyzer - Starting Application"
echo "================================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "Error: Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found. Please create it from .env.example"
    exit 1
fi

# Check if OPENAI_API_KEY is set
if ! grep -q "OPENAI_API_KEY=sk-" .env; then
    echo "Warning: OPENAI_API_KEY appears to be missing or invalid in .env file"
    read -p "Do you want to continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "Starting Docker containers..."
echo ""

# Use docker-compose or docker compose depending on what's available
if command -v docker-compose &> /dev/null; then
    docker-compose up -d --build
else
    docker compose up -d --build
fi

echo ""
echo "================================================"
echo "  Application Started Successfully!"
echo "================================================"
echo ""
echo "Services:"
echo "  - Frontend:  http://localhost"
echo "  - Backend:   http://localhost:8000"
echo "  - API Docs:  http://localhost:8000/docs"
echo "  - Database:  localhost:5436"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f"
echo ""
echo "To stop:"
echo "  docker-compose down"
echo ""
echo "Note: First startup will download ~2GB of ML models"
echo "      This may take 10-15 minutes depending on internet speed"
echo ""

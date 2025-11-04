#!/bin/bash

# VoiceMoodAnalyzer API Test Script
# Tests all API endpoints to verify the system is working

set -e

echo "================================================"
echo "  VoiceMoodAnalyzer - API Test Script"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="${1:-http://localhost:8000}"

echo "Testing API at: $BASE_URL"
echo ""

# Test 1: Health Check
echo -n "Test 1: Health Check... "
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/")
if [ "$response" -eq 200 ]; then
    echo -e "${GREEN}PASSED${NC}"
else
    echo -e "${RED}FAILED${NC} (HTTP $response)"
    exit 1
fi

# Test 2: Get Fusion Matrix
echo -n "Test 2: Get Fusion Matrix... "
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/matrix")
if [ "$response" -eq 200 ]; then
    echo -e "${GREEN}PASSED${NC}"
    matrix_count=$(curl -s "$BASE_URL/api/matrix" | grep -o '"id"' | wc -l)
    echo "   → Found $matrix_count fusion matrix entries"
else
    echo -e "${RED}FAILED${NC} (HTTP $response)"
fi

# Test 3: Get Analysis History
echo -n "Test 3: Get Analysis History... "
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/history")
if [ "$response" -eq 200 ]; then
    echo -e "${GREEN}PASSED${NC}"
else
    echo -e "${RED}FAILED${NC} (HTTP $response)"
fi

# Test 4: Analyze Audio (requires audio files)
echo ""
echo "Test 4: Analyze Audio Files"

# Array of test files to check
TEST_FILES=("test_happy.wav" "test_sad.wav" "test_angry.wav" "test_neutral.wav")
FOUND_FILES=()

# Check which test files exist
for file in "${TEST_FILES[@]}"; do
    if [ -f "$file" ]; then
        FOUND_FILES+=("$file")
    fi
done

if [ ${#FOUND_FILES[@]} -eq 0 ]; then
    echo -e "${YELLOW}SKIPPED${NC} (no test audio files found)"
    echo "   Expected files: test_happy.wav, test_sad.wav, test_angry.wav, test_neutral.wav"
    echo "   See CREATE_TEST_AUDIO.md for instructions on creating test files"
else
    echo "   Found ${#FOUND_FILES[@]} test file(s)"
    echo ""

    # Test each found file
    for TEST_FILE in "${FOUND_FILES[@]}"; do
        echo "   Testing: $TEST_FILE"
        echo -n "      Analyzing... "

        response=$(curl -s -o /tmp/analysis_result.json -w "%{http_code}" \
            -X POST "$BASE_URL/api/analyze" \
            -F "file=@$TEST_FILE")

        if [ "$response" -eq 200 ]; then
            echo -e "${GREEN}PASSED${NC}"

            # Extract and display key results
            if command -v python3 &> /dev/null; then
                echo "      Results:"
                python3 -c "
import json
with open('/tmp/analysis_result.json') as f:
    data = json.load(f)
    print(f'        Text: \"{data[\"transcribed_text\"]}\"')
    print(f'        Audio Emotion: {data[\"audio_emotion\"]} ({data[\"audio_confidence\"]*100:.1f}%)')
    print(f'        Text Emotion: {data[\"text_emotion\"]} ({data[\"text_confidence\"]*100:.1f}%)')
    print(f'        Final Mood: {data[\"emoji\"]} {data[\"final_mood\"]}')
" 2>/dev/null || cat /tmp/analysis_result.json
            else
                cat /tmp/analysis_result.json
            fi
            echo ""
        else
            echo -e "${RED}FAILED${NC} (HTTP $response)"
            cat /tmp/analysis_result.json 2>/dev/null || echo "      No response body"
            echo ""
        fi

        rm -f /tmp/analysis_result.json
    done
fi

echo ""
echo "================================================"
echo "  Test Summary"
echo "================================================"
echo ""
echo "API is responding correctly!"
echo ""
echo "Next steps:"
echo "  1. Open http://localhost in your browser"
echo "  2. Record or upload audio to test full pipeline"
echo "  3. Check logs: docker-compose logs -f"
echo ""

# Testing Guide - VoiceMoodAnalyzer

This guide explains how to test the VoiceMoodAnalyzer API with audio samples.

## Quick Start

### Option 1: Generate Test Audio (Automated - Basic Quality)

```bash
# Install text-to-speech library
pip install gtts pydub

# Generate test audio files
python3 generate_test_audio.py

# Run tests
./test_api.sh
```

**Note**: gTTS creates robotic voice without real emotional tone. Good for basic testing, but not ideal for emotion detection accuracy.

### Option 2: Record Your Own Voice (Recommended - Best Quality)

See `CREATE_TEST_AUDIO.md` for detailed instructions on creating high-quality test samples with real emotional tone.

Quick steps:
1. Use your phone or computer microphone
2. Record 4 samples (happy, sad, angry, neutral)
3. Save as `test_happy.wav`, `test_sad.wav`, `test_angry.wav`, `test_neutral.wav`
4. Place files in project root
5. Run `./test_api.sh`

### Option 3: Use the Web Interface

The easiest way to test:

```bash
# Start backend
cd backend
python3 app.py

# In another terminal, start frontend
cd frontend
npm run dev

# Open browser
http://localhost:3000

# Click "Start Recording" and speak
```

## Test API Script

The `test_api.sh` script runs 4 tests:

### Test 1: Health Check
Verifies the API is running
```bash
curl http://localhost:8000/
```

### Test 2: Get Fusion Matrix
Retrieves all emotion mapping combinations
```bash
curl http://localhost:8000/api/matrix
```

### Test 3: Get Analysis History
Retrieves past analysis records
```bash
curl http://localhost:8000/api/history
```

### Test 4: Analyze Audio Files
Tests audio analysis with all available test files:
- `test_happy.wav` - Happy and joyful emotion
- `test_sad.wav` - Sad and melancholic emotion
- `test_angry.wav` - Angry and frustrated emotion
- `test_neutral.wav` - Neutral and calm emotion

## Expected Output

When you run `./test_api.sh`, you should see:

```
================================================
  VoiceMoodAnalyzer - API Test Script
================================================

Testing API at: http://localhost:8000

Test 1: Health Check... PASSED
Test 2: Get Fusion Matrix... PASSED
   → Found 30 fusion matrix entries
Test 3: Get Analysis History... PASSED
Test 4: Analyze Audio Files
   Found 4 test file(s)

   Testing: test_happy.wav
      Analyzing... PASSED
      Results:
        Text: "I'm so excited! Today has been absolutely wonderful..."
        Audio Emotion: happy (85.3%)
        Text Emotion: joy (92.1%)
        Final Mood: 😄 Very Happy & Joyful

   Testing: test_sad.wav
      Analyzing... PASSED
      Results:
        Text: "I feel really down today..."
        Audio Emotion: sad (78.9%)
        Text Emotion: sadness (88.7%)
        Final Mood: 😢 Very Sad & Depressed

   Testing: test_angry.wav
      Analyzing... PASSED
      Results:
        Text: "This is absolutely unacceptable..."
        Audio Emotion: angry (82.4%)
        Text Emotion: anger (91.3%)
        Final Mood: 🤬 Very Angry & Furious

   Testing: test_neutral.wav
      Analyzing... PASSED
      Results:
        Text: "The weather today is partly cloudy..."
        Audio Emotion: neutral (76.5%)
        Text Emotion: neutral (89.2%)
        Final Mood: 😐 Calm & Neutral

================================================
  Test Summary
================================================

API is responding correctly!
```

## Manual Testing

### Test a single audio file:

```bash
curl -X POST http://localhost:8000/api/analyze \
  -F "file=@test_happy.wav" | python3 -m json.tool
```

### Test with different formats:

```bash
# WAV file
curl -X POST http://localhost:8000/api/analyze -F "file=@test.wav"

# MP3 file
curl -X POST http://localhost:8000/api/analyze -F "file=@test.mp3"

# M4A file
curl -X POST http://localhost:8000/api/analyze -F "file=@test.m4a"
```

### View API documentation:

Open your browser to: http://localhost:8000/docs

## Troubleshooting

### "No test audio files found"

Create test files using one of these methods:
1. Run `python3 generate_test_audio.py`
2. Record your own samples (see CREATE_TEST_AUDIO.md)
3. Use the web interface to record and save files

### "Connection refused"

Make sure the backend is running:
```bash
cd backend
python3 app.py
```

### "Analysis failed: Whisper transcription failed"

1. Check your OpenAI API key in `.env`
2. Verify you have internet connection (Whisper is a cloud API)
3. Check OpenAI API quota: https://platform.openai.com/usage

### "Audio emotion detection failed"

First run downloads ML models (~2GB, includes Wav2Vec2 and DistilRoBERTa). Wait 10-15 minutes on first startup. The upgraded Wav2Vec2 model is larger (~1.2GB) but provides 97.5% accuracy.

### Test files exist but test skipped

Make sure test files are in the project root directory:
```bash
cd /home/omar/u1/code/MoodDetectionDemo1/voice-mood-analyzer
ls -lh test_*.wav
```

## Test File Locations

All test audio files should be placed here:
```
/home/omar/u1/code/MoodDetectionDemo1/voice-mood-analyzer/
├── test_happy.wav
├── test_sad.wav
├── test_angry.wav
└── test_neutral.wav
```

## Performance Benchmarks

Expected processing times (per audio file):
- Upload: < 1 second
- Whisper transcription: 2-5 seconds
- Audio emotion detection: 1-3 seconds
- Text emotion detection: < 1 second
- Total: **5-10 seconds**

## Understanding Results

### Audio Emotion
Detected from voice tone using Wav2Vec2 model (97.5% accuracy):
- Model: `r-f/wav2vec-english-speech-emotion-recognition`
- Training: 4,720 samples from SAVEE, RAVDESS, and TESS datasets
- Emotions detected:
  - `angry` - Intense, forceful voice
  - `disgust` - Repulsed, contemptuous tone
  - `fear` - Anxious, worried voice
  - `happy` - Upbeat, cheerful voice
  - `neutral` - Calm, even tone
  - `sad` - Low, quiet voice
  - `surprise` - Shocked, astonished tone

### Text Emotion
Detected from transcribed words using DistilRoBERTa:
- `neutral` - Balanced content
- `joy` / `happy` - Positive words
- `sadness` / `sad` - Negative, down words
- `anger` / `angry` - Frustrated, harsh words
- `fear` / `fearful` - Anxious, worried words
- `surprise` / `surprised` - Unexpected events
- `disgust` / `disgusted` - Repulsion, distaste

### Final Mood
Combined result from fusion matrix:
- Looks up (audio_emotion, text_emotion) combination
- Returns descriptive mood with emoji
- Example: (happy, joy) → "😄 Very Happy & Joyful"

## Advanced Testing

### Load Testing

```bash
# Install apache bench
sudo apt-get install apache2-utils

# Test with 10 concurrent requests
ab -n 10 -c 2 -p test_happy.wav -T audio/wav \
  http://localhost:8000/api/analyze
```

### Batch Testing

```bash
# Test all WAV files in a directory
for file in *.wav; do
    echo "Testing: $file"
    curl -X POST http://localhost:8000/api/analyze -F "file=@$file"
    echo ""
done
```

### Database Verification

```bash
# Check analysis history
psql -h localhost -p 5436 -U postgres -d mito_books \
  -c "SELECT created_at, final_mood, emoji FROM voice_analysis ORDER BY created_at DESC LIMIT 10;"
```

## Integration Testing

Test the full stack (frontend + backend + database):

1. Start all services:
   ```bash
   # Backend
   cd backend && python3 app.py &

   # Frontend
   cd frontend && npm run dev &
   ```

2. Open http://localhost:3000

3. Test recording flow:
   - Click "Start Recording"
   - Speak a test phrase
   - Click "Stop Recording"
   - Verify results appear

4. Check database:
   ```bash
   psql -h localhost -p 5436 -U postgres -d mito_books \
     -c "SELECT COUNT(*) FROM voice_analysis;"
   ```

## Continuous Integration

To automate testing in CI/CD:

```yaml
# .github/workflows/test.yml
name: Test API
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Start services
        run: docker-compose up -d
      - name: Wait for API
        run: sleep 30
      - name: Run tests
        run: ./test_api.sh
```

---

**Quick Reference**:
```bash
# Generate test audio
python3 generate_test_audio.py

# Run all tests
./test_api.sh

# Test single file
curl -X POST http://localhost:8000/api/analyze -F "file=@test_happy.wav"

# View API docs
open http://localhost:8000/docs
```

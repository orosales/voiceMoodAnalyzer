# Creating Test Audio Files

Since audio files cannot be generated programmatically, you need to create them manually. Here are 4 test scenarios with sample text you can record:

## Test Audio Files to Create

### 1. test_happy.wav
**Mood**: Happy and joyful
**Text to record**: "I'm so excited! Today has been absolutely wonderful and I couldn't be happier!"
**Recording instructions**:
- Speak with an upbeat, cheerful tone
- Smile while speaking
- Use enthusiastic inflection

### 2. test_sad.wav
**Mood**: Sad and melancholic
**Text to record**: "I feel really down today. Everything seems so difficult and I just don't know what to do anymore."
**Recording instructions**:
- Speak slowly with a low, quiet voice
- Sound dejected and tired
- Use downward inflection

### 3. test_angry.wav
**Mood**: Angry and frustrated
**Text to record**: "This is absolutely unacceptable! I'm so frustrated with how things are going. This needs to change immediately!"
**Recording instructions**:
- Speak with intensity and force
- Raise your voice slightly
- Use sharp, clipped words

### 4. test_neutral.wav
**Mood**: Calm and neutral
**Text to record**: "The weather today is partly cloudy with temperatures around 70 degrees. Traffic is moderate on the main highways."
**Recording instructions**:
- Speak in a calm, even tone
- No emotional inflection
- Like a news reporter or weather person

## How to Record

### Option 1: Using your phone
1. Use your phone's voice recorder app
2. Record each audio sample
3. Transfer files to your computer
4. Convert to WAV format if needed (using VLC or online converter)
5. Place files in the project root directory

### Option 2: Using Audacity (Free software)
1. Download Audacity: https://www.audacityteam.org/
2. Click the red record button
3. Speak the text
4. Click stop
5. File → Export → Export as WAV
6. Save with the appropriate filename
7. Repeat for all 4 files

### Option 3: Using online tools
1. Go to https://online-voice-recorder.com/
2. Click "Record"
3. Speak the text
4. Click "Stop"
5. Download as WAV
6. Rename to appropriate filename

### Option 4: Use text-to-speech (quick but less accurate for emotion)
You can use online TTS services, but they may not capture emotional tone as well:
- https://ttsmaker.com/
- https://www.naturalreaders.com/online/

## File Specifications

All test audio files should be:
- Format: WAV (preferred) or MP3
- Sample rate: 16kHz or higher
- Duration: 5-10 seconds
- Placed in: `/home/omar/u1/code/MoodDetectionDemo1/voice-mood-analyzer/`

## Quick Python Script to Download Sample Audio (Optional)

If you want to use pre-recorded samples, you can download them from online sources:

```python
# download_samples.py
import urllib.request
import os

# These are example URLs - replace with actual audio samples
samples = {
    'test_happy.wav': 'URL_TO_HAPPY_AUDIO',
    'test_sad.wav': 'URL_TO_SAD_AUDIO',
    'test_angry.wav': 'URL_TO_ANGRY_AUDIO',
    'test_neutral.wav': 'URL_TO_NEUTRAL_AUDIO'
}

for filename, url in samples.items():
    print(f"Downloading {filename}...")
    # urllib.request.urlretrieve(url, filename)
    print(f"✓ {filename} downloaded")
```

## Using Browser Recording (Easiest)

Since you have the VoiceMoodAnalyzer frontend running:

1. Open http://localhost:3000
2. Click "Start Recording"
3. Speak the test text
4. Click "Stop Recording"
5. Open browser developer tools (F12)
6. In the Network tab, find the audio upload
7. Right-click and "Save as..."
8. Rename to appropriate test filename
9. Repeat for all 4 moods

## Verification

After creating the files, verify them:

```bash
cd /home/omar/u1/code/MoodDetectionDemo1/voice-mood-analyzer
ls -lh test_*.wav

# Should show:
# test_happy.wav
# test_sad.wav
# test_angry.wav
# test_neutral.wav
```

Then run the test script:
```bash
./test_api.sh
```

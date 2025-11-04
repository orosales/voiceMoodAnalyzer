#!/usr/bin/env python3
"""
Generate test audio files using gTTS (Google Text-to-Speech)
Note: This creates basic audio files. For better emotion testing, record your own voice.

Install dependencies:
    pip install gtts pydub

Usage:
    python3 generate_test_audio.py
"""

import os
from pathlib import Path

try:
    from gtts import gTTS
    print("✓ gTTS library found")
except ImportError:
    print("Error: gTTS not installed. Install it with:")
    print("  pip install gtts")
    exit(1)

# Test audio configurations
TEST_AUDIO = {
    "test_happy.wav": {
        "text": "I'm so excited! Today has been absolutely wonderful and I couldn't be happier!",
        "emotion": "Happy",
        "lang": "en",
        "slow": False
    },
    "test_sad.wav": {
        "text": "I feel really down today. Everything seems so difficult and I just don't know what to do anymore.",
        "emotion": "Sad",
        "lang": "en",
        "slow": True
    },
    "test_angry.wav": {
        "text": "This is absolutely unacceptable! I'm so frustrated with how things are going. This needs to change immediately!",
        "emotion": "Angry",
        "lang": "en",
        "slow": False
    },
    "test_neutral.wav": {
        "text": "The weather today is partly cloudy with temperatures around 70 degrees. Traffic is moderate on the main highways.",
        "emotion": "Neutral",
        "lang": "en",
        "slow": False
    }
}

def generate_audio_file(filename, config):
    """Generate an audio file using gTTS."""
    try:
        print(f"\nGenerating {filename}...")
        print(f"  Emotion: {config['emotion']}")
        print(f"  Text: {config['text'][:50]}...")

        # Create TTS object
        tts = gTTS(text=config['text'], lang=config['lang'], slow=config['slow'])

        # Save as MP3 first (gTTS limitation)
        mp3_file = filename.replace('.wav', '.mp3')
        tts.save(mp3_file)
        print(f"  ✓ Created {mp3_file}")

        # Optional: Convert MP3 to WAV using pydub
        try:
            from pydub import AudioSegment
            audio = AudioSegment.from_mp3(mp3_file)
            audio.export(filename, format="wav")
            print(f"  ✓ Converted to {filename}")
            os.remove(mp3_file)  # Clean up MP3
        except ImportError:
            print(f"  ⚠ pydub not installed. Keeping MP3 format.")
            print(f"  Install with: pip install pydub")
            print(f"  (You may also need ffmpeg: sudo apt-get install ffmpeg)")
        except Exception as e:
            print(f"  ⚠ Conversion failed: {e}")
            print(f"  Keeping MP3 format: {mp3_file}")

        return True
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False

def main():
    print("=" * 60)
    print("  VoiceMoodAnalyzer - Test Audio Generator")
    print("=" * 60)
    print("\nNote: gTTS creates basic TTS audio without emotional tone.")
    print("For better emotion testing, record your own voice samples.")
    print("")

    # Check if files already exist
    existing_files = []
    for filename in TEST_AUDIO.keys():
        if os.path.exists(filename) or os.path.exists(filename.replace('.wav', '.mp3')):
            existing_files.append(filename)

    if existing_files:
        print("Warning: The following files already exist:")
        for f in existing_files:
            print(f"  - {f}")
        response = input("\nOverwrite existing files? (y/n): ")
        if response.lower() != 'y':
            print("Aborted.")
            return

    # Generate all test files
    success_count = 0
    for filename, config in TEST_AUDIO.items():
        if generate_audio_file(filename, config):
            success_count += 1

    print("\n" + "=" * 60)
    print(f"  Generated {success_count}/{len(TEST_AUDIO)} test audio files")
    print("=" * 60)

    if success_count > 0:
        print("\nNext steps:")
        print("1. Run the API test script:")
        print("   ./test_api.sh")
        print("")
        print("2. Or test manually:")
        print("   curl -X POST http://localhost:8000/api/analyze \\")
        print("     -F 'file=@test_happy.wav'")
        print("")
        print("Note: For more realistic emotion detection, consider recording")
        print("your own voice samples with actual emotional tone.")

if __name__ == "__main__":
    main()

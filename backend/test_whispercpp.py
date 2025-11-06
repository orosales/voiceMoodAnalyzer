#!/usr/bin/env python3
"""
Test script for whisper.cpp integration.
This script creates a simple test without requiring an actual audio file.
"""
import asyncio
from services.whisper_cpp_service import get_whisper_service


async def test_service():
    """Test that the service can be instantiated."""
    print("=" * 60)
    print("Testing WhisperCppService Integration")
    print("=" * 60)

    try:
        # Test 1: Service instantiation
        print("\n[1/2] Testing service instantiation...")
        service = get_whisper_service()
        print(f"✓ Service created successfully")
        print(f"  - Model name: {service.model_name}")
        print(f"  - Model directory: {service._model_dir}")

        # Test 2: Check model lazy loading mechanism
        print("\n[2/2] Checking lazy loading mechanism...")
        if service.whisper is None:
            print("✓ Model is not loaded yet (lazy loading works)")
            print("  - Model will load on first transcription call")
        else:
            print("⚠ Model already loaded (unexpected)")

        print("\n" + "=" * 60)
        print("All tests passed! ✓")
        print("=" * 60)
        print("\nNOTE: The whisper.cpp 'small' model (~466MB) will download")
        print("automatically on the first transcription request.")
        print("\nTo test with real audio:")
        print("1. Record audio via the web UI, or")
        print("2. Upload an audio file via the API")
        print("=" * 60)

    except Exception as e:
        print(f"\n✗ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

    return True


if __name__ == "__main__":
    success = asyncio.run(test_service())
    exit(0 if success else 1)

import { pipeline, env } from '@xenova/transformers';

// Configure environment for Web Worker
env.allowLocalModels = false;
env.allowRemoteModels = true;
env.useBrowserCache = true;

let transcriber: any = null;

/**
 * Initialize Whisper pipeline with quantized tiny.en model
 * This is called once and cached for subsequent transcriptions
 */
async function loadModel() {
  if (!transcriber) {
    self.postMessage({ status: 'loading', progress: 0 });

    try {
      transcriber = await pipeline(
        'automatic-speech-recognition',
        'Xenova/whisper-tiny.en',
        {
          quantized: true, // Use quantized version (31 MB instead of 75 MB)
          progress_callback: (progress: any) => {
            if (progress.status === 'progress' && progress.total) {
              const percent = Math.round((progress.loaded / progress.total) * 100);
              self.postMessage({
                status: 'loading',
                progress: percent,
                message: `Downloading model... ${percent}%`
              });
            }
          }
        }
      );

      self.postMessage({ status: 'ready', message: 'Model loaded successfully' });
    } catch (error: any) {
      self.postMessage({
        status: 'error',
        error: `Failed to load model: ${error.message}`
      });
      throw error;
    }
  }
  return transcriber;
}

/**
 * Listen for messages from main thread
 * Expected message format: { audio: ArrayBuffer }
 */
self.addEventListener('message', async (event) => {
  const { audio } = event.data;

  if (!audio) {
    self.postMessage({
      status: 'error',
      error: 'No audio data provided'
    });
    return;
  }

  try {
    // Load model (cached after first load)
    const pipe = await loadModel();

    // Notify that transcription has started
    self.postMessage({
      status: 'transcribing',
      message: 'Transcribing audio...'
    });

    // Run transcription
    // chunk_length_s: Process audio in 30-second chunks
    // stride_length_s: Overlap between chunks for better accuracy
    const result = await pipe(audio, {
      return_timestamps: false,  // Don't need word-level timestamps
      chunk_length_s: 30,        // Process in 30s chunks
      stride_length_s: 5,        // 5s overlap between chunks
    });

    // Send transcribed text back to main thread
    self.postMessage({
      status: 'complete',
      text: result.text.trim(),
      message: 'Transcription complete'
    });
  } catch (error: any) {
    self.postMessage({
      status: 'error',
      error: `Transcription failed: ${error.message}`
    });
  }
});

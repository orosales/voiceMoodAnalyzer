import { useCallback, useState } from 'react';

// Global pipeline instance (singleton)
let transcriberInstance: any = null;
let transformersModule: any = null;

/**
 * Whisper transcription status and progress
 */
export interface WhisperState {
  status: 'idle' | 'loading' | 'ready' | 'transcribing' | 'complete' | 'error';
  progress: number;
  message: string;
  text?: string;
  error?: string;
}

/**
 * React hook for browser-based speech-to-text using Transformers.js
 *
 * Features:
 * - Runs Whisper model entirely in browser (no server required)
 * - Works offline after first model download (~31 MB)
 * - Provides progress feedback for model download and transcription
 * - Handles errors gracefully
 *
 * @example
 * ```tsx
 * const { transcribe, state } = useWhisper();
 *
 * const handleAudio = async (audioBlob: Blob) => {
 *   try {
 *     const text = await transcribe(audioBlob);
 *     console.log('Transcription:', text);
 *   } catch (error) {
 *     console.error('Failed:', error);
 *   }
 * };
 * ```
 */
export const useWhisper = () => {
  const [state, setState] = useState<WhisperState>({
    status: 'idle',
    progress: 0,
    message: '',
  });

  /**
   * Load Transformers.js module dynamically
   */
  const loadTransformers = useCallback(async () => {
    if (!transformersModule) {
      transformersModule = await import('@xenova/transformers');
      // Configure environment after import
      transformersModule.env.allowLocalModels = false;
      transformersModule.env.allowRemoteModels = true;
      transformersModule.env.useBrowserCache = true;
    }
    return transformersModule;
  }, []);

  /**
   * Load the Whisper model (singleton pattern)
   */
  const loadModel = useCallback(async () => {
    if (transcriberInstance) {
      return transcriberInstance;
    }

    setState({
      status: 'loading',
      progress: 0,
      message: 'Loading Whisper model...',
    });

    try {
      // Dynamically import transformers to avoid early initialization
      const { pipeline } = await loadTransformers();

      transcriberInstance = await pipeline(
        'automatic-speech-recognition',
        'Xenova/whisper-tiny.en',
        {
          quantized: true,
          progress_callback: (progress: any) => {
            if (progress.status === 'progress' && progress.total) {
              const percent = Math.round((progress.loaded / progress.total) * 100);
              setState({
                status: 'loading',
                progress: percent,
                message: `Downloading model... ${percent}%`,
              });
            }
          },
        }
      );

      setState({
        status: 'ready',
        progress: 100,
        message: 'Model loaded successfully',
      });

      return transcriberInstance;
    } catch (error: any) {
      setState({
        status: 'error',
        progress: 0,
        message: '',
        error: `Failed to load model: ${error.message}`,
      });
      throw error;
    }
  }, [loadTransformers]);

  /**
   * Transcribe audio blob to text
   *
   * @param audioBlob - Audio file as Blob (from MediaRecorder or file input)
   * @returns Transcribed text
   * @throws Error if transcription fails
   */
  const transcribe = useCallback(
    async (audioBlob: Blob): Promise<string> => {
      try {
        // Load model if not already loaded
        const transcriber = await loadModel();

        setState({
          status: 'transcribing',
          progress: 0,
          message: 'Transcribing audio...',
        });

        // Convert Blob to ArrayBuffer
        const audioData = await audioBlob.arrayBuffer();

        // Run transcription
        const result = await transcriber(audioData, {
          return_timestamps: false,
          chunk_length_s: 30,
          stride_length_s: 5,
        });

        const transcribedText = result.text.trim();

        setState({
          status: 'complete',
          progress: 100,
          message: 'Transcription complete',
          text: transcribedText,
        });

        return transcribedText;
      } catch (error: any) {
        const errorMessage = `Transcription failed: ${error.message}`;
        setState({
          status: 'error',
          progress: 0,
          message: '',
          error: errorMessage,
        });
        throw new Error(errorMessage);
      }
    },
    [loadModel]
  );

  return {
    transcribe,
    state,
    cleanup: () => {
      // No cleanup needed - model is cached globally
    },
    isReady: state.status === 'ready' || state.status === 'idle',
    isLoading: state.status === 'loading',
    isTranscribing: state.status === 'transcribing',
    hasError: state.status === 'error',
  };
};

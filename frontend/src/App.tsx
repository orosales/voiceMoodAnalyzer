import { useState } from 'react';
import AudioRecorder from './components/AudioRecorder';
import FileUploader from './components/FileUploader';
import MoodResult from './components/MoodResult';
import LoadingSpinner from './components/LoadingSpinner';
import { analyzeVoice } from './services/api';
import { MoodAnalysisResponse } from './types';

function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<MoodAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getErrorMessage = (err: any): string => {
    const detail = err.response?.data?.detail || err.message;

    if (detail?.includes('file size') || detail?.includes('too large')) {
      return 'File is too large. Please use an audio file under 25MB, or try recording directly instead.';
    }

    if (detail?.includes('format') || detail?.includes('unsupported')) {
      return 'Audio format not supported. Please use WAV, MP3, M4A, OGG, FLAC, or WebM format.';
    }

    if (detail?.includes('network') || detail?.includes('timeout')) {
      return 'Network connection issue. Please check your internet connection and try again.';
    }

    if (detail?.includes('API key') || detail?.includes('unauthorized')) {
      return 'Service configuration error. Please contact support.';
    }

    return 'Unable to analyze audio. Please try recording again or uploading a different file.';
  };

  const handleAudioReady = async (audioData: Blob | File) => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      // Convert Blob to File if needed
      const audioFile = audioData instanceof File
        ? audioData
        : new File([audioData], 'recording.webm', { type: audioData.type });

      // Send audio to backend for analysis
      const analysisResult = await analyzeVoice(audioFile);
      setResult(analysisResult);
    } catch (err: any) {
      console.error('Analysis error:', err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <header className="text-center mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              VoiceMoodAnalyzer
            </h1>
            <p className="text-gray-900 text-lg">
              AI-powered voice emotion detection using Whisper.cpp & Hugging Face
            </p>
            <div className="mt-4 bg-blue-50 border-2 border-blue-400 rounded-lg p-3 text-sm">
              <p className="text-blue-900 font-medium">
                ℹ️ Audio emotion analysis: Based on recording duration
              </p>
              <p className="text-blue-800 text-xs mt-1">
                • Under 15 seconds: Audio emotion + Text emotion analysis
              </p>
              <p className="text-blue-800 text-xs">
                • 15 seconds or longer: Text emotion analysis only
              </p>
            </div>
          </header>

          <main id="main-content">
            <h2 className="sr-only">Voice Analysis Interface</h2>

            <div className="space-y-6">
              {error && (
                <section aria-labelledby="error-heading">
                  <h3 id="error-heading" className="sr-only">Error Message</h3>
                  <div
                    className="bg-red-50 border-2 border-red-500 text-red-900 px-6 py-4 rounded-xl shadow-lg"
                    role="alert"
                    aria-live="assertive"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl flex-shrink-0" aria-hidden="true">⚠️</span>
                      <div className="flex-1">
                        <p className="font-bold text-lg mb-1">Error</p>
                        <p className="text-sm leading-relaxed">{error}</p>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {isAnalyzing && (
                <section aria-labelledby="loading-heading">
                  <h3 id="loading-heading" className="sr-only">Analysis in Progress</h3>
                  <LoadingSpinner message="Analyzing your voice..."
                  />
                </section>
              )}

              {result && !isAnalyzing && (
                <section aria-labelledby="results-heading">
                  <h3 id="results-heading" className="sr-only">Analysis Results</h3>
                  <MoodResult result={result} />
                  <div className="text-center mt-6">
                    <button
                      onClick={handleReset}
                      className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-lg shadow-purple-500/50 transition-all duration-200 active:scale-95 hover:shadow-xl hover:shadow-purple-600/50 min-h-[44px]"
                      aria-label="Analyze another audio recording"
                    >
                      Analyze Another
                    </button>
                  </div>
                </section>
              )}

              {!isAnalyzing && !result && (
                <>
                  <section aria-labelledby="record-heading">
                    <h3 id="record-heading" className="sr-only">Record Audio</h3>
                    <AudioRecorder
                      onRecordingComplete={handleAudioReady}
                      onError={setError}
                      disabled={isAnalyzing}
                    />
                  </section>

                  <div className="relative text-center py-4" aria-hidden="true">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t-2 border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-4 py-1 text-gray-900 font-bold text-sm uppercase tracking-wider rounded-full shadow-sm">
                        OR
                      </span>
                    </div>
                  </div>

                  <section aria-labelledby="upload-heading">
                    <h3 id="upload-heading" className="sr-only">Upload Audio File</h3>
                    <FileUploader
                      onFileSelected={handleAudioReady}
                      disabled={isAnalyzing}
                    />
                  </section>
                </>
              )}
            </div>
          </main>

          <footer className="mt-12 text-center text-sm">
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 shadow-sm inline-block">
              <p className="text-gray-900 font-medium">
                Powered by Whisper.cpp (local) & Hugging Face Transformers
              </p>
              <p className="mt-1 text-gray-700 text-xs">
                Fast local transcription • Works on desktop and mobile devices
              </p>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}

export default App;

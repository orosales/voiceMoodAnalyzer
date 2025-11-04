import React, { useState } from 'react';
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

  const handleAudioReady = async (audioData: Blob | File) => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      // Convert Blob to File if needed
      const audioFile = audioData instanceof File
        ? audioData
        : new File([audioData], 'recording.webm', { type: audioData.type });

      const analysisResult = await analyzeVoice(audioFile);
      setResult(analysisResult);
    } catch (err: any) {
      console.error('Analysis error:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Analysis failed. Please try again.';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
            VoiceMoodAnalyzer
          </h1>
          <p className="text-gray-600 text-lg">
            AI-powered voice emotion detection using Whisper & Hugging Face
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow">
              <div className="flex items-center">
                <span className="text-2xl mr-2">⚠️</span>
                <div>
                  <p className="font-semibold">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isAnalyzing && <LoadingSpinner message="Analyzing your voice..." />}

          {/* Result Display */}
          {result && !isAnalyzing && (
            <>
              <MoodResult result={result} />
              <div className="text-center">
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg shadow-md transition-all duration-200 active:scale-95"
                >
                  Analyze Another
                </button>
              </div>
            </>
          )}

          {/* Input Methods */}
          {!isAnalyzing && !result && (
            <>
              <AudioRecorder
                onRecordingComplete={handleAudioReady}
                disabled={isAnalyzing}
              />

              <div className="text-center text-gray-500 font-semibold">
                OR
              </div>

              <FileUploader
                onFileSelected={handleAudioReady}
                disabled={isAnalyzing}
              />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-600">
          <p>Powered by OpenAI Whisper & Hugging Face Transformers</p>
          <p className="mt-2">Works on desktop and mobile devices</p>
        </div>
      </div>
    </div>
  );
}

export default App;

import React from 'react';
import { MoodAnalysisResponse } from '../types';

interface MoodResultProps {
  result: MoodAnalysisResponse | null;
}

const MoodResult: React.FC<MoodResultProps> = ({ result }) => {
  if (!result) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 via-white to-blue-50 rounded-xl shadow-2xl p-6 animate-fadeIn border border-purple-100">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 text-center">
        Analysis Results
      </h2>

      {/* Main Mood Display */}
      <div className="bg-white rounded-lg p-6 mb-4 text-center shadow-md">
        <div className="text-6xl mb-2" role="img" aria-label={`${result.final_mood} emotion`}>
          {result.emoji}
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-2">{result.final_mood}</h3>
        <p className="text-gray-800">{result.description}</p>
      </div>

      {/* Transcribed Text */}
      <div className="bg-white rounded-lg p-4 mb-4 shadow-md">
        <h4 className="font-bold text-gray-900 mb-2 text-base">Transcription:</h4>
        <p className="text-gray-800 italic">"{result.transcribed_text}"</p>
      </div>

      {/* Emotion Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Audio Emotion */}
        <div className="bg-white rounded-lg p-4 shadow-md">
          <h4 className="font-bold text-gray-900 mb-2 text-base">Audio Emotion</h4>
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium text-blue-600 capitalize">
              {result.audio_emotion}
            </span>
            <span className="text-sm text-gray-800 font-medium">
              {(result.audio_confidence * 100).toFixed(1)}% confidence
            </span>
          </div>
          <div
            className="mt-2 bg-gray-200 rounded-full h-3 overflow-hidden"
            role="progressbar"
            aria-valuenow={Math.round(result.audio_confidence * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Audio emotion confidence: ${(result.audio_confidence * 100).toFixed(1)} percent`}
          >
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full h-3 transition-all duration-500 shadow-sm"
              style={{ width: `${result.audio_confidence * 100}%` }}
            />
          </div>
        </div>

        {/* Text Emotion */}
        <div className="bg-white rounded-lg p-4 shadow-md">
          <h4 className="font-bold text-gray-900 mb-2 text-base">Text Emotion</h4>
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium text-green-600 capitalize">
              {result.text_emotion}
            </span>
            <span className="text-sm text-gray-800 font-medium">
              {(result.text_confidence * 100).toFixed(1)}% confidence
            </span>
          </div>
          <div
            className="mt-2 bg-gray-200 rounded-full h-3 overflow-hidden"
            role="progressbar"
            aria-valuenow={Math.round(result.text_confidence * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Text emotion confidence: ${(result.text_confidence * 100).toFixed(1)} percent`}
          >
            <div
              className="bg-gradient-to-r from-green-500 to-green-600 rounded-full h-3 transition-all duration-500 shadow-sm"
              style={{ width: `${result.text_confidence * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodResult;

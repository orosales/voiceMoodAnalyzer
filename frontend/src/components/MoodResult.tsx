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
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow-lg p-6 animate-fadeIn">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">
        Analysis Results
      </h2>

      {/* Main Mood Display */}
      <div className="bg-white rounded-lg p-6 mb-4 text-center shadow-md">
        <div className="text-6xl mb-2">{result.emoji}</div>
        <h3 className="text-3xl font-bold text-gray-800 mb-2">{result.final_mood}</h3>
        <p className="text-gray-600">{result.description}</p>
      </div>

      {/* Transcribed Text */}
      <div className="bg-white rounded-lg p-4 mb-4 shadow-md">
        <h4 className="font-semibold text-gray-700 mb-2">Transcription:</h4>
        <p className="text-gray-800 italic">"{result.transcribed_text}"</p>
      </div>

      {/* Emotion Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Audio Emotion */}
        <div className="bg-white rounded-lg p-4 shadow-md">
          <h4 className="font-semibold text-gray-700 mb-2">Audio Emotion</h4>
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium text-blue-600 capitalize">
              {result.audio_emotion}
            </span>
            <span className="text-sm text-gray-500">
              {(result.audio_confidence * 100).toFixed(1)}%
            </span>
          </div>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 rounded-full h-2 transition-all duration-500"
              style={{ width: `${result.audio_confidence * 100}%` }}
            />
          </div>
        </div>

        {/* Text Emotion */}
        <div className="bg-white rounded-lg p-4 shadow-md">
          <h4 className="font-semibold text-gray-700 mb-2">Text Emotion</h4>
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium text-green-600 capitalize">
              {result.text_emotion}
            </span>
            <span className="text-sm text-gray-500">
              {(result.text_confidence * 100).toFixed(1)}%
            </span>
          </div>
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 rounded-full h-2 transition-all duration-500"
              style={{ width: `${result.text_confidence * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodResult;

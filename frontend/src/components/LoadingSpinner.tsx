import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Analyzing...' }) => {
  return (
    <div
      className="bg-white rounded-xl shadow-xl p-10 text-center border border-blue-100"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center space-y-6">
        <div className="relative" aria-hidden="true">
          <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin shadow-lg"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-purple-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        <p className="text-xl font-bold text-gray-900">{message}</p>
        <p className="text-sm text-gray-800 max-w-xs">This may take a few moments...</p>
        <span className="sr-only">Loading, please wait</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;

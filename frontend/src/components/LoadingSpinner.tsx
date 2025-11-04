import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Analyzing...' }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-8 text-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        <p className="text-lg font-medium text-gray-700">{message}</p>
        <p className="text-sm text-gray-500">This may take a few moments...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;

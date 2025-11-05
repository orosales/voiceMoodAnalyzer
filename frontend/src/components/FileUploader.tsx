import React, { useRef } from 'react';

interface FileUploaderProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelected, disabled = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelected(file);
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Upload Audio File</h3>

      <div className="flex flex-col items-center space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,.wav,.mp3,.m4a,.ogg,.flac,.webm"
          onChange={handleFileChange}
          className="hidden"
          id="audio-file-input"
          aria-label="Upload audio file for mood analysis"
        />

        <button
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-describedby="upload-help-text"
          className={`
            px-8 py-4 rounded-lg font-semibold text-white min-h-[44px] min-w-[200px]
            bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/50
            transform transition-all duration-200 active:scale-95
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl hover:shadow-green-600/50'}
          `}
        >
          <span className="flex items-center">
            <span className="mr-2" aria-hidden="true">📁</span>
            Choose Audio File
          </span>
        </button>

        <p id="upload-help-text" className="text-sm text-gray-900 text-center font-medium">
          Supported formats: WAV, MP3, M4A, OGG, FLAC, WebM
        </p>
        <p className="text-xs text-gray-800 font-medium">
          Maximum file size: 25MB
        </p>
      </div>
    </div>
  );
};

export default FileUploader;

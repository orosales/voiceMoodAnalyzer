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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Upload Audio File</h2>

      <div className="flex flex-col items-center space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,.wav,.mp3,.m4a,.ogg,.flac,.webm"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          onClick={handleClick}
          disabled={disabled}
          className={`
            px-8 py-4 rounded-lg font-semibold text-white
            bg-green-500 hover:bg-green-600
            transform transition-all duration-200 active:scale-95
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}
          `}
        >
          <span className="flex items-center">
            <span className="mr-2">📁</span>
            Choose Audio File
          </span>
        </button>

        <p className="text-sm text-gray-600 text-center">
          Supported formats: WAV, MP3, M4A, OGG, FLAC, WebM
        </p>
        <p className="text-xs text-gray-500">
          Maximum file size: 25MB
        </p>
      </div>
    </div>
  );
};

export default FileUploader;

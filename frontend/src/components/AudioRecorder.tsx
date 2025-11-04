import React, { useState, useRef } from 'react';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  disabled?: boolean;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete, disabled = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4',
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        onRecordingComplete(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please grant permission and try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Record Audio</h2>

      <div className="flex flex-col items-center space-y-4">
        {isRecording && (
          <div className="text-2xl font-mono text-red-600">
            {formatTime(recordingTime)}
          </div>
        )}

        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={disabled}
          className={`
            px-8 py-4 rounded-full font-semibold text-white
            transform transition-all duration-200
            ${isRecording
              ? 'bg-red-500 hover:bg-red-600 active:scale-95'
              : 'bg-blue-500 hover:bg-blue-600 active:scale-95'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}
          `}
        >
          {isRecording ? (
            <span className="flex items-center">
              <span className="animate-pulse mr-2">⏹</span>
              Stop Recording
            </span>
          ) : (
            <span className="flex items-center">
              <span className="mr-2">🎤</span>
              Start Recording
            </span>
          )}
        </button>

        <p className="text-sm text-gray-600 text-center">
          {isRecording
            ? 'Recording in progress... Click "Stop Recording" when done'
            : 'Click to start recording your voice'
          }
        </p>
      </div>
    </div>
  );
};

export default AudioRecorder;

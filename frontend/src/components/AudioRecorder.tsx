import React, { useState, useRef, useEffect } from 'react';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  onError,
  disabled = false
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // Update document title when recording
  useEffect(() => {
    if (isRecording) {
      const originalTitle = document.title;
      document.title = '🔴 Recording... - VoiceMoodAnalyzer';

      return () => {
        document.title = originalTitle;
      };
    }
  }, [isRecording]);

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

    } catch (error: any) {
      console.error('Error accessing microphone:', error);

      let errorMessage = 'Unable to access microphone. ';

      if (error.name === 'NotAllowedError') {
        errorMessage += 'Please grant microphone permission in your browser settings and try again.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No microphone found. Please connect a microphone and try again.';
      } else {
        errorMessage += 'Please check your microphone settings and try again.';
      }

      onError?.(errorMessage);
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
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Record Audio</h3>

      <div className="flex flex-col items-center space-y-4">
        {isRecording && (
          <div
            className="text-3xl font-bold font-mono text-red-600 bg-red-50 px-6 py-3 rounded-lg border-2 border-red-200"
            role="timer"
            aria-live="off"
            aria-atomic="true"
            aria-label={`Recording time: ${formatTime(recordingTime)}`}
          >
            <span aria-hidden="true" className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></span>
              {formatTime(recordingTime)}
            </span>
          </div>
        )}

        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={disabled}
          aria-label={isRecording ? 'Stop recording audio' : 'Start recording audio'}
          className={`
            px-8 py-4 rounded-full font-semibold text-white min-h-[44px] min-w-[200px]
            transform transition-all duration-200
            ${isRecording
              ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/50 active:scale-95'
              : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/50 active:scale-95'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl hover:shadow-blue-600/50'}
          `}
        >
          {isRecording ? (
            <span className="flex items-center">
              <span className="animate-pulse mr-2" aria-hidden="true">⏹</span>
              Stop Recording
            </span>
          ) : (
            <span className="flex items-center">
              <span className="mr-2" aria-hidden="true">🎤</span>
              Start Recording
            </span>
          )}
        </button>

        <p className="text-sm text-gray-900 text-center font-medium">
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

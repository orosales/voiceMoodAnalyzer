import axios from 'axios';
import { MoodAnalysisResponse, AnalysisHistory } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds for audio processing
});

export const analyzeVoice = async (audioFile: File): Promise<MoodAnalysisResponse> => {
  const formData = new FormData();
  formData.append('file', audioFile);

  const response = await api.post<MoodAnalysisResponse>('/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const getHistory = async (limit: number = 20): Promise<AnalysisHistory[]> => {
  const response = await api.get<AnalysisHistory[]>('/history', {
    params: { limit },
  });

  return response.data;
};

export default api;

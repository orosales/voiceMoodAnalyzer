export interface MoodAnalysisResponse {
  transcribed_text: string;
  audio_emotion: string;
  audio_confidence: number;
  text_emotion: string;
  text_confidence: number;
  final_mood: string;
  emoji: string;
  description: string;
}

export interface AnalysisHistory {
  id: number;
  created_at: string;
  transcribed_text: string;
  audio_emotion: string;
  audio_confidence: number;
  text_emotion: string;
  text_confidence: number;
  final_mood: string;
  emoji: string;
  description: string;
}

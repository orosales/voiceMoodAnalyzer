-- VoiceMoodAnalyzer Database Initialization
-- This script drops and recreates the necessary tables for the voice mood analyzer system

-- Drop existing tables (CASCADE will drop dependent objects)
DROP TABLE IF EXISTS voice_analysis CASCADE;
DROP TABLE IF EXISTS voice_matrix CASCADE;

-- Create voice_matrix table (Fusion Matrix)
CREATE TABLE voice_matrix (
    id SERIAL PRIMARY KEY,
    audio_emotion VARCHAR(50) NOT NULL,
    text_emotion VARCHAR(50) NOT NULL,
    final_mood VARCHAR(100) NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT voice_matrix_audio_emotion_text_emotion_key UNIQUE(audio_emotion, text_emotion)
);

CREATE INDEX idx_voice_matrix_emotions ON voice_matrix(audio_emotion, text_emotion);

-- Create voice_analysis table (Analysis History)
CREATE TABLE voice_analysis (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    transcribed_text TEXT NOT NULL,
    audio_emotion VARCHAR(50) NOT NULL,
    audio_confidence FLOAT NOT NULL,
    text_emotion VARCHAR(50) NOT NULL,
    text_confidence FLOAT NOT NULL,
    final_mood VARCHAR(100) NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    description TEXT
);

CREATE INDEX idx_voice_analysis_created ON voice_analysis(created_at DESC);
CREATE INDEX idx_voice_analysis_mood ON voice_analysis(final_mood);

-- Add comments for documentation
COMMENT ON TABLE voice_matrix IS 'Fusion matrix mapping audio and text emotions to final mood (upgraded for 7 audio emotions)';
COMMENT ON TABLE voice_analysis IS 'Historical record of voice mood analyses';

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Tables created successfully';
    RAISE NOTICE '  - voice_matrix: ready for 7 audio emotions (angry, disgust, fear, happy, neutral, sad, surprise)';
    RAISE NOTICE '  - voice_analysis: ready for analysis history';
END $$;

-- VoiceMoodAnalyzer Database Initialization
-- This script creates the necessary tables for the voice mood analyzer system
-- IDEMPOTENT: Safe to run multiple times

-- Create voice_matrix table (Fusion Matrix) if not exists
CREATE TABLE IF NOT EXISTS voice_matrix (
    id SERIAL PRIMARY KEY,
    audio_emotion VARCHAR(50) NOT NULL,
    text_emotion VARCHAR(50) NOT NULL,
    final_mood VARCHAR(100) NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT voice_matrix_audio_emotion_text_emotion_key UNIQUE(audio_emotion, text_emotion)
);

-- Create index if not exists (PostgreSQL 9.5+)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_voice_matrix_emotions') THEN
        CREATE INDEX idx_voice_matrix_emotions ON voice_matrix(audio_emotion, text_emotion);
    END IF;
END $$;

-- Create voice_analysis table (Analysis History) if not exists
CREATE TABLE IF NOT EXISTS voice_analysis (
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

-- Create indexes if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_voice_analysis_created') THEN
        CREATE INDEX idx_voice_analysis_created ON voice_analysis(created_at DESC);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_voice_analysis_mood') THEN
        CREATE INDEX idx_voice_analysis_mood ON voice_analysis(final_mood);
    END IF;
END $$;

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

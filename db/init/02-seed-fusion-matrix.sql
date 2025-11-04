-- Seed Fusion Matrix with emotion combinations
-- This creates a comprehensive mapping of audio + text emotions to final moods

-- Clear existing data (for re-runs)
TRUNCATE TABLE voice_matrix RESTART IDENTITY CASCADE;

-- Neutral Audio Combinations
INSERT INTO voice_matrix (audio_emotion, text_emotion, final_mood, emoji, description) VALUES
('neutral', 'neutral', 'Calm & Neutral', '😐', 'The speaker appears calm and emotionally balanced.'),
('neutral', 'happy', 'Quietly Content', '🙂', 'The speaker expresses happiness through words while maintaining a calm tone.'),
('neutral', 'sad', 'Subdued Sadness', '😔', 'The speaker conveys sadness through content while maintaining composure.'),
('neutral', 'angry', 'Restrained Frustration', '😠', 'The speaker expresses anger through words but controls vocal tone.'),
('neutral', 'surprised', 'Mild Surprise', '😯', 'The speaker shows surprise through words with controlled delivery.'),
('neutral', 'fearful', 'Quiet Concern', '😟', 'The speaker expresses worry through content while maintaining vocal control.'),
('neutral', 'disgusted', 'Subtle Disgust', '😒', 'The speaker conveys distaste through words with a neutral tone.');

-- Happy Audio Combinations
INSERT INTO voice_matrix (audio_emotion, text_emotion, final_mood, emoji, description) VALUES
('happy', 'neutral', 'Optimistic', '😊', 'The speaker sounds upbeat even with neutral content.'),
('happy', 'happy', 'Very Happy & Joyful', '😄', 'The speaker is genuinely happy in both tone and words.'),
('happy', 'sad', 'Mixed Emotions', '🙃', 'There is a disconnect between the cheerful tone and sad content.'),
('happy', 'angry', 'Sarcastic or Passive-Aggressive', '😏', 'The speaker may be using humor to mask anger or being sarcastic.'),
('happy', 'surprised', 'Delighted Surprise', '😃', 'The speaker is pleasantly surprised and enthusiastic.'),
('happy', 'fearful', 'Nervous Laughter', '😅', 'The speaker may be using cheerfulness to cope with fear or anxiety.'),
('happy', 'disgusted', 'Amused Disgust', '🤨', 'The speaker finds something distasteful but humorous.');

-- Sad Audio Combinations
INSERT INTO voice_matrix (audio_emotion, text_emotion, final_mood, emoji, description) VALUES
('sad', 'neutral', 'Melancholic', '😞', 'The speaker sounds down despite neutral content.'),
('sad', 'happy', 'Bittersweet', '🥲', 'The speaker discusses positive things while sounding sad.'),
('sad', 'sad', 'Very Sad & Depressed', '😢', 'The speaker is deeply sad in both tone and content.'),
('sad', 'angry', 'Defeated Anger', '😤', 'The speaker expresses anger but sounds emotionally drained.'),
('sad', 'surprised', 'Disappointed Surprise', '😦', 'The speaker is surprised but in a negative or disappointing way.'),
('sad', 'fearful', 'Deeply Troubled', '😰', 'The speaker is both sad and anxious, feeling overwhelmed.'),
('sad', 'disgusted', 'Disheartened Disgust', '😩', 'The speaker is upset and repulsed by something.');

-- Angry Audio Combinations
INSERT INTO voice_matrix (audio_emotion, text_emotion, final_mood, emoji, description) VALUES
('angry', 'neutral', 'Irritated', '😑', 'The speaker sounds frustrated even with neutral content.'),
('angry', 'happy', 'Conflicted or Manic', '😵', 'There is a disturbing disconnect between angry tone and happy words.'),
('angry', 'sad', 'Angry & Hurt', '😡', 'The speaker is both angry and deeply hurt.'),
('angry', 'angry', 'Very Angry & Furious', '🤬', 'The speaker is extremely angry in both tone and words.'),
('angry', 'surprised', 'Outraged Surprise', '😠', 'The speaker is shocked and angered by something.'),
('angry', 'fearful', 'Defensive Anger', '😾', 'The speaker uses anger as a defense mechanism against fear.'),
('angry', 'disgusted', 'Intense Disgust', '🤢', 'The speaker is both angry and deeply disgusted.');

-- Disgust Audio Combinations (NEW - from upgraded Wav2Vec2 model)
INSERT INTO voice_matrix (audio_emotion, text_emotion, final_mood, emoji, description) VALUES
('disgust', 'neutral', 'Mildly Disgusted', '😒', 'The speaker sounds repulsed but content is neutral.'),
('disgust', 'happy', 'Confusingly Positive', '🫤', 'The speaker sounds disgusted but words are positive - likely sarcasm.'),
('disgust', 'sad', 'Disgusted & Sad', '🤢', 'The speaker is both repulsed and sad about something.'),
('disgust', 'angry', 'Disgusted & Angry', '🤬', 'The speaker is both disgusted and furious.'),
('disgust', 'surprised', 'Shocked Disgust', '😱', 'The speaker is surprised by something disgusting.'),
('disgust', 'fearful', 'Fearful Disgust', '😨', 'The speaker is disgusted and afraid.'),
('disgust', 'disgusted', 'Extremely Disgusted', '🤮', 'The speaker is deeply disgusted in both tone and words.');

-- Fear Audio Combinations (NEW - from upgraded Wav2Vec2 model)
INSERT INTO voice_matrix (audio_emotion, text_emotion, final_mood, emoji, description) VALUES
('fear', 'neutral', 'Anxious', '😰', 'The speaker sounds fearful despite neutral content.'),
('fear', 'happy', 'Nervous Optimism', '😅', 'The speaker tries to sound positive but tone reveals fear.'),
('fear', 'sad', 'Fearful & Sad', '😢', 'The speaker is both afraid and sad.'),
('fear', 'angry', 'Panicked Anger', '😡', 'The speaker is angry but fear dominates the tone.'),
('fear', 'surprised', 'Shocked Fear', '😱', 'The speaker is surprised and terrified.'),
('fear', 'fearful', 'Extremely Fearful', '😨', 'The speaker is deeply afraid in both tone and words.'),
('fear', 'disgusted', 'Fearful Repulsion', '🤢', 'The speaker is both afraid and disgusted.');

-- Surprise Audio Combinations (NEW - from upgraded Wav2Vec2 model)
INSERT INTO voice_matrix (audio_emotion, text_emotion, final_mood, emoji, description) VALUES
('surprise', 'neutral', 'Unexpectedly Neutral', '😲', 'The speaker sounds surprised by mundane content.'),
('surprise', 'happy', 'Pleasantly Surprised', '😃', 'The speaker is surprised and delighted.'),
('surprise', 'sad', 'Sadly Surprised', '😦', 'The speaker is surprised by something disappointing.'),
('surprise', 'angry', 'Angrily Surprised', '😠', 'The speaker is surprised and angry about something.'),
('surprise', 'surprised', 'Very Surprised', '😱', 'The speaker is extremely surprised in both tone and words.'),
('surprise', 'fearful', 'Surprised & Scared', '😨', 'The speaker is surprised and afraid.'),
('surprise', 'disgusted', 'Surprised & Disgusted', '🤢', 'The speaker is surprised by something disgusting.');

-- Additional emotion combinations for completeness (joy combinations)
INSERT INTO voice_matrix (audio_emotion, text_emotion, final_mood, emoji, description) VALUES
('neutral', 'joy', 'Quietly Pleased', '☺️', 'The speaker is pleased but maintains vocal composure.'),
('happy', 'joy', 'Ecstatic', '🥳', 'The speaker is extremely joyful and enthusiastic.'),
('sad', 'joy', 'Wistful', '😌', 'The speaker discusses joy but with a melancholic undertone.'),
('angry', 'joy', 'Aggressively Positive', '😤', 'The speaker says positive words but with aggressive tone.'),
('disgust', 'joy', 'Sarcastic Joy', '😏', 'The speaker discusses positive things with a disgusted tone.'),
('fear', 'joy', 'Anxious Positivity', '😅', 'The speaker expresses joy but voice reveals underlying fear.'),
('surprise', 'joy', 'Joyful Amazement', '😍', 'The speaker is surprised and delighted.');

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Fusion matrix seeded successfully with % entries', (SELECT COUNT(*) FROM voice_matrix);
END $$;

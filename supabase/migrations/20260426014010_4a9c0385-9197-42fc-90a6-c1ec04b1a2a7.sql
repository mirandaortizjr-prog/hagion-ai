-- Add a subject column to daily_wisdom_stories so each story can be tied
-- to a specific Hagion University subject (biblical-stories, martyrs, etc.)
ALTER TABLE public.daily_wisdom_stories
  ADD COLUMN IF NOT EXISTS subject text NOT NULL DEFAULT 'general';

CREATE INDEX IF NOT EXISTS idx_daily_wisdom_stories_subject
  ON public.daily_wisdom_stories(subject);
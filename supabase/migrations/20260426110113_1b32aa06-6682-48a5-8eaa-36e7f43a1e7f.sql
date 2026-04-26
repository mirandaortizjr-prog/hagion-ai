ALTER TABLE public.daily_wisdom_stories
  ADD COLUMN IF NOT EXISTS era TEXT,
  ADD COLUMN IF NOT EXISTS law_statement TEXT,
  ADD COLUMN IF NOT EXISTS law_transgression TEXT,
  ADD COLUMN IF NOT EXISTS law_observance TEXT,
  ADD COLUMN IF NOT EXISTS law_interpretation TEXT;
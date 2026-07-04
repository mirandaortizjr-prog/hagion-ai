
ALTER TABLE public.user_devotionals
  ADD COLUMN IF NOT EXISTS appeal_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS appealed_at timestamptz;

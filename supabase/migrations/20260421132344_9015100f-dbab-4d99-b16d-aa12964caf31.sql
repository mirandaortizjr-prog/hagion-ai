
-- Add category + scoring to posts
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS vote_score INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS hot_score DOUBLE PRECISION NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_vote_score ON public.posts(vote_score DESC);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);

-- Votes table (upvote-only)
CREATE TABLE IF NOT EXISTS public.post_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);

ALTER TABLE public.post_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view votes"
  ON public.post_votes FOR SELECT
  USING (true);

CREATE POLICY "Auth users add own vote"
  ON public.post_votes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users remove own vote"
  ON public.post_votes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Update vote_score + hot_score automatically
CREATE OR REPLACE FUNCTION public.update_post_vote_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_id UUID;
  v_score INTEGER;
  v_age_hours DOUBLE PRECISION;
  v_created TIMESTAMP WITH TIME ZONE;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_post_id := NEW.post_id;
  ELSE
    v_post_id := OLD.post_id;
  END IF;

  SELECT created_at INTO v_created FROM public.posts WHERE id = v_post_id;
  v_score := (SELECT COUNT(*)::INT FROM public.post_votes WHERE post_id = v_post_id);
  v_age_hours := GREATEST(EXTRACT(EPOCH FROM (now() - v_created)) / 3600.0, 0.1);

  UPDATE public.posts
    SET vote_score = v_score,
        hot_score = v_score / power(v_age_hours + 2, 1.5)
    WHERE id = v_post_id;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_post_votes_score ON public.post_votes;
CREATE TRIGGER trg_post_votes_score
AFTER INSERT OR DELETE ON public.post_votes
FOR EACH ROW EXECUTE FUNCTION public.update_post_vote_score();

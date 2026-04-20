-- Daily Devotionals: 365 pre-generated entries, bilingual EN/ES
CREATE TABLE public.daily_devotionals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_year INTEGER NOT NULL UNIQUE CHECK (day_of_year BETWEEN 1 AND 366),
  title_en TEXT NOT NULL,
  title_es TEXT NOT NULL,
  scripture_ref_en TEXT NOT NULL,
  scripture_ref_es TEXT NOT NULL,
  scripture_text_en TEXT NOT NULL,
  scripture_text_es TEXT NOT NULL,
  reflection_en TEXT NOT NULL,
  reflection_es TEXT NOT NULL,
  application_question_en TEXT NOT NULL,
  application_question_es TEXT NOT NULL,
  prayer_en TEXT NOT NULL,
  prayer_es TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_devotionals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view devotionals"
  ON public.daily_devotionals FOR SELECT
  USING (true);

-- Threaded Reddit-style comments
CREATE TABLE public.devotional_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  devotional_id UUID NOT NULL REFERENCES public.daily_devotionals(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.devotional_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  author_name TEXT,
  author_avatar TEXT,
  content TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 4000),
  score INTEGER NOT NULL DEFAULT 0,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_dev_comments_devotional ON public.devotional_comments(devotional_id, created_at DESC);
CREATE INDEX idx_dev_comments_parent ON public.devotional_comments(parent_id);

ALTER TABLE public.devotional_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments"
  ON public.devotional_comments FOR SELECT
  USING (is_hidden = false);

CREATE POLICY "Auth users add comments"
  ON public.devotional_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own comments"
  ON public.devotional_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own comments"
  ON public.devotional_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_dev_comments_updated
  BEFORE UPDATE ON public.devotional_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Votes
CREATE TABLE public.devotional_comment_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES public.devotional_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  vote SMALLINT NOT NULL CHECK (vote IN (-1, 1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (comment_id, user_id)
);

ALTER TABLE public.devotional_comment_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view votes"
  ON public.devotional_comment_votes FOR SELECT
  USING (true);

CREATE POLICY "Users insert own votes"
  ON public.devotional_comment_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own votes"
  ON public.devotional_comment_votes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own votes"
  ON public.devotional_comment_votes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger to maintain comment score
CREATE OR REPLACE FUNCTION public.update_devotional_comment_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.devotional_comments
      SET score = score + NEW.vote
      WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.devotional_comments
      SET score = score + (NEW.vote - OLD.vote)
      WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.devotional_comments
      SET score = score - OLD.vote
      WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_dev_comment_vote_score
  AFTER INSERT OR UPDATE OR DELETE ON public.devotional_comment_votes
  FOR EACH ROW EXECUTE FUNCTION public.update_devotional_comment_score();

-- Reports
CREATE TABLE public.devotional_comment_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES public.devotional_comments(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (comment_id, reporter_id)
);

ALTER TABLE public.devotional_comment_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users can report"
  ON public.devotional_comment_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users see own reports"
  ON public.devotional_comment_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);
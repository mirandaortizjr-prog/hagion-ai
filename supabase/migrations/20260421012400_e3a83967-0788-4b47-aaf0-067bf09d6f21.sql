
-- Extend prayers
ALTER TABLE public.prayers
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS theme text,
  ADD COLUMN IF NOT EXISTS author_avatar text,
  ADD COLUMN IF NOT EXISTS is_answered boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS answered_at timestamptz,
  ADD COLUMN IF NOT EXISTS praying_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS amen_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS encouraged_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS comment_count integer NOT NULL DEFAULT 0;

-- Comments
CREATE TABLE IF NOT EXISTS public.prayer_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prayer_id uuid NOT NULL REFERENCES public.prayers(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.prayer_comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  author_name text,
  author_avatar text,
  content text NOT NULL,
  is_hidden boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.prayer_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view prayer comments"
  ON public.prayer_comments FOR SELECT USING (is_hidden = false);
CREATE POLICY "Auth users add prayer comments"
  ON public.prayer_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own prayer comments"
  ON public.prayer_comments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own prayer comments"
  ON public.prayer_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_prayer_comments_prayer ON public.prayer_comments(prayer_id);
CREATE INDEX IF NOT EXISTS idx_prayer_comments_parent ON public.prayer_comments(parent_id);

-- Reactions
CREATE TABLE IF NOT EXISTS public.prayer_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prayer_id uuid NOT NULL REFERENCES public.prayers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  reaction text NOT NULL CHECK (reaction IN ('praying','amen','encouraged')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (prayer_id, user_id, reaction)
);

ALTER TABLE public.prayer_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view prayer reactions"
  ON public.prayer_reactions FOR SELECT USING (true);
CREATE POLICY "Auth users add prayer reactions"
  ON public.prayer_reactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own prayer reactions"
  ON public.prayer_reactions FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_prayer_reactions_prayer ON public.prayer_reactions(prayer_id);

-- Triggers
CREATE OR REPLACE FUNCTION public.update_prayer_reaction_counts()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.reaction = 'praying' THEN UPDATE prayers SET praying_count = praying_count + 1 WHERE id = NEW.prayer_id;
    ELSIF NEW.reaction = 'amen' THEN UPDATE prayers SET amen_count = amen_count + 1 WHERE id = NEW.prayer_id;
    ELSIF NEW.reaction = 'encouraged' THEN UPDATE prayers SET encouraged_count = encouraged_count + 1 WHERE id = NEW.prayer_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.reaction = 'praying' THEN UPDATE prayers SET praying_count = GREATEST(praying_count - 1, 0) WHERE id = OLD.prayer_id;
    ELSIF OLD.reaction = 'amen' THEN UPDATE prayers SET amen_count = GREATEST(amen_count - 1, 0) WHERE id = OLD.prayer_id;
    ELSIF OLD.reaction = 'encouraged' THEN UPDATE prayers SET encouraged_count = GREATEST(encouraged_count - 1, 0) WHERE id = OLD.prayer_id;
    END IF;
  END IF;
  RETURN NULL;
END $$;

DROP TRIGGER IF EXISTS trg_prayer_reaction_counts ON public.prayer_reactions;
CREATE TRIGGER trg_prayer_reaction_counts
AFTER INSERT OR DELETE ON public.prayer_reactions
FOR EACH ROW EXECUTE FUNCTION public.update_prayer_reaction_counts();

CREATE OR REPLACE FUNCTION public.update_prayer_comment_counts()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN UPDATE prayers SET comment_count = comment_count + 1 WHERE id = NEW.prayer_id;
  ELSIF TG_OP = 'DELETE' THEN UPDATE prayers SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.prayer_id;
  END IF;
  RETURN NULL;
END $$;

DROP TRIGGER IF EXISTS trg_prayer_comment_counts ON public.prayer_comments;
CREATE TRIGGER trg_prayer_comment_counts
AFTER INSERT OR DELETE ON public.prayer_comments
FOR EACH ROW EXECUTE FUNCTION public.update_prayer_comment_counts();

DROP TRIGGER IF EXISTS trg_prayer_comments_updated_at ON public.prayer_comments;
CREATE TRIGGER trg_prayer_comments_updated_at
BEFORE UPDATE ON public.prayer_comments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Realtime
ALTER TABLE public.prayers REPLICA IDENTITY FULL;
ALTER TABLE public.prayer_comments REPLICA IDENTITY FULL;
ALTER TABLE public.prayer_reactions REPLICA IDENTITY FULL;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.prayers;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.prayer_comments;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.prayer_reactions;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

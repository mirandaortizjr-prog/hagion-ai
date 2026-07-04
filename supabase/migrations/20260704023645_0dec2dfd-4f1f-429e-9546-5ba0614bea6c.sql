
-- 1. USER DEVOTIONALS
CREATE TABLE public.user_devotionals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL,
  title text NOT NULL,
  scripture_ref text NOT NULL,
  scripture_text text,
  reflection text NOT NULL,
  prayer text NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  language text NOT NULL DEFAULT 'en',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','needs_revision','rejected')),
  moderation_feedback jsonb,
  moderation_score integer,
  last_featured_at timestamptz,
  featured_count integer NOT NULL DEFAULT 0,
  read_count integer NOT NULL DEFAULT 0,
  save_count integer NOT NULL DEFAULT 0,
  amen_count integer NOT NULL DEFAULT 0,
  comment_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_user_devotionals_status ON public.user_devotionals(status);
CREATE INDEX idx_user_devotionals_author ON public.user_devotionals(author_id);
CREATE INDEX idx_user_devotionals_rotation ON public.user_devotionals(status, last_featured_at NULLS FIRST);
CREATE INDEX idx_user_devotionals_created ON public.user_devotionals(created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_devotionals TO authenticated;
GRANT ALL ON public.user_devotionals TO service_role;

ALTER TABLE public.user_devotionals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read approved devotionals"
  ON public.user_devotionals FOR SELECT TO authenticated
  USING (status = 'approved' OR author_id = auth.uid());

CREATE POLICY "Premium users can submit devotionals"
  ON public.user_devotionals FOR INSERT TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND public.get_user_tier(auth.uid()) IN ('premium','premium_plus','pro')
    AND status = 'pending'
  );

CREATE POLICY "Authors can edit their submission while revising"
  ON public.user_devotionals FOR UPDATE TO authenticated
  USING (author_id = auth.uid() AND status IN ('needs_revision','pending'))
  WITH CHECK (author_id = auth.uid() AND status IN ('needs_revision','pending'));

CREATE POLICY "Authors can delete their own devotionals"
  ON public.user_devotionals FOR DELETE TO authenticated
  USING (author_id = auth.uid());

CREATE TRIGGER trg_user_devotionals_updated
  BEFORE UPDATE ON public.user_devotionals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. DAILY PICK
CREATE TABLE public.devotional_daily_pick (
  pick_date date PRIMARY KEY,
  devotional_id uuid NOT NULL REFERENCES public.user_devotionals(id) ON DELETE CASCADE,
  language text NOT NULL DEFAULT 'en',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.devotional_daily_pick TO authenticated;
GRANT ALL ON public.devotional_daily_pick TO service_role;

ALTER TABLE public.devotional_daily_pick ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read daily pick"
  ON public.devotional_daily_pick FOR SELECT TO authenticated
  USING (true);

-- 3. COMMENTS
CREATE TABLE public.user_devotional_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  devotional_id uuid NOT NULL REFERENCES public.user_devotionals(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  parent_id uuid REFERENCES public.user_devotional_comments(id) ON DELETE CASCADE,
  body text NOT NULL,
  amen_count integer NOT NULL DEFAULT 0,
  encouraged_count integer NOT NULL DEFAULT 0,
  insight_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_udc_devotional ON public.user_devotional_comments(devotional_id, created_at DESC);
CREATE INDEX idx_udc_parent ON public.user_devotional_comments(parent_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_devotional_comments TO authenticated;
GRANT ALL ON public.user_devotional_comments TO service_role;

ALTER TABLE public.user_devotional_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read comments"
  ON public.user_devotional_comments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can post comments"
  ON public.user_devotional_comments FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors can edit own comments"
  ON public.user_devotional_comments FOR UPDATE TO authenticated
  USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors can delete own comments"
  ON public.user_devotional_comments FOR DELETE TO authenticated
  USING (author_id = auth.uid());

CREATE TRIGGER trg_udc_updated
  BEFORE UPDATE ON public.user_devotional_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Comment count trigger on parent devotional
CREATE OR REPLACE FUNCTION public.update_user_devotional_comment_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.user_devotionals SET comment_count = comment_count + 1 WHERE id = NEW.devotional_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.user_devotionals SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.devotional_id;
  END IF;
  RETURN NULL;
END $$;

CREATE TRIGGER trg_udc_count
  AFTER INSERT OR DELETE ON public.user_devotional_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_user_devotional_comment_count();

-- 4. COMMENT REACTIONS
CREATE TABLE public.user_devotional_comment_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES public.user_devotional_comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  reaction text NOT NULL CHECK (reaction IN ('amen','encouraged','insight')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (comment_id, user_id, reaction)
);
CREATE INDEX idx_udcr_comment ON public.user_devotional_comment_reactions(comment_id);

GRANT SELECT, INSERT, DELETE ON public.user_devotional_comment_reactions TO authenticated;
GRANT ALL ON public.user_devotional_comment_reactions TO service_role;

ALTER TABLE public.user_devotional_comment_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read reactions"
  ON public.user_devotional_comment_reactions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can add own reactions"
  ON public.user_devotional_comment_reactions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove own reactions"
  ON public.user_devotional_comment_reactions FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.update_user_devotional_comment_reaction_counts()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.reaction = 'amen' THEN UPDATE public.user_devotional_comments SET amen_count = amen_count + 1 WHERE id = NEW.comment_id;
    ELSIF NEW.reaction = 'encouraged' THEN UPDATE public.user_devotional_comments SET encouraged_count = encouraged_count + 1 WHERE id = NEW.comment_id;
    ELSIF NEW.reaction = 'insight' THEN UPDATE public.user_devotional_comments SET insight_count = insight_count + 1 WHERE id = NEW.comment_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.reaction = 'amen' THEN UPDATE public.user_devotional_comments SET amen_count = GREATEST(amen_count - 1, 0) WHERE id = OLD.comment_id;
    ELSIF OLD.reaction = 'encouraged' THEN UPDATE public.user_devotional_comments SET encouraged_count = GREATEST(encouraged_count - 1, 0) WHERE id = OLD.comment_id;
    ELSIF OLD.reaction = 'insight' THEN UPDATE public.user_devotional_comments SET insight_count = GREATEST(insight_count - 1, 0) WHERE id = OLD.comment_id;
    END IF;
  END IF;
  RETURN NULL;
END $$;

CREATE TRIGGER trg_udcr_counts
  AFTER INSERT OR DELETE ON public.user_devotional_comment_reactions
  FOR EACH ROW EXECUTE FUNCTION public.update_user_devotional_comment_reaction_counts();

-- 5. SAVES
CREATE TABLE public.user_devotional_saves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  devotional_id uuid NOT NULL REFERENCES public.user_devotionals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (devotional_id, user_id)
);
CREATE INDEX idx_uds_user ON public.user_devotional_saves(user_id);

GRANT SELECT, INSERT, DELETE ON public.user_devotional_saves TO authenticated;
GRANT ALL ON public.user_devotional_saves TO service_role;

ALTER TABLE public.user_devotional_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their saves"
  ON public.user_devotional_saves FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can save"
  ON public.user_devotional_saves FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can unsave"
  ON public.user_devotional_saves FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.update_user_devotional_save_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.user_devotionals SET save_count = save_count + 1 WHERE id = NEW.devotional_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.user_devotionals SET save_count = GREATEST(save_count - 1, 0) WHERE id = OLD.devotional_id;
  END IF;
  RETURN NULL;
END $$;

CREATE TRIGGER trg_uds_count
  AFTER INSERT OR DELETE ON public.user_devotional_saves
  FOR EACH ROW EXECUTE FUNCTION public.update_user_devotional_save_count();

-- 6. Fair-rotation picker function
CREATE OR REPLACE FUNCTION public.pick_daily_devotional(p_date date DEFAULT CURRENT_DATE)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_id uuid;
  v_existing uuid;
BEGIN
  SELECT devotional_id INTO v_existing FROM public.devotional_daily_pick WHERE pick_date = p_date;
  IF v_existing IS NOT NULL THEN RETURN v_existing; END IF;

  -- Least-recently-featured, nulls first (brand-new gets first airtime)
  SELECT id INTO v_id
  FROM public.user_devotionals
  WHERE status = 'approved'
  ORDER BY last_featured_at NULLS FIRST, created_at ASC
  LIMIT 1;

  IF v_id IS NULL THEN RETURN NULL; END IF;

  INSERT INTO public.devotional_daily_pick (pick_date, devotional_id)
    VALUES (p_date, v_id)
    ON CONFLICT (pick_date) DO NOTHING;

  UPDATE public.user_devotionals
    SET last_featured_at = now(), featured_count = featured_count + 1
    WHERE id = v_id;

  RETURN v_id;
END $$;

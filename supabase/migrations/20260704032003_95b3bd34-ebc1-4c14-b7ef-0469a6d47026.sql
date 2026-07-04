
-- 1) Reports table (polymorphic: devotional or comment)
CREATE TABLE public.content_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL,
  target_type text NOT NULL CHECK (target_type IN ('user_devotional', 'user_devotional_comment')),
  target_id uuid NOT NULL,
  reason text NOT NULL CHECK (reason IN ('heresy', 'abuse', 'spam', 'off_topic', 'self_promotion', 'other')),
  details text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'actioned')),
  reviewer_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (reporter_id, target_type, target_id)
);

GRANT SELECT, INSERT ON public.content_reports TO authenticated;
GRANT ALL ON public.content_reports TO service_role;

ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own reports"
  ON public.content_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports"
  ON public.content_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id OR public.is_staff_email(auth.uid()));

CREATE POLICY "Staff can update reports"
  ON public.content_reports FOR UPDATE
  TO authenticated
  USING (public.is_staff_email(auth.uid()))
  WITH CHECK (public.is_staff_email(auth.uid()));

CREATE TRIGGER trg_content_reports_updated_at
  BEFORE UPDATE ON public.content_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_content_reports_target ON public.content_reports (target_type, target_id, status);

-- 2) Auto-hide devotional after 3 pending reports
CREATE OR REPLACE FUNCTION public.autohide_reported_devotional()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
BEGIN
  IF NEW.target_type = 'user_devotional' AND NEW.status = 'pending' THEN
    SELECT COUNT(*) INTO v_count
      FROM public.content_reports
      WHERE target_type = 'user_devotional'
        AND target_id = NEW.target_id
        AND status = 'pending';

    IF v_count >= 3 THEN
      UPDATE public.user_devotionals
        SET status = 'needs_revision',
            moderation_feedback = COALESCE(moderation_feedback, '{}'::jsonb)
              || jsonb_build_object(
                'autohidden', true,
                'autohidden_at', now(),
                'reason', 'Auto-hidden after multiple community reports pending review.'
              )
        WHERE id = NEW.target_id
          AND status = 'approved';

      -- Clear today's daily pick if this was the pick, so next fetch re-picks
      DELETE FROM public.devotional_daily_pick
        WHERE devotional_id = NEW.target_id AND pick_date = CURRENT_DATE;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_autohide_reported_devotional
  AFTER INSERT ON public.content_reports
  FOR EACH ROW EXECUTE FUNCTION public.autohide_reported_devotional();

-- 3) Rate-limited submission RPC (3/day per user)
CREATE OR REPLACE FUNCTION public.submit_user_devotional(
  p_title text,
  p_scripture_ref text,
  p_scripture_text text,
  p_reflection text,
  p_prayer text,
  p_tags text[],
  p_language text
)
RETURNS TABLE(id uuid, allowed boolean, remaining int, daily_limit int, error text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_tier text;
  v_daily_limit int := 3;
  v_count int;
  v_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RETURN QUERY SELECT NULL::uuid, false, 0, v_daily_limit, 'not_authenticated'; RETURN;
  END IF;

  v_tier := public.get_user_tier(v_uid);
  IF v_tier NOT IN ('premium', 'premium_plus', 'pro') THEN
    RETURN QUERY SELECT NULL::uuid, false, 0, v_daily_limit, 'premium_required'; RETURN;
  END IF;

  SELECT COUNT(*) INTO v_count
    FROM public.user_devotionals
    WHERE author_id = v_uid
      AND created_at >= (now() - interval '24 hours');

  IF v_count >= v_daily_limit THEN
    RETURN QUERY SELECT NULL::uuid, false, 0, v_daily_limit, 'rate_limited'; RETURN;
  END IF;

  INSERT INTO public.user_devotionals
    (author_id, title, scripture_ref, scripture_text, reflection, prayer, tags, language, status)
  VALUES
    (v_uid, p_title, p_scripture_ref, p_scripture_text, p_reflection, p_prayer, COALESCE(p_tags, '{}'), COALESCE(p_language, 'en'), 'pending')
  RETURNING user_devotionals.id INTO v_id;

  RETURN QUERY SELECT v_id, true, v_daily_limit - (v_count + 1), v_daily_limit, NULL::text;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_user_devotional(text, text, text, text, text, text[], text) TO authenticated;

CREATE OR REPLACE FUNCTION public.check_sermon_draft_quota(p_user_id uuid)
RETURNS TABLE(allowed boolean, remaining integer, monthly_limit integer, tier text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_tier text;
  v_limit integer := 5;
  v_count integer;
  v_month_start timestamptz := date_trunc('month', now());
BEGIN
  v_tier := public.get_user_tier(p_user_id);

  IF v_tier <> 'pro' THEN
    RETURN QUERY SELECT false, 0, 0, v_tier;
    RETURN;
  END IF;

  SELECT COUNT(*)::int INTO v_count
  FROM public.sermon_drafts
  WHERE user_id = p_user_id
    AND created_at >= v_month_start;

  IF v_count >= v_limit THEN
    RETURN QUERY SELECT false, 0, v_limit, v_tier;
    RETURN;
  END IF;

  RETURN QUERY SELECT true, v_limit - v_count, v_limit, v_tier;
END;
$$;

-- Enforce at insert time as a safety net (RLS-friendly trigger)
CREATE OR REPLACE FUNCTION public.enforce_sermon_draft_quota()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_tier text;
  v_count integer;
  v_month_start timestamptz := date_trunc('month', now());
BEGIN
  v_tier := public.get_user_tier(NEW.user_id);
  IF v_tier <> 'pro' THEN
    RAISE EXCEPTION 'Sermon Lab is only available on the Pro plan';
  END IF;

  SELECT COUNT(*)::int INTO v_count
  FROM public.sermon_drafts
  WHERE user_id = NEW.user_id
    AND created_at >= v_month_start;

  IF v_count >= 5 THEN
    RAISE EXCEPTION 'Monthly sermon limit reached (5 per month)';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sermon_draft_quota_trg ON public.sermon_drafts;
CREATE TRIGGER sermon_draft_quota_trg
BEFORE INSERT ON public.sermon_drafts
FOR EACH ROW
EXECUTE FUNCTION public.enforce_sermon_draft_quota();
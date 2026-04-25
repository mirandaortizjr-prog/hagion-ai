-- Drop existing function so the return type can change
DROP FUNCTION IF EXISTS public.check_and_increment_message_count(uuid);

-- ============================================================================
-- 1. SUBSCRIPTIONS TABLE (Stripe-synced)
-- ============================================================================
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id text NOT NULL UNIQUE,
  stripe_customer_id text NOT NULL,
  product_id text NOT NULL,
  price_id text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  environment text NOT NULL DEFAULT 'sandbox',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_user_env_status ON public.subscriptions(user_id, environment, status);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions"
  ON public.subscriptions FOR ALL
  USING (auth.role() = 'service_role');

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 2. DISCERNMENT USAGE TABLE
-- ============================================================================
CREATE TABLE public.discernment_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  feature text NOT NULL CHECK (feature IN ('sermon_analysis', 'doctrine_analysis', 'lyric_analysis')),
  period_start timestamptz NOT NULL DEFAULT date_trunc('month', now()),
  count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, feature, period_start)
);

CREATE INDEX idx_discernment_usage_lookup ON public.discernment_usage(user_id, feature, period_start);

ALTER TABLE public.discernment_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own discernment usage"
  ON public.discernment_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages discernment usage"
  ON public.discernment_usage FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================
-- 3. TRANSCRIPTION USAGE TABLE
-- ============================================================================
CREATE TABLE public.transcription_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  day_bucket date NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::date,
  month_bucket date NOT NULL DEFAULT date_trunc('month', now())::date,
  daily_minutes integer NOT NULL DEFAULT 0,
  monthly_minutes integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, day_bucket)
);

CREATE INDEX idx_transcription_usage_lookup ON public.transcription_usage(user_id, day_bucket);
CREATE INDEX idx_transcription_usage_month ON public.transcription_usage(user_id, month_bucket);

ALTER TABLE public.transcription_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transcription usage"
  ON public.transcription_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages transcription usage"
  ON public.transcription_usage FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================================
-- 4. GET USER TIER
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_user_tier(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_price_id text;
BEGIN
  SELECT price_id INTO v_price_id
  FROM public.subscriptions
  WHERE user_id = p_user_id
    AND (
      (status IN ('active', 'trialing') AND (current_period_end IS NULL OR current_period_end > now()))
      OR (status = 'canceled' AND current_period_end > now())
    )
  ORDER BY 
    CASE 
      WHEN price_id = 'hagion_pro_monthly' THEN 1
      WHEN price_id = 'hagion_premium_plus_monthly' THEN 2
      WHEN price_id = 'hagion_premium_monthly' THEN 3
      ELSE 4
    END,
    created_at DESC
  LIMIT 1;

  IF v_price_id IS NULL THEN RETURN 'free'; END IF;

  RETURN CASE v_price_id
    WHEN 'hagion_pro_monthly' THEN 'pro'
    WHEN 'hagion_premium_plus_monthly' THEN 'premium_plus'
    WHEN 'hagion_premium_monthly' THEN 'premium'
    ELSE 'free'
  END;
END;
$$;

-- ============================================================================
-- 5. MESSAGE COUNT WITH PER-TIER LIMITS
-- ============================================================================
CREATE OR REPLACE FUNCTION public.check_and_increment_message_count(p_user_id uuid)
RETURNS TABLE(allowed boolean, remaining integer, tier text, daily_limit integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
  v_last_reset timestamptz;
  v_should_reset boolean;
  v_tier text;
  v_limit integer;
BEGIN
  v_tier := public.get_user_tier(p_user_id);
  v_limit := CASE v_tier
    WHEN 'pro' THEN 1000
    WHEN 'premium_plus' THEN 300
    WHEN 'premium' THEN 100
    ELSE 5
  END;

  SELECT message_count, last_reset_at INTO v_count, v_last_reset
  FROM public.user_message_usage
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    INSERT INTO public.user_message_usage (user_id, message_count, last_reset_at)
    VALUES (p_user_id, 1, now());
    RETURN QUERY SELECT true, v_limit - 1, v_tier, v_limit;
    RETURN;
  END IF;

  v_should_reset := (now() - v_last_reset) > interval '24 hours';

  IF v_should_reset THEN
    UPDATE public.user_message_usage
    SET message_count = 1, last_reset_at = now()
    WHERE user_id = p_user_id;
    RETURN QUERY SELECT true, v_limit - 1, v_tier, v_limit;
    RETURN;
  END IF;

  IF v_count < v_limit THEN
    UPDATE public.user_message_usage
    SET message_count = message_count + 1
    WHERE user_id = p_user_id;
    RETURN QUERY SELECT true, v_limit - (v_count + 1), v_tier, v_limit;
  ELSE
    RETURN QUERY SELECT false, 0, v_tier, v_limit;
  END IF;
END;
$$;

-- ============================================================================
-- 6. CHECK + INCREMENT DISCERNMENT USAGE
-- ============================================================================
CREATE OR REPLACE FUNCTION public.check_and_increment_discernment_usage(
  p_user_id uuid,
  p_feature text
)
RETURNS TABLE(allowed boolean, remaining integer, monthly_limit integer, tier text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tier text;
  v_limit integer;
  v_count integer;
  v_period_start timestamptz := date_trunc('month', now());
BEGIN
  v_tier := public.get_user_tier(p_user_id);

  v_limit := CASE v_tier
    WHEN 'pro' THEN
      CASE p_feature
        WHEN 'sermon_analysis' THEN 30
        WHEN 'doctrine_analysis' THEN 50
        WHEN 'lyric_analysis' THEN 100
        ELSE 0
      END
    WHEN 'premium_plus' THEN
      CASE p_feature
        WHEN 'sermon_analysis' THEN 5
        WHEN 'doctrine_analysis' THEN 10
        WHEN 'lyric_analysis' THEN 20
        ELSE 0
      END
    ELSE 0
  END;

  IF v_limit = 0 THEN
    RETURN QUERY SELECT false, 0, 0, v_tier;
    RETURN;
  END IF;

  INSERT INTO public.discernment_usage (user_id, feature, period_start, count)
  VALUES (p_user_id, p_feature, v_period_start, 0)
  ON CONFLICT (user_id, feature, period_start) DO NOTHING;

  SELECT count INTO v_count
  FROM public.discernment_usage
  WHERE user_id = p_user_id AND feature = p_feature AND period_start = v_period_start;

  IF v_count >= v_limit THEN
    RETURN QUERY SELECT false, 0, v_limit, v_tier;
    RETURN;
  END IF;

  UPDATE public.discernment_usage
  SET count = count + 1, updated_at = now()
  WHERE user_id = p_user_id AND feature = p_feature AND period_start = v_period_start;

  RETURN QUERY SELECT true, v_limit - (v_count + 1), v_limit, v_tier;
END;
$$;

-- ============================================================================
-- 7. CHECK + INCREMENT TRANSCRIPTION MINUTES
-- ============================================================================
CREATE OR REPLACE FUNCTION public.check_and_increment_transcription_minutes(
  p_user_id uuid,
  p_minutes integer
)
RETURNS TABLE(
  allowed boolean,
  daily_remaining integer,
  monthly_remaining integer,
  daily_limit integer,
  monthly_limit integer,
  tier text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tier text;
  v_daily_limit integer;
  v_monthly_limit integer;
  v_daily_used integer := 0;
  v_monthly_used integer := 0;
  v_today date := (now() AT TIME ZONE 'UTC')::date;
  v_month date := date_trunc('month', now())::date;
BEGIN
  v_tier := public.get_user_tier(p_user_id);

  v_daily_limit := CASE v_tier
    WHEN 'pro' THEN 240
    WHEN 'premium_plus' THEN 60
    ELSE 0
  END;
  v_monthly_limit := CASE v_tier
    WHEN 'pro' THEN 2400
    WHEN 'premium_plus' THEN 300
    ELSE 0
  END;

  IF v_daily_limit = 0 THEN
    RETURN QUERY SELECT false, 0, 0, 0, 0, v_tier;
    RETURN;
  END IF;

  SELECT COALESCE(SUM(daily_minutes), 0) INTO v_monthly_used
  FROM public.transcription_usage
  WHERE user_id = p_user_id AND month_bucket = v_month;

  SELECT daily_minutes INTO v_daily_used
  FROM public.transcription_usage
  WHERE user_id = p_user_id AND day_bucket = v_today;

  v_daily_used := COALESCE(v_daily_used, 0);

  IF v_daily_used + p_minutes > v_daily_limit OR v_monthly_used + p_minutes > v_monthly_limit THEN
    RETURN QUERY SELECT false, v_daily_limit - v_daily_used, v_monthly_limit - v_monthly_used, v_daily_limit, v_monthly_limit, v_tier;
    RETURN;
  END IF;

  INSERT INTO public.transcription_usage (user_id, day_bucket, month_bucket, daily_minutes, monthly_minutes)
  VALUES (p_user_id, v_today, v_month, p_minutes, p_minutes)
  ON CONFLICT (user_id, day_bucket) DO UPDATE
  SET daily_minutes = public.transcription_usage.daily_minutes + p_minutes,
      monthly_minutes = public.transcription_usage.monthly_minutes + p_minutes,
      updated_at = now();

  RETURN QUERY SELECT
    true,
    v_daily_limit - (v_daily_used + p_minutes),
    v_monthly_limit - (v_monthly_used + p_minutes),
    v_daily_limit,
    v_monthly_limit,
    v_tier;
END;
$$;

-- ============================================================================
-- 8. RESTRICT HERO IMAGE UPLOAD TO PREMIUM PLUS / PRO
-- ============================================================================
DROP POLICY IF EXISTS "Users can submit one active hero image" ON public.hero_images;

CREATE POLICY "Premium Plus and Pro users submit one active hero image"
  ON public.hero_images FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND public.get_user_tier(auth.uid()) IN ('premium_plus', 'pro')
    AND NOT EXISTS (
      SELECT 1 FROM public.hero_images h
      WHERE h.user_id = auth.uid()
        AND h.status IN ('pending', 'approved')
    )
  );
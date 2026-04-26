-- Table to store verified Google Play purchase tokens and subscription state
CREATE TABLE public.google_play_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id TEXT NOT NULL,
  purchase_token TEXT NOT NULL UNIQUE,
  order_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'active' | 'canceled' | 'expired' | 'pending' | 'on_hold' | 'paused'
  start_time TIMESTAMPTZ,
  expiry_time TIMESTAMPTZ,
  auto_renewing BOOLEAN NOT NULL DEFAULT false,
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  raw_response JSONB,
  last_verified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_gpp_user_id ON public.google_play_purchases(user_id);
CREATE INDEX idx_gpp_product_id ON public.google_play_purchases(product_id);
CREATE INDEX idx_gpp_status ON public.google_play_purchases(status);

ALTER TABLE public.google_play_purchases ENABLE ROW LEVEL SECURITY;

-- Users may only read their own verified purchases
CREATE POLICY "Users view own google play purchases"
  ON public.google_play_purchases
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Only the service role (edge function) may write
CREATE POLICY "Service role manages google play purchases"
  ON public.google_play_purchases
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER update_google_play_purchases_updated_at
  BEFORE UPDATE ON public.google_play_purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update get_user_tier so verified Google Play subscriptions also count
CREATE OR REPLACE FUNCTION public.get_user_tier(p_user_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_price_id text;
  v_gp_product text;
BEGIN
  IF public.is_staff_email(p_user_id) THEN
    RETURN 'pro';
  END IF;

  -- Check verified Google Play purchase first
  SELECT product_id INTO v_gp_product
  FROM public.google_play_purchases
  WHERE user_id = p_user_id
    AND status = 'active'
    AND (expiry_time IS NULL OR expiry_time > now())
  ORDER BY
    CASE
      WHEN product_id = 'hagion_premium_plus_monthly' THEN 1
      WHEN product_id = 'hagion_premium_monthly' THEN 2
      ELSE 3
    END,
    expiry_time DESC NULLS LAST
  LIMIT 1;

  IF v_gp_product IS NOT NULL THEN
    RETURN CASE v_gp_product
      WHEN 'hagion_premium_plus_monthly' THEN 'premium_plus'
      WHEN 'hagion_premium_monthly' THEN 'premium'
      ELSE 'free'
    END;
  END IF;

  -- Fall back to Stripe subscription
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
$function$;
CREATE OR REPLACE FUNCTION public.is_staff_email(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = p_user_id
      AND lower(email) IN ('fabyygarciia@gmail.com', 'nicholasexousia@gmail.com')
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_tier(p_user_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_price_id text;
BEGIN
  IF public.is_staff_email(p_user_id) THEN
    RETURN 'pro';
  END IF;

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
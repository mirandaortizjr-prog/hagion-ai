
-- Add sponsorship flags to content tables
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS is_sponsored boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sponsor_name text,
  ADD COLUMN IF NOT EXISTS sponsor_url text,
  ADD COLUMN IF NOT EXISTS sponsored_until timestamptz;

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS is_sponsored boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sponsored_until timestamptz;

ALTER TABLE public.teachings
  ADD COLUMN IF NOT EXISTS is_sponsored boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sponsored_until timestamptz;

ALTER TABLE public.churches
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS featured_until timestamptz,
  ADD COLUMN IF NOT EXISTS pro_tier text,
  ADD COLUMN IF NOT EXISTS banner_url text;

CREATE INDEX IF NOT EXISTS idx_posts_sponsored ON public.posts(is_sponsored, sponsored_until) WHERE is_sponsored = true;
CREATE INDEX IF NOT EXISTS idx_events_sponsored ON public.events(is_sponsored, sponsored_until) WHERE is_sponsored = true;
CREATE INDEX IF NOT EXISTS idx_teachings_sponsored ON public.teachings(is_sponsored, sponsored_until) WHERE is_sponsored = true;
CREATE INDEX IF NOT EXISTS idx_churches_featured ON public.churches(is_featured, featured_until) WHERE is_featured = true;

-- Church subscriptions (Ministry Pro)
CREATE TABLE IF NOT EXISTS public.church_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id uuid NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  owner_user_id uuid NOT NULL,
  stripe_customer_id text,
  stripe_subscription_id text UNIQUE,
  status text NOT NULL DEFAULT 'incomplete',
  tier text NOT NULL DEFAULT 'ministry_pro',
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.church_subscriptions TO authenticated;
GRANT ALL ON public.church_subscriptions TO service_role;

ALTER TABLE public.church_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Church owner can view their subscription"
  ON public.church_subscriptions FOR SELECT
  TO authenticated
  USING (
    owner_user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.churches c WHERE c.id = church_id AND c.pastor_id = auth.uid())
  );

CREATE TRIGGER church_subscriptions_updated_at
  BEFORE UPDATE ON public.church_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Sponsorship campaigns
CREATE TABLE IF NOT EXISTS public.sponsorships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type text NOT NULL CHECK (target_type IN ('post','event','teaching','church')),
  target_id uuid NOT NULL,
  sponsor_user_id uuid NOT NULL,
  stripe_payment_intent_id text,
  stripe_checkout_session_id text UNIQUE,
  amount_cents integer NOT NULL,
  duration_days integer NOT NULL,
  starts_at timestamptz,
  ends_at timestamptz,
  status text NOT NULL DEFAULT 'pending',
  sponsor_name text,
  sponsor_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.sponsorships TO authenticated;
GRANT ALL ON public.sponsorships TO service_role;

ALTER TABLE public.sponsorships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sponsors can view their own campaigns"
  ON public.sponsorships FOR SELECT
  TO authenticated
  USING (sponsor_user_id = auth.uid());

CREATE TRIGGER sponsorships_updated_at
  BEFORE UPDATE ON public.sponsorships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_sponsorships_sponsor ON public.sponsorships(sponsor_user_id);
CREATE INDEX IF NOT EXISTS idx_sponsorships_target ON public.sponsorships(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_church_subscriptions_church ON public.church_subscriptions(church_id);

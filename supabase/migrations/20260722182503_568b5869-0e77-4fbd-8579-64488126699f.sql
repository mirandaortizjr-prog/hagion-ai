ALTER TABLE public.church_subscriptions
  ADD COLUMN IF NOT EXISTS revenuecat_product_id text,
  ADD COLUMN IF NOT EXISTS revenuecat_transaction_id text;

ALTER TABLE public.sponsorships
  ADD COLUMN IF NOT EXISTS revenuecat_product_id text,
  ADD COLUMN IF NOT EXISTS revenuecat_transaction_id text;

CREATE INDEX IF NOT EXISTS idx_church_subscriptions_revenuecat
  ON public.church_subscriptions(revenuecat_transaction_id)
  WHERE revenuecat_transaction_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_sponsorships_revenuecat
  ON public.sponsorships(revenuecat_transaction_id)
  WHERE revenuecat_transaction_id IS NOT NULL;
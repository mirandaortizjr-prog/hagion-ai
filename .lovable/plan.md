# Community Monetization: Sponsored Content + Ministry Pro

Two revenue streams, both fully web-based so Native Forge's next pass is not affected. No Capacitor plugins, no in-app purchase code, no changes to `google_play_purchases` flow.

## What we're building

### 1. Sponsored Content (ad-style, but native to the feed)
- Sponsored **posts** in Discussions feed
- Sponsored **churches** boosted in the Community/Church list & map
- Sponsored **events** pinned at the top of Events
- Sponsored **teachings** featured on the Teachings page
- Each item shows a clear "Sponsored" label (Play Store requirement) and is capped so the feed doesn't feel spammy (e.g. 1 sponsored post every 5 organic posts).

### 2. Ministry / Church Pro tier
A paid upgrade specifically for **churches and ministries** (not individual users — those keep the existing Premium tiers).
- **Verified badge** on the church page + everywhere the church appears
- **Featured placement** in church directory / map
- **Unlimited events** + featured event slots
- **Basic analytics** (page views, member joins, event RSVPs)
- **Custom banner + description**
- Billed via **Stripe Checkout in the browser** (opens system browser from the app). No Play Billing required — Google Play allows web checkout for B2B/organizational subscriptions from the seller's own site.

## Technical section

### Database changes (migration)
Add new columns to existing tables — no new user-facing tables required for MVP:

```
posts:       + is_sponsored bool, sponsor_name text, sponsor_url text, sponsored_until timestamptz
churches:    + is_verified bool, is_featured bool, featured_until timestamptz, pro_tier text, banner_url text
events:      + is_sponsored bool, sponsored_until timestamptz
teachings:   + is_sponsored bool, sponsored_until timestamptz
```

New table:
```
church_subscriptions (id, church_id, stripe_customer_id, stripe_subscription_id,
                      status, tier, current_period_end, created_at)
```
+ standard GRANTs + RLS (only church owner can read; service_role writes via webhook).

New table:
```
sponsorships (id, target_type, target_id, sponsor_user_id, stripe_payment_intent_id,
              amount_cents, starts_at, ends_at, status, created_at)
```
Sponsor Pro-tier users pay per campaign; row drives `is_sponsored` flag via ends_at.

### Edge functions (all `verify_jwt = false`, validate JWT in-code)
1. `create-sponsorship-checkout` — creates a Stripe Checkout session for a sponsorship campaign (post / church / event / teaching, duration, budget).
2. `create-church-pro-checkout` — Stripe Checkout for the Ministry Pro monthly/annual subscription.
3. `stripe-webhook` — receives Stripe events, activates sponsorships/subscriptions, sets `is_verified` / `is_sponsored` flags.
4. `sponsorship-cleanup` (cron-style, called from client on feed load) — flips `is_sponsored=false` when `ends_at < now()`.

Uses existing `STRIPE_SECRET_KEY` if present, otherwise we'll add it via `add_secret` when you're ready.

### Frontend changes
- Discussions/Events/Teachings/Churches lists: interleave sponsored items with clear "Sponsored" badge (styled to match theme, bilingual EN/ES).
- New page: `/monetize/sponsor` — self-serve sponsor campaign creator (choose target, dates, budget → Stripe Checkout).
- New page: `/monetize/church-pro` — Ministry Pro upgrade landing + Checkout button, only visible to users who own a church.
- Church detail page: show Verified badge + Featured banner when applicable.
- All strings run through the existing `t(en, es)` helper.

### What we are NOT doing (to protect Native Forge)
- ❌ No AdMob / no `@capacitor-community/admob`
- ❌ No Google Play Billing changes
- ❌ No new Capacitor plugins
- ❌ No changes to `capacitor.config.ts`
- ✅ Stripe Checkout opens in the system browser via a plain `window.location.href` (works in the current WebView build)

## Rollout order
1. Migration (schema + RLS + GRANTs)
2. Stripe edge functions + webhook
3. Sponsor campaign UI + Church Pro upgrade UI
4. Feed integration (sponsored badges + placement rules)
5. Bilingual pass on all new strings

Approve and I'll build it in this order.

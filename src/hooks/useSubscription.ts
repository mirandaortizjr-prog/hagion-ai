import { useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { getStripeEnvironment } from '@/lib/stripe';

const IS_NATIVE = Capacitor.isNativePlatform();

export type Tier = 'free' | 'premium' | 'premium_plus' | 'pro';

interface SubscriptionRow {
  id: string;
  status: string;
  price_id: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  stripe_customer_id: string;
}

const PRICE_TO_TIER: Record<string, Tier> = {
  hagion_premium_monthly: 'premium',
  hagion_premium_plus_monthly: 'premium_plus',
  hagion_pro_monthly: 'pro',
};

const NATIVE_PRODUCT_TO_TIER: Record<string, Tier> = {
  hagion_premium_monthly: 'premium',
  hagion_premium_plus_monthly: 'premium_plus',
};

const TIER_RANK: Record<Tier, number> = { free: 0, premium: 1, premium_plus: 2, pro: 3 };

const DEMO_EMAIL = 'demo.hagionai@gmail.com';
const STAFF_EMAILS = ['fabyygarciia@gmail.com', 'miranda.ortiz.jr@gmail.com'];

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null);
  const [tier, setTier] = useState<Tier>('free');
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  const refetch = useCallback(async (uid?: string | null, email?: string | null) => {
    const id = uid ?? userId;
    const em = email ?? userEmail;
    if (!id) {
      setSubscription(null);
      setTier('free');
      setIsLoading(false);
      return;
    }
    const lowerEm = em?.toLowerCase() ?? '';
    if (lowerEm === DEMO_EMAIL || STAFF_EMAILS.includes(lowerEm)) {
      setIsDemo(lowerEm === DEMO_EMAIL);
      setTier('pro');
      setSubscription(null);
      setIsLoading(false);
      return;
    }
    setIsDemo(false);

    // Native (Android/iOS): tier is driven by Google Play purchases only.
    // Web: Stripe subscriptions only.
    if (IS_NATIVE) {
      const { data: gp } = await supabase
        .from('google_play_purchases')
        .select('product_id, status, expiry_time')
        .eq('user_id', id)
        .eq('status', 'active');
      const now = Date.now();
      const active = (gp ?? []).filter(
        (p) => !p.expiry_time || new Date(p.expiry_time as string).getTime() > now,
      );
      let nativeTier: Tier = 'free';
      for (const p of active) {
        const t = NATIVE_PRODUCT_TO_TIER[p.product_id as string];
        if (t && TIER_RANK[t] > TIER_RANK[nativeTier]) nativeTier = t;
      }
      setSubscription(null);
      setTier(nativeTier);
      setIsLoading(false);
      return;
    }

    const { data } = await supabase
      .from('subscriptions')
      .select('id, status, price_id, current_period_end, cancel_at_period_end, stripe_customer_id')
      .eq('user_id', id)
      .eq('environment', getStripeEnvironment())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setSubscription(data as SubscriptionRow);
      const isActive =
        ((data.status === 'active' || data.status === 'trialing' || data.status === 'past_due') &&
          (!data.current_period_end || new Date(data.current_period_end) > new Date())) ||
        (data.status === 'canceled' && data.current_period_end && new Date(data.current_period_end) > new Date());
      setTier(isActive ? PRICE_TO_TIER[data.price_id] ?? 'free' : 'free');
    } else {
      setSubscription(null);
      setTier('free');
    }
    setIsLoading(false);
  }, [userId, userEmail]);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!mounted) return;
      setUserId(user?.id ?? null);
      setUserEmail(user?.email ?? null);
      refetch(user?.id ?? null, user?.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user;
      setUserId(u?.id ?? null);
      setUserEmail(u?.email ?? null);
      refetch(u?.id ?? null, u?.email ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Realtime updates on subscription rows for this user
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`subscriptions:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'subscriptions', filter: `user_id=eq.${userId}` },
        () => refetch()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, refetch]);

  const isAtLeast = useCallback((minTier: Tier) => TIER_RANK[tier] >= TIER_RANK[minTier], [tier]);

  return {
    tier,
    subscription,
    isLoading,
    isDemo,
    userId,
    userEmail,
    isAtLeast,
    isPremium: isAtLeast('premium'),
    isPremiumPlus: isAtLeast('premium_plus'),
    isPro: tier === 'pro',
    refetch: () => refetch(),
  };
}

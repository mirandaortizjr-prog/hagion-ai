import { useMemo } from 'react';
import { useSubscription, Tier } from './useSubscription';

const FEATURE_MIN_TIER: Record<string, Tier> = {
  // Discernment
  sermon_analysis: 'premium_plus',
  doctrine_analysis: 'premium_plus',
  lyric_analysis: 'premium_plus',
  // Hero image upload
  hero_upload: 'premium_plus',
  // Bible translations bulk
  bible_translations_premium: 'premium',
  // Non-Bible bundled scriptures (LDS, Qur'an, etc.)
  scripture_lds: 'premium',
  scripture_quran: 'premium',
  scripture_eastern: 'premium',
  scripture_premium_plus: 'premium_plus',
  // Hagion University full access
  hagion_university: 'premium',
  // Debate arena premium rounds
  debate_arena_premium: 'premium',
  // Pro-only
  priority_processing: 'pro',
};

export function useTierAccess() {
  const sub = useSubscription();

  const access = useMemo(() => ({
    ...sub,
    canUse: (feature: string) => {
      const required = FEATURE_MIN_TIER[feature];
      if (!required) return true;
      return sub.isAtLeast(required);
    },
    requiredTierFor: (feature: string): Tier | null => FEATURE_MIN_TIER[feature] ?? null,
  }), [sub]);

  return access;
}

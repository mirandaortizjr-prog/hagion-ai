import { createContext, useContext, ReactNode } from 'react';
import { useTierAccess } from '@/hooks/useTierAccess';
import type { Tier } from '@/hooks/useSubscription';

interface PremiumContextType {
  tier: Tier;
  isPremium: boolean;
  isPremiumPlus: boolean;
  isPro: boolean;
  isLoading: boolean;
  isDemo: boolean;
  canUse: (feature: string) => boolean;
  refetch: () => void;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export const PremiumProvider = ({ children }: { children: ReactNode }) => {
  const access = useTierAccess();

  const value: PremiumContextType = {
    tier: access.tier,
    isPremium: access.isPremium,
    isPremiumPlus: access.isPremiumPlus,
    isPro: access.isPro,
    isLoading: access.isLoading,
    isDemo: access.isDemo,
    canUse: access.canUse,
    refetch: access.refetch,
  };

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
};

export const usePremium = () => {
  const context = useContext(PremiumContext);
  if (context === undefined) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
};

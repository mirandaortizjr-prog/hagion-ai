import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useInAppPurchases, PRODUCT_IDS } from '@/hooks/useInAppPurchases';
import { supabase } from '@/integrations/supabase/client';

interface PremiumContextType {
  isPremium: boolean;
  isPremiumPlus: boolean;
  isLoading: boolean;
  products: any[];
  purchasePremium: () => Promise<{ success: boolean; error?: string }>;
  purchasePremiumPlus: () => Promise<{ success: boolean; error?: string }>;
  restorePurchases: () => Promise<{ success: boolean; error?: string }>;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

// Demo account for Google Play review - gets full premium access
const DEMO_EMAIL = "demo.hagionai@gmail.com";

export const PremiumProvider = ({ children }: { children: ReactNode }) => {
  const {
    isPremium: nativeIsPremium,
    isPremiumPlus: nativeIsPremiumPlus,
    isLoading: nativeLoading,
    products,
    purchaseProduct,
    restorePurchases: nativeRestorePurchases,
    isNative,
  } = useInAppPurchases();

  // For web users, check subscription status from database
  const [webPremiumStatus, setWebPremiumStatus] = useState({
    isPremium: false,
    isPremiumPlus: false,
    isLoading: true,
  });

  // Track if current user is the demo account
  const [isDemoAccount, setIsDemoAccount] = useState(false);

  useEffect(() => {
    checkUserAndPremiumStatus();
  }, [isNative]);

  const checkUserAndPremiumStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setWebPremiumStatus({ isPremium: false, isPremiumPlus: false, isLoading: false });
        setIsDemoAccount(false);
        return;
      }

      // Check if demo account - gets full premium access
      if (user.email?.toLowerCase() === DEMO_EMAIL.toLowerCase()) {
        setIsDemoAccount(true);
        setWebPremiumStatus({ isPremium: true, isPremiumPlus: true, isLoading: false });
        return;
      }

      setIsDemoAccount(false);
      
      if (!isNative) {
        // For now, web users don't have premium
        // This would integrate with Stripe or another web payment provider
        setWebPremiumStatus({ isPremium: false, isPremiumPlus: false, isLoading: false });
      }
    } catch (error) {
      console.error('Error checking premium status:', error);
      setWebPremiumStatus({ isPremium: false, isPremiumPlus: false, isLoading: false });
    }
  };

  const purchasePremium = async () => {
    if (isNative) {
      return purchaseProduct(PRODUCT_IDS.PREMIUM_MONTHLY);
    }
    // Web fallback - redirect to premium page
    window.location.href = '/premium';
    return { success: false, error: 'Web purchases not implemented' };
  };

  const purchasePremiumPlus = async () => {
    if (isNative) {
      return purchaseProduct(PRODUCT_IDS.PREMIUM_PLUS_MONTHLY);
    }
    window.location.href = '/premium';
    return { success: false, error: 'Web purchases not implemented' };
  };

  const restorePurchases = async () => {
    if (isNative) {
      return nativeRestorePurchases();
    }
    return { success: false, error: 'Web restore not implemented' };
  };

  const value: PremiumContextType = {
    isPremium: isDemoAccount ? true : (isNative ? nativeIsPremium : webPremiumStatus.isPremium),
    isPremiumPlus: isDemoAccount ? true : (isNative ? nativeIsPremiumPlus : webPremiumStatus.isPremiumPlus),
    isLoading: isNative ? nativeLoading : webPremiumStatus.isLoading,
    products,
    purchasePremium,
    purchasePremiumPlus,
    restorePurchases,
  };

  return (
    <PremiumContext.Provider value={value}>
      {children}
    </PremiumContext.Provider>
  );
};

export const usePremium = () => {
  const context = useContext(PremiumContext);
  if (context === undefined) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
};

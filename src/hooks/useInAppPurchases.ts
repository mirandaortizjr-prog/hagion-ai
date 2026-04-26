import { useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

const isNative = Capacitor.isNativePlatform();

// Server-side receipt verification.
// Calls the verify-google-play-purchase edge function which talks to the
// Google Play Developer API and writes the verified state to the
// google_play_purchases table. The premium gate reads that table — never
// trust the client.
async function verifyPurchaseOnServer(productId: string, purchaseToken: string) {
  try {
    const { data, error } = await supabase.functions.invoke(
      'verify-google-play-purchase',
      { body: { productId, purchaseToken } },
    );
    if (error) {
      console.error('Server verification failed:', error);
      return { verified: false, error: error.message };
    }
    console.log('Server verification result:', data);
    return data;
  } catch (e) {
    console.error('Server verification error:', e);
    return { verified: false, error: (e as Error).message };
  }
}

async function fetchVerifiedPurchaseState() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { isPremium: false, isPremiumPlus: false };

  const { data, error } = await supabase
    .from('google_play_purchases')
    .select('product_id, status, expiry_time')
    .eq('user_id', user.id)
    .eq('status', 'active');

  if (error || !data) return { isPremium: false, isPremiumPlus: false };

  const now = Date.now();
  const active = data.filter(
    (p) => !p.expiry_time || new Date(p.expiry_time).getTime() > now,
  );
  const isPremiumPlus = active.some(
    (p) => p.product_id === PRODUCT_IDS.PREMIUM_PLUS_MONTHLY,
  );
  const isPremium =
    isPremiumPlus ||
    active.some((p) => p.product_id === PRODUCT_IDS.PREMIUM_MONTHLY);
  return { isPremium, isPremiumPlus };
}

// Product IDs - these must match your Google Play Console / App Store Connect setup
export const PRODUCT_IDS = {
  PREMIUM_MONTHLY: 'hagion_premium_monthly',
  PREMIUM_PLUS_MONTHLY: 'hagion_premium_plus_monthly',
} as const;

export interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  priceAmount: number;
  currency: string;
}

export interface Purchase {
  productId: string;
  transactionId: string;
  purchaseDate: Date;
  isActive: boolean;
}

interface InAppPurchaseState {
  products: Product[];
  purchases: Purchase[];
  isLoading: boolean;
  isPremium: boolean;
  isPremiumPlus: boolean;
  error: string | null;
}

// Store reference for cordova-plugin-purchase
let store: any = null;

export const useInAppPurchases = () => {
  const [state, setState] = useState<InAppPurchaseState>({
    products: [],
    purchases: [],
    isLoading: true,
    isPremium: false,
    isPremiumPlus: false,
    error: null,
  });

  // Initialize the store
  const initStore = useCallback(async () => {
    if (!isNative) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      // Wait for device ready
      await new Promise(resolve => {
        if ((window as any).CdvPurchase) {
          resolve(true);
        } else {
          document.addEventListener('deviceready', () => resolve(true), false);
        }
      });

      store = (window as any).CdvPurchase?.store;
      
      if (!store) {
        console.log('Store not available');
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const { ProductType, Platform } = (window as any).CdvPurchase;

      // Register products
      store.register([
        {
          id: PRODUCT_IDS.PREMIUM_MONTHLY,
          type: ProductType.PAID_SUBSCRIPTION,
          platform: Platform.GOOGLE_PLAY,
        },
        {
          id: PRODUCT_IDS.PREMIUM_PLUS_MONTHLY,
          type: ProductType.PAID_SUBSCRIPTION,
          platform: Platform.GOOGLE_PLAY,
        },
      ]);

      // Set up event handlers
      store.when().approved((transaction: any) => {
        console.log('Purchase approved:', transaction);
        transaction.verify();
      });

      store.when().verified((receipt: any) => {
        console.log('Purchase verified:', receipt);
        receipt.finish();
        updatePurchaseState();
      });

      store.when().finished((transaction: any) => {
        console.log('Purchase finished:', transaction);
        updatePurchaseState();
      });

      store.error((error: any) => {
        console.error('Store error:', error);
        setState(prev => ({ ...prev, error: error.message }));
      });

      // Initialize store
      await store.initialize([Platform.GOOGLE_PLAY]);
      
      // Load products
      await store.update();
      
      updateProductState();
      updatePurchaseState();
      
    } catch (error) {
      console.error('Error initializing store:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: (error as Error).message 
      }));
    }
  }, []);

  const updateProductState = useCallback(() => {
    if (!store) return;

    const products: Product[] = [];
    
    Object.values(PRODUCT_IDS).forEach(productId => {
      const product = store.get(productId);
      if (product) {
        products.push({
          id: product.id,
          title: product.title || getDefaultTitle(product.id),
          description: product.description || getDefaultDescription(product.id),
          price: product.pricing?.price || getDefaultPrice(product.id),
          priceAmount: product.pricing?.priceMicros ? product.pricing.priceMicros / 1000000 : 0,
          currency: product.pricing?.currency || 'USD',
        });
      }
    });

    setState(prev => ({ ...prev, products, isLoading: false }));
  }, []);

  const updatePurchaseState = useCallback(() => {
    if (!store) return;

    const premiumProduct = store.get(PRODUCT_IDS.PREMIUM_MONTHLY);
    const premiumPlusProduct = store.get(PRODUCT_IDS.PREMIUM_PLUS_MONTHLY);

    const isPremium = premiumProduct?.owned || false;
    const isPremiumPlus = premiumPlusProduct?.owned || false;

    setState(prev => ({
      ...prev,
      isPremium: isPremium || isPremiumPlus, // Premium Plus includes Premium features
      isPremiumPlus,
    }));
  }, []);

  const purchaseProduct = useCallback(async (productId: string) => {
    if (!isNative || !store) {
      console.log('Store not available for purchase');
      return { success: false, error: 'Store not available' };
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const product = store.get(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const offer = product.getOffer();
      if (!offer) {
        throw new Error('No offer available for this product');
      }

      await offer.order();
      
      return { success: true };
    } catch (error) {
      console.error('Purchase error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: (error as Error).message 
      }));
      return { success: false, error: (error as Error).message };
    }
  }, []);

  const restorePurchases = useCallback(async () => {
    if (!isNative || !store) {
      return { success: false, error: 'Store not available' };
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      await store.restorePurchases();
      updatePurchaseState();
      setState(prev => ({ ...prev, isLoading: false }));
      return { success: true };
    } catch (error) {
      console.error('Restore error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: (error as Error).message 
      }));
      return { success: false, error: (error as Error).message };
    }
  }, [updatePurchaseState]);

  useEffect(() => {
    initStore();
  }, [initStore]);

  return {
    ...state,
    purchaseProduct,
    restorePurchases,
    isNative,
  };
};

// Default values for when store data isn't available
function getDefaultTitle(productId: string): string {
  switch (productId) {
    case PRODUCT_IDS.PREMIUM_MONTHLY:
      return 'Premium Monthly';
    case PRODUCT_IDS.PREMIUM_PLUS_MONTHLY:
      return 'Premium Plus Monthly';
    default:
      return 'Unknown Product';
  }
}

function getDefaultDescription(productId: string): string {
  switch (productId) {
    case PRODUCT_IDS.PREMIUM_MONTHLY:
      return 'Unlock all premium features with unlimited access';
    case PRODUCT_IDS.PREMIUM_PLUS_MONTHLY:
      return 'Premium features plus advanced discernment, transcription, and hero image uploads';
    default:
      return '';
  }
}

function getDefaultPrice(productId: string): string {
  switch (productId) {
    case PRODUCT_IDS.PREMIUM_MONTHLY:
      return '$9.99';
    case PRODUCT_IDS.PREMIUM_PLUS_MONTHLY:
      return '$15.99';
    default:
      return '$0.00';
  }
}

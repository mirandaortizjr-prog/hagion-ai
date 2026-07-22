import { useEffect, useState, useCallback, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";

// RevenueCat is only used on native builds. Lazy-import so the SDK is never
// bundled into the web runtime.
let Purchases: typeof import("@revenuecat/purchases-capacitor").Purchases | null = null;

const IS_NATIVE = Capacitor.isNativePlatform();
const ANDROID_KEY = import.meta.env.VITE_REVENUECAT_PUBLIC_SDK_KEY_ANDROID;

export type RevenueCatProduct = {
  id: string;
  title: string;
  description: string;
  priceString: string;
  price: number;
  currencyCode: string;
};

export type RevenueCatPurchaseResult =
  | { success: true; productId: string; transactionId?: string }
  | { success: false; error: string };

interface RevenueCatState {
  isInitialized: boolean;
  isLoading: boolean;
  products: RevenueCatProduct[];
  error: string | null;
}

async function loadSdk() {
  if (!IS_NATIVE) return null;
  if (Purchases) return Purchases;
  const mod = await import("@revenuecat/purchases-capacitor");
  Purchases = mod.Purchases;
  return Purchases;
}

export function useRevenueCat() {
  const [state, setState] = useState<RevenueCatState>({
    isInitialized: false,
    isLoading: true,
    products: [],
    error: null,
  });
  const initStarted = useRef(false);

  const init = useCallback(async () => {
    if (!IS_NATIVE || initStarted.current) return;
    initStarted.current = true;

    const sdk = await loadSdk();
    if (!sdk) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }

    if (!ANDROID_KEY) {
      console.error("Missing VITE_REVENUECAT_PUBLIC_SDK_KEY_ANDROID");
      setState((s) => ({
        ...s,
        isLoading: false,
        error: "RevenueCat SDK key not configured",
      }));
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      await sdk.configure({ apiKey: ANDROID_KEY, appUserID: user?.id });

      const offerings = await sdk.getOfferings();
      const allPackages =
        offerings.all["Hagion Offerings"]?.availablePackages ??
        offerings.current?.availablePackages ??
        [];

      const products: RevenueCatProduct[] = allPackages
        .map((pkg: any) => pkg.product)
        .filter(Boolean)
        .map((p: any) => ({
          id: p.identifier,
          title: p.title ?? p.identifier,
          description: p.description ?? "",
          priceString: p.priceString ?? "",
          price: p.price ?? 0,
          currencyCode: p.currencyCode ?? "USD",
        }));

      setState({
        isInitialized: true,
        isLoading: false,
        products,
        error: null,
      });
    } catch (e) {
      console.error("RevenueCat init error:", e);
      setState((s) => ({
        ...s,
        isLoading: false,
        error: (e as Error).message || "Failed to initialize purchases",
      }));
    }
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  const setAttributes = useCallback(async (attrs: Record<string, string | null>) => {
    if (!IS_NATIVE || !Purchases) return;
    try {
      await Purchases.setAttributes(attrs);
    } catch (e) {
      console.error("setAttributes error:", e);
    }
  }, []);

  const purchase = useCallback(
    async (productId: string, attributes?: Record<string, string | null>): Promise<RevenueCatPurchaseResult> => {
      if (!IS_NATIVE || !Purchases) {
        return { success: false, error: "Not on a native device" };
      }
      try {
        if (attributes) {
          await Purchases.setAttributes(attributes);
        }

        const offerings = await Purchases.getOfferings();
        const allPackages =
          offerings.all["Hagion Offerings"]?.availablePackages ??
          offerings.current?.availablePackages ??
          [];

        const target = allPackages.find(
          (pkg: any) => pkg.product?.identifier === productId
        );

        let result: any;
        if (target) {
          result = await Purchases.purchasePackage({
            identifier: target.identifier,
            offeringIdentifier: target.offeringIdentifier,
          });
        } else {
          // Fallback for when offerings are empty or product not in current offering
          result = await Purchases.purchaseStoreProduct({
            product: { identifier: productId } as any,
          });
        }

        const customerInfo = result.customerInfo;
        const transaction = result.transaction;
        const entitlements = customerInfo?.entitlements?.all ?? {};

        console.log("RevenueCat purchase success:", productId, transaction?.transactionIdentifier);
        return {
          success: true,
          productId,
          transactionId: transaction?.transactionIdentifier,
        };
      } catch (e: any) {
        // RevenueCat returns userCancelled as a code; don't treat it as an error
        if (e?.code === "USER_CANCELLED" || e?.message?.toLowerCase().includes("cancel")) {
          return { success: false, error: "Purchase cancelled" };
        }
        console.error("RevenueCat purchase error:", e);
        return { success: false, error: e?.message || "Purchase failed" };
      }
    },
    []
  );

  const restorePurchases = useCallback(async (): Promise<RevenueCatPurchaseResult> => {
    if (!IS_NATIVE || !Purchases) {
      return { success: false, error: "Not on a native device" };
    }
    try {
      const info = await Purchases.restorePurchases();
      console.log("RevenueCat restored:", info);
      return { success: true, productId: "" };
    } catch (e: any) {
      console.error("RevenueCat restore error:", e);
      return { success: false, error: e?.message || "Restore failed" };
    }
  }, []);

  const getProduct = useCallback(
    (productId: string) => state.products.find((p) => p.id === productId),
    [state.products]
  );

  return {
    ...state,
    isNative: IS_NATIVE,
    purchase,
    restorePurchases,
    setAttributes,
    getProduct,
  };
}

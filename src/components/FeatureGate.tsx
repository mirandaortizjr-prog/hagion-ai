import { ReactNode } from "react";
import { useTierAccess } from "@/hooks/useTierAccess";
import { FeatureLockCard } from "@/components/FeatureLockCard";
import type { Tier } from "@/hooks/useSubscription";

interface Props {
  /** Feature key matching FEATURE_MIN_TIER in useTierAccess */
  feature: string;
  /** Fallback required tier shown on the lock card if the feature has no mapping */
  fallbackTier?: Exclude<Tier, "free">;
  children: ReactNode;
}

/**
 * Route-level feature gate. Renders the page only if the user's tier allows
 * the feature; otherwise shows a full-page FeatureLockCard with an upgrade CTA.
 *
 * Wraps the entire page so hook-order in the wrapped component is unaffected.
 */
export function FeatureGate({ feature, fallbackTier = "premium", children }: Props) {
  const { canUse, requiredTierFor, isLoading } = useTierAccess();

  // Allow during initial load to avoid flash; the page itself can show its own loading state.
  if (isLoading) return <>{children}</>;

  if (canUse(feature)) return <>{children}</>;

  const required = (requiredTierFor(feature) ?? fallbackTier) as Exclude<Tier, "free">;
  return <FeatureLockCard requiredTier={required} />;
}

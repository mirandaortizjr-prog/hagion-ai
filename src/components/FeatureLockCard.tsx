import { useNavigate } from "react-router-dom";
import { ArrowLeft, Crown, Sparkles, Zap, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { PremiumNav } from "@/components/PremiumNav";
import type { Tier } from "@/hooks/useSubscription";

const TIER_META: Record<Exclude<Tier, "free">, { icon: typeof Crown; label: string; gradient: string; ring: string }> = {
  premium: {
    icon: Sparkles,
    label: "Premium",
    gradient: "from-primary to-accent",
    ring: "ring-primary/30",
  },
  premium_plus: {
    icon: Crown,
    label: "Premium Plus",
    gradient: "from-blue-500 to-blue-600",
    ring: "ring-blue-400/30",
  },
  pro: {
    icon: Zap,
    label: "Pro",
    gradient: "from-amber-500 to-orange-500",
    ring: "ring-amber-400/30",
  },
};

interface Props {
  /** Required minimum tier to use this feature */
  requiredTier: Exclude<Tier, "free">;
  /** Feature title shown on the card */
  featureName?: string;
  /** Short description of what unlocks */
  description?: string;
  /** Whether to render full-page (with nav + back button) */
  fullPage?: boolean;
  /** Optional back navigation override */
  onBack?: () => void;
}

/**
 * Inline lock card shown when a user lacks the required tier for a feature.
 * Use as an early `return` in a page component, or inline within a section.
 */
export function FeatureLockCard({
  requiredTier,
  featureName,
  description,
  fullPage = true,
  onBack,
}: Props) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const meta = TIER_META[requiredTier];
  const Icon = meta.icon;

  const title =
    language === "es"
      ? `Función ${meta.label}`
      : `${meta.label} feature`;

  const defaultDesc =
    language === "es"
      ? `Esta función requiere el plan ${meta.label} o superior para acceder.`
      : `This feature requires the ${meta.label} plan or higher to access.`;

  const card = (
    <div
      className={`relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8 sm:p-10 text-center ring-1 ${meta.ring}`}
    >
      <div className="absolute inset-0 opacity-30 pointer-events-none bg-gradient-to-br from-white/5 to-transparent" />

      <div
        className={`relative mx-auto inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${meta.gradient} mb-5 shadow-lg`}
      >
        <Lock className="w-7 h-7 text-white" />
      </div>

      <p className="relative text-[10px] uppercase tracking-[0.3em] text-accent/90 mb-2">
        {language === "es" ? "Bloqueado" : "Locked"}
      </p>

      <h2 className="relative text-2xl sm:text-3xl font-semibold text-white mb-2 leading-tight">
        {featureName ?? title}
      </h2>

      <p className="relative text-[14.5px] text-white/70 leading-relaxed max-w-md mx-auto mb-6">
        {description ?? defaultDesc}
      </p>

      <div className="relative flex items-center justify-center gap-2 mb-6">
        <Icon className="w-3.5 h-3.5 text-accent" />
        <span className="text-[11px] uppercase tracking-[0.25em] text-accent/90">
          {language === "es" ? "Requiere" : "Requires"} {meta.label}
        </span>
      </div>

      <div className="relative flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button
          size="lg"
          onClick={() => navigate("/premium")}
          className={`bg-gradient-to-r ${meta.gradient} text-white font-semibold px-8 hover:opacity-90 transition-opacity`}
        >
          {language === "es" ? "Ver planes" : "View plans"}
        </Button>
        <Button
          variant="ghost"
          size="lg"
          onClick={() => (onBack ? onBack() : navigate(-1))}
          className="text-white/70 hover:text-white hover:bg-white/5"
        >
          {language === "es" ? "Volver" : "Go back"}
        </Button>
      </div>
    </div>
  );

  if (!fullPage) return card;

  return (
    <div className="min-h-screen flex flex-col page-transition">
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-background/40 border-b border-white/5">
        <div className="flex items-center gap-3 px-4 py-3 max-w-3xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => (onBack ? onBack() : navigate(-1))}
            className="tap-scale rounded-full hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 text-center">
            <p className="text-[11px] uppercase tracking-[0.25em] text-foreground/60">
              {language === "es" ? "Función bloqueada" : "Locked feature"}
            </p>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 overflow-auto px-5 sm:px-6 pt-12 pb-32">
        <div className="max-w-xl mx-auto">{card}</div>
      </main>

      <PremiumNav />
    </div>
  );
}

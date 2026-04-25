import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Tier } from "@/hooks/useSubscription";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requiredTier?: Tier;
  feature?: string;
  reason?: 'limit' | 'gated';
}

const TIER_META: Record<Tier, { icon: any; label: string; gradient: string }> = {
  free: { icon: Sparkles, label: 'Free', gradient: 'from-muted to-muted' },
  premium: { icon: Sparkles, label: 'Premium', gradient: 'from-primary to-accent' },
  premium_plus: { icon: Crown, label: 'Premium Plus', gradient: 'from-blue-500 to-blue-600' },
  pro: { icon: Zap, label: 'Pro', gradient: 'from-amber-500 to-orange-500' },
};

export function LimitReachedDialog({ open, onOpenChange, requiredTier = 'premium', reason = 'gated' }: Props) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const meta = TIER_META[requiredTier];
  const Icon = meta.icon;

  const title = reason === 'limit'
    ? (language === 'es' ? 'Límite diario alcanzado' : 'Daily limit reached')
    : (language === 'es' ? 'Función premium' : 'Premium feature');

  const desc = reason === 'limit'
    ? (language === 'es'
      ? `Has llegado a tu límite diario gratuito de mensajes. Mejora a ${meta.label} para desbloquear más.`
      : `You've hit your free daily message limit. Upgrade to ${meta.label} to unlock more.`)
    : (language === 'es'
      ? `Esta función requiere ${meta.label} o superior.`
      : `This feature requires ${meta.label} or higher.`);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className={`mx-auto inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${meta.gradient} mb-3`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-center text-2xl">{title}</DialogTitle>
          <DialogDescription className="text-center">{desc}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <Button
            className={`w-full bg-gradient-to-r ${meta.gradient} text-white font-semibold`}
            size="lg"
            onClick={() => {
              onOpenChange(false);
              navigate('/premium');
            }}
          >
            {language === 'es' ? 'Ver planes' : 'View plans'}
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => onOpenChange(false)}>
            {language === 'es' ? 'Quizás más tarde' : 'Maybe later'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

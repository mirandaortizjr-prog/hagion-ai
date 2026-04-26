import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Check, Crown, ArrowLeft, Sparkles, Zap, Loader2, Settings2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePremium } from "@/contexts/PremiumContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { PremiumNav } from "@/components/PremiumNav";

type PlanId = 'free' | 'premium' | 'premium_plus' | 'pro';

interface Plan {
  id: PlanId;
  priceId: string | null;
  name: string;
  price: string;
  cadence: string;
  trial?: string;
  highlight?: 'popular' | 'best';
  icon: typeof Crown;
  gradient: string;
  borderClass: string;
  features: { en: string; es: string }[];
}

const Premium = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { language } = useLanguage();
  const { tier, isLoading, isDemo, refetch } = usePremium();

  const [checkoutPriceId, setCheckoutPriceId] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUser({ id: user.id, email: user.email ?? undefined });
    });
  }, []);

  // Handle Stripe return
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      toast.success(
        language === 'es' ? '¡Pago completado!' : 'Payment complete!',
        { description: language === 'es' ? 'Tu suscripción se activará en unos segundos.' : 'Your subscription will activate in a few seconds.' }
      );
      setSearchParams({});
      setTimeout(() => refetch(), 1500);
      setTimeout(() => refetch(), 4000);
    }
  }, [searchParams, setSearchParams, language, refetch]);

  const plans: Plan[] = [
    {
      id: 'free',
      priceId: null,
      name: language === 'es' ? 'Gratis' : 'Free',
      price: '$0',
      cadence: language === 'es' ? 'siempre' : 'forever',
      icon: Sparkles,
      gradient: 'from-muted to-muted',
      borderClass: 'border-border',
      features: [
        { en: '5 messages per day', es: '5 mensajes por día' },
        { en: 'All Analysts of Faith', es: 'Todos los Analistas de Fe' },
        { en: 'Full Bible access', es: 'Acceso completo a la Biblia' },
        { en: 'Prayer Wall & Community', es: 'Muro de Oración y Comunidad' },
      ],
    },
    {
      id: 'premium',
      priceId: 'hagion_premium_monthly',
      name: 'Premium',
      price: '$9.99',
      cadence: language === 'es' ? '/mes' : '/month',
      trial: language === 'es' ? '3 días gratis' : '3-day free trial',
      icon: Sparkles,
      gradient: 'from-primary to-accent',
      borderClass: 'border-primary',
      features: [
        { en: '100 messages per day', es: '100 mensajes por día' },
        { en: 'Saved history & offline', es: 'Historial guardado y sin conexión' },
        { en: 'Hagion University access', es: 'Acceso a Hagion University' },
        { en: 'Debate Arena premium', es: 'Arena de Debate premium' },
        { en: 'All Bible translations', es: 'Todas las traducciones bíblicas' },
        { en: 'Ad-free experience', es: 'Experiencia sin anuncios' },
      ],
    },
    {
      id: 'premium_plus',
      priceId: 'hagion_premium_plus_monthly',
      name: 'Premium Plus',
      price: '$15.99',
      cadence: language === 'es' ? '/mes' : '/month',
      trial: language === 'es' ? '3 días gratis' : '3-day free trial',
      highlight: 'popular',
      icon: Crown,
      gradient: 'from-blue-500 to-blue-600',
      borderClass: 'border-blue-500',
      features: [
        { en: '300 messages per day', es: '300 mensajes por día' },
        { en: 'Discernment tools (sermon, doctrine, lyrics)', es: 'Herramientas de Discernimiento' },
        { en: '60 min/day transcription', es: '60 min/día de transcripción' },
        { en: 'Hero image uploads', es: 'Subir imágenes principales' },
        { en: 'Everything in Premium', es: 'Todo lo de Premium' },
      ],
    },
    {
      id: 'pro',
      priceId: 'hagion_pro_monthly',
      name: 'Pro',
      price: '$39.99',
      cadence: language === 'es' ? '/mes' : '/month',
      trial: language === 'es' ? '3 días gratis' : '3-day free trial',
      highlight: 'best',
      icon: Zap,
      gradient: 'from-amber-500 to-orange-500',
      borderClass: 'border-amber-500',
      features: [
        { en: '1,000 messages per day', es: '1.000 mensajes por día' },
        { en: 'Priority AI processing', es: 'Procesamiento prioritario' },
        { en: 'Expanded Discernment quotas', es: 'Cuotas ampliadas de Discernimiento' },
        { en: '240 min/day transcription', es: '240 min/día de transcripción' },
        { en: 'Early access to new features', es: 'Acceso anticipado a funciones' },
        { en: 'Everything in Premium Plus', es: 'Todo lo de Premium Plus' },
      ],
    },
  ];

  const handleSelect = (plan: Plan) => {
    if (!user) {
      navigate('/auth?redirect=/premium');
      return;
    }
    if (!plan.priceId) return;
    if (tier === plan.id) {
      handleManageBilling();
      return;
    }
    setCheckoutPriceId(plan.priceId);
  };

  const handleManageBilling = async () => {
    if (!user) return;
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-portal-session', {
        body: {
          environment: getStripeEnvironment(),
          returnUrl: `${window.location.origin}/premium`,
        },
      });
      if (error || !data?.url) throw new Error(error?.message || 'Failed to open portal');
      window.open(data.url, '_blank');
    } catch (e) {
      toast.error(language === 'es' ? 'No se pudo abrir el portal' : 'Could not open portal', {
        description: (e as Error).message,
      });
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-card">
      <PaymentTestModeBanner />

      <header className="border-b bg-card/60 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl md:text-2xl font-bold text-secondary">
              {language === 'es' ? 'Planes Hagion' : 'Hagion Plans'}
            </h1>
          </div>
          {tier !== 'free' && !isDemo && (
            <Button variant="outline" size="sm" onClick={handleManageBilling} disabled={portalLoading}>
              {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Settings2 className="w-4 h-4 mr-2" />}
              {language === 'es' ? 'Facturación' : 'Billing'}
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-7xl pb-32">
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent mb-6 shadow-[var(--shadow-divine)]">
            <Crown className="w-10 h-10 text-primary-foreground" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-3">
            {language === 'es' ? 'Eleva tu camino espiritual' : 'Elevate your spiritual journey'}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {language === 'es'
              ? 'Comienza tu prueba gratuita de 3 días. Cancela en cualquier momento sin cargo.'
              : 'Start your 3-day free trial. Cancel anytime during the trial at no charge.'}
          </p>
          {isDemo && (
            <div className="mt-4 inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              {language === 'es' ? 'Cuenta demo · Acceso Pro completo' : 'Demo account · Full Pro access'}
            </div>
          )}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            const isCurrent = !isLoading && tier === plan.id;
            const isFreeCurrent = isCurrent && plan.id === 'free';

            return (
              <Card
                key={plan.id}
                className={`relative p-6 border-2 ${plan.borderClass} bg-card/80 backdrop-blur-sm overflow-hidden animate-slide-up transition-all hover:shadow-[var(--shadow-divine)] flex flex-col`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {plan.highlight === 'popular' && (
                  <div className="absolute top-0 right-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                    {language === 'es' ? 'POPULAR' : 'POPULAR'}
                  </div>
                )}
                {plan.highlight === 'best' && (
                  <div className="absolute top-0 right-0 bg-gradient-to-br from-amber-500 to-orange-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                    {language === 'es' ? 'MEJOR VALOR' : 'BEST VALUE'}
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute top-0 left-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold rounded-br-lg">
                    {language === 'es' ? 'TU PLAN' : 'YOUR PLAN'}
                  </div>
                )}

                <div className="text-center mb-5 mt-3">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br ${plan.gradient} mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-secondary mb-1">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-extrabold text-secondary">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">{plan.cadence}</span>
                  </div>
                  {plan.trial && (
                    <p className="text-xs font-semibold text-primary mt-1">🎁 {plan.trial}</p>
                  )}
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-secondary/90">{language === 'es' ? f.es : f.en}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  size="lg"
                  disabled={isFreeCurrent || isLoading}
                  onClick={() => handleSelect(plan)}
                  className={
                    plan.id === 'free'
                      ? 'w-full'
                      : `w-full bg-gradient-to-r ${plan.gradient} text-white font-semibold shadow-lg hover:shadow-xl hover:opacity-95`
                  }
                  variant={plan.id === 'free' ? 'outline' : 'default'}
                >
                  {isFreeCurrent
                    ? (language === 'es' ? 'Plan actual' : 'Current plan')
                    : isCurrent
                    ? (language === 'es' ? 'Administrar' : 'Manage')
                    : plan.id === 'free'
                    ? (language === 'es' ? 'Empezar gratis' : 'Get started')
                    : (language === 'es' ? 'Comenzar prueba' : 'Start trial')}
                </Button>
              </Card>
            );
          })}
        </div>

        <div className="text-center text-xs text-muted-foreground space-y-1 max-w-2xl mx-auto">
          <p>
            {language === 'es'
              ? 'Facturado mensualmente después de la prueba. Cancela en cualquier momento; el cambio surte efecto al final del ciclo de facturación.'
              : 'Billed monthly after the trial. Cancel anytime; cancellation takes effect at the end of the billing period.'}
          </p>
          <p>
            {language === 'es'
              ? 'Impuestos calculados automáticamente. Sin reembolsos después de la facturación.'
              : 'Taxes calculated automatically. No refunds after billing.'}
          </p>
        </div>
      </main>

      <Dialog open={!!checkoutPriceId} onOpenChange={(open) => !open && setCheckoutPriceId(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <DialogTitle className="sr-only">
            {language === 'es' ? 'Completar pago' : 'Complete payment'}
          </DialogTitle>
          {checkoutPriceId && user && (
            <StripeEmbeddedCheckout
              priceId={checkoutPriceId}
              customerEmail={user.email}
              userId={user.id}
              returnUrl={`${window.location.origin}/premium?session_id={CHECKOUT_SESSION_ID}`}
            />
          )}
        </DialogContent>
      </Dialog>

      <PremiumNav />
    </div>
  );
};

export default Premium;

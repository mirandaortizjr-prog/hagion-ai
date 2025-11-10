import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Crown, ArrowLeft, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

const Premium = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async (plan: 'premium' | 'premiumPlus') => {
    setIsProcessing(true);
    
    try {
      // TODO: Integrate with Google Play Billing when ready
      // For now, show a message that payment integration is coming
      toast({
        title: language === 'es' ? 'Próximamente' : 'Coming Soon',
        description: language === 'es' 
          ? 'La integración de pagos se activará cuando la aplicación esté publicada en Google Play Store'
          : 'Payment integration will be activated when the app is published on Google Play Store',
      });
      
      // When ready, this will call Google Play Billing API:
      // const purchase = await Purchases.purchaseProduct({
      //   productId: plan === 'premium' ? 'hagion_premium_monthly' : 'hagion_premium_plus_monthly'
      // });
      
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: language === 'es' ? 'Error' : 'Error',
        description: language === 'es' 
          ? 'No se pudo procesar la compra. Por favor, inténtalo de nuevo.'
          : 'Could not process purchase. Please try again.',
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const features = {
    free: [
      t('feature_daily_limit'),
      t('feature_all_assistants'),
      "✨ Full Bible access (always free)",
    ],
    premium: [
      "🎁 3-day free trial included",
      t('feature_unlimited'),
      t('feature_priority'),
      t('feature_saved_history'),
      t('feature_offline'),
      t('feature_early_access'),
      t('feature_ad_free'),
      t('feature_support_dev'),
      "✨ Full Bible access (always free)",
    ],
    premiumPlus: [
      "🎁 3-day free trial included",
      t('feature_unlimited'),
      t('feature_priority'),
      t('feature_saved_history'),
      t('feature_offline'),
      t('feature_early_access'),
      t('feature_ad_free'),
      t('feature_support_dev'),
      "✨ Full Bible access (always free)",
      "🎯 Bonus: Faithful Friend app access",
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-white">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/menu")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-secondary">{t('upgrade_premium')}</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent mb-6">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-secondary mb-4">
            {t('unlimited_guidance')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start your 3-day free trial and unlock unlimited spiritual guidance. Cancel anytime during the trial at no charge.
          </p>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto mt-2">
            📖 <strong>The Bible is always free</strong> - No premium required for scripture access
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
          <Card className="p-8 border-2 animate-slide-up">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-secondary mb-2">{t('free')}</h3>
              <div className="text-4xl font-bold text-primary">$0</div>
              <p className="text-muted-foreground">{t('forever')}</p>
            </div>
            <ul className="space-y-3">
              {features.free.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6 border-2 border-primary relative overflow-hidden animate-slide-up shadow-lg" style={{ animationDelay: "100ms" }}>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-secondary mb-2">{t('premium')}</h3>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-2xl text-muted-foreground line-through">$9.99</span>
                <span className="text-4xl font-bold text-primary">FREE</span>
              </div>
              <p className="text-sm font-semibold text-primary mt-1">for 3 days, then $9.99/month</p>
              <p className="text-xs text-muted-foreground mt-2">
                Billed monthly after trial. Cancel anytime - takes effect next billing cycle.
              </p>
            </div>
            <ul className="space-y-2 mb-6">
              {features.premium.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-secondary text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              size="lg"
              onClick={() => handlePurchase('premium')}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-primary to-accent text-white font-semibold shadow-lg hover:shadow-xl"
            >
              {isProcessing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {language === 'es' ? 'Procesando...' : 'Processing...'}</>
              ) : (
                'Start 3-Day Free Trial'
              )}
            </Button>
          </Card>

          <Card className="p-6 border-4 border-blue-500 relative overflow-hidden animate-slide-up shadow-xl" style={{ animationDelay: "200ms" }}>
            <div className="absolute top-0 right-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white px-4 py-1 text-sm font-semibold">
              {t('most_popular')}
            </div>
            <div className="text-center mb-6 mt-6">
              <h3 className="text-2xl font-bold text-secondary mb-2">Premium Plus</h3>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-2xl text-muted-foreground line-through">$15.99</span>
                <span className="text-4xl font-bold text-blue-600">FREE</span>
              </div>
              <p className="text-sm font-semibold text-blue-600 mt-1">for 3 days, then $15.99/month</p>
              <p className="text-xs text-muted-foreground mt-2">
                Billed monthly after trial. Cancel anytime - takes effect next billing cycle.
              </p>
            </div>
            <ul className="space-y-2 mb-6">
              {features.premiumPlus.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-secondary font-medium text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              size="lg"
              onClick={() => handlePurchase('premiumPlus')}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl"
            >
              {isProcessing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {language === 'es' ? 'Procesando...' : 'Processing...'}</>
              ) : (
                'Start 3-Day Free Trial'
              )}
            </Button>
          </Card>
        </div>

        <div className="text-center text-sm text-muted-foreground animate-fade-in space-y-2">
          <p className="font-medium">✨ Start your free trial today - no payment required for 3 days</p>
          <p>Choose Premium ($9.99/month) or Premium Plus ($15.99/month with Faithful Friend). Cancel anytime during trial at no cost.</p>
          <p className="text-xs">No refunds after billing. Cancellations take effect at the end of your billing period.</p>
        </div>
      </main>
    </div>
  );
};

export default Premium;

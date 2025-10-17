import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Crown, ArrowLeft, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@/assets/logo.png";

const Premium = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const features = {
    free: [
      t('feature_daily_limit'),
      t('feature_all_assistants'),
      t('feature_basic_scripture'),
    ],
    premium: [
      t('feature_unlimited'),
      t('feature_priority'),
      t('feature_saved_history'),
      t('feature_advanced_scripture'),
      t('feature_offline'),
      t('feature_early_access'),
      t('feature_ad_free'),
      t('feature_support_dev'),
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
            {t('premium_description')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
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

          <Card className="p-8 border-4 border-primary relative overflow-hidden animate-slide-up shadow-xl" style={{ animationDelay: "100ms" }}>
            <div className="absolute top-0 right-0 bg-gradient-to-br from-primary to-accent text-white px-4 py-1 text-sm font-semibold">
              {t('most_popular')}
            </div>
            <div className="text-center mb-6 mt-6">
              <h3 className="text-2xl font-bold text-secondary mb-2">{t('premium')}</h3>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-4xl font-bold text-primary">$9.99</span>
                <span className="text-muted-foreground">{t('per_month')}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{t('or_yearly')}</p>
            </div>
            <ul className="space-y-3 mb-8">
              {features.premium.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-secondary font-medium">{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-primary to-accent text-white font-semibold text-lg shadow-lg hover:shadow-xl"
            >
              {t('upgrade_now')}
            </Button>
          </Card>
        </div>

        <div className="text-center text-sm text-muted-foreground animate-fade-in">
          <p>{t('cancel_anytime')}</p>
        </div>
      </main>
    </div>
  );
};

export default Premium;

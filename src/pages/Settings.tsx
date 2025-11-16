import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Bell, Shield, HelpCircle, LogOut, Star, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import LanguageToggle from "@/components/LanguageToggle";

const Settings = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: t('error'),
        description: t('failed_logout'),
        variant: "destructive",
      });
    } else {
      toast({
        title: t('logged_out'),
        description: t('logged_out_success'),
      });
      navigate("/auth");
    }
  };

  const handleResetOnboarding = () => {
    localStorage.removeItem("onboardingCompleted");
    toast({
      title: language === 'es' ? 'Tutorial reiniciado' : 'Tutorial Reset',
      description: language === 'es' ? 'Volverás a ver el tutorial en tu próxima visita' : 'You will see the tutorial on your next visit',
    });
    navigate("/onboarding");
  };

  const settingsSections = [
    {
      title: t('account'),
      items: [
        { icon: User, label: t('profile'), action: () => navigate("/profile") },
        { icon: Bell, label: t('notifications'), action: () => navigate("/notifications") },
        { icon: Star, label: t('pro'), action: () => navigate("/premium"), isPro: true },
      ],
    },
    {
      title: t('preferences'),
      items: [],
    },
    {
      title: t('support'),
      items: [
        { icon: HelpCircle, label: t('help_support'), action: () => navigate("/support") },
        { icon: BookOpen, label: language === 'es' ? 'Ver Tutorial de Nuevo' : 'View Tutorial Again', action: handleResetOnboarding },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-4 px-4 py-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => navigate("/main-menu")}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold">{t('settings')}</h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {settingsSections.map((section, idx) => (
            <div key={idx}>
              <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-2">
                {section.title}
              </h2>
              {section.title === t('preferences') ? (
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t('language')}</span>
                    <LanguageToggle />
                  </div>
                </Card>
              ) : (
                <Card className="divide-y">
                  {section.items.map((item, itemIdx) => (
                    <button
                      key={itemIdx}
                      onClick={item.action}
                      className="w-full flex items-center gap-4 px-4 py-4 hover:bg-muted/50 transition-colors text-left"
                    >
                      <item.icon className={(item as any).isPro ? "w-5 h-5 text-orange-500" : "w-5 h-5 text-muted-foreground"} />
                      <span className="flex-1">{item.label}</span>
                      {(item as any).isPro && (
                        <span className="text-orange-500 text-sm">★</span>
                      )}
                    </button>
                  ))}
                </Card>
              )}
            </div>
          ))}

          <Separator className="my-6" />

          <Card>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-4 py-4 hover:bg-muted/50 transition-colors text-left text-destructive"
            >
              <LogOut className="w-5 h-5" />
              <span className="flex-1">{t('log_out')}</span>
            </button>
          </Card>

          <div className="text-center text-sm text-muted-foreground py-6">
            <p>Hagion AI v1.0.0</p>
            <p className="mt-1">© 2025 All rights reserved</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

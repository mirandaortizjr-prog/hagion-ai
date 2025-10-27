import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Bell, Shield, HelpCircle, LogOut } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

  const settingsSections = [
    {
      title: t('account'),
      items: [
        { icon: User, label: t('profile'), action: () => navigate("/profile") },
        { icon: Bell, label: t('notifications'), action: () => navigate("/notifications") },
      ],
    },
    {
      title: t('preferences'),
      items: [
        { 
          icon: Shield, 
          label: language === 'en' ? t('language_english') : t('language_spanish'),
          action: () => setLanguage(language === 'en' ? 'es' : 'en')
        },
      ],
    },
    {
      title: t('support'),
      items: [
        { icon: HelpCircle, label: t('help_support'), action: () => navigate("/support") },
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
              <Card className="divide-y">
                {section.items.map((item, itemIdx) => (
                  <button
                    key={itemIdx}
                    onClick={item.action}
                    className="w-full flex items-center gap-4 px-4 py-4 hover:bg-muted/50 transition-colors text-left"
                  >
                    <item.icon className="w-5 h-5 text-muted-foreground" />
                    <span className="flex-1">{item.label}</span>
                  </button>
                ))}
              </Card>
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

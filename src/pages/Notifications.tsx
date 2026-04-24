import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { PremiumNav } from "@/components/PremiumNav";

const Notifications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [notifications, setNotifications] = useState({
    chatResponses: true,
    newFeatures: true,
    systemUpdates: false,
    dailyReminders: false,
  });

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => {
      const newState = { ...prev, [key]: !prev[key] };
      
      // Save to localStorage
      localStorage.setItem("notification_preferences", JSON.stringify(newState));
      
      toast({
        title: t('preference_updated'),
        description: `${t('notifications')} ${newState[key] ? t('enabled') : t('disabled')}`,
      });
      
      return newState;
    });
  };

  const notificationSettings = [
    {
      key: "chatResponses" as const,
      title: t('chat_responses'),
      description: t('chat_responses_desc'),
    },
    {
      key: "newFeatures" as const,
      title: t('new_features'),
      description: t('new_features_desc'),
    },
    {
      key: "systemUpdates" as const,
      title: t('system_updates'),
      description: t('system_updates_desc'),
    },
    {
      key: "dailyReminders" as const,
      title: t('daily_reminders'),
      description: t('daily_reminders_desc'),
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center gap-4 px-4 py-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold">{t('notifications')}</h1>
      </header>

      <div className="flex-1 overflow-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>{t('notification_preferences')}</CardTitle>
              <CardDescription>
                {t('notification_preferences_desc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {notificationSettings.map((setting) => (
                <div key={setting.key} className="flex items-center justify-between space-x-4">
                  <div className="flex-1">
                    <Label htmlFor={setting.key} className="text-base cursor-pointer">
                      {setting.title}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {setting.description}
                    </p>
                  </div>
                  <Switch
                    id={setting.key}
                    checked={notifications[setting.key]}
                    onCheckedChange={() => handleToggle(setting.key)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
      <PremiumNav />
    </div>
  );
};

export default Notifications;

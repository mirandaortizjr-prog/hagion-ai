import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Notifications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
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
        title: "Preference updated",
        description: `Notifications ${newState[key] ? "enabled" : "disabled"}`,
      });
      
      return newState;
    });
  };

  const notificationSettings = [
    {
      key: "chatResponses" as const,
      title: "Chat Responses",
      description: "Get notified when your chat receives a response",
    },
    {
      key: "newFeatures" as const,
      title: "New Features",
      description: "Stay updated about new features and improvements",
    },
    {
      key: "systemUpdates" as const,
      title: "System Updates",
      description: "Important updates about the app",
    },
    {
      key: "dailyReminders" as const,
      title: "Daily Reminders",
      description: "Receive daily spiritual reminders and verses",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center gap-4 px-4 py-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold">Notifications</h1>
      </header>

      <div className="flex-1 overflow-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose what notifications you want to receive
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
    </div>
  );
};

export default Notifications;

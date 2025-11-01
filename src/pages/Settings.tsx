import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Bell, Shield, HelpCircle, LogOut, History, MessageSquare, Trash2, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import LanguageToggle from "@/components/LanguageToggle";

interface ChatHistory {
  id: string;
  voice: string;
  context: string;
  timestamp: number;
  messages: Array<{ role: string; content: string }>;
  preview: string;
}

const Settings = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const { toast } = useToast();
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = () => {
    const stored = localStorage.getItem("chat_history");
    if (stored) {
      try {
        const history = JSON.parse(stored);
        // Sort by timestamp, most recent first
        const sorted = history.sort((a: ChatHistory, b: ChatHistory) => b.timestamp - a.timestamp);
        setChatHistory(sorted);
      } catch (error) {
        console.error("Failed to load chat history:", error);
      }
    }
  };

  const handleDeleteConversation = (id: string) => {
    const stored = localStorage.getItem("chat_history");
    if (stored) {
      try {
        const history = JSON.parse(stored);
        const filtered = history.filter((c: ChatHistory) => c.id !== id);
        localStorage.setItem("chat_history", JSON.stringify(filtered));
        setChatHistory(filtered);
        toast({
          title: t('deleted'),
          description: t('conversation_deleted'),
        });
      } catch (error) {
        console.error("Failed to delete conversation:", error);
      }
    }
  };

  const handleClearAllHistory = () => {
    localStorage.removeItem("chat_history");
    setChatHistory([]);
    toast({
      title: t('cleared'),
      description: t('all_history_cleared'),
    });
  };

  const handleOpenConversation = (conversation: ChatHistory) => {
    // Navigate to appropriate chat based on context
    if (conversation.context === "divine") {
      navigate(`/divine/${conversation.voice}?history=${conversation.id}`);
    } else if (conversation.context === "storytelling") {
      navigate(`/storytelling/${conversation.voice}?history=${conversation.id}`);
    } else {
      navigate(`/chat?voice=${conversation.voice}&context=${conversation.context}&history=${conversation.id}`);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return t('today');
    if (days === 1) return t('yesterday');
    if (days < 7) return `${days} ${t('days_ago')}`;
    return date.toLocaleDateString();
  };

  const getVoiceLabel = (voice: string) => {
    const labels: Record<string, string> = {
      elohim: t('elohim'),
      christ: t('christ'),
      emmanuel: t('christ'),
      "holy-spirit": t('holy_spirit'),
      ruach: t('holy_spirit'),
      trinity: t('trinity'),
      "biblical-stories": t('biblical_stories'),
      martyrs: t('martyrs_faith'),
      "history-christianity": t('history_christianity'),
    };
    return labels[voice] || voice;
  };

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

          {/* Chat History Section */}
          <div>
            <div className="flex items-center justify-between mb-3 px-2">
              <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <History className="w-4 h-4" />
                {t('chat_history')}
              </h2>
              {chatHistory.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAllHistory}
                  className="text-xs text-destructive hover:text-destructive"
                >
                  {t('clear_all')}
                </Button>
              )}
            </div>
            {chatHistory.length === 0 ? (
              <Card className="p-8 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">{t('no_chat_history')}</p>
              </Card>
            ) : (
              <Card className="divide-y max-h-[400px] overflow-y-auto">
                {chatHistory.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors group"
                  >
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => handleOpenConversation(conversation)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {getVoiceLabel(conversation.voice)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          • {formatTimestamp(conversation.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {conversation.preview}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConversation(conversation.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </Card>
            )}
          </div>

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

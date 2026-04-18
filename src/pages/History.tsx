import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MessageCircle, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";
import { BottomNav } from "@/components/BottomNav";

interface ConversationHistory {
  id: string;
  voice: string;
  context: string;
  timestamp: number;
  messages: Array<{ role: string; content: string }>;
  preview: string;
}

const History = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [conversations, setConversations] = useState<ConversationHistory[]>([]);

  useEffect(() => {
    // Load conversation history from localStorage
    const stored = localStorage.getItem("chat_history");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setConversations(parsed.sort((a: ConversationHistory, b: ConversationHistory) => b.timestamp - a.timestamp));
      } catch (error) {
        console.error("Failed to load history:", error);
      }
    }
  }, []);

  const deleteConversation = (id: string) => {
    const updated = conversations.filter(c => c.id !== id);
    setConversations(updated);
    localStorage.setItem("chat_history", JSON.stringify(updated));
  };

  const clearAllHistory = () => {
    setConversations([]);
    localStorage.removeItem("chat_history");
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return t('today');
    if (days === 1) return t('yesterday');
    if (days < 7) return `${days} ${t('days_ago')}`;
    return date.toLocaleDateString();
  };

  const voiceNames: Record<string, string> = {
    elohim: t('elohim'),
    christ: t('christ'),
    "holy-spirit": t('holy_spirit'),
    trinity: t('trinity'),
    "biblical-stories": t('biblical_stories'),
    martyrs: t('martyrs_faith'),
    apologetics: "Miranda-Ortiz",
    science: "Sophia",
    medical: "Asher",
    psychology: "Caleb",
    historical: "Brooke",
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/main-menu")}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-bold">{t('chat_history')}</h1>
        </div>
        {conversations.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllHistory}
            className="text-destructive hover:text-destructive"
          >
            {t('clear_all')}
          </Button>
        )}
      </header>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="px-4 py-6 max-w-2xl mx-auto space-y-4">
          {conversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h2 className="text-xl font-semibold mb-2">{t('no_conversations')}</h2>
              <p className="text-muted-foreground">
                {t('start_conversation_see_history')}
              </p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <Card
                key={conversation.id}
                className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/chat?voice=${conversation.voice}&context=${conversation.context}&history=${conversation.id}`)}
              >
                <div className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-semibold truncate">
                        {voiceNames[conversation.voice] || conversation.voice}
                      </h3>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(conversation.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {conversation.preview}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {conversation.messages.length} {t('messages')}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conversation.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
      <BottomNav />
    </div>
  );
};

export default History;

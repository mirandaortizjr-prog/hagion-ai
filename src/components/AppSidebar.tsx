import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Star, Trash2, ChevronDown } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import hagionLogo from "@/assets/hagion-logo.png";

interface ChatHistory {
  id: string;
  voice: string;
  context: string;
  timestamp: number;
  messages: Array<{ role: string; content: string }>;
  preview: string;
  isFavorite?: boolean;
}

export function AppSidebar() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [favoritesOpen, setFavoritesOpen] = useState(true);

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = () => {
    const stored = localStorage.getItem("chat_history");
    if (stored) {
      try {
        const history = JSON.parse(stored);
        const sorted = history.sort((a: ChatHistory, b: ChatHistory) => b.timestamp - a.timestamp);
        setChatHistory(sorted);
      } catch (error) {
        console.error("Failed to load chat history:", error);
      }
    }
  };

  const handleOpenConversation = (conversation: ChatHistory) => {
    if (conversation.context === "divine") {
      navigate(`/divine/${conversation.voice}?history=${conversation.id}`);
    } else if (conversation.context === "storytelling") {
      navigate(`/storytelling/${conversation.voice}?history=${conversation.id}`);
    } else {
      navigate(`/chat?voice=${conversation.voice}&context=${conversation.context}&history=${conversation.id}`);
    }
  };

  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const stored = localStorage.getItem("chat_history");
    if (stored) {
      try {
        const history = JSON.parse(stored);
        const updated = history.map((c: ChatHistory) => 
          c.id === id ? { ...c, isFavorite: !c.isFavorite } : c
        );
        localStorage.setItem("chat_history", JSON.stringify(updated));
        setChatHistory(updated);
      } catch (error) {
        console.error("Failed to toggle favorite:", error);
      }
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

  const recentChats = chatHistory.filter(c => !c.isFavorite).slice(0, 10);
  const favoriteChats = chatHistory.filter(c => c.isFavorite);

  return (
    <Sidebar className="w-[50vw] border-r border-black bg-muted/30">
      <div className="p-8 bg-black border-b-0">
        <img src={hagionLogo} alt="Hagion AI" className="h-20 w-auto" />
      </div>

      <SidebarContent className="bg-muted/30">
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2 text-base font-semibold">
            <MessageSquare className="h-5 w-5" />
            {t('chat_history')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {recentChats.length === 0 ? (
                <div className="px-3 py-2 text-base text-muted-foreground">
                  {t('no_conversations')}
                </div>
              ) : (
                recentChats.map((chat) => (
                  <SidebarMenuItem key={chat.id} className="mb-3">
                    <SidebarMenuButton
                      onClick={() => handleOpenConversation(chat)}
                      className="w-full justify-between group py-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-base font-medium truncate">{chat.preview}</div>
                        <div className="text-xs text-muted-foreground">{formatTimestamp(chat.timestamp)}</div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => handleToggleFavorite(chat.id, e)}
                        >
                          <Star className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => handleDeleteConversation(chat.id, e)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Collapsible open={favoritesOpen} onOpenChange={setFavoritesOpen}>
          <SidebarGroup>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 text-base font-semibold">
                <Star className="h-5 w-5" />
                {t('favorite_chats')}
                <ChevronDown className={`h-5 w-5 ml-auto transition-transform ${favoritesOpen ? 'rotate-180' : ''}`} />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-2">
                  {favoriteChats.length === 0 ? (
                    <div className="px-3 py-2 text-base text-muted-foreground">
                      {t('no_favorites')}
                    </div>
                  ) : (
                    favoriteChats.map((chat) => (
                      <SidebarMenuItem key={chat.id} className="mb-3">
                        <SidebarMenuButton
                          onClick={() => handleOpenConversation(chat)}
                          className="w-full justify-between group py-3"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-base font-medium truncate">{chat.preview}</div>
                            <div className="text-xs text-muted-foreground">{formatTimestamp(chat.timestamp)}</div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => handleToggleFavorite(chat.id, e)}
                            >
                              <Star className="h-3 w-3 fill-current" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => handleDeleteConversation(chat.id, e)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>
    </Sidebar>
  );
}

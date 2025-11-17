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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  const [savedChatsOpen, setSavedChatsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

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

  const favoriteChats = chatHistory.filter(c => c.isFavorite);
  const recentChats = chatHistory.filter(c => !c.isFavorite);

  const renderChatItem = (chat: ChatHistory) => (
    <SidebarMenuItem key={chat.id} className="group bg-muted">
      <SidebarMenuButton
        onClick={() => handleOpenConversation(chat)}
        className="w-full bg-muted hover:bg-muted/80"
      >
        <MessageSquare className="h-4 w-4 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="truncate text-sm font-medium">{chat.preview}</div>
          <div className="text-xs text-muted-foreground">{formatTimestamp(chat.timestamp)}</div>
        </div>
      </SidebarMenuButton>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => handleToggleFavorite(chat.id, e)}
        >
          <Star className={`h-3 w-3 ${chat.isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
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
    </SidebarMenuItem>
  );

  return (
    <Sidebar className="w-[50vw] border-0 bg-muted shadow-none flex flex-col">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-muted">
        <div className="p-4 bg-black">
          <img src={hagionLogo} alt="Hagion AI" className="h-20 mx-auto" />
        </div>
        <div className="px-6 py-3 bg-muted">
          <h1 className="text-3xl font-playfair font-bold text-foreground">Hagion AI</h1>
        </div>
        <Separator className="bg-border" />
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1 bg-muted">
        <SidebarContent className="bg-muted">
          {/* Saved Chats Section */}
          <Collapsible
            open={savedChatsOpen}
            onOpenChange={setSavedChatsOpen}
            className="bg-muted"
          >
            <SidebarGroup className="bg-muted">
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className="bg-muted hover:bg-muted/80 cursor-pointer text-lg font-playfair font-semibold py-4">
                  <span>Saved Chats</span>
                  <ChevronDown
                    className={`ml-auto h-4 w-4 transition-transform ${
                      savedChatsOpen ? "rotate-180" : ""
                    }`}
                  />
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent className="bg-muted">
                  {favoriteChats.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground bg-muted">
                      {t('no_saved_chats')}
                    </div>
                  ) : (
                    <ScrollArea className="h-[200px] bg-muted">
                      <SidebarMenu className="bg-muted">
                        {favoriteChats.map(renderChatItem)}
                      </SidebarMenu>
                    </ScrollArea>
                  )}
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>

          {/* History Section */}
          <Collapsible
            open={historyOpen}
            onOpenChange={setHistoryOpen}
            className="bg-muted"
          >
            <SidebarGroup className="bg-muted">
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className="bg-muted hover:bg-muted/80 cursor-pointer text-lg font-playfair font-semibold py-4">
                  <span>History</span>
                  <ChevronDown
                    className={`ml-auto h-4 w-4 transition-transform ${
                      historyOpen ? "rotate-180" : ""
                    }`}
                  />
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent className="bg-muted">
                  {recentChats.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground bg-muted">
                      {t('no_history')}
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px] bg-muted">
                      <SidebarMenu className="bg-muted">
                        {recentChats.map(renderChatItem)}
                      </SidebarMenu>
                    </ScrollArea>
                  )}
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        </SidebarContent>
      </ScrollArea>
    </Sidebar>
  );
}

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
    <SidebarMenuItem key={chat.id} className="group">
      <SidebarMenuButton onClick={() => handleOpenConversation(chat)} className="w-full justify-start hover:bg-gray-100 px-2 py-2">
        <MessageSquare className="mr-2 h-4 w-4 flex-shrink-0 text-gray-600" />
        <div className="flex-1 min-w-0">
          <div className="text-sm truncate text-gray-900">{chat.preview}</div>
          <div className="text-xs text-gray-500">{formatTimestamp(chat.timestamp)}</div>
        </div>
      </SidebarMenuButton>
      <div className="flex items-center gap-1 px-2">
        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => handleToggleFavorite(chat.id, e)}>
          <Star className={`h-3 w-3 ${chat.isFavorite ? "fill-yellow-500 text-yellow-500" : "text-gray-600"}`} />
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => handleDeleteConversation(chat.id, e)}>
          <Trash2 className="h-3 w-3 text-red-500" />
        </Button>
      </div>
    </SidebarMenuItem>
  );

  return (
    <Sidebar className="w-[280px] border-0 bg-[hsl(205,37%,78%)]">
      <SidebarContent className="p-4 bg-[hsl(205,37%,78%)]">
        {/* White Content Box */}
        <div className="bg-white rounded-lg flex flex-col max-h-[calc(100vh-32px)] overflow-hidden shadow-sm">
          {/* Fixed Header */}
          <div className="p-4 border-b border-gray-300 flex-shrink-0 bg-white">
            <div className="flex items-center gap-3">
              <img src={hagionLogo} alt="Hagion AI" className="w-10 h-10 rounded-lg shadow-sm" />
              <h2 className="text-lg font-semibold text-gray-900 font-playfair">Hagion AI</h2>
            </div>
          </div>
          
          {/* Scrollable Chat Section */}
          <div className="flex-grow overflow-y-auto bg-white">
            {/* Saved Chats Section */}
            <Collapsible
              open={savedChatsOpen}
              onOpenChange={setSavedChatsOpen}
              className="p-4"
            >
              <SidebarGroup>
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel className="hover:bg-gray-50 cursor-pointer text-base font-playfair font-semibold py-3 text-gray-900">
                    <span>Saved Chats</span>
                    <ChevronDown
                      className={`ml-auto h-4 w-4 transition-transform text-gray-900 ${
                        savedChatsOpen ? "rotate-180" : ""
                      }`}
                    />
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarGroupContent className="px-0 py-2">
                    {favoriteChats.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-gray-500">
                        {t('no_saved_chats')}
                      </div>
                    ) : (
                      <SidebarMenu>
                        {favoriteChats.map(renderChatItem)}
                      </SidebarMenu>
                    )}
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>

            {/* History Section */}
            <Collapsible
              open={historyOpen}
              onOpenChange={setHistoryOpen}
              className="p-4 border-t border-gray-200"
            >
              <SidebarGroup>
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel className="hover:bg-gray-50 cursor-pointer text-base font-playfair font-semibold py-3 text-gray-900">
                    <span>History</span>
                    <ChevronDown
                      className={`ml-auto h-4 w-4 transition-transform text-gray-900 ${
                        historyOpen ? "rotate-180" : ""
                      }`}
                    />
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarGroupContent className="px-0 py-2">
                    {recentChats.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-gray-500">
                        {t('no_history')}
                      </div>
                    ) : (
                      <SidebarMenu>
                        {recentChats.map(renderChatItem)}
                      </SidebarMenu>
                    )}
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

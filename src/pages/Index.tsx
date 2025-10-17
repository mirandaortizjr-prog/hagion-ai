import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User } from "@supabase/supabase-js";
import { Settings, MessageSquare, Users, BookOpen, Menu, Send, Sparkles } from "lucide-react";
import logoImage from "@/assets/logo.jpg";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useMessageLimit } from "@/hooks/useMessageLimit";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const Index = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const { remaining, refetch: refetchUsage } = useMessageLimit();
  const [user, setUser] = useState<User | null>(null);
  const [greeting, setGreeting] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Set time-based greeting
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting(language === 'es' ? "Buenos días" : "Good morning");
    } else if (hour < 18) {
      setGreeting(language === 'es' ? "Buenas tardes" : "Good afternoon");
    } else {
      setGreeting(language === 'es' ? "Buenas noches" : "Good evening");
    }
  }, [language]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getUserName = () => {
    if (!user) return language === 'es' ? "Amigo" : "Friend";
    return user.user_metadata?.first_name || user.email?.split('@')[0] || (language === 'es' ? "Amigo" : "Friend");
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast({
          title: t('login_required'),
          description: t('login_required_continue'),
          variant: "destructive",
        });
        setMessages((prev) => prev.slice(0, -1));
        navigate("/auth");
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          voice: "friend",
          context: "general",
          language,
        }),
      });

      if (response.status === 401) {
        toast({
          title: t('login_required'),
          description: t('login_required_continue'),
          variant: "destructive",
        });
        setMessages((prev) => prev.slice(0, -1));
        navigate("/auth");
        return;
      }

      if (response.status === 429) {
        toast({
          title: t('daily_limit_reached'),
          description: t('upgrade_unlimited'),
          variant: "destructive",
          action: (
            <Button variant="outline" size="sm" onClick={() => navigate('/premium')}>
              {t('upgrade')}
            </Button>
          ),
        });
        setMessages((prev) => prev.slice(0, -1));
        refetchUsage();
        setIsLoading(false);
        return;
      }

      if (!response.ok || !response.body) {
        throw new Error("Failed to get response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      let textBuffer = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });
        let newlineIndex: number;

        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const newMessages = [...prev];
                const lastMsg = newMessages[newMessages.length - 1];
                if (lastMsg.role === "assistant") {
                  lastMsg.content = assistantContent;
                }
                return newMessages;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
      
      refetchUsage();
      setIsLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: t('connection_issue_retry'),
        },
      ]);
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--gradient-splash)' }}>
      {/* Top Navigation */}
      <header className="border-b border-white/20 bg-white/10 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/main-menu")}
              className="text-white hover:bg-white/20"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-lg font-semibold text-white">Hagion AI</h2>
              {remaining !== null && (
                <span className="inline-flex items-center gap-1 text-xs text-white/90">
                  <Sparkles className="w-3 h-3" />
                  {remaining} {language === 'es' ? 'mensajes gratis hoy' : 'free messages today'}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/settings")}
              className="text-white hover:bg-white/20"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area with Chat */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea ref={scrollRef} className="flex-1">
          <div className="container mx-auto max-w-4xl px-4 py-6">
            {/* Welcome Section - only show when no messages */}
            {messages.length === 0 && (
              <>
                <div className="text-center mb-8 animate-fade-in">
                  <h1 className="text-2xl md:text-3xl font-bold mb-6 text-white">
                    {greeting}, {getUserName()}
                  </h1>
                  <p className="text-lg text-white/90 leading-relaxed max-w-2xl mx-auto">
                    {language === 'es' 
                      ? "¿Qué tienes en mente esta mañana? Te invitamos a consultar nuestros Analistas, buscar consejo sabio a través de la guía divina, o encontrar inspiración en una historia de fe en nuestra sección de narración." 
                      : "What's on your mind this morning? You're welcome to consult our Analysts, seek wise counsel through divine guidance, or find inspiration in a story of faith from our storytelling section."}
                  </p>
                </div>

              </>
            )}

            {/* Chat Messages */}
            {messages.length > 0 && (
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    } animate-fade-in`}
                  >
                    <Card
                      className={`max-w-[80%] p-4 border-0 shadow-xl rounded-3xl ${
                        message.role === "user"
                          ? "bg-white/95 text-gray-800"
                          : "bg-white/90 text-gray-800"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-white/20 bg-white/10 backdrop-blur-sm">
          <div className="container mx-auto max-w-4xl px-4 py-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSend()}
                placeholder={language === 'es' ? "Escribe tu pregunta..." : "Ask Your Question"}
                className="flex-1 bg-white/95 shadow-lg rounded-3xl border-0 text-gray-800 placeholder:text-gray-500"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-primary text-primary-foreground flex-shrink-0 rounded-full w-12 h-12 p-0 overflow-hidden"
              >
                <img src={logoImage} alt="Send" className="w-full h-full object-cover" />
              </Button>
            </div>
            {remaining !== null && remaining <= 2 && remaining > 0 && (
              <p className="text-xs text-center mt-2 text-white/80">
                {remaining} {t('messages_remaining')}. <button onClick={() => navigate('/premium')} className="text-white hover:underline font-semibold">{t('upgrade')}</button>
              </p>
            )}
            {remaining === 0 && (
              <p className="text-xs text-center mt-2 text-white">
                {t('daily_limit_reached')}. <button onClick={() => navigate('/premium')} className="text-white hover:underline font-semibold">{t('upgrade')}</button>
              </p>
            )}
            <p className="text-xs text-white/70 text-center mt-2">
              {t('guidance_disclaimer')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

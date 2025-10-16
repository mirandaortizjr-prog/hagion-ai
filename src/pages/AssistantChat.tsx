import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Send, Mic, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useMessageLimit } from "@/hooks/useMessageLimit";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const AssistantChat = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const { remaining, refetch: refetchUsage } = useMessageLimit();
  const { assistantId } = useParams();
  
  const [conversationId] = useState(() => `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: t('assistant_intro'),
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Save conversation to history
  useEffect(() => {
    if (messages.length > 1) {
      const stored = localStorage.getItem("chat_history");
      let history = [];
      try {
        history = stored ? JSON.parse(stored) : [];
      } catch (error) {
        console.error("Failed to parse history:", error);
      }

      const existingIndex = history.findIndex((c: any) => c.id === conversationId);
      const userMessages = messages.filter(m => m.role === "user");
      const preview = userMessages.length > 0 ? userMessages[0].content : "New conversation";

      const conversationData = {
        id: conversationId,
        voice: assistantId || "apologetics",
        context: "assistant",
        timestamp: Date.now(),
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        preview: preview.substring(0, 100),
      };

      if (existingIndex >= 0) {
        history[existingIndex] = conversationData;
      } else {
        history.push(conversationData);
      }

      localStorage.setItem("chat_history", JSON.stringify(history));
    }
  }, [messages, conversationId, assistantId]);

  const assistantInfo: Record<string, { name: string; subtitle: string }> = {
    apologetics: { name: "Miranda-Ortiz", subtitle: t('biblical_apologetics') },
    science: { name: "Sophia", subtitle: t('science_evidence') },
    medical: { name: "Asher", subtitle: t('medical_evidence') },
    forensic: { name: "Kenan", subtitle: t('forensic_evidence') },
    philosophical: { name: "Thaddeus", subtitle: t('philosophical_evidence') },
    psychology: { name: "Caleb", subtitle: t('psychological_evidence') },
    historical: { name: "Brooke", subtitle: t('historical_evidence') },
    artistic: { name: "J.R. Miranda", subtitle: t('artistic_evidence') },
    linguistic: { name: "Elias", subtitle: t('linguistic_evidence') },
    cultural: { name: "Naomi", subtitle: t('cultural_evidence') },
    storytelling: { name: "Story teller", subtitle: t('biblical_storytelling') },
  };

  const info = assistantInfo[assistantId || "apologetics"] || { name: "Assistant", subtitle: "AI Assistant" };
  
  // Redirect if invalid assistant ID
  useEffect(() => {
    if (assistantId && !assistantInfo[assistantId]) {
      navigate("/main-menu");
    }
  }, [assistantId, navigate]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

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
          voice: assistantId,
          context: "",
          language,
        }),
      });

      if (response.status === 429) {
        const errorData = await response.json();
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
        return;
      }

      if (response.status === 402) {
        toast({
          title: t('credits_required'),
          description: t('credits_required_desc'),
          variant: "destructive",
        });
        setMessages((prev) => prev.slice(0, -1));
        return;
      }

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

      if (!response.ok || !response.body) {
        throw new Error("Failed to get response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      let textBuffer = "";

      // Add initial assistant message
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
      
      // Refetch usage after successful message
      refetchUsage();
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: t('connection_issue_retry'),
        },
      ]);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/main-menu")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-secondary">{info.name}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              {info.subtitle}
              {remaining !== null && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  <Sparkles className="w-3 h-3" />
                  {remaining} {t('messages_remaining')}
                </span>
              )}
            </p>
          </div>
        </div>
      </header>

      <ScrollArea ref={scrollRef} className="flex-1 px-4">
        <div className="container mx-auto max-w-6xl py-6 space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              } animate-fade-in`}
            >
              <Card
                className={`max-w-[95%] p-4 ${
                  message.role === "user"
                    ? "bg-primary text-white"
                    : "bg-card"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </Card>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="flex-shrink-0">
              <Mic className="w-5 h-5" />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder={t('type_message')}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim()}
              className="bg-primary text-white flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          {remaining !== null && remaining <= 2 && remaining > 0 && (
            <p className="text-xs text-center mt-2 text-muted-foreground">
              {remaining} {t('messages_remaining')}. <button onClick={() => navigate('/premium')} className="text-primary hover:underline">{t('upgrade')}</button> {t('upgrade_unlimited')}
            </p>
          )}
          {remaining === 0 && (
            <p className="text-xs text-center mt-2 text-destructive">
              {t('daily_limit_reached')}. <button onClick={() => navigate('/premium')} className="text-primary hover:underline">{t('upgrade')}</button> {t('upgrade_unlimited')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssistantChat;

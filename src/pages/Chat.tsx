import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Send, Bookmark, Sparkles, Copy, Share2, Check, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useMessageLimit } from "@/hooks/useMessageLimit";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
  scripture?: string;
}

const Chat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const { remaining, refetch: refetchUsage } = useMessageLimit();
  const [searchParams] = useSearchParams();
  const locationState = location.state as { context?: string; question?: string } | null;
  const voice = searchParams.get("voice") || locationState?.context || "elohim";
  const context = searchParams.get("context") || "throne";
  const historyId = searchParams.get("history");
  // Discernment params (from Discern page)
  const discern = searchParams.get("discern");
  const subject = searchParams.get("subject");
  const categoryName = searchParams.get("categoryName") || "";
  const discernContext = searchParams.get("discernContext") || "";
  const churchName = searchParams.get("church") || "";
  const [remainingMessages, setRemainingMessages] = useState<number | null>(null);
  
  const [conversationId] = useState(() => historyId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [sharingIndex, setSharingIndex] = useState<number | null>(null);
  
  const [messages, setMessages] = useState<Message[]>(() => {
    // Load from history if resuming a conversation
    if (historyId) {
      const stored = localStorage.getItem("chat_history");
      if (stored) {
        try {
          const history = JSON.parse(stored);
          const conversation = history.find((c: any) => c.id === historyId);
          if (conversation) {
            return conversation.messages;
          }
        } catch (error) {
          console.error("Failed to load conversation:", error);
        }
      }
    }
    
    // Check if coming from Prompts button with friendly context
    if (locationState?.context === 'friend' && locationState?.question) {
      return [
        {
          role: "assistant",
          content: locationState.question,
        },
      ];
    }

    // Discernment flow: show welcome message for category
    if (discern) {
      const categoryLabels: Record<string, string> = {
        "churches": "Churches",
        "belief-systems": "Belief Systems & Religions",
        "texts": "Religious Texts & Books",
      };

      const label = categoryLabels[discern] || discern;
      let intro = `Welcome to the ${label} Discernment Circle.\n\nI am your theological evaluation specialist. I will help you assess ${discern === "churches" ? "churches" : discern === "belief-systems" ? "belief systems, denominations, or religions" : "sacred or spiritual texts"} using biblical criteria.`;
      
      if (churchName) {
        intro += `\n\nI see you'd like to evaluate "${churchName}". Please share any additional context you have, and I'll provide a thorough biblical analysis of this church.`;
      } else {
        intro += `\n\nWhat would you like to evaluate? Please share the name and any context you have.`;
      }

      return [
        {
          role: "assistant",
          content: intro,
        },
      ];
    }
    
    return [
      {
        role: "assistant",
        content: t('assistant_intro'),
        scripture: "Psalm 46:1",
      },
    ];
  });
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Save conversation to history whenever messages change
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
        voice,
        context,
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
  }, [messages, conversationId, voice, context]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
    forensic: "Kenan",
    philosophical: "Thaddeus",
    psychology: "Caleb",
    historical: "Brooke",
    friend: language === 'es' ? 'Chat de Amigo' : 'Friend Chat',
  };
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      // Ensure user is authenticated and use their JWT for the function
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
          voice,
          context,
          language,
          discern,
          churchName,
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
        setMessages((prev) => prev.slice(0, -1)); // Remove the empty assistant message
        refetchUsage();
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

  const handleCopyMessage = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast({
        title: t('copied'),
        description: t('message_copied_clipboard'),
      });
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      toast({
        title: t('error'),
        description: t('failed_copy_message'),
        variant: "destructive",
      });
    }
  };

  const handleShareMessage = async (text: string, index: number) => {
    setSharingIndex(index);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: t('login_required'),
          description: t('login_share_messages'),
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const contextInfo = discern 
        ? `${t('theological_evaluation')}: ${discern}`
        : voiceNames[voice as keyof typeof voiceNames] || voice;

      const { data, error } = await supabase
        .from("shared_content")
        .insert({
          user_id: user.id,
          content: text,
          context: contextInfo,
        })
        .select()
        .single();

      if (error) throw error;

      const shareUrl = `${window.location.origin}/shared?token=${data.share_token}`;
      
      await navigator.clipboard.writeText(shareUrl);

      toast({
        title: t('share_link_created'),
        description: t('share_link_copied'),
      });
    } catch (error: any) {
      console.error("Error sharing message:", error);
      toast({
        title: t('error'),
        description: t('failed_create_share_link'),
        variant: "destructive",
      });
    } finally {
      setSharingIndex(null);
    }
  };

  const handleSaveAnswer = (content: string, index: number) => {
    const questionMessage = messages[index - 1];
    const question = questionMessage?.role === "user" ? questionMessage.content : "";
    
    const savedAnswer = {
      id: `saved_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      question,
      voice,
      timestamp: Date.now(),
    };

    const stored = localStorage.getItem("saved_answers");
    let savedAnswers = [];
    try {
      savedAnswers = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to parse saved answers:", error);
    }

    savedAnswers.push(savedAnswer);
    localStorage.setItem("saved_answers", JSON.stringify(savedAnswers));

    toast({
      title: t('saved_toast'),
      description: t('answer_saved_collection'),
    });
  };

  const headerTitle = discern ? t('discernment') : voiceNames[voice];
  const headerSubtitle = discern
    ? (discern === "churches" ? t('churches_evaluation')
      : discern === "belief-systems" ? t('belief_systems_evaluation')
      : discern === "texts" ? t('religious_texts_evaluation')
      : t('theological_evaluation'))
    : context.replace("-", " ");

  return (
    <div className="h-screen flex flex-col bg-background text-white">
      {/* iMessage-style header */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/80 backdrop-blur-2xl">
        <div className="px-3 py-3 flex items-center gap-2 max-w-3xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full text-primary hover:bg-white/5 -ml-1"
          >
            <ArrowLeft className="w-[22px] h-[22px]" strokeWidth={2.2} />
          </Button>
          <div className="flex-1 flex flex-col items-center -ml-8 pointer-events-none">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-primary/5 ring-1 ring-white/15 flex items-center justify-center mb-0.5">
              <Sparkles className="w-4 h-4 text-primary/90" strokeWidth={1.8} />
            </div>
            <h1 className="font-playfair text-[15px] leading-tight tracking-tight">
              {headerTitle}
            </h1>
            <p className="text-[10.5px] text-white/45 capitalize tracking-wide">
              {headerSubtitle}
            </p>
          </div>
          <div className="w-9" />
        </div>
      </header>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1">
        <div className="px-3 sm:px-4 py-5 max-w-3xl mx-auto space-y-2.5">
          {messages.map((message, index) => {
            const isUser = message.role === "user";
            const prev = messages[index - 1];
            const grouped = prev && prev.role === message.role;
            return (
              <div
                key={index}
                className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}
                style={{ marginTop: grouped ? 2 : 10 }}
              >
                <div className={`max-w-[78%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                  <div
                    className={`relative px-3.5 py-2 text-[15px] leading-[1.35] font-light tracking-[-0.01em] ${
                      isUser
                        ? "text-white rounded-[20px] rounded-br-[6px] shadow-[0_1px_2px_rgba(0,0,0,0.25)]"
                        : "text-white/95 rounded-[20px] rounded-bl-[6px] bg-white/[0.07] border border-white/10 backdrop-blur-xl"
                    }`}
                    style={isUser ? {
                      background: "linear-gradient(180deg, hsl(var(--primary) / 0.95), hsl(var(--primary) / 0.78))",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), 0 6px 18px -8px hsl(var(--primary) / 0.6)",
                    } : undefined}
                  >
                    <p className="whitespace-pre-wrap font-sans">{message.content}</p>
                    {message.scripture && (
                      <p className="text-[11px] mt-1.5 opacity-70 italic font-playfair">
                        — {message.scripture}
                      </p>
                    )}
                  </div>
                  {!isUser && message.content && (
                    <div className="flex gap-1 mt-1 ml-1 opacity-60 hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleCopyMessage(message.content, index)}
                        className="text-[11px] px-2 py-1 rounded-full hover:bg-white/10 flex items-center gap-1 text-white/70"
                      >
                        {copiedIndex === index ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedIndex === index ? t('copied') : t('copy')}
                      </button>
                      <button
                        onClick={() => handleShareMessage(message.content, index)}
                        disabled={sharingIndex === index}
                        className="text-[11px] px-2 py-1 rounded-full hover:bg-white/10 flex items-center gap-1 text-white/70"
                      >
                        {sharingIndex === index ? <Loader2 className="w-3 h-3 animate-spin" /> : <Share2 className="w-3 h-3" />}
                        {t('share')}
                      </button>
                      <button
                        onClick={() => handleSaveAnswer(message.content, index)}
                        className="text-[11px] px-2 py-1 rounded-full hover:bg-white/10 flex items-center gap-1 text-white/70"
                      >
                        <Bookmark className="w-3 h-3" />
                        {t('save')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* iMessage-style composer */}
      <div className="border-t border-white/10 bg-black/80 backdrop-blur-2xl pb-[env(safe-area-inset-bottom)]">
        <div className="px-3 py-2.5 max-w-3xl mx-auto">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <div
                className="absolute -inset-[1.5px] rounded-full pointer-events-none transition-opacity"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--primary) / 0.7), hsl(var(--primary) / 0.25), hsl(var(--primary) / 0.7))",
                  boxShadow: "0 0 18px hsl(var(--primary) / 0.45), 0 0 32px hsl(var(--primary) / 0.25)",
                }}
              />
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder={t('type_message')}
                className="relative rounded-full bg-black/70 border-transparent text-[15px] font-light tracking-[-0.01em] pl-4 pr-4 h-10 placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={!input.trim()}
              size="icon"
              className="rounded-full h-9 w-9 flex-shrink-0 disabled:opacity-30 transition-all"
              style={{
                background: "linear-gradient(180deg, hsl(var(--primary)), hsl(var(--primary) / 0.78))",
                boxShadow: "0 4px 14px -4px hsl(var(--primary) / 0.6)",
              }}
            >
              <Send className="w-4 h-4" strokeWidth={2.2} />
            </Button>
          </div>
          <p className="text-[10px] font-light tracking-wide text-white/35 text-center mt-1.5">
            {t('guidance_disclaimer')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;

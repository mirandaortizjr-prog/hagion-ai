import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Send, Mic, Bookmark, Sparkles } from "lucide-react";
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
  const [remainingMessages, setRemainingMessages] = useState<number | null>(null);
  
  const [conversationId] = useState(() => historyId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  
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

    // Discernment flow: seed with evaluation intro if coming from Discern page
    if (discern && subject) {
      const evaluationConfig: Record<string, { label: string; tests: string[] }> = {
        "churches": {
          label: "Churches",
          tests: [
            "Creedal and doctrinal alignment",
            "Salvation clarity (grace vs. works)",
            "Emotional atmosphere and fruit",
            "Witness and mission integrity",
            "Leadership humility and restoration culture",
          ],
        },
        "belief-systems": {
          label: "Belief Systems & Religions",
          tests: [
            "Christology (Who is Jesus?)",
            "Trinitarian theology",
            "Path to salvation",
            "Scriptural authority and additions",
            "Cultural fruit and emotional impact",
          ],
        },
        "texts": {
          label: "Religious Texts & Books",
          tests: [
            "Alignment with Scripture",
            "Christ-centeredness",
            "Doctrinal clarity or distortion",
            "Emotional and spiritual impact",
            "Historical and canonical context",
          ],
        },
      };

      const cfg = evaluationConfig[discern as keyof typeof evaluationConfig];
      const label = categoryName || cfg?.label || discern;
      const bullets = (cfg?.tests || []).map(t => `• ${t}`).join("\n");
      const intro = `Starting Discernment: ${label} → ${subject}\n\nEvaluation criteria:\n${bullets}${discernContext ? `\n\nAdditional context: ${discernContext}` : ""}\n\nWhen you're ready, say "Begin" or ask a specific question to start the evaluation.`;

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
        content: "Peace be with you, beloved child. I am here to guide you with wisdom from Scripture. What weighs upon your heart today?",
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
    elohim: "Elohim",
    christ: "Christ",
    "holy-spirit": "Holy Spirit",
    trinity: "Trinity",
    "biblical-stories": "Biblical Stories",
    martyrs: "Martyrs for the Faith",
    apologetics: "Miranda-Ortiz",
    science: "Sophia",
    medical: "Asher",
    forensic: "Kenan",
    philosophical: "Thaddeus",
    psychology: "Caleb",
    historical: "Brooke",
    friend: "Friend Chat",
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
          title: "Login required",
          description: "Please log in to continue.",
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
        }),
      });

      if (response.status === 401) {
        toast({
          title: "Login required",
          description: "Please log in to continue.",
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
          content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        },
      ]);
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
      title: "Saved",
      description: "Answer saved to your collection",
    });
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/main-menu")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-secondary">
              {voiceNames[voice]}
            </h1>
            <p className="text-sm text-muted-foreground capitalize flex items-center gap-2">
              {context.replace("-", " ")}
              {remaining !== null && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  <Sparkles className="w-3 h-3" />
                  {remaining} free {remaining === 1 ? 'message' : 'messages'} left today
                </span>
              )}
            </p>
            {discern && subject && (
              <p className="text-xs text-muted-foreground mt-1">
                Discernment: {(categoryName || discern).toString()} — {subject}
              </p>
            )}
          </div>
        </div>
      </header>

      <ScrollArea ref={scrollRef} className="flex-1 px-4">
        <div className="container mx-auto max-w-4xl py-6 space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              } animate-fade-in`}
            >
              <Card
                className={`max-w-[80%] p-4 ${
                  message.role === "user"
                    ? "bg-primary text-white"
                    : "bg-card"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.scripture && (
                  <p className="text-xs mt-2 opacity-70 italic">
                    — {message.scripture}
                  </p>
                )}
                {message.role === "assistant" && message.content && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 gap-2"
                    onClick={() => handleSaveAnswer(message.content, index)}
                  >
                    <Bookmark className="w-4 h-4" />
                    Save
                  </Button>
                )}
              </Card>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-4xl px-4 py-4">
          {remainingMessages !== null && (
            <div className="text-xs text-center text-muted-foreground mb-2">
              {remainingMessages > 0 ? (
                `${remainingMessages} ${t('messages_remaining')}`
              ) : (
                <span className="text-destructive">{t('daily_limit_reached')}. <button onClick={() => navigate('/premium')} className="underline">{t('upgrade_premium')}</button></span>
              )}
            </div>
          )}
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
          <p className="text-xs text-muted-foreground text-center mt-2">
            {t('guidance_disclaimer')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;

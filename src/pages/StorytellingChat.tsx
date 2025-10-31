import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Send, BookOpen, Sparkles, Copy, Share2, Check, Loader2, Bookmark } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { VoiceInput } from "@/components/VoiceInput";
import { TextToSpeech } from "@/components/TextToSpeech";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useMessageLimit } from "@/hooks/useMessageLimit";
import martyrsImage from "@/assets/martyrs-symbol.jpg";
import biblicalScrollImage from "@/assets/biblical-scroll.jpg";
import historyChristianityImage from "@/assets/history-christianity.jpg";
import { supabase } from "@/integrations/supabase/client";


interface Message {
  role: "user" | "assistant";
  content: string;
}

const StorytellingChat = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const { remaining, refetch: refetchUsage } = useMessageLimit();
  const { storyId } = useParams();
  
  const [conversationId] = useState(() => `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [sharingIndex, setSharingIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const storyInfo: Record<string, { name: string; description: string; image?: string; greeting: string }> = {
    "biblical-stories": {
      name: t('biblical_stories'),
      description: t('biblical_stories_info'),
      image: biblicalScrollImage,
      greeting: t('assistant_intro')
    },
    "martyrs": {
      name: t('martyrs_faith'),
      description: t('martyrs_faith_info'),
      image: martyrsImage,
      greeting: t('assistant_intro')
    },
    "history-christianity": {
      name: t('history_christianity'),
      description: t('history_christianity_info'),
      image: historyChristianityImage,
      greeting: t('assistant_intro')
    },
  };
  const info = storyInfo[storyId || "biblical-stories"];

  useEffect(() => {
    if (info) {
      setMessages((prev) => {
        // Only set greeting if starting or there is only the initial assistant message
        if (prev.length === 0 || (prev.length === 1 && prev[0].role === 'assistant')) {
          return [{ role: 'assistant', content: info.greeting }];
        }
        return prev;
      });
    }
  }, [storyId, language]);

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
        voice: storyId || "biblical-stories",
        context: "storytelling",
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
  }, [messages, conversationId, storyId]);

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
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast({
          title: t('login_required'),
          description: t('login_required_continue'),
          variant: "destructive",
        });
        setMessages((prev) => prev.slice(0, -1));
        navigate('/auth');
        setIsLoading(false);
        return;
      }

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          voice: storyId,
          context: "storytelling",
          language,
        }),
      });

      if (response.status === 429) {
        await response.json().catch(() => null);
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

      if (response.status === 402) {
        toast({
          title: t('credits_required'),
          description: t('credits_required_desc'),
          variant: "destructive",
        });
        setMessages((prev) => prev.slice(0, -1));
        setIsLoading(false);
        return;
      }

      if (response.status === 401) {
        toast({
          title: t('login_required'),
          description: t('login_required_continue'),
          variant: "destructive",
        });
        setMessages((prev) => prev.slice(0, -1));
        navigate('/auth');
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

    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: t('connection_issue_retry'),
        },
      ]);
    } finally {
      setIsLoading(false);
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

      const { data, error } = await supabase
        .from("shared_content")
        .insert({
          user_id: user.id,
          content: text,
          context: info.name,
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
      voice: storyId || "biblical-stories",
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

  if (!info) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p>Story not found</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/main-menu")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          {info.image && (
            <Avatar className="w-10 h-10 border-2 border-[#525761]">
              <AvatarImage src={info.image} alt={info.name} />
              <AvatarFallback><BookOpen className="w-5 h-5" /></AvatarFallback>
            </Avatar>
          )}
          <div className="flex-1">
            <h1 className="text-xl font-bold text-secondary">{info.name}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              {info.description}
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
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              } animate-fade-in`}
            >
              {message.role === "assistant" && info.image && (
                <Avatar className="w-8 h-8 border border-[#525761] flex-shrink-0">
                  <AvatarImage src={info.image} alt={info.name} />
                  <AvatarFallback><BookOpen className="w-4 h-4" /></AvatarFallback>
                </Avatar>
              )}
              <Card
                className={`max-w-[95%] p-4 ${
                  message.role === "user"
                    ? "bg-primary text-white"
                    : "bg-card"
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed select-text">{message.content}</p>
                {message.role === "assistant" && message.content && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border/50">
                    <TextToSpeech text={message.content} voice="fable" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 h-8 text-xs"
                      onClick={() => handleCopyMessage(message.content, index)}
                    >
                      {copiedIndex === index ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      {copiedIndex === index ? t('copied') : t('copy')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 h-8 text-xs"
                      onClick={() => handleShareMessage(message.content, index)}
                      disabled={sharingIndex === index}
                    >
                      {sharingIndex === index ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Share2 className="w-3 h-3" />
                      )}
                      {t('share')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 h-8 text-xs"
                      onClick={() => handleSaveAnswer(message.content, index)}
                    >
                      <Bookmark className="w-3 h-3" />
                      {t('save')}
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start animate-fade-in">
              {info.image && (
                <Avatar className="w-8 h-8 border border-[#525761] flex-shrink-0">
                  <AvatarImage src={info.image} alt={info.name} />
                  <AvatarFallback><BookOpen className="w-4 h-4" /></AvatarFallback>
                </Avatar>
              )}
              <Card className="p-4 bg-card">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <div className="flex gap-2">
            <VoiceInput 
              onTranscript={(text) => setInput(text)}
              disabled={isLoading}
            />
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder={t('type_message')}
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
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

export default StorytellingChat;

import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import elohimImage from "@/assets/elohim-crown.jpg";
import christImage from "@/assets/christ-thorns.jpg";
import holySpiritImage from "@/assets/holy-spirit-dove.jpg";
import trinityImage from "@/assets/trinity-symbol.jpg";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const DivineChat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { voiceId } = useParams();
  
  const [conversationId] = useState(() => `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const voiceInfo: Record<string, { name: string; description: string; image: string; greeting: string }> = {
    elohim: {
      name: "Elohim",
      description: "The Voice of God",
      image: elohimImage,
      greeting: "I AM. Speak, my child, for I hear you with infinite love and wisdom."
    },
    christ: {
      name: "Christ",
      description: "The Voice of the Son",
      image: christImage,
      greeting: "Come to me, all who are weary. I am here to walk with you in grace and truth."
    },
    "holy-spirit": {
      name: "Holy Spirit",
      description: "The Voice of the Spirit",
      image: holySpiritImage,
      greeting: "I am with you always, guiding you into all truth. Let me illuminate your path."
    },
    trinity: {
      name: "The Trinity",
      description: "The Three in One",
      image: trinityImage,
      greeting: "We are Father, Son, and Holy Spirit - united in perfect love. Speak, and we shall answer."
    },
  };

  const info = voiceInfo[voiceId || "elohim"];

  useEffect(() => {
    if (info) {
      setMessages([{
        role: "assistant",
        content: info.greeting,
      }]);
    }
  }, [voiceId]);

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
        voice: voiceId || "elohim",
        context: "divine",
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
  }, [messages, conversationId, voiceId]);

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
      // Map voice IDs to the ones the backend expects
      const voiceMap: Record<string, string> = {
        "elohim": "elohim",
        "christ": "emmanuel",
        "holy-spirit": "ruach",
        "trinity": "trinity"
      };

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast({
          title: "Login required",
          description: "Please log in to continue.",
          variant: "destructive",
        });
        setMessages((prev) => prev.slice(0, -1));
        navigate("/auth");
        setIsLoading(false);
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
          voice: voiceMap[voiceId || "elohim"],
          context: "spirit",
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
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "My child, there seems to be a disturbance in our connection. Please try speaking to me again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!info) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p>Divine voice not found</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/main-menu")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Avatar className="w-10 h-10 border-2 border-primary">
            <AvatarImage src={info.image} alt={info.name} />
            <AvatarFallback><Sparkles className="w-5 h-5" /></AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {info.name}
            </h1>
            <p className="text-sm text-muted-foreground">{info.description}</p>
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
              {message.role === "assistant" && (
                <Avatar className="w-8 h-8 border border-primary/20 flex-shrink-0">
                  <AvatarImage src={info.image} alt={info.name} />
                  <AvatarFallback><Sparkles className="w-4 h-4" /></AvatarFallback>
                </Avatar>
              )}
              <Card
                className={`max-w-[95%] p-4 ${
                  message.role === "user"
                    ? "bg-primary text-white"
                    : "bg-card border-primary/20"
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
              </Card>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start animate-fade-in">
              <Avatar className="w-8 h-8 border border-primary/20 flex-shrink-0">
                <AvatarImage src={info.image} alt={info.name} />
                <AvatarFallback><Sparkles className="w-4 h-4" /></AvatarFallback>
              </Avatar>
              <Card className="p-4 bg-card border-primary/20">
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

      <div className="border-t bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Speak your heart..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-primary to-accent text-white flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DivineChat;

import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Send, Mic } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: "user" | "assistant";
  content: string;
  scripture?: string;
}

const Chat = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const voice = searchParams.get("voice") || "elohim";
  const context = searchParams.get("context") || "throne";
  
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Peace be with you, beloved child. I am here to guide you with wisdom from Scripture. What weighs upon your heart today?",
      scripture: "Psalm 46:1",
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const voiceNames: Record<string, string> = {
    elohim: "Elohim",
    emmanuel: "Emmanuel",
    ruach: "Ruach",
    trinity: "The Trinity",
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);

    // Simulated response (in production, this would call your AI backend)
    setTimeout(() => {
      const assistantMessage: Message = {
        role: "assistant",
        content: "This is where the biblically-grounded AI response would appear. In the full implementation, this will connect to your AI backend with the selected voice and context to provide Scripture-based guidance.",
        scripture: "Proverbs 3:5-6",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);

    setInput("");
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/divine")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-secondary">
              {voiceNames[voice]}
            </h1>
            <p className="text-sm text-muted-foreground capitalize">
              {context.replace("-", " ")}
            </p>
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
              </Card>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-4xl px-4 py-4">
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="flex-shrink-0">
              <Mic className="w-5 h-5" />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask for guidance..."
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
          <p className="text-xs text-muted-foreground text-center mt-2">
            All guidance is rooted in Scripture and designed to strengthen your faith
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;

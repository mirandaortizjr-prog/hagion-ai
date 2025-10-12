import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

const LogosLearning = () => {
  const navigate = useNavigate();
  const { type, id } = useParams<{ type: string; id: string }>();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);

  const trackTitles: Record<string, string> = {
    foundations: "Foundations of Logos",
    fallacies: "Fallacies & Shadows",
    apologetics: "Apologetics Logic",
    witnessing: "Witnessing with Wisdom",
    scripture: "Logic in Scripture",
    emotional: "Emotional Logic",
  };

  const pathTitles: Record<string, string> = {
    "apologetics-path": "Apologetics Path",
    "witnessing-path": "Witnessing Path",
    "logic-path": "Logic Path",
    "scriptural-path": "Scriptural Path",
    "ceremonial-path": "Ceremonial Path",
  };

  const title = type === "track" ? trackTitles[id || ""] : pathTitles[id || ""];

  const handleSend = () => {
    if (message.trim()) {
      setMessages([...messages, { role: "user", content: message }]);
      setMessage("");
      
      // Simulate AI response
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `This is a placeholder response for ${title}. The full learning experience will be implemented with AI-guided lessons, exercises, and feedback.`,
          },
        ]);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-4 px-4 py-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => navigate("/logos-circle")}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">
            {type === "track" ? "Curriculum Track" : "Teaching Path"}
          </p>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && (
            <Card className="bg-violet-500/5 border-violet-500/20">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Welcome to {title}! Ask questions or request lessons to begin your learning journey.
                </p>
              </CardContent>
            </Card>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-violet-500 text-white"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="px-4 py-4 border-t bg-background">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-3">
            <input
              type="text"
              placeholder="Ask a question or request a lesson..."
              className="flex-1 bg-transparent outline-none text-sm"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSend();
                }
              }}
            />
            <Button
              size="icon"
              className="rounded-full h-8 w-8 bg-violet-500 hover:bg-violet-600"
              onClick={handleSend}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogosLearning;

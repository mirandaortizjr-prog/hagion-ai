import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send, Swords, RefreshCw, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Persona {
  id: string;
  name: string;
  title: string;
  tone: string;
  challenge: string;
  color: string;
}

const personas: Persona[] = [
  {
    id: "atheist",
    name: "The Void",
    title: "Atheist",
    tone: "Rational, blunt",
    challenge: "Absence of sacred meaning",
    color: "text-gray-400"
  },
  {
    id: "agnostic",
    name: "The Fog",
    title: "Agnostic",
    tone: "Curious, hesitant",
    challenge: "Fear of unknowable truth",
    color: "text-slate-400"
  },
  {
    id: "secular-humanist",
    name: "The Flame",
    title: "Secular Humanist",
    tone: "Ethical, confident",
    challenge: "Morality without divinity",
    color: "text-orange-400"
  },
  {
    id: "skeptic",
    name: "The Mirror",
    title: "Skeptic",
    tone: "Analytical, probing",
    challenge: "Doubt as virtue",
    color: "text-blue-400"
  },
  {
    id: "pantheist",
    name: "The River",
    title: "Pantheist",
    tone: "Mystical, poetic",
    challenge: "Divinity in all things",
    color: "text-emerald-400"
  },
  {
    id: "alternative-spiritual",
    name: "The Oracle",
    title: "Alternative Spiritual",
    tone: "Esoteric, symbolic",
    challenge: "Truth through intuition",
    color: "text-purple-400"
  }
];

const ApologeticsDebate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPersona, setCurrentPersona] = useState<Persona | null>(null);
  const [debateStarted, setDebateStarted] = useState(false);
  const [round, setRound] = useState<'opening' | 'rebuttal' | 'cross-examination' | 'closing'>('opening');
  const [suggestedResponses, setSuggestedResponses] = useState<Record<number, string>>({});
  const [loadingSuggestion, setLoadingSuggestion] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const selectPersona = (persona: Persona) => {
    setCurrentPersona(persona);
    setDebateStarted(true);
    setRound('opening');
    
    const invocationMessage: Message = {
      role: 'assistant',
      content: `⚔️ **Circle of Apologetics: Trial by Truth**\n\nYou have summoned **${persona.name}** to the arena.\n\n**Stance:** ${persona.title}\n**Tone:** ${persona.tone}\n**Challenge:** ${persona.challenge}\n\nPrepare yourself. The trial begins now.\n\n*Round 1: Opening Statement*\nState your position clearly. What truth do you defend?`
    };
    
    setMessages([invocationMessage]);
  };

  const selectRandomPersona = () => {
    const randomIndex = Math.floor(Math.random() * personas.length);
    const selected = personas[randomIndex];
    selectPersona(selected);
  };

  const handleSend = async () => {
    if (!input.trim() || !currentPersona) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
      
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          voice: "debate",
          debatePersona: currentPersona.id,
          debateRound: round,
        }),
      });

      if (response.status === 429) {
        toast({
          title: "Rate limit exceeded",
          description: "Please try again in a moment.",
          variant: "destructive",
        });
        return;
      }

      if (response.status === 402) {
        toast({
          title: "Credits required",
          description: "Please add credits to continue.",
          variant: "destructive",
        });
        return;
      }

      if (!response.ok || !response.body) {
        throw new Error("Failed to get response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                assistantMessage += content;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = {
                    role: "assistant",
                    content: assistantMessage,
                  };
                  return newMessages;
                });
              }
            } catch (e) {
              // Invalid JSON, skip
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const advanceRound = () => {
    const rounds: Array<'opening' | 'rebuttal' | 'cross-examination' | 'closing'> = ['opening', 'rebuttal', 'cross-examination', 'closing'];
    const currentIndex = rounds.indexOf(round);
    if (currentIndex < rounds.length - 1) {
      const nextRound = rounds[currentIndex + 1];
      setRound(nextRound);
      
      const roundNames = {
        'opening': 'Opening Statement',
        'rebuttal': 'Rebuttal',
        'cross-examination': 'Cross-Examination',
        'closing': 'Closing Statement'
      };
      
      toast({
        title: `Round ${currentIndex + 2}: ${roundNames[nextRound]}`,
        description: "The debate continues...",
      });
    } else {
      toast({
        title: "Debate Complete",
        description: "The trial has concluded. Reflect on what was learned.",
      });
    }
  };

  const resetDebate = () => {
    setDebateStarted(false);
    setCurrentPersona(null);
    setMessages([]);
    setRound('opening');
    setSuggestedResponses({});
    setLoadingSuggestion(null);
  };

  const getSuggestedResponse = async (messageIndex: number) => {
    if (!currentPersona) return;
    
    setLoadingSuggestion(messageIndex);

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
      
      // Get the conversation up to this point
      const conversationSoFar = messages.slice(0, messageIndex + 1);
      
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: conversationSoFar.map(m => ({ role: m.role, content: m.content })),
          voice: "apologetics-helper",
          debatePersona: currentPersona.id,
          debateRound: round,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to get suggested response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let suggestedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                suggestedContent += content;
                setSuggestedResponses(prev => ({
                  ...prev,
                  [messageIndex]: suggestedContent
                }));
              }
            } catch (e) {
              // Invalid JSON, skip
            }
          }
        }
      }
    } catch (error) {
      console.error("Error getting suggestion:", error);
      toast({
        title: "Error",
        description: "Failed to get suggested response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingSuggestion(null);
    }
  };

  const useSuggestedResponse = (messageIndex: number) => {
    const suggestion = suggestedResponses[messageIndex];
    if (suggestion) {
      setInput(suggestion);
    }
  };

  if (!debateStarted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="flex items-center gap-4 px-4 py-4 border-b">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Swords className="w-6 h-6 text-primary" />
              Apologetics Arena
            </h1>
            <p className="text-sm text-muted-foreground">Trial by Truth</p>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
          <div className="text-center space-y-4 max-w-lg">
            <h2 className="text-3xl font-bold">⚔️ Circle of Apologetics</h2>
            <p className="text-lg text-muted-foreground">
              Transform intellectual tension into spiritual clarity. Face a random challenger who will test your apologetics through respectful confrontation.
            </p>
            
            <div className="grid grid-cols-2 gap-3 mt-8">
              {personas.map((persona) => (
                <button
                  key={persona.id}
                  onClick={() => selectPersona(persona)}
                  className="p-4 rounded-lg border bg-card space-y-2 hover:border-primary hover:bg-accent transition-colors text-left"
                >
                  <h3 className={`font-bold ${persona.color}`}>{persona.name}</h3>
                  <p className="text-xs text-muted-foreground">{persona.title}</p>
                  <p className="text-xs italic">{persona.challenge}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              size="lg" 
              className="gap-2"
              onClick={selectRandomPersona}
            >
              <Swords className="w-5 h-5" />
              Random Opponent
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Or click any opponent above to challenge them directly
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center gap-4 px-4 py-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-bold flex items-center gap-2">
            <Swords className="w-5 h-5 text-primary" />
            Facing: {currentPersona?.name}
          </h1>
          <p className="text-xs text-muted-foreground">
            {currentPersona?.title} • Round: {round}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={advanceRound} disabled={round === 'closing'}>
          Next Round
        </Button>
        <Button variant="ghost" size="icon" onClick={resetDebate}>
          <RefreshCw className="w-5 h-5" />
        </Button>
      </header>

      <ScrollArea className="flex-1 px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((message, index) => (
            <div key={index} className="space-y-2">
              <div
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.role === "assistant" && (
                    <p className={`text-xs font-bold mb-1 ${currentPersona?.color}`}>
                      {currentPersona?.name}
                    </p>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
              
              {message.role === "assistant" && index > 0 && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] space-y-2">
                    {!suggestedResponses[index] && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => getSuggestedResponse(index)}
                        disabled={loadingSuggestion === index}
                      >
                        <Lightbulb className="w-4 h-4" />
                        {loadingSuggestion === index ? "Getting help..." : "Show Suggested Response"}
                      </Button>
                    )}
                    
                    {suggestedResponses[index] && (
                      <Card className="p-4 bg-accent/50 border-primary/20">
                        <div className="flex items-start gap-2 mb-2">
                          <Lightbulb className="w-4 h-4 text-primary mt-0.5" />
                          <p className="text-xs font-semibold text-primary">Suggested Apologetic Response</p>
                        </div>
                        <p className="text-sm whitespace-pre-wrap mb-3">{suggestedResponses[index]}</p>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => useSuggestedResponse(index)}
                        >
                          Use This Response
                        </Button>
                      </Card>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-muted/30">
        <div className="max-w-3xl mx-auto flex gap-2">
          <input
            type="text"
            placeholder="Present your argument..."
            className="flex-1 rounded-full px-4 py-3 bg-background border outline-none focus:ring-2 focus:ring-primary"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSend()}
            disabled={isLoading}
          />
          <Button
            size="icon"
            className="rounded-full"
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ApologeticsDebate;

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send, Swords, RefreshCw, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { FeatureLockCard } from "@/components/FeatureLockCard";
import { useTierAccess } from "@/hooks/useTierAccess";

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

const ApologeticsDebate = () => {
  const __lockAccess = useTierAccess();
  if (!__lockAccess.isLoading && !__lockAccess.canUse("debate_arena_premium")) {
    return (
      <FeatureLockCard
        requiredTier="premium"
      />
    );
  }

  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const personas: Persona[] = [
    {
      id: "atheist",
      name: t('persona_void'),
      title: t('persona_void_title'),
      tone: t('persona_void_tone'),
      challenge: t('persona_void_challenge'),
      color: "text-gray-400"
    },
    {
      id: "agnostic",
      name: t('persona_fog'),
      title: t('persona_fog_title'),
      tone: t('persona_fog_tone'),
      challenge: t('persona_fog_challenge'),
      color: "text-slate-400"
    },
    {
      id: "secular-humanist",
      name: t('persona_flame'),
      title: t('persona_flame_title'),
      tone: t('persona_flame_tone'),
      challenge: t('persona_flame_challenge'),
      color: "text-orange-400"
    },
    {
      id: "skeptic",
      name: t('persona_mirror'),
      title: t('persona_mirror_title'),
      tone: t('persona_mirror_tone'),
      challenge: t('persona_mirror_challenge'),
      color: "text-blue-400"
    },
    {
      id: "pantheist",
      name: t('persona_river'),
      title: t('persona_river_title'),
      tone: t('persona_river_tone'),
      challenge: t('persona_river_challenge'),
      color: "text-emerald-400"
    },
    {
      id: "alternative-spiritual",
      name: t('persona_oracle'),
      title: t('persona_oracle_title'),
      tone: t('persona_oracle_tone'),
      challenge: t('persona_oracle_challenge'),
      color: "text-purple-400"
    }
  ];
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPersona, setCurrentPersona] = useState<Persona | null>(null);
  const [debateStarted, setDebateStarted] = useState(false);
  const [round, setRound] = useState<number>(1);
  const [rebuttalsInRound, setRebuttalsInRound] = useState<number>(0);
  const [maxRebuttalsPerRound] = useState<number>(3);
  const [mirandaUsesLeft, setMirandaUsesLeft] = useState<number>(3);
  const [suggestedResponses, setSuggestedResponses] = useState<Record<number, string>>({});
  const [loadingSuggestion, setLoadingSuggestion] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const selectPersona = async (persona: Persona) => {
    setCurrentPersona(persona);
    setDebateStarted(true);
    setRound(1);
    setRebuttalsInRound(0);
    setMirandaUsesLeft(3);
    
    // Host introduction
    const hostMessage: Message = {
      role: 'assistant',
      content: `🎭 **${t('debate_host')}**\n\n${t('host_welcome')}\n\n${t('host_intro_opponent').replace('{name}', persona.name).replace('{title}', persona.title)}\n\n**${t('stance')}:** ${persona.title}\n**${t('tone')}:** ${persona.tone}\n**${t('challenge')}:** ${persona.challenge}\n\n${t('host_round_1')}`
    };
    
    setMessages([hostMessage]);
    
    // Opponent asks the first question
    setTimeout(() => {
      getOpponentOpeningQuestion(persona);
    }, 1000);
  };

  const getOpponentOpeningQuestion = async (persona: Persona) => {
    setIsLoading(true);
    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          messages: [{ 
            role: 'user', 
            content: `You are ${persona.name}, a ${persona.title}. Start the debate with your opening challenge or question. Be ${persona.tone} in your approach. Focus on: ${persona.challenge}. Ask a thought-provoking question or present a challenging argument that Round 1 difficulty - moderately challenging but not too complex.`
          }],
          voice: "debate",
          debatePersona: persona.id,
          debateRound: "opening",
        }),
      });

      if (!response.ok || !response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let opponentMessage = "";

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
                opponentMessage += content;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = {
                    role: "assistant",
                    content: opponentMessage,
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
      
      // Add host prompt for user to respond
      setTimeout(() => {
        const hostPrompt: Message = {
          role: 'assistant',
          content: `🎭 **${t('debate_host')}**\n\n${t('host_your_turn')}`
        };
        setMessages((prev) => [...prev, hostPrompt]);
      }, 500);
      
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
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
    setRebuttalsInRound(prev => prev + 1);

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast({
          title: t('login_required'),
          description: t('login_required_desc'),
          variant: "destructive",
        });
        setMessages((prev) => prev.slice(0, -1));
        navigate('/auth');
        setIsLoading(false);
        return;
      }

      const debateStage = round === 1 ? 'opening' : round === 2 ? 'rebuttal' : 'cross-examination';

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          voice: "debate",
          debatePersona: currentPersona.id,
          debateRound: debateStage,
        }),
      });

      if (response.status === 429) {
        toast({
          title: t('rate_limit_exceeded'),
          description: t('rate_limit_exceeded_desc'),
          variant: "destructive",
        });
        return;
      }

      if (response.status === 402) {
        toast({
          title: t('credits_required'),
          description: t('credits_required_desc'),
          variant: "destructive",
        });
        return;
      }

      if (response.status === 401) {
        toast({
          title: t('login_required'),
          description: t('login_required_continue'),
          variant: "destructive",
        });
        navigate('/auth');
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
        title: t('error'),
        description: t('failed_get_response'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const advanceRound = () => {
    if (round < 3) {
      const nextRound = round + 1;
      setRound(nextRound);
      setRebuttalsInRound(0);
      
      const roundDifficulty = {
        1: t('difficulty_moderate'),
        2: t('difficulty_challenging'),
        3: t('difficulty_expert')
      };
      
      toast({
        title: `${t('round')} ${nextRound}`,
        description: `${t('difficulty')}: ${roundDifficulty[nextRound as keyof typeof roundDifficulty]}`,
      });
      
      // Host announces new round
      const hostMessage: Message = {
        role: 'assistant',
        content: `🎭 **${t('debate_host')}**\n\n${t('host_round_advance').replace('{round}', nextRound.toString()).replace('{difficulty}', roundDifficulty[nextRound as keyof typeof roundDifficulty])}\n\n${t('host_continue')}`
      };
      setMessages((prev) => [...prev, hostMessage]);
    } else {
      toast({
        title: t('debate_complete'),
        description: t('debate_complete_desc'),
      });
    }
  };

  const resetDebate = () => {
    setDebateStarted(false);
    setCurrentPersona(null);
    setMessages([]);
    setRound(1);
    setRebuttalsInRound(0);
    setMirandaUsesLeft(3);
    setSuggestedResponses({});
    setLoadingSuggestion(null);
  };

  const getSuggestedResponse = async (messageIndex: number) => {
    if (!currentPersona || mirandaUsesLeft <= 0) return;
    
    setLoadingSuggestion(messageIndex);
    setMirandaUsesLeft(prev => prev - 1);

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
      
      // Get the conversation up to this point
      const conversationSoFar = messages.slice(0, messageIndex + 1);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast({
          title: t('login_required'),
          description: t('login_required_continue'),
          variant: "destructive",
        });
        return;
      }

      const debateStage = round === 1 ? 'opening' : round === 2 ? 'rebuttal' : 'cross-examination';
      
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          messages: conversationSoFar.map(m => ({ role: m.role, content: m.content })),
          voice: "apologetics-helper",
          debatePersona: currentPersona.id,
          debateRound: debateStage,
        }),
      });

      if (response.status === 401) {
        toast({
          title: t('login_required'),
          description: t('login_required_continue'),
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

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
        title: t('error'),
        description: t('failed_get_response'),
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
        <Button variant="ghost" size="icon" onClick={() => navigate('/main-menu')}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Swords className="w-6 h-6 text-primary" />
            {t('apologetics_arena')}
          </h1>
          <p className="text-sm text-muted-foreground">{t('trial_by_truth_subtitle')}</p>
        </div>
      </header>

        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
          <div className="text-center space-y-4 max-w-lg">
            <h2 className="text-3xl font-bold">{t('circle_of_apologetics')}</h2>
            <p className="text-lg text-muted-foreground">
              {t('arena_description')}
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
              {t('random_opponent')}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              {t('or_click_opponent')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center gap-4 px-4 py-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => navigate('/main-menu')}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-bold flex items-center gap-2">
            <Swords className="w-5 h-5 text-primary" />
            {t('facing')}: {currentPersona?.name}
          </h1>
          <p className="text-xs text-muted-foreground">
            {currentPersona?.title} • {t('round')} {round} • {rebuttalsInRound}/{maxRebuttalsPerRound} {t('rebuttals')}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-xs text-muted-foreground">{t('miranda_uses')}: {mirandaUsesLeft}</span>
          <Button variant="outline" size="sm" onClick={advanceRound} disabled={round === 3 || rebuttalsInRound < maxRebuttalsPerRound}>
            {t('next_round')}
          </Button>
          <Button variant="ghost" size="icon" onClick={resetDebate}>
            <RefreshCw className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <ScrollArea className="flex-1 px-4 py-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {messages.map((message, index) => (
            <div key={index} className="space-y-2">
              <div
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[95%] rounded-2xl px-4 py-3 ${
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
              
              {message.role === "assistant" && index > 0 && !message.content.includes(t('debate_host')) && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] space-y-2">
                    {!suggestedResponses[index] && mirandaUsesLeft > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => getSuggestedResponse(index)}
                        disabled={loadingSuggestion === index}
                      >
                        <Lightbulb className="w-4 h-4" />
                        {loadingSuggestion === index ? t('miranda_thinking') : t('miranda_will_answer')}
                      </Button>
                    )}
                    {mirandaUsesLeft === 0 && !suggestedResponses[index] && (
                      <p className="text-xs text-muted-foreground italic">{t('miranda_exhausted')}</p>
                    )}
                    
                    {suggestedResponses[index] && (
                      <Card className="p-4 bg-accent/50 border-primary/20">
                        <div className="flex items-start gap-2 mb-2">
                          <Lightbulb className="w-4 h-4 text-primary mt-0.5" />
                          <p className="text-xs font-semibold text-primary">📖 {t('miranda_ortiz_response')}</p>
                        </div>
                        <p className="text-sm whitespace-pre-wrap mb-3">{suggestedResponses[index]}</p>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => useSuggestedResponse(index)}
                        >
                          {t('use_this_response')}
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

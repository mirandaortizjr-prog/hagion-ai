import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Bookmark, BookmarkCheck, Loader2, Send, Share2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { PremiumNav } from "@/components/PremiumNav";
import biblicalScrollImage from "@/assets/biblical-scroll.jpg";
import martyrsImage from "@/assets/martyrs-symbol.jpg";
import historyImage from "@/assets/history-christianity.jpg";
import bibleImage from "@/assets/biblical-scroll.jpg";
import { toast as sonner } from "sonner";

interface Story {
  id: string;
  title: string;
  content: string;
  theme: string;
  moral_takeaway: string | null;
  subject: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SUBJECT_META: Record<
  string,
  { titleKey: string; image: string; chatVoice: string }
> = {
  "biblical-stories": {
    titleKey: "biblical_stories",
    image: biblicalScrollImage,
    chatVoice: "biblical-stories",
  },
  martyrs: {
    titleKey: "martyrs_faith",
    image: martyrsImage,
    chatVoice: "martyrs",
  },
  "history-christianity": {
    titleKey: "history_christianity",
    image: historyImage,
    chatVoice: "history-christianity",
  },
  "bible-translations": {
    titleKey: "bible_translations",
    image: bibleImage,
    chatVoice: "bible-translations",
  },
};

const SubjectDailyStory = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const meta = SUBJECT_META[subjectId || ""] || SUBJECT_META["biblical-stories"];
  const subjectTitle = t(meta.titleKey);

  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [savingBookmark, setSavingBookmark] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load today's story for this subject
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/auth");
          return;
        }

        // All views by this user for stories in this subject
        const { data: views } = await supabase
          .from("user_story_views")
          .select("story_id, viewed_at, daily_wisdom_stories!inner(subject)")
          .eq("user_id", user.id)
          .eq("daily_wisdom_stories.subject", subjectId)
          .order("viewed_at", { ascending: false });

        const latest = views?.[0];
        const within24h = latest
          ? Date.now() - new Date(latest.viewed_at as string).getTime() < 24 * 60 * 60 * 1000
          : false;

        let chosen: Story | null = null;

        if (within24h && latest?.story_id) {
          const { data } = await supabase
            .from("daily_wisdom_stories")
            .select("*")
            .eq("id", latest.story_id)
            .maybeSingle();
          chosen = (data as Story) || null;
        }

        if (!chosen) {
          const viewedIds = (views || []).map((v) => v.story_id);
          let q = supabase
            .from("daily_wisdom_stories")
            .select("*")
            .eq("subject", subjectId)
            .order("created_at", { ascending: true })
            .limit(1);
          if (viewedIds.length > 0) {
            q = q.not("id", "in", `(${viewedIds.join(",")})`);
          }
          const { data: next } = await q;
          if (next && next.length > 0) {
            chosen = next[0] as Story;
          } else {
            // Cycled through all — pick the oldest one again
            const { data: anyStory } = await supabase
              .from("daily_wisdom_stories")
              .select("*")
              .eq("subject", subjectId)
              .order("created_at", { ascending: true })
              .limit(1);
            chosen = (anyStory?.[0] as Story) || null;
          }

          if (chosen) {
            await supabase
              .from("user_story_views")
              .insert({ user_id: user.id, story_id: chosen.id });
          }
        }

        if (cancelled) return;
        setStory(chosen);

        if (chosen) {
          const { data: savedRow } = await supabase
            .from("saved_stories")
            .select("id")
            .eq("user_id", user.id)
            .eq("story_id", chosen.id)
            .maybeSingle();
          setIsSaved(!!savedRow);

          // Seed chat with the story so the AI has context
          setMessages([
            {
              role: "assistant",
              content:
                language === "es"
                  ? `Acabas de leer "${chosen.title}". Pregúntame lo que quieras sobre ${subjectTitle.toLowerCase()} y exploraremos más profundo en la Escritura.`
                  : `You just read "${chosen.title}". Ask me anything about ${subjectTitle.toLowerCase()} and we'll dig deeper into Scripture together.`,
            },
          ]);
        }
      } catch (err) {
        console.error("Error loading subject story:", err);
        sonner.error(t("failed_load_wisdom"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [subjectId, navigate, language, subjectTitle, t]);

  // Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSave = async () => {
    if (!story) return;
    setSavingBookmark(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      if (isSaved) {
        await supabase
          .from("saved_stories")
          .delete()
          .eq("user_id", user.id)
          .eq("story_id", story.id);
        setIsSaved(false);
        sonner.success(t("story_removed_saved"));
      } else {
        await supabase
          .from("saved_stories")
          .insert({ user_id: user.id, story_id: story.id });
        setIsSaved(true);
        sonner.success(t("story_saved_reflection"));
      }
    } finally {
      setSavingBookmark(false);
    }
  };

  const handleShare = async () => {
    if (!story) return;
    const shareText = `${subjectTitle}: ${story.title}\n\n${story.content}\n\n— Hagion University`;
    if (navigator.share) {
      try {
        await navigator.share({ title: story.title, text: shareText });
      } catch (err) {
        if ((err as Error).name !== "AbortError") sonner.error(t("failed_share_story"));
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        sonner.success(t("story_copied_clipboard"));
      } catch {
        sonner.error(t("failed_copy_story"));
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast({
          title: t("login_required"),
          description: t("login_required_continue"),
          variant: "destructive",
        });
        navigate("/auth");
        setSending(false);
        return;
      }

      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
      const contextPreamble = story
        ? `Today's story for the user is titled "${story.title}". Story: ${story.content}${story.moral_takeaway ? ` Moral: ${story.moral_takeaway}` : ""}.`
        : "";

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: contextPreamble },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: userMsg.content },
          ],
          voice: meta.chatVoice,
          context: "storytelling",
          language,
        }),
      });

      if (response.status === 429) {
        toast({
          title: t("daily_limit_reached"),
          description: t("upgrade_unlimited"),
          variant: "destructive",
          action: (
            <Button variant="outline" size="sm" onClick={() => navigate("/premium")}>
              {t("upgrade")}
            </Button>
          ),
        });
        setMessages((prev) => prev.slice(0, -1));
        setSending(false);
        return;
      }

      if (!response.ok || !response.body) {
        throw new Error("Failed to get response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      let buffer = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (delta) {
              assistantContent += delta;
              setMessages((prev) => {
                const next = [...prev];
                const last = next[next.length - 1];
                if (last?.role === "assistant") last.content = assistantContent;
                return next;
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: t("connection_issue_retry") },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col blue-sky-gradient">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-4 border-b border-white/10 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/main-menu?tab=hagion-university")}
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <Avatar className="w-10 h-10 ring-1 ring-white/30">
          <AvatarImage src={meta.image} alt={subjectTitle} />
          <AvatarFallback>{subjectTitle.slice(0, 1)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold truncate">{subjectTitle}</h1>
          <p className="text-xs text-muted-foreground truncate">
            {language === "es" ? "Historia diaria + Pregunta más" : "Daily story + Ask more"}
          </p>
        </div>
      </header>

      {/* Story + Chat */}
      <div className="flex-1 overflow-auto px-4 py-4 space-y-4 max-w-3xl mx-auto w-full pb-32">
        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#3BB4F2]" />
            </CardContent>
          </Card>
        ) : story ? (
          <Card className="bg-white/95 text-foreground">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{story.title}</CardTitle>
                  <CardDescription>
                    <span className="inline-block px-3 py-1 bg-[#3BB4F2]/10 text-[#3BB4F2] rounded-full text-xs font-semibold">
                      {story.theme}
                    </span>
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSave}
                    disabled={savingBookmark}
                  >
                    {isSaved ? (
                      <BookmarkCheck className="w-5 h-5 text-[#3BB4F2]" />
                    ) : (
                      <Bookmark className="w-5 h-5" />
                    )}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleShare}>
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-sm max-w-none">
                {story.content
                  .replace(/\\n/g, "\n")
                  .split("\n\n")
                  .map((p, i) => (
                    <p key={i} className="leading-relaxed">
                      {p}
                    </p>
                  ))}
              </div>
              {story.moral_takeaway && (
                <div className="p-4 bg-muted/40 rounded-lg border-l-4 border-[#3BB4F2]">
                  <h3 className="font-semibold text-sm mb-1 flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-[#3BB4F2]" />
                    {t("reflection")}
                  </h3>
                  <p className="text-sm italic text-muted-foreground">
                    {story.moral_takeaway}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {t("no_story_available")}
            </CardContent>
          </Card>
        )}

        {/* Chat thread */}
        {story && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-white/80 px-1">
              {language === "es" ? "Pregunta más sobre esta historia" : "Ask more about this story"}
            </h2>
            <ScrollArea className="max-h-[50vh]">
              <div ref={scrollRef} className="space-y-3 pr-2">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {m.role === "assistant" && (
                      <Avatar className="w-7 h-7 shrink-0">
                        <AvatarImage src={meta.image} />
                        <AvatarFallback>{subjectTitle.slice(0, 1)}</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`rounded-2xl px-3 py-2 max-w-[80%] text-sm whitespace-pre-wrap ${
                        m.role === "user"
                          ? "bg-[#3BB4F2] text-white"
                          : "bg-white/95 text-foreground"
                      }`}
                    >
                      {m.content || (sending && i === messages.length - 1 ? "…" : "")}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="fixed bottom-[72px] left-0 right-0 px-4 pb-3 bg-gradient-to-t from-black/40 to-transparent">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              language === "es" ? "Escribe tu pregunta…" : "Type your question…"
            }
            className="flex-1 bg-white/95 text-foreground border-white/30"
            disabled={sending || !story}
          />
          <Button
            onClick={handleSend}
            disabled={sending || !input.trim() || !story}
            className="bg-[#3BB4F2] hover:bg-[#0052D4]"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <PremiumNav />
    </div>
  );
};

export default SubjectDailyStory;

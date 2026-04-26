import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Bookmark, BookmarkCheck, Loader2, Send, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { PremiumNav } from "@/components/PremiumNav";
import biblicalScrollImage from "@/assets/biblical-scroll.jpg";
import martyrsImage from "@/assets/martyrs-symbol.jpg";
import historyImage from "@/assets/history-christianity.jpg";
import { toast as sonner } from "sonner";

interface Story {
  id: string;
  title: string;
  content: string;
  theme: string;
  moral_takeaway: string | null;
  subject: string;
  era: string | null;
  law_statement: string | null;       // biblical: scripture_ref
  law_transgression: string | null;   // biblical: scene_setting
  law_observance: string | null;      // biblical: scene_action
  law_interpretation: string | null;  // biblical: scene_aftermath
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SUBJECT_META: Record<
  string,
  { titleKey: string; image: string; chatVoice: string; isBiblical?: boolean }
> = {
  "biblical-stories": {
    titleKey: "biblical_stories",
    image: biblicalScrollImage,
    chatVoice: "biblical-stories",
    isBiblical: true,
  },
  martyrs: { titleKey: "martyrs_faith", image: martyrsImage, chatVoice: "martyrs" },
  "history-christianity": {
    titleKey: "history_christianity",
    image: historyImage,
    chatVoice: "history-christianity",
  },
  "bible-translations": {
    titleKey: "bible_translations",
    image: biblicalScrollImage,
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
  const isBiblical = !!meta.isBiblical;

  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [savingBookmark, setSavingBookmark] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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

          setMessages([
            {
              role: "assistant",
              content:
                language === "es"
                  ? `Acabas de leer "${chosen.title}". Pregúntame lo que quieras y exploraremos más profundo en la Escritura.`
                  : `You just read "${chosen.title}". Ask me anything and we'll dig deeper into Scripture together.`,
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
    return () => { cancelled = true; };
  }, [subjectId, navigate, language, t]);

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
        await supabase.from("saved_stories").delete().eq("user_id", user.id).eq("story_id", story.id);
        setIsSaved(false);
        sonner.success(t("story_removed_saved"));
      } else {
        await supabase.from("saved_stories").insert({ user_id: user.id, story_id: story.id });
        setIsSaved(true);
        sonner.success(t("story_saved_reflection"));
      }
    } finally {
      setSavingBookmark(false);
    }
  };

  const handleShare = async () => {
    if (!story) return;
    const shareText = `${story.title}${story.era ? `\n${story.era}` : ""}\n\n${story.content}\n\n— Hagion University`;
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
        toast({ title: t("login_required"), description: t("login_required_continue"), variant: "destructive" });
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
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
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

      if (!response.ok || !response.body) throw new Error("Failed to get response");

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
      setMessages((prev) => [...prev, { role: "assistant", content: t("connection_issue_retry") }]);
    } finally {
      setSending(false);
    }
  };

  const renderParagraphs = (text: string | null | undefined) => {
    if (!text) return null;
    return text
      .replace(/\\n/g, "\n")
      .split(/\n{2,}|\n/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p, i) => (
        <p key={i} className="leading-[1.85] text-[15px] sm:text-base text-white mb-4">
          {p}
        </p>
      ));
  };

  return (
    <div className="min-h-screen flex flex-col page-transition">
      {/* Floating header — minimal, no card */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-background/40 border-b border-white/5">
        <div className="flex items-center gap-3 px-4 py-3 max-w-3xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/main-menu?tab=hagion-university")}
            className="tap-scale rounded-full hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 text-center">
            <p className="text-[11px] uppercase tracking-[0.25em] text-foreground/60">
              {subjectTitle}
            </p>
          </div>
          {story && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSave}
                disabled={savingBookmark}
                className="tap-scale rounded-full hover:bg-white/10"
              >
                {isSaved ? (
                  <BookmarkCheck className="w-5 h-5 text-accent" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="tap-scale rounded-full hover:bg-white/10"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-auto px-5 sm:px-6 pt-8 pb-32">
        <div className="max-w-2xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="w-7 h-7 animate-spin text-accent" />
              <p className="text-xs uppercase tracking-[0.2em] text-foreground/50">
                {language === "es" ? "Abriendo la Escritura…" : "Opening the Scripture…"}
              </p>
            </div>
          ) : story ? (
            <article className="animate-fade-in">
              {/* Title */}
              <h1 className="text-center text-3xl sm:text-4xl font-bold leading-tight tracking-tight text-white mb-3 px-2">
                {story.title}
              </h1>

              {/* Era */}
              {story.era && (
                <p className="text-center text-[12px] uppercase tracking-[0.35em] text-white mb-2">
                  {story.era}
                </p>
              )}

              {/* Scripture reference (biblical only) */}
              {isBiblical && story.law_statement && (
                <p className="text-center text-[11px] tracking-[0.2em] text-accent/90 mb-2 italic">
                  {story.law_statement}
                </p>
              )}

              {/* Theme pill */}
              <div className="flex justify-center mb-10">
                <span className="text-[10px] uppercase tracking-[0.3em] text-accent/90 px-3 py-1 rounded-full border border-accent/20 bg-accent/5">
                  {story.theme}
                </span>
              </div>

              {/* Divider */}
              <div className="flex items-center justify-center mb-10">
                <span className="h-px w-10 bg-foreground/20" />
                <span className="mx-3 text-foreground/30 text-xs">✦</span>
                <span className="h-px w-10 bg-foreground/20" />
              </div>

              {isBiblical ? (
                <>
                  <Section label={language === "es" ? "El Escenario" : "The Setting"} body={story.law_transgression} />
                  <Section label={language === "es" ? "La Escena" : "The Scene"} body={story.law_observance} />
                  <Section label={language === "es" ? "Lo Que Quedó" : "The Aftermath"} body={story.law_interpretation} />
                </>
              ) : (
                <div className="mb-10">{renderParagraphs(story.content)}</div>
              )}

              {/* Closing reflection */}
              {story.moral_takeaway && (
                <div className="mt-12 mb-2">
                  <div className="flex items-center justify-center mb-6">
                    <span className="h-px w-10 bg-foreground/20" />
                    <span className="mx-3 text-foreground/30 text-xs">✦</span>
                    <span className="h-px w-10 bg-foreground/20" />
                  </div>
                  <blockquote className="text-center italic text-lg sm:text-xl leading-relaxed text-white px-4">
                    "{story.moral_takeaway}"
                  </blockquote>
                </div>
              )}

              {/* Ask more — inline toggle */}
              <div className="mt-14 flex justify-center">
                <Button
                  variant="ghost"
                  onClick={() => setChatOpen((v) => !v)}
                  className="text-xs uppercase tracking-[0.3em] text-accent hover:bg-accent/10 rounded-full px-5"
                >
                  {chatOpen
                    ? (language === "es" ? "Ocultar conversación" : "Hide conversation")
                    : (language === "es" ? "Pregunta más" : "Ask more")}
                </Button>
              </div>

              {chatOpen && (
                <div className="mt-6 animate-fade-in">
                  <ScrollArea className="max-h-[50vh]">
                    <div ref={scrollRef} className="space-y-3 pr-2">
                      {messages.map((m, i) => (
                        <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                          {m.role === "assistant" && (
                            <Avatar className="w-7 h-7 shrink-0">
                              <AvatarImage src={meta.image} />
                              <AvatarFallback>{subjectTitle.slice(0, 1)}</AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={`rounded-2xl px-3 py-2 max-w-[80%] text-sm whitespace-pre-wrap ${
                              m.role === "user"
                                ? "bg-accent text-accent-foreground"
                                : "bg-white/10 text-white border border-white/10"
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
            </article>
          ) : (
            <div className="py-24 text-center text-foreground/60">
              <p>{t("no_story_available")}</p>
            </div>
          )}
        </div>
      </main>

      {/* Composer — only when chat opened */}
      {chatOpen && story && (
        <div className="fixed bottom-[72px] left-0 right-0 px-4 pb-3 backdrop-blur-xl bg-background/60 border-t border-white/5 pt-3">
          <div className="max-w-2xl mx-auto flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={language === "es" ? "Escribe tu pregunta…" : "Type your question…"}
              className="flex-1 bg-white/10 text-white border-white/20 placeholder:text-white/40"
              disabled={sending}
            />
            <Button
              onClick={handleSend}
              disabled={sending || !input.trim()}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}

      <PremiumNav />
    </div>
  );

  function Section({ label, body }: { label: string; body: string | null | undefined }) {
    if (!body) return null;
    return (
      <section className="mb-10">
        <h2 className="text-[11px] uppercase tracking-[0.3em] text-accent mb-4 font-semibold">
          {label}
        </h2>
        {renderParagraphs(body)}
      </section>
    );
  }
};

export default SubjectDailyStory;

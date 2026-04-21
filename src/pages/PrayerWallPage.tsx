import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ArrowLeft,
  HandHeart,
  Heart,
  Sparkles,
  MessageCircle,
  Send,
  Loader2,
  CheckCircle2,
  Plus,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PrayerCommentThread } from "@/components/prayer/PrayerCommentThread";

type Prayer = {
  id: string;
  user_id: string | null;
  author_name: string | null;
  author_avatar: string | null;
  title: string | null;
  content: string;
  theme: string | null;
  is_anonymous: boolean;
  is_answered: boolean;
  answered_at: string | null;
  praying_count: number;
  amen_count: number;
  encouraged_count: number;
  comment_count: number;
  created_at: string;
};

type Reaction = "praying" | "amen" | "encouraged";
type SortMode = "needs" | "recent" | "supported";
type FilterTheme = "all" | "healing" | "family" | "guidance" | "salvation" | "thanksgiving" | "answered";

const THEMES: { value: Exclude<FilterTheme, "all" | "answered">; en: string; es: string }[] = [
  { value: "healing", en: "Healing", es: "Sanidad" },
  { value: "family", en: "Family", es: "Familia" },
  { value: "guidance", en: "Guidance", es: "Guía" },
  { value: "salvation", en: "Salvation", es: "Salvación" },
  { value: "thanksgiving", en: "Thanksgiving", es: "Gratitud" },
];

export default function PrayerWallPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (en: string, es: string) => (language === "es" ? es : en);

  const [user, setUser] = useState<any>(null);
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [myReactions, setMyReactions] = useState<Record<string, Set<Reaction>>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [composerOpen, setComposerOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [draftTheme, setDraftTheme] = useState<Exclude<FilterTheme, "all" | "answered">>("guidance");
  const [posting, setPosting] = useState(false);
  const [sort, setSort] = useState<SortMode>("recent");
  const [filter, setFilter] = useState<FilterTheme>("all");
  const [glowingReactions, setGlowingReactions] = useState<Record<string, Reaction | null>>({});

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("prayers")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    setPrayers(((data as Prayer[]) || []));
    setLoading(false);
  }, []);

  const loadMyReactions = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from("prayer_reactions")
      .select("prayer_id, reaction")
      .eq("user_id", uid);
    const map: Record<string, Set<Reaction>> = {};
    (data || []).forEach((r: any) => {
      if (!map[r.prayer_id]) map[r.prayer_id] = new Set();
      map[r.prayer_id].add(r.reaction);
    });
    setMyReactions(map);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) loadMyReactions(data.user.id);
    });
    load();

    // Realtime: prayers + reactions
    const ch = supabase
      .channel("prayer-wall-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "prayers" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "prayer_reactions" }, () => load())
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, [load, loadMyReactions]);

  const filteredSorted = useMemo(() => {
    let list = [...prayers];
    if (filter === "answered") {
      list = list.filter((p) => p.is_answered);
    } else if (filter !== "all") {
      list = list.filter((p) => p.theme === filter && !p.is_answered);
    } else {
      // Push answered to bottom unless explicitly viewing them
      list.sort((a, b) => Number(a.is_answered) - Number(b.is_answered));
    }
    if (sort === "needs") {
      list.sort((a, b) => {
        if (a.is_answered !== b.is_answered) return Number(a.is_answered) - Number(b.is_answered);
        return a.praying_count - b.praying_count;
      });
    } else if (sort === "supported") {
      list.sort((a, b) => {
        const aw = Number(a.is_answered) - Number(b.is_answered);
        if (aw !== 0) return aw;
        return (b.praying_count + b.amen_count + b.encouraged_count) -
          (a.praying_count + a.amen_count + a.encouraged_count);
      });
    } else {
      list.sort((a, b) => {
        const aw = Number(a.is_answered) - Number(b.is_answered);
        if (aw !== 0) return aw;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    }
    return list;
  }, [prayers, filter, sort]);

  const requireAuth = () => {
    if (!user) {
      toast.error(t("Please sign in.", "Inicia sesión."));
      navigate("/auth");
      return false;
    }
    return true;
  };

  const submitPrayer = async () => {
    if (!requireAuth()) return;
    const content = draftContent.trim();
    if (!content) {
      toast.error(t("Please write your petition.", "Escribe tu petición."));
      return;
    }
    if (content.length > 2000) {
      toast.error(t("Petition too long.", "Petición muy larga."));
      return;
    }
    setPosting(true);
    const { data: profile } = await supabase
      .from("profiles")
      .select("name,username,avatar_url")
      .eq("user_id", user.id)
      .maybeSingle();
    const { error } = await supabase.from("prayers").insert({
      user_id: user.id,
      title: draftTitle.trim() ? draftTitle.trim().slice(0, 120) : null,
      content,
      theme: draftTheme,
      is_anonymous: false,
      author_name: profile?.name || profile?.username || user.email?.split("@")[0] || "Believer",
      author_avatar: profile?.avatar_url ?? null,
    });
    setPosting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setDraftTitle("");
    setDraftContent("");
    setComposerOpen(false);
    toast.success(t("Petition shared. May the saints lift you up.", "Petición compartida."));
  };

  const toggleReaction = async (prayer: Prayer, reaction: Reaction) => {
    if (!requireAuth()) return;
    const has = myReactions[prayer.id]?.has(reaction);
    // Optimistic
    setMyReactions((m) => {
      const next = { ...m };
      const set = new Set(next[prayer.id] || []);
      if (has) set.delete(reaction);
      else set.add(reaction);
      next[prayer.id] = set;
      return next;
    });
    setPrayers((ps) =>
      ps.map((p) => {
        if (p.id !== prayer.id) return p;
        const delta = has ? -1 : 1;
        if (reaction === "praying") return { ...p, praying_count: Math.max(0, p.praying_count + delta) };
        if (reaction === "amen") return { ...p, amen_count: Math.max(0, p.amen_count + delta) };
        return { ...p, encouraged_count: Math.max(0, p.encouraged_count + delta) };
      })
    );
    if (!has) {
      setGlowingReactions((g) => ({ ...g, [prayer.id]: reaction }));
      setTimeout(() => setGlowingReactions((g) => ({ ...g, [prayer.id]: null })), 700);
      // Light haptic on mobile
      if ("vibrate" in navigator) navigator.vibrate?.(20);
    }
    if (has) {
      await supabase
        .from("prayer_reactions")
        .delete()
        .eq("prayer_id", prayer.id)
        .eq("user_id", user.id)
        .eq("reaction", reaction);
    } else {
      const { error } = await supabase
        .from("prayer_reactions")
        .insert({ prayer_id: prayer.id, user_id: user.id, reaction });
      if (error && !error.message.includes("duplicate")) {
        toast.error(error.message);
      }
    }
  };

  const markAnswered = async (prayer: Prayer) => {
    if (!user || prayer.user_id !== user.id) return;
    const next = !prayer.is_answered;
    const { error } = await supabase
      .from("prayers")
      .update({ is_answered: next, answered_at: next ? new Date().toISOString() : null })
      .eq("id", prayer.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (next) toast.success(t("Praise God! 🎉", "¡Gloria a Dios! 🎉"));
  };

  const livePrayingTotal = prayers.reduce((s, p) => s + p.praying_count, 0);

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      {/* Consistent dark gradient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at center, #2B5681 0%, #000000 100%)",
        }}
      />

      <main className="px-5 sm:px-8 pb-32 max-w-2xl mx-auto">
        {/* Header */}
        <header className="pt-6 pb-4 animate-fade-in flex flex-col items-center text-center relative">
          <button
            onClick={() => navigate("/home")}
            aria-label={t("Back", "Atrás")}
            className="absolute left-0 top-6 w-8 h-8 rounded-full bg-white/[0.06] border border-white/15 backdrop-blur-xl text-white/80 hover:text-white hover:bg-white/10 transition flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-300/30 to-blue-600/30 border border-sky-300/30 backdrop-blur-xl flex items-center justify-center shadow-[0_8px_30px_-6px_rgba(56,135,255,0.55)] mb-3">
            <HandHeart className="w-6 h-6 text-sky-100" />
          </div>
          <h1 className="font-playfair text-2xl sm:text-3xl leading-[1.05] tracking-tight bg-gradient-to-b from-white via-white to-sky-200/90 bg-clip-text text-transparent drop-shadow-[0_4px_20px_rgba(56,135,255,0.35)]">
            {t("Prayer Wall", "Muro de Oración")}
          </h1>
          <div className="mt-2 h-px w-16 bg-gradient-to-r from-transparent via-sky-400/70 to-transparent" />
          <p className="mt-2 italic text-white/70 text-[12px] font-playfair max-w-xs">
            {t(
              "“Bear one another's burdens, and so fulfill the law of Christ.” — Galatians 6:2",
              "“Sobrellevad los unos las cargas de los otros.” — Gálatas 6:2"
            )}
          </p>
          {livePrayingTotal > 0 && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-sky-300/25 bg-sky-300/5 px-3 py-1 text-[10.5px] tracking-[0.16em] uppercase text-sky-100/85">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 rounded-full bg-sky-300 animate-ping opacity-75" />
                <span className="relative rounded-full bg-sky-300 h-1.5 w-1.5" />
              </span>
              {livePrayingTotal} {t("prayers lifted", "oraciones elevadas")}
            </div>
          )}
        </header>

        {/* Filter chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
          {(
            [
              { v: "all", label: t("All", "Todas") },
              ...THEMES.map((th) => ({ v: th.value as FilterTheme, label: t(th.en, th.es) })),
              { v: "answered" as FilterTheme, label: t("Answered ✨", "Respondidas ✨") },
            ] as { v: FilterTheme; label: string }[]
          ).map((f) => (
            <button
              key={f.v}
              onClick={() => setFilter(f.v)}
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-full text-[11px] tracking-[0.06em] font-inter transition border",
                filter === f.v
                  ? "bg-gradient-to-r from-sky-400/30 to-blue-500/30 border-sky-300/50 text-white shadow-[0_4px_18px_-6px_rgba(56,135,255,0.6)]"
                  : "bg-white/[0.03] border-white/10 text-white/60 hover:text-white/90"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex justify-between items-center mt-3 mb-3">
          <div className="flex gap-1 text-[10.5px]">
            {(
              [
                { v: "recent" as SortMode, label: t("Recent", "Reciente") },
                { v: "needs" as SortMode, label: t("Needs prayer", "Necesita oración") },
                { v: "supported" as SortMode, label: t("Most supported", "Más apoyo") },
              ]
            ).map((s) => (
              <button
                key={s.v}
                onClick={() => setSort(s.v)}
                className={cn(
                  "px-2.5 py-1 rounded-full uppercase tracking-[0.16em] font-inter transition",
                  sort === s.v ? "bg-white/15 text-white" : "text-white/45 hover:text-white/80"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-white/40" />
          </div>
        ) : filteredSorted.length === 0 ? (
          <div className="text-center py-16 text-white/50 text-sm font-inter italic">
            {t("No petitions here yet. Be the first.", "Aún no hay peticiones. Sé el primero.")}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSorted.map((p) => (
              <PrayerCard
                key={p.id}
                prayer={p}
                userId={user?.id ?? null}
                myReactions={myReactions[p.id] || new Set()}
                glowing={glowingReactions[p.id] ?? null}
                isOpen={!!openComments[p.id]}
                onToggleComments={() =>
                  setOpenComments((o) => ({ ...o, [p.id]: !o[p.id] }))
                }
                onReact={(r) => toggleReaction(p, r)}
                onMarkAnswered={() => markAnswered(p)}
                t={t}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating compose */}
      <button
        onClick={() => {
          if (!requireAuth()) return;
          setComposerOpen(true);
        }}
        aria-label={t("Share a petition", "Compartir petición")}
        className="fixed bottom-6 right-5 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-[0_10px_40px_-6px_rgba(56,135,255,0.7)] flex items-center justify-center hover:brightness-110 transition active:scale-95"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Composer modal */}
      {composerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setComposerOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl border border-sky-300/20 bg-gradient-to-b from-[hsl(220_55%_14%)] to-[hsl(222_65%_9%)] p-5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] animate-scale-in"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <HandHeart className="w-5 h-5 text-sky-300" />
                <h2 className="font-playfair text-lg text-white">
                  {t("Share a petition", "Compartir petición")}
                </h2>
              </div>
              <button
                onClick={() => setComposerOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              placeholder={t("Title (optional)", "Título (opcional)")}
              maxLength={120}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-[14px] text-white placeholder:text-white/40 outline-none focus:border-sky-400/50 transition mb-2 font-inter"
            />
            <textarea
              value={draftContent}
              onChange={(e) => setDraftContent(e.target.value)}
              rows={5}
              maxLength={2000}
              placeholder={t(
                "Share what's on your heart…",
                "Comparte lo que está en tu corazón…"
              )}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-[14px] text-white placeholder:text-white/40 outline-none focus:border-sky-400/50 transition resize-none font-inter"
            />
            <div className="mt-3">
              <p className="text-[10px] tracking-[0.18em] uppercase text-white/45 mb-1.5">
                {t("Theme", "Tema")}
              </p>
              <div className="flex gap-1.5 flex-wrap">
                {THEMES.map((th) => (
                  <button
                    key={th.value}
                    onClick={() => setDraftTheme(th.value)}
                    className={cn(
                      "px-3 py-1 rounded-full text-[11px] border transition",
                      draftTheme === th.value
                        ? "bg-gradient-to-r from-sky-400/30 to-blue-500/30 border-sky-300/50 text-white"
                        : "bg-white/[0.03] border-white/10 text-white/60 hover:text-white/90"
                    )}
                  >
                    {t(th.en, th.es)}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-2 text-right text-[10px] text-white/40 font-inter">
              {draftContent.length}/2000
            </div>
            <button
              disabled={posting || !draftContent.trim()}
              onClick={submitPrayer}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 text-white py-2.5 text-[14px] font-medium disabled:opacity-40 hover:brightness-110 transition shadow-[0_8px_30px_-6px_rgba(56,135,255,0.7)]"
            >
              {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {t("Share petition", "Compartir petición")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface CardProps {
  prayer: Prayer;
  userId: string | null;
  myReactions: Set<Reaction>;
  glowing: Reaction | null;
  isOpen: boolean;
  onToggleComments: () => void;
  onReact: (r: Reaction) => void;
  onMarkAnswered: () => void;
  t: (en: string, es: string) => string;
}

const PrayerCard = ({
  prayer,
  userId,
  myReactions,
  glowing,
  isOpen,
  onToggleComments,
  onReact,
  onMarkAnswered,
  t,
}: CardProps) => {
  const isOwn = userId && prayer.user_id === userId;
  const initial = (prayer.author_name || "?").trim().charAt(0).toUpperCase();
  const themeLabel = prayer.theme
    ? THEMES.find((th) => th.value === prayer.theme)
    : null;

  return (
    <article
      className={cn(
        "rounded-3xl border backdrop-blur-2xl p-4 transition-all relative overflow-hidden",
        prayer.is_answered
          ? "border-amber-300/40 bg-gradient-to-br from-amber-500/[0.07] via-white/[0.03] to-amber-300/[0.05] shadow-[0_8px_30px_-10px_rgba(255,200,80,0.35)]"
          : "border-white/10 bg-white/[0.035] shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)]"
      )}
    >
      {prayer.is_answered && (
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-amber-400/15 border border-amber-300/40 px-2 py-0.5 text-[10px] tracking-[0.14em] uppercase text-amber-200">
          <Sparkles className="w-3 h-3" />
          {t("Answered", "Respondida")}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-2.5 mb-3">
        {prayer.author_avatar ? (
          <img
            src={prayer.author_avatar}
            alt=""
            className="w-9 h-9 rounded-full object-cover border border-white/15"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400/40 to-blue-600/40 border border-white/15 flex items-center justify-center text-[13px] font-medium text-white/90">
            {initial}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-medium text-white/90 truncate font-inter">
            {prayer.author_name || t("Believer", "Creyente")}
          </div>
          <div className="flex items-center gap-1.5 text-[10.5px] text-white/45 font-inter">
            <span>{timeAgo(prayer.created_at, t)}</span>
            {themeLabel && (
              <>
                <span>·</span>
                <span className="text-sky-300/85">{t(themeLabel.en, themeLabel.es)}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {prayer.title && (
        <h3 className="font-playfair text-[17px] leading-snug text-white mb-1.5">
          {prayer.title}
        </h3>
      )}
      <p className="text-[14px] leading-relaxed text-white/85 whitespace-pre-wrap break-words font-inter">
        {prayer.content}
      </p>

      {/* Reactions */}
      <div className="mt-3.5 flex items-center gap-1.5 flex-wrap">
        <ReactionButton
          active={myReactions.has("praying")}
          glow={glowing === "praying"}
          count={prayer.praying_count}
          label={t("Praying", "Orando")}
          emoji="🙏"
          color="sky"
          onClick={() => onReact("praying")}
        />
        <ReactionButton
          active={myReactions.has("amen")}
          glow={glowing === "amen"}
          count={prayer.amen_count}
          label={t("Amen", "Amén")}
          emoji="❤️"
          color="rose"
          onClick={() => onReact("amen")}
        />
        <ReactionButton
          active={myReactions.has("encouraged")}
          glow={glowing === "encouraged"}
          count={prayer.encouraged_count}
          label={t("Encouraged", "Animado")}
          emoji="🕊️"
          color="violet"
          onClick={() => onReact("encouraged")}
        />
        <button
          onClick={onToggleComments}
          className={cn(
            "ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] border transition",
            isOpen
              ? "bg-white/10 border-white/20 text-white"
              : "bg-white/[0.03] border-white/10 text-white/65 hover:text-white"
          )}
        >
          <MessageCircle className="w-3.5 h-3.5" />
          {prayer.comment_count}
        </button>
      </div>

      {isOwn && (
        <button
          onClick={onMarkAnswered}
          className={cn(
            "mt-3 inline-flex items-center gap-1.5 text-[11px] tracking-[0.1em] uppercase transition",
            prayer.is_answered
              ? "text-amber-200 hover:text-amber-100"
              : "text-white/45 hover:text-amber-200"
          )}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          {prayer.is_answered ? t("Unmark answered", "Desmarcar respondida") : t("Mark as answered", "Marcar respondida")}
        </button>
      )}

      {/* Comments */}
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <PrayerCommentThread prayerId={prayer.id} userId={userId} />
        </div>
      )}
    </article>
  );
};

const ReactionButton = ({
  active,
  glow,
  count,
  label,
  emoji,
  color,
  onClick,
}: {
  active: boolean;
  glow: boolean;
  count: number;
  label: string;
  emoji: string;
  color: "sky" | "rose" | "violet";
  onClick: () => void;
}) => {
  const colorMap = {
    sky: {
      active: "bg-sky-400/15 border-sky-300/50 text-sky-100 shadow-[0_4px_20px_-4px_rgba(56,135,255,0.55)]",
      glow: "ring-2 ring-sky-300/60",
    },
    rose: {
      active: "bg-rose-400/15 border-rose-300/50 text-rose-100 shadow-[0_4px_20px_-4px_rgba(255,80,120,0.5)]",
      glow: "ring-2 ring-rose-300/60",
    },
    violet: {
      active: "bg-violet-400/15 border-violet-300/50 text-violet-100 shadow-[0_4px_20px_-4px_rgba(170,120,255,0.5)]",
      glow: "ring-2 ring-violet-300/60",
    },
  } as const;
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] border transition active:scale-95 font-inter",
        active
          ? colorMap[color].active
          : "bg-white/[0.03] border-white/10 text-white/70 hover:text-white",
        glow && colorMap[color].glow
      )}
      aria-label={label}
    >
      <span className="text-[13px] leading-none">{emoji}</span>
      <span className="tabular-nums">{count}</span>
    </button>
  );
};

function timeAgo(iso: string, t: (en: string, es: string) => string) {
  const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 60) return t("just now", "ahora");
  const m = Math.floor(sec / 60);
  if (m < 60) return `${m}${t("m", "m")}`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}${t("h", "h")}`;
  const d = Math.floor(h / 24);
  return `${d}${t("d", "d")}`;
}

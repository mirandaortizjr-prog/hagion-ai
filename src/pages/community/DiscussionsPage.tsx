import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CommunityHeader } from "@/components/community/CommunityHeader";
import { PremiumNav } from "@/components/PremiumNav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowBigUp, MessageCircle, Plus, Flame, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatDistanceToNow } from "date-fns";
import { DISCUSSION_CATEGORIES, getCategory } from "@/data/discussionCategories";

type Sort = "hot" | "new" | "top";

interface Discussion {
  id: string;
  user_id: string;
  author_name: string | null;
  is_anonymous: boolean;
  content: string;
  category: string;
  vote_score: number;
  comment_count: number;
  created_at: string;
}

export default function DiscussionsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = (en: string, es: string) => (language === "es" ? es : en);
  const [params, setParams] = useSearchParams();

  const sort = (params.get("sort") as Sort) || "hot";
  const cat = params.get("cat") || "all";

  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<Discussion[]>([]);
  const [myVotes, setMyVotes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const [composeOpen, setComposeOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("general");
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const load = async () => {
    setLoading(true);
    let q = supabase.from("posts").select("*").eq("post_type", "discussion");
    if (cat !== "all") q = q.eq("category", cat);

    if (sort === "new") q = q.order("created_at", { ascending: false });
    else if (sort === "top") q = q.order("vote_score", { ascending: false });
    else q = q.order("hot_score", { ascending: false }).order("created_at", { ascending: false });

    const { data } = await q.limit(100);
    setPosts((data as any) || []);

    if (user && data && data.length) {
      const ids = data.map((p: any) => p.id);
      const { data: votes } = await supabase
        .from("post_votes")
        .select("post_id")
        .eq("user_id", user.id)
        .in("post_id", ids);
      setMyVotes(new Set((votes || []).map((v: any) => v.post_id)));
    } else {
      setMyVotes(new Set());
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, cat, user?.id]);

  const setSort = (s: Sort) => {
    params.set("sort", s);
    setParams(params, { replace: true });
  };
  const setCat = (c: string) => {
    if (c === "all") params.delete("cat");
    else params.set("cat", c);
    setParams(params, { replace: true });
  };

  const toggleVote = async (post: Discussion) => {
    if (!user) {
      toast({ title: t("Please sign in to upvote", "Inicia sesión para votar") });
      navigate("/auth");
      return;
    }
    const voted = myVotes.has(post.id);
    // optimistic
    const next = new Set(myVotes);
    if (voted) next.delete(post.id);
    else next.add(post.id);
    setMyVotes(next);
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id ? { ...p, vote_score: p.vote_score + (voted ? -1 : 1) } : p
      )
    );

    if (voted) {
      await supabase.from("post_votes").delete().eq("post_id", post.id).eq("user_id", user.id);
    } else {
      const { error } = await supabase
        .from("post_votes")
        .insert({ post_id: post.id, user_id: user.id });
      if (error) {
        // rollback
        setMyVotes(myVotes);
        setPosts((prev) =>
          prev.map((p) => (p.id === post.id ? { ...p, vote_score: p.vote_score + (voted ? 1 : -1) } : p))
        );
      }
    }
  };

  const submit = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    const body = newBody.trim();
    const title = newTitle.trim();
    if (!title || !body) return;
    setSubmitting(true);
    const content = `**${title}**\n\n${body}`;
    const { error } = await supabase.from("posts").insert({
      user_id: user.id,
      author_name: user.user_metadata?.name || user.email?.split("@")[0] || "Believer",
      content,
      post_type: "discussion",
      category: newCategory,
      is_anonymous: false,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: t("Could not post", "No se pudo publicar"), variant: "destructive" });
      return;
    }
    setComposeOpen(false);
    setNewTitle("");
    setNewBody("");
    setNewCategory("general");
    load();
  };

  const renderTitle = (content: string) => {
    const m = content.match(/^\*\*(.+?)\*\*\n\n([\s\S]*)$/);
    if (m) return { title: m[1], body: m[2] };
    return { title: content.split("\n")[0].slice(0, 120), body: content };
  };

  const sortBtn = (id: Sort, Icon: any, label: string) => (
    <button
      onClick={() => setSort(id)}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all",
        sort === id
          ? "bg-white/15 text-white ring-1 ring-white/30"
          : "text-white/60 hover:text-white/90 hover:bg-white/5"
      )}
    >
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  );

  return (
    <div className="min-h-screen text-white">
      <main className="px-5 sm:px-8 pb-32 max-w-3xl mx-auto">
        <CommunityHeader
          title={t("Discussions", "Discusiones")}
          subtitle={t(
            "Ask, share, and reason together in love.",
            "Pregunta, comparte y razonen juntos en amor."
          )}
        />

        {/* Sort + compose */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex gap-1 rounded-full bg-white/[0.04] border border-white/10 p-1 backdrop-blur-xl">
            {sortBtn("hot", Flame, t("Hot", "Popular"))}
            {sortBtn("new", Clock, t("New", "Nuevo"))}
            {sortBtn("top", TrendingUp, t("Top", "Top"))}
          </div>

          <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="rounded-full bg-gradient-to-r from-white/95 to-white/80 text-black hover:from-white hover:to-white/90"
              >
                <Plus className="w-4 h-4 mr-1" /> {t("Post", "Publicar")}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0b0b14] border-white/10 text-white max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-playfair text-2xl">
                  {t("New Discussion", "Nueva Discusión")}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger className="bg-black/30 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0b0b14] border-white/10 text-white">
                    {DISCUSSION_CATEGORIES.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.emoji} {language === "es" ? c.es : c.en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder={t("Title", "Título")}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  maxLength={140}
                  className="bg-black/30 border-white/10 text-white placeholder:text-white/40"
                />
                <Textarea
                  placeholder={t("Share your thoughts...", "Comparte tus pensamientos...")}
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  rows={6}
                  className="bg-black/30 border-white/10 text-white placeholder:text-white/40 resize-none"
                />
              </div>
              <DialogFooter>
                <Button
                  onClick={submit}
                  disabled={submitting || !newTitle.trim() || !newBody.trim()}
                  className="rounded-full bg-gradient-to-r from-white/95 to-white/80 text-black"
                >
                  {submitting ? t("Posting...", "Publicando...") : t("Post", "Publicar")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-3 -mx-1 px-1 scrollbar-hide">
          <CategoryChip active={cat === "all"} onClick={() => setCat("all")} label={t("All", "Todos")} emoji="🌐" />
          {DISCUSSION_CATEGORIES.map((c) => (
            <CategoryChip
              key={c.id}
              active={cat === c.id}
              onClick={() => setCat(c.id)}
              label={language === "es" ? c.es : c.en}
              emoji={c.emoji}
            />
          ))}
        </div>

        {/* Posts */}
        {loading ? (
          <div className="text-center py-16 text-white/50">{t("Loading...", "Cargando...")}</div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-8 text-center text-white/60">
            {t("No discussions yet. Be the first.", "Aún no hay discusiones. Sé el primero.")}
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((p) => {
              const c = getCategory(p.category);
              const { title, body } = renderTitle(p.content);
              const voted = myVotes.has(p.id);
              return (
                <article
                  key={p.id}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)] transition-all hover:border-white/20"
                >
                  <div
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute -right-12 -top-14 h-40 w-40 rounded-full bg-gradient-to-br opacity-50 blur-3xl",
                      c.accent
                    )}
                  />
                  <div className="relative flex">
                    {/* Vote rail */}
                    <div className="flex flex-col items-center gap-1 px-3 py-4 border-r border-white/5">
                      <button
                        onClick={() => toggleVote(p)}
                        className={cn(
                          "p-1.5 rounded-lg transition-all",
                          voted
                            ? "text-amber-300 bg-amber-300/15"
                            : "text-white/50 hover:text-white hover:bg-white/10"
                        )}
                        aria-label="upvote"
                      >
                        <ArrowBigUp className="w-5 h-5" strokeWidth={voted ? 2.4 : 2} />
                      </button>
                      <span className="text-[12px] font-semibold tabular-nums">{p.vote_score}</span>
                    </div>

                    <button
                      onClick={() => navigate(`/community/post/${p.id}`)}
                      className="flex-1 text-left p-4 min-w-0"
                    >
                      <div className="flex items-center gap-2 mb-1.5 text-[11px] text-white/50">
                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/80">
                          {c.emoji} {language === "es" ? c.es : c.en}
                        </span>
                        <span>·</span>
                        <span>{p.is_anonymous ? t("Anonymous", "Anónimo") : p.author_name || "Believer"}</span>
                        <span>·</span>
                        <span>{formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}</span>
                      </div>
                      <h3 className="font-playfair text-[17px] leading-snug text-white/95 mb-1 line-clamp-2">
                        {title}
                      </h3>
                      <p className="text-[13px] text-white/60 line-clamp-2 leading-relaxed">{body}</p>
                      <div className="mt-3 flex items-center gap-3 text-[12px] text-white/50">
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3.5 h-3.5" /> {p.comment_count}
                        </span>
                      </div>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
      <PremiumNav />
    </div>
  );
}

function CategoryChip({
  active,
  onClick,
  label,
  emoji,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  emoji: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all whitespace-nowrap",
        active
          ? "bg-white/15 text-white border-white/30"
          : "bg-white/[0.03] text-white/60 border-white/10 hover:text-white/90 hover:bg-white/[0.07]"
      )}
    >
      <span className="mr-1">{emoji}</span> {label}
    </button>
  );
}

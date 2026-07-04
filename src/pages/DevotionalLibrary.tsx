import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSafeBackNavigation } from "@/hooks/useSafeBackNavigation";
import { ArrowLeft, BookOpen, Search, Loader2, Tag, Sparkles, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { formatDistanceToNow } from "date-fns";

type Item = {
  id: string;
  title: string;
  scripture_ref: string;
  reflection: string;
  tags: string[];
  read_count: number;
  save_count: number;
  amen_count: number;
  created_at: string;
  author_id: string;
  author_name?: string;
  _score?: number;
  _reasons?: string[];
};

// Extract book name from "John 3:16" → "john"
const bookOf = (ref: string) =>
  (ref || "").trim().toLowerCase().replace(/^\d+\s*/, (m) => m.trim() + " ").split(/\s+\d/)[0].trim();

const DevotionalLibrary = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (en: string, es: string) => (language === "es" ? es : en);
  const back = useSafeBackNavigation("/daily-devotional");

  const [tab, setTab] = useState("foryou");
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState<string | null>(null);
  const [tagAffinity, setTagAffinity] = useState<Record<string, number>>({});
  const [bookAffinity, setBookAffinity] = useState<Record<string, number>>({});
  const [hasSignal, setHasSignal] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUid(data.user?.id ?? null));
  }, []);

  // Build affinity profile from saves + comment history
  useEffect(() => {
    if (!uid) return;
    (async () => {
      const [{ data: saves }, { data: comments }] = await Promise.all([
        supabase.from("user_devotional_saves").select("devotional_id").eq("user_id", uid).limit(100),
        supabase.from("user_devotional_comments").select("devotional_id").eq("author_id", uid).limit(100),
      ]);
      const ids = Array.from(new Set([
        ...(saves || []).map((s: any) => s.devotional_id),
        ...(comments || []).map((c: any) => c.devotional_id),
      ]));
      if (!ids.length) { setHasSignal(false); return; }
      setHasSignal(true);
      const { data: sourced } = await supabase
        .from("user_devotionals")
        .select("tags, scripture_ref")
        .in("id", ids);
      const tagMap: Record<string, number> = {};
      const bookMap: Record<string, number> = {};
      (sourced || []).forEach((d: any) => {
        (d.tags || []).forEach((tag: string) => { tagMap[tag.toLowerCase()] = (tagMap[tag.toLowerCase()] || 0) + 1; });
        const b = bookOf(d.scripture_ref);
        if (b) bookMap[b] = (bookMap[b] || 0) + 1;
      });
      setTagAffinity(tagMap);
      setBookAffinity(bookMap);
    })();
  }, [uid]);

  // Load candidates
  useEffect(() => {
    (async () => {
      setLoading(true);
      let query = supabase.from("user_devotionals")
        .select("id, title, scripture_ref, reflection, tags, read_count, save_count, amen_count, created_at, author_id")
        .eq("status", "approved");

      if (tab === "popular") query = query.order("save_count", { ascending: false }).order("read_count", { ascending: false }).limit(50);
      else if (tab === "newest") query = query.order("created_at", { ascending: false }).limit(50);
      else query = query.order("created_at", { ascending: false }).limit(120); // foryou: wider pool

      const { data } = await query;
      let list = (data || []) as Item[];

      const authorIds = Array.from(new Set(list.map((i) => i.author_id)));
      if (authorIds.length) {
        const { data: profs } = await supabase.from("profiles").select("user_id, name, username").in("user_id", authorIds);
        const map: Record<string, string> = {};
        (profs || []).forEach((p: any) => { map[p.user_id] = p.name || p.username || "Friend"; });
        list.forEach((i) => { i.author_name = map[i.author_id]; });
      }

      if (tab === "foryou") {
        const now = Date.now();
        list = list.map((i) => {
          const tagScore = (i.tags || []).reduce((acc, tag) => acc + (tagAffinity[tag.toLowerCase()] || 0) * 3, 0);
          const bookScore = (bookAffinity[bookOf(i.scripture_ref)] || 0) * 2;
          const ageHours = Math.max((now - new Date(i.created_at).getTime()) / 36e5, 1);
          const freshness = 8 / Math.log2(ageHours + 2); // gentle decay, brand-new gets ~8, week-old ~1.5
          const engagement = Math.log2((i.save_count || 0) + (i.amen_count || 0) + 1) * 0.5;
          const diversity = Math.random() * 1.5; // 20% wiggle
          const _score = tagScore + bookScore + freshness + engagement + diversity;
          const _reasons: string[] = [];
          const matchedTags = (i.tags || []).filter((tag) => tagAffinity[tag.toLowerCase()]);
          if (matchedTags.length) _reasons.push(t(`Matches your interest in ${matchedTags.slice(0, 2).join(", ")}`, `Coincide con tu interés en ${matchedTags.slice(0, 2).join(", ")}`));
          if (bookAffinity[bookOf(i.scripture_ref)]) _reasons.push(t(`You've read others from ${i.scripture_ref.split(/\s\d/)[0]}`, `Has leído otros de ${i.scripture_ref.split(/\s\d/)[0]}`));
          if (freshness > 6) _reasons.push(t("Fresh from the community", "Recién publicado"));
          if (!_reasons.length) _reasons.push(t("Recommended for you", "Recomendado para ti"));
          return { ...i, _score, _reasons };
        }).sort((a, b) => (b._score || 0) - (a._score || 0)).slice(0, 40);
      }

      setItems(list);
      setLoading(false);
    })();
  }, [tab, tagAffinity, bookAffinity]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((i) =>
      i.title.toLowerCase().includes(s) ||
      i.scripture_ref.toLowerCase().includes(s) ||
      (i.tags || []).some((tag) => tag.toLowerCase().includes(s))
    );
  }, [items, q]);

  return (
    <div className="min-h-screen text-white">
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-black/40 border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={back} className="p-2 rounded-full hover:bg-white/10">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <BookOpen className="h-5 w-5 text-white/70" />
          <h1 className="font-playfair text-lg tracking-tight">{t("Devotional Library", "Biblioteca de Devocionales")}</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pb-24 pt-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search title, scripture, tag…", "Buscar título, escritura, etiqueta…")} className="pl-9 bg-white/5 border-white/10" />
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="foryou" className="gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              {t("For You", "Para Ti")}
            </TabsTrigger>
            <TabsTrigger value="newest">{t("Newest", "Más Nuevos")}</TabsTrigger>
            <TabsTrigger value="popular">{t("Most Read", "Más Leídos")}</TabsTrigger>
          </TabsList>

          {tab === "foryou" && !hasSignal && uid && (
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 text-[12px] text-white/65 flex gap-2">
              <Info className="h-4 w-4 shrink-0 text-amber-300/80 mt-0.5" />
              <span>
                {t(
                  "Save and comment on devotionals to personalize your feed. For now we're showing fresh picks with a bit of variety.",
                  "Guarda y comenta devocionales para personalizar tu feed. Por ahora mostramos selecciones nuevas con variedad."
                )}
              </span>
            </div>
          )}

          <TabsContent value={tab} className="mt-4 space-y-2.5">
            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-white/40" /></div>
            ) : filtered.length === 0 ? (
              <p className="text-center py-16 text-white/50 text-sm">
                {t("No devotionals yet. Be the first to write one!", "Aún no hay devocionales. ¡Sé el primero!")}
              </p>
            ) : (
              filtered.map((i) => (
                <div key={i.id} className="rounded-2xl border border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.06] transition-all">
                  <button
                    onClick={() => navigate(`/devotional/${i.id}`)}
                    className="w-full text-left p-4"
                  >
                    <div className="flex items-center gap-2 mb-1.5 text-[10.5px] uppercase tracking-wider text-amber-200/70">
                      {i.scripture_ref}
                      <span className="text-white/30">·</span>
                      <span className="text-white/50 normal-case tracking-normal">{i.author_name || "Friend"}</span>
                    </div>
                    <h3 className="font-playfair text-lg tracking-tight text-white/95">{i.title}</h3>
                    <p className="mt-1 text-[13px] text-white/60 line-clamp-2 font-inter">{i.reflection}</p>
                    <div className="mt-2 flex items-center gap-3 flex-wrap text-[11px] text-white/45">
                      <span>{formatDistanceToNow(new Date(i.created_at), { addSuffix: true })}</span>
                      {i.save_count > 0 && <span>· 🔖 {i.save_count}</span>}
                      {i.amen_count > 0 && <span>· 🙏 {i.amen_count}</span>}
                      {(i.tags || []).slice(0, 2).map((tg) => (
                        <span key={tg} className="inline-flex items-center gap-0.5"><Tag className="h-2.5 w-2.5" />{tg}</span>
                      ))}
                    </div>
                  </button>
                  {tab === "foryou" && i._reasons && i._reasons.length > 0 && (
                    <div className="px-4 pb-3 -mt-1">
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="text-[10.5px] text-white/40 hover:text-white/70 inline-flex items-center gap-1">
                            <Info className="h-3 w-3" />
                            {t("Why am I seeing this?", "¿Por qué veo esto?")}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="bg-zinc-950 border-white/10 text-white/85 text-xs max-w-xs">
                          <p className="font-medium mb-1.5">{t("Recommendation reasons", "Razones de recomendación")}</p>
                          <ul className="space-y-1 text-white/70">
                            {i._reasons.map((r, idx) => <li key={idx}>• {r}</li>)}
                          </ul>
                          <p className="mt-2 pt-2 border-t border-white/10 text-[10px] text-white/45">
                            {t(
                              "We prioritize depth over outrage — no engagement-bait ranking here.",
                              "Priorizamos profundidad sobre indignación — sin ranking manipulador."
                            )}
                          </p>
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DevotionalLibrary;

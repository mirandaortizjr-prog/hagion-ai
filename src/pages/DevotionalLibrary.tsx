import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSafeBackNavigation } from "@/hooks/useSafeBackNavigation";
import { ArrowLeft, BookOpen, Search, Loader2, Tag, Flame } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
};

const DevotionalLibrary = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (en: string, es: string) => (language === "es" ? es : en);
  const back = useSafeBackNavigation("/daily-devotional");

  const [tab, setTab] = useState("newest");
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let query = supabase.from("user_devotionals")
        .select("id, title, scripture_ref, reflection, tags, read_count, save_count, amen_count, created_at, author_id")
        .eq("status", "approved")
        .limit(50);

      if (tab === "newest") query = query.order("created_at", { ascending: false });
      else if (tab === "popular") query = query.order("save_count", { ascending: false }).order("read_count", { ascending: false });

      const { data } = await query;
      const list = (data || []) as Item[];

      const authorIds = Array.from(new Set(list.map((i) => i.author_id)));
      if (authorIds.length) {
        const { data: profs } = await supabase.from("profiles").select("user_id, name, username").in("user_id", authorIds);
        const map: Record<string, string> = {};
        (profs || []).forEach((p: any) => { map[p.user_id] = p.name || p.username || "Friend"; });
        list.forEach((i) => { i.author_name = map[i.author_id]; });
      }
      setItems(list);
      setLoading(false);
    })();
  }, [tab]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((i) =>
      i.title.toLowerCase().includes(s) ||
      i.scripture_ref.toLowerCase().includes(s) ||
      i.tags.some((tag) => tag.toLowerCase().includes(s))
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
            <TabsTrigger value="newest">{t("Newest", "Más Nuevos")}</TabsTrigger>
            <TabsTrigger value="popular">{t("Most Read", "Más Leídos")}</TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-4 space-y-2.5">
            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-white/40" /></div>
            ) : filtered.length === 0 ? (
              <p className="text-center py-16 text-white/50 text-sm">
                {t("No devotionals yet. Be the first to write one!", "Aún no hay devocionales. ¡Sé el primero!")}
              </p>
            ) : (
              filtered.map((i) => (
                <button
                  key={i.id}
                  onClick={() => navigate(`/devotional/${i.id}`)}
                  className="w-full text-left rounded-2xl border border-white/10 bg-white/[0.04] p-4 hover:border-white/20 hover:bg-white/[0.06] transition-all"
                >
                  <div className="flex items-center gap-2 mb-1.5 text-[10.5px] uppercase tracking-wider text-amber-200/70">
                    {i.scripture_ref}
                    <span className="text-white/30">·</span>
                    <span className="text-white/50 normal-case tracking-normal">{i.author_name || "Friend"}</span>
                  </div>
                  <h3 className="font-playfair text-lg tracking-tight text-white/95">{i.title}</h3>
                  <p className="mt-1 text-[13px] text-white/60 line-clamp-2 font-inter">{i.reflection}</p>
                  <div className="mt-2 flex items-center gap-3 text-[11px] text-white/45">
                    <span>{formatDistanceToNow(new Date(i.created_at), { addSuffix: true })}</span>
                    {i.save_count > 0 && <span>· 🔖 {i.save_count}</span>}
                    {i.amen_count > 0 && <span>· 🙏 {i.amen_count}</span>}
                    {i.tags.slice(0, 2).map((t) => (
                      <span key={t} className="inline-flex items-center gap-0.5"><Tag className="h-2.5 w-2.5" />{t}</span>
                    ))}
                  </div>
                </button>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DevotionalLibrary;

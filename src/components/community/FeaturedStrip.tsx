import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, ArrowRight } from "lucide-react";

interface Featured {
  id: string;
  kind: string;
  title: string | null;
  subtitle: string | null;
  link: string | null;
  ref_id: string | null;
}

const KIND_META: Record<string, { label: string; accent: string }> = {
  verse_of_week: { label: "Verse of the Week", accent: "from-amber-300/30 via-orange-400/15 to-rose-600/20" },
  room_of_week: { label: "Room of the Week", accent: "from-sky-300/30 via-blue-400/15 to-indigo-700/20" },
  prayer_of_week: { label: "Prayer of the Week", accent: "from-violet-300/30 via-fuchsia-400/15 to-purple-700/20" },
  testimony_of_week: { label: "Testimony of the Week", accent: "from-emerald-300/30 via-teal-400/15 to-cyan-700/20" },
};

export function FeaturedStrip() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Featured[]>([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    (async () => {
      const now = new Date().toISOString();
      const { data } = await (supabase.from("featured_content") as any)
        .select("*")
        .lte("starts_at", now)
        .gte("ends_at", now)
        .order("created_at", { ascending: false })
        .limit(8);
      setItems((data as Featured[]) || []);
    })();
  }, []);

  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % items.length), 6000);
    return () => clearInterval(t);
  }, [items.length]);

  if (items.length === 0) return null;
  const f = items[idx];
  const meta = KIND_META[f.kind] || { label: "Featured", accent: "from-white/20 via-white/10 to-white/5" };

  const go = () => {
    if (f.link) navigate(f.link);
    else if (f.kind === "room_of_week" && f.ref_id) navigate(`/community/group/${f.ref_id}`);
    else if (f.kind === "prayer_of_week") navigate("/prayer-wall");
  };

  return (
    <button
      onClick={go}
      className="group relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl px-4 py-3 text-left animate-fade-in transition-all hover:border-white/25 hover:bg-white/[0.06]"
    >
      <div aria-hidden className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${meta.accent} opacity-70 blur-3xl`} />
      <div className="relative flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
          <Sparkles className="h-4 w-4 text-white" strokeWidth={1.9} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] tracking-[0.18em] uppercase text-white/55">{meta.label}</p>
          <h3 className="font-playfair text-[15px] leading-tight text-white truncate">{f.title || "Featured"}</h3>
          {f.subtitle && <p className="text-[11.5px] text-white/55 truncate">{f.subtitle}</p>}
        </div>
        <ArrowRight className="h-4 w-4 text-white/45 group-hover:translate-x-1 transition-transform" />
      </div>
      {items.length > 1 && (
        <div className="mt-2 flex items-center gap-1 relative">
          {items.map((_, i) => (
            <span key={i} className={`h-[2px] flex-1 rounded-full transition-colors ${i === idx ? "bg-white/70" : "bg-white/15"}`} />
          ))}
        </div>
      )}
    </button>
  );
}

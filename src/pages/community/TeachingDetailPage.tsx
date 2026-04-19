import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CommunityHeader } from "@/components/community/CommunityHeader";
import { PremiumNav } from "@/components/PremiumNav";
import { Play, Clock, User } from "lucide-react";

export default function TeachingDetailPage() {
  const { id } = useParams();
  const [t, setT] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    supabase.from("teachings").select("*").eq("id", id).maybeSingle().then(({ data }) => setT(data));
  }, [id]);

  const fmt = (s?: number | null) => {
    if (!s) return "";
    const m = Math.floor(s / 60);
    return `${m} min`;
  };

  return (
    <div className="min-h-screen text-white">
      <main className="px-5 sm:px-8 pb-32 max-w-3xl mx-auto">
        <CommunityHeader title="Teaching" />
        {t && (
          <>
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] mb-5">
              {t.thumbnail_url ? (
                <img src={t.thumbnail_url} alt={t.title} className="w-full h-full object-cover" />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md ring-1 ring-white/40 flex items-center justify-center">
                  <Play className="w-7 h-7 text-white fill-white ml-1" />
                </div>
              </div>
            </div>
            <h2 className="font-playfair text-2xl text-white">{t.title}</h2>
            <div className="flex items-center gap-4 mt-2 text-[12px] text-white/60">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> {t.author_name}
              </span>
              {t.duration_seconds && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {fmt(t.duration_seconds)}
                </span>
              )}
            </div>
            {t.description && (
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-4 text-white/80 leading-relaxed">
                {t.description}
              </div>
            )}
          </>
        )}
      </main>
      <PremiumNav />
    </div>
  );
}

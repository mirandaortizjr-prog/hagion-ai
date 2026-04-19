import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CommunityHeader } from "@/components/community/CommunityHeader";
import { PremiumNav } from "@/components/PremiumNav";
import { Play } from "lucide-react";

export default function ReelsPage() {
  const [reels, setReels] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from("reels")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setReels(data || []));
  }, []);

  return (
    <div className="min-h-screen text-white">
      <main className="px-5 sm:px-8 pb-32 max-w-3xl mx-auto">
        <CommunityHeader title="Reels" subtitle="Short messages of faith and encouragement." />

        {reels.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[9/16] rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] flex items-center justify-center"
              >
                <Play className="w-8 h-8 text-white/40" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {reels.map((r) => (
              <button
                key={r.id}
                className="relative aspect-[9/16] rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] group"
              >
                {r.thumbnail_url && (
                  <img src={r.thumbnail_url} alt={r.title} className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md ring-1 ring-white/40 flex items-center justify-center group-hover:scale-110 transition">
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-2 left-2 right-2 text-left">
                  <div className="text-xs text-white font-semibold line-clamp-2">{r.title}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
      <PremiumNav />
    </div>
  );
}

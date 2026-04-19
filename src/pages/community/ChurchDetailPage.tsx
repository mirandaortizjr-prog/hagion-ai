import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CommunityHeader } from "@/components/community/CommunityHeader";
import { PremiumNav } from "@/components/PremiumNav";
import { Church, MapPin, Globe } from "lucide-react";

export default function ChurchDetailPage() {
  const { id } = useParams();
  const [c, setC] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    supabase.from("churches").select("*").eq("id", id).maybeSingle().then(({ data }) => setC(data));
  }, [id]);

  return (
    <div className="min-h-screen text-white">
      <main className="px-5 sm:px-8 pb-32 max-w-3xl mx-auto">
        <CommunityHeader title="Church" />
        {c && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] p-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-white/30 via-white/10 to-white/5 ring-1 ring-white/30 flex items-center justify-center mb-4">
              <Church className="w-8 h-8 text-white" />
            </div>
            <h2 className="font-playfair text-2xl">{c.name}</h2>
            {c.location && (
              <div className="flex items-center gap-2 mt-2 text-[13px] text-white/65">
                <MapPin className="w-4 h-4" />
                {c.location}
              </div>
            )}
            {c.description && <p className="mt-4 text-white/80 leading-relaxed">{c.description}</p>}
            {c.website && (
              <a
                href={c.website}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm text-white hover:bg-white/15"
              >
                <Globe className="w-4 h-4" /> Visit website
              </a>
            )}
          </div>
        )}
      </main>
      <PremiumNav />
    </div>
  );
}

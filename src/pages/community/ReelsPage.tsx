import { CommunityHeader } from "@/components/community/CommunityHeader";
import { PremiumNav } from "@/components/PremiumNav";
import { Film, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ReelsPage() {
  const navigate = useNavigate();

  const tiles = [
    {
      label: "Reels",
      icon: Film,
      onClick: () => navigate("/community/reels/feed"),
    },
    {
      label: "Videos",
      icon: Video,
      onClick: () => navigate("/community/videos"),
    },
    {
      label: "",
      icon: null,
      onClick: () => {},
      disabled: true,
    },
  ];

  return (
    <div className="min-h-screen text-white">
      <main className="px-5 sm:px-8 pb-32 max-w-3xl mx-auto">
        <CommunityHeader title="Reels & Videos" subtitle="Choose what you want to watch." />

        <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-4">
          {tiles.map((t, i) => {
            const Icon = t.icon;
            return (
              <button
                key={i}
                onClick={t.onClick}
                disabled={t.disabled}
                className="relative aspect-[9/16] rounded-[2rem] overflow-hidden border border-white/15 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed group"
              >
                {/* Phone notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1.5 rounded-full bg-black/60 ring-1 ring-white/10 z-10" />

                {/* Inner screen */}
                <div className="absolute inset-2 rounded-[1.5rem] bg-gradient-to-br from-black/40 via-black/20 to-black/40 border border-white/10 flex flex-col items-center justify-center gap-2">
                  {Icon && (
                    <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-md ring-1 ring-white/30 flex items-center justify-center group-hover:scale-110 transition">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  )}
                  {t.label && (
                    <div className="text-xs font-playfair tracking-[0.2em] uppercase text-white/90">
                      {t.label}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </main>

      <PremiumNav />
    </div>
  );
}

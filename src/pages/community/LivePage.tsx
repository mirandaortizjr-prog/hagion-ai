import { CommunityHeader } from "@/components/community/CommunityHeader";
import { PremiumNav } from "@/components/PremiumNav";
import { Radio } from "lucide-react";

export default function LivePage() {
  return (
    <div className="min-h-screen text-white">
      <main className="px-5 sm:px-8 pb-32 max-w-3xl mx-auto">
        <CommunityHeader title="Live" subtitle="Live streams from the community." />

        <div className="mt-6 rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.7)] p-10 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-16 h-16 rounded-full bg-white/10 ring-1 ring-white/20 flex items-center justify-center">
            <Radio className="w-7 h-7 text-white/80" />
          </div>
          <h2 className="text-lg font-playfair tracking-wide">No live streams yet</h2>
          <p className="text-sm text-white/60 max-w-sm">
            Live sermons, prayer sessions, and worship streams will appear here when they go live.
          </p>
        </div>
      </main>

      <PremiumNav />
    </div>
  );
}

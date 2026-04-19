import { CommunityHeader } from "@/components/community/CommunityHeader";
import { PremiumNav } from "@/components/PremiumNav";
import { Video } from "lucide-react";

export default function VideosPage() {
  return (
    <div className="min-h-screen text-white">
      <main className="px-5 sm:px-8 pb-32 max-w-3xl mx-auto">
        <CommunityHeader title="Videos" subtitle="Long-form videos from the community." />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-video rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] flex items-center justify-center"
            >
              <Video className="w-8 h-8 text-white/40" />
            </div>
          ))}
        </div>
      </main>

      <PremiumNav />
    </div>
  );
}

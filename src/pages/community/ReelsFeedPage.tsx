import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Volume2,
  VolumeX,
  Play,
  MoreHorizontal,
  Sparkles,
  Music2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import VideoUploadSheet from "@/components/community/VideoUploadSheet";

interface Reel {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  author_name: string | null;
  like_count: number;
  view_count: number;
  created_at: string;
}

const formatCount = (n: number) => {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return (n / 1000).toFixed(n < 10_000 ? 1 : 0) + "K";
  return (n / 1_000_000).toFixed(1) + "M";
};

const SAMPLE_REELS: Reel[] = [
  {
    id: "sample-0",
    user_id: "sample",
    title: "For God so loved the world.",
    description:
      "John 3:16 — that He gave His one and only Son, that whoever believes in Him shall not perish but have eternal life.",
    video_url: "/demo-reels/john316.mp4",
    thumbnail_url: null,
    author_name: "hagion",
    like_count: 3420,
    view_count: 58200,
    created_at: new Date().toISOString(),
  },
  {
    id: "sample-1",
    user_id: "sample",
    title: "Be still and know that I am God.",
    description: "Psalm 46:10 — A breath of stillness for your day.",
    video_url: "/demo-reels/bestill.mp4",
    thumbnail_url: null,
    author_name: "hagion",
    like_count: 1284,
    view_count: 22400,
    created_at: new Date().toISOString(),
  },
  {
    id: "sample-2",
    user_id: "sample",
    title: "Light shines in the darkness.",
    description: "John 1:5 — and the darkness has not overcome it.",
    video_url: "/demo-reels/light.mp4",
    thumbnail_url: null,
    author_name: "scripture_daily",
    like_count: 902,
    view_count: 15800,
    created_at: new Date().toISOString(),
  },
  {
    id: "sample-3",
    user_id: "sample",
    title: "He restores my soul.",
    description: "Psalm 23:3 — green pastures, still waters, peace.",
    video_url: "/demo-reels/restores.mp4",
    thumbnail_url: null,
    author_name: "stillwaters",
    like_count: 2105,
    view_count: 41200,
    created_at: new Date().toISOString(),
  },
];

export default function ReelsFeedPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [paused, setPaused] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [liked, setLiked] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem("reels_liked") || "[]")); } catch { return new Set(); }
  });
  const [saved, setSaved] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem("reels_saved") || "[]")); } catch { return new Set(); }
  });
  const [showHeart, setShowHeart] = useState<Record<string, number>>({});
  const [uploadOpen, setUploadOpen] = useState(false);
  const [commentsFor, setCommentsFor] = useState<Reel | null>(null);
  const lastTapRef = useRef<Record<string, number>>({});

  useEffect(() => {
    localStorage.setItem("reels_liked", JSON.stringify([...liked]));
  }, [liked]);
  useEffect(() => {
    localStorage.setItem("reels_saved", JSON.stringify([...saved]));
  }, [saved]);

  const handleBack = useCallback(() => {
    navigate("/community", { replace: true });
  }, [navigate]);

  const loadReels = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("reels")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      let list = (data as Reel[]) || [];
      if (list.length === 0) list = SAMPLE_REELS;
      setReels(list);
      if (list.length) setActiveId((prev) => prev ?? list[0].id);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReels();
  }, [loadReels]);

  useEffect(() => {
    const onPopState = () => handleBack();
    window.history.pushState({ reelsFeed: true }, "", window.location.href);
    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, [handleBack]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const listener = CapacitorApp.addListener("backButton", () => {
      handleBack();
    });

    return () => {
      listener.then((l) => l.remove());
    };
  }, [handleBack]);

  useEffect(() => {
    if (!containerRef.current || reels.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = (entry.target as HTMLElement).dataset.reelId;
          if (!id) return;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.65) {
            setActiveId(id);
          }
        });
      },
      {
        root: containerRef.current,
        threshold: [0.65],
      },
    );
    const els = containerRef.current.querySelectorAll("[data-reel-id]");
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [reels]);

  useEffect(() => {
    videoRefs.current.forEach((video, id) => {
      if (id === activeId) {
        video.muted = muted;
        if (!paused[id]) {
          const playPromise = video.play();
          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(() => {});
          }
        } else {
          video.pause();
        }
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, [activeId, muted, paused]);

  useEffect(() => {
    return () => {
      videoRefs.current.forEach((video) => {
        video.pause();
        video.currentTime = 0;
      });
    };
  }, []);

  const handleTap = (reel: Reel) => {
    const now = Date.now();
    const last = lastTapRef.current[reel.id] || 0;
    if (now - last < 280) {
      handleLike(reel, true);
      setShowHeart((s) => ({ ...s, [reel.id]: now }));
      setTimeout(() => {
        setShowHeart((s) => {
          if (s[reel.id] === now) {
            const n = { ...s };
            delete n[reel.id];
            return n;
          }
          return s;
        });
      }, 900);
      lastTapRef.current[reel.id] = 0;
    } else {
      lastTapRef.current[reel.id] = now;
      setTimeout(() => {
        if (lastTapRef.current[reel.id] === now) {
          setPaused((p) => ({ ...p, [reel.id]: !p[reel.id] }));
        }
      }, 280);
    }
  };

  const handleLike = (reel: Reel, force = false) => {
    setLiked((s) => {
      const n = new Set(s);
      if (force) {
        n.add(reel.id);
      } else {
        if (n.has(reel.id)) n.delete(reel.id);
        else n.add(reel.id);
      }
      return n;
    });
  };

  const handleSave = (reel: Reel) => {
    setSaved((s) => {
      const n = new Set(s);
      if (n.has(reel.id)) n.delete(reel.id);
      else n.add(reel.id);
      return n;
    });
    toast({ title: saved.has(reel.id) ? "Removed from saved" : "Saved" });
  };

  const handleShare = async (reel: Reel) => {
    const url = `${window.location.origin}/community/reels/feed#${reel.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: reel.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast({ title: "Link copied" });
      }
    } catch {}
  };

  const handlePlaybackError = useCallback(
    (title: string) => {
      toast({
        title: "Video unavailable",
        description: `${title} could not be played.`,
      });
    },
    [toast],
  );

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden">
      <div className="absolute top-0 inset-x-0 z-30 pointer-events-none">
        <div className="h-32 bg-gradient-to-b from-black/80 via-black/40 to-transparent" />
      </div>
      <header className="absolute top-0 inset-x-0 z-40 flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top),12px)] pb-3">
        <button
          onClick={handleBack}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/15 flex items-center justify-center hover:bg-white/15 active:scale-95 transition"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-white/80" />
          <h1 className="font-playfair text-lg tracking-tight">Reels</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setUploadOpen(true)}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/15 flex items-center justify-center hover:bg-white/15 active:scale-95 transition"
            aria-label="Upload reel"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMuted((m) => !m)}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/15 flex items-center justify-center hover:bg-white/15 active:scale-95 transition"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center text-white/60">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/55">
              Loading reels
            </div>
          </div>
        </div>
      ) : reels.length === 0 ? (
        <EmptyState onBack={handleBack} />
      ) : (
        <div
          ref={containerRef}
          className="absolute inset-0 overflow-y-scroll snap-y snap-mandatory scrollbar-none"
          style={{ scrollSnapType: "y mandatory" }}
        >
          {reels.map((reel) => (
            <ReelItem
              key={reel.id}
              reel={reel}
              isActive={reel.id === activeId}
              muted={muted}
              paused={!!paused[reel.id]}
              liked={liked.has(reel.id)}
              saved={saved.has(reel.id)}
              progress={progress[reel.id] || 0}
              showHeart={!!showHeart[reel.id]}
              onTap={() => handleTap(reel)}
              onLike={() => handleLike(reel)}
              onSave={() => handleSave(reel)}
              onShare={() => handleShare(reel)}
              onComment={() => toast({ title: "Comments coming soon" })}
              onMore={() => toast({ title: "More options coming soon" })}
              onPlaybackError={() => handlePlaybackError(reel.title)}
              registerVideo={(el) => {
                if (el) videoRefs.current.set(reel.id, el);
                else videoRefs.current.delete(reel.id);
              }}
              onProgress={(p) =>
                setProgress((prev) =>
                  Math.abs((prev[reel.id] || 0) - p) > 0.01
                    ? { ...prev, [reel.id]: p }
                    : prev,
                )
              }
            />
          ))}
        </div>
      )}

      <VideoUploadSheet
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        kind="reel"
        onUploaded={loadReels}
      />
    </div>
  );
}

interface ReelItemProps {
  reel: Reel;
  isActive: boolean;
  muted: boolean;
  paused: boolean;
  liked: boolean;
  saved: boolean;
  progress: number;
  showHeart: boolean;
  onTap: () => void;
  onLike: () => void;
  onSave: () => void;
  onShare: () => void;
  onComment: () => void;
  onMore: () => void;
  onPlaybackError: () => void;
  registerVideo: (el: HTMLVideoElement | null) => void;
  onProgress: (p: number) => void;
}

function ReelItem({
  reel,
  isActive,
  muted,
  paused,
  liked,
  saved,
  progress,
  showHeart,
  onTap,
  onLike,
  onSave,
  onShare,
  onComment,
  onMore,
  onPlaybackError,
  registerVideo,
  onProgress,
}: ReelItemProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [expanded, setExpanded] = useState(false);

  const initial = (reel.author_name || "?").charAt(0).toUpperCase();

  return (
    <section
      data-reel-id={reel.id}
      className="relative w-full h-[100dvh] snap-start overflow-hidden bg-black"
    >
      <video
        ref={(el) => {
          videoRef.current = el;
          registerVideo(el);
        }}
        src={reel.video_url}
        poster={reel.thumbnail_url || undefined}
        loop
        muted={muted}
        playsInline
        autoPlay={isActive && !paused}
        preload={isActive ? "auto" : "metadata"}
        onClick={onTap}
        onLoadedData={(e) => {
          const video = e.currentTarget;
          if (isActive && !paused) {
            const playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
              playPromise.catch(() => {});
            }
          }
        }}
        onError={onPlaybackError}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          if (v.duration > 0) onProgress(v.currentTime / v.duration);
        }}
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_55%,rgba(0,0,0,0.55)_100%)]" />
      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-72 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

      {paused && isActive && (
        <button
          onClick={onTap}
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/20"
          aria-label="Play"
        >
          <div className="w-20 h-20 rounded-full bg-white/15 backdrop-blur-xl ring-1 ring-white/30 flex items-center justify-center animate-fade-in">
            <Play className="w-9 h-9 text-white fill-white" />
          </div>
        </button>
      )}

      {showHeart && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <Heart
            className="w-32 h-32 text-white drop-shadow-[0_0_24px_rgba(255,80,120,0.7)] fill-rose-500"
            style={{
              animation: "heartPop 900ms cubic-bezier(0.2,0.9,0.3,1.2) forwards",
            }}
          />
        </div>
      )}

      <div
        className="absolute right-3 z-30 flex flex-col items-center gap-5"
        style={{ bottom: "max(calc(env(safe-area-inset-bottom) + 20px), 20px)" }}
      >
        <ActionButton
          icon={Heart}
          active={liked}
          activeColor="rose"
          label={formatCount((reel.like_count || 0) + (liked ? 1 : 0))}
          onClick={onLike}
        />
        <ActionButton
          icon={MessageCircle}
          label="Chat"
          onClick={onComment}
        />
        <ActionButton
          icon={Share2}
          label="Share"
          onClick={onShare}
        />
        <ActionButton
          icon={Bookmark}
          active={saved}
          label={saved ? "Saved" : "Save"}
          onClick={onSave}
        />
        <ActionButton icon={MoreHorizontal} label="" onClick={onMore} />

        <div className="relative mt-1">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-white/35 via-white/15 to-white/5 ring-2 ring-white/40 flex items-center justify-center overflow-hidden">
            <span className="font-playfair text-base text-white">{initial}</span>
          </div>
          <button
            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-rose-500 ring-2 ring-black flex items-center justify-center active:scale-90 transition"
            aria-label="Follow"
          >
            <Plus className="w-3 h-3 text-white" strokeWidth={3} />
          </button>
        </div>
      </div>

      <div className="absolute left-0 right-20 bottom-0 z-30 px-5 pb-7 pt-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="text-sm font-medium text-white">
            @{reel.author_name || "anonymous"}
          </div>
          <span className="w-1 h-1 rounded-full bg-white/40" />
          <button className="text-[11px] uppercase tracking-[0.18em] text-white/85 border border-white/30 rounded-full px-2.5 py-0.5 active:scale-95 transition">
            Follow
          </button>
        </div>
        {reel.title && (
          <h3 className="font-playfair text-[19px] leading-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)] mb-1.5">
            {reel.title}
          </h3>
        )}
        {reel.description && (
          <p
            className={cn(
              "text-[13px] text-white/80 leading-relaxed",
              !expanded && "line-clamp-2",
            )}
            onClick={() => setExpanded((e) => !e)}
          >
            {reel.description}
          </p>
        )}
        <div className="mt-3 flex items-center gap-2 text-[11px] text-white/70">
          <Music2 className="w-3 h-3" />
          <div className="overflow-hidden whitespace-nowrap">
            <div className="inline-block animate-[marquee_18s_linear_infinite] pr-12">
              Original audio · {reel.author_name || "Unknown"} · Hagion
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 z-30 h-[3px] bg-white/10">
        <div
          className="h-full bg-gradient-to-r from-white via-white to-white/80"
          style={{ width: `${Math.min(100, progress * 100)}%` }}
        />
      </div>

      <style>{`
        @keyframes heartPop {
          0% { transform: scale(0.4); opacity: 0; }
          25% { transform: scale(1.15); opacity: 1; }
          60% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.2); opacity: 0; }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { scrollbar-width: none; }
      `}</style>
    </section>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  active,
  activeColor,
}: {
  icon: any;
  label: string;
  onClick: () => void;
  active?: boolean;
  activeColor?: "rose";
}) {
  const isRose = active && activeColor === "rose";
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 active:scale-90 transition"
    >
      <div
        className={cn(
          "w-11 h-11 rounded-full backdrop-blur-xl ring-1 flex items-center justify-center transition",
          active
            ? "bg-white/20 ring-white/40"
            : "bg-white/10 ring-white/15 hover:bg-white/15",
        )}
      >
        <Icon
          className={cn(
            "w-[22px] h-[22px] transition",
            isRose
              ? "text-rose-500 fill-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.7)]"
              : active
                ? "text-white fill-white"
                : "text-white",
          )}
        />
      </div>
      {label && (
        <div className="text-[10px] font-medium text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
          {label}
        </div>
      )}
    </button>
  );
}

function EmptyState({ onBack }: { onBack: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-white/20 via-white/10 to-white/5 ring-1 ring-white/20 flex items-center justify-center mb-5">
        <Sparkles className="w-9 h-9 text-white/80" />
      </div>
      <h2 className="font-playfair text-2xl mb-2">No reels yet</h2>
      <p className="text-white/55 text-[14px] max-w-xs leading-relaxed mb-6">
        Be the first to share a short, sacred moment with the community.
      </p>
      <Button
        onClick={onBack}
        className="rounded-full h-11 px-6 bg-gradient-to-b from-white to-white/85 text-black hover:from-white hover:to-white/95"
      >
        Go Back
      </Button>
    </div>
  );
}

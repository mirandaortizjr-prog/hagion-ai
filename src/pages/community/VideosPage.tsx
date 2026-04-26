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
  Pause,
  MoreHorizontal,
  Sparkles,
  Plus,
  Film,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import VideoUploadSheet from "@/components/community/VideoUploadSheet";
import MediaCommentsSheet from "@/components/community/MediaCommentsSheet";
import MediaMoreSheet from "@/components/community/MediaMoreSheet";
import MediaSearchSheet from "@/components/community/MediaSearchSheet";

interface VideoItem {
  id: string;
  user_id: string | null;
  title: string;
  description: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  author_name: string;
  view_count: number;
  duration_seconds: number | null;
  created_at: string;
}

const formatCount = (n: number) => {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return (n / 1000).toFixed(n < 10_000 ? 1 : 0) + "K";
  return (n / 1_000_000).toFixed(1) + "M";
};

const formatTime = (s: number) => {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

const SAMPLE_VIDEOS: VideoItem[] = [
  {
    id: "sample-v-0",
    user_id: null,
    title: "The Weight of Glory — A Sermon on Eternal Hope",
    description:
      "A long-form teaching on 2 Corinthians 4. We explore suffering, perseverance, and the unseen weight of glory awaiting those who endure in Christ.",
    video_url: "/demo-reels/john316.mp4",
    thumbnail_url: null,
    author_name: "Hagion Teachings",
    view_count: 18420,
    duration_seconds: 1820,
    created_at: new Date().toISOString(),
  },
  {
    id: "sample-v-1",
    user_id: null,
    title: "Walking in the Spirit — Full Study",
    description:
      "Galatians 5 unpacked verse by verse. Learn how to discern the flesh from the Spirit and live a life shaped by grace and truth.",
    video_url: "/demo-reels/bestill.mp4",
    thumbnail_url: null,
    author_name: "Scripture Daily",
    view_count: 9210,
    duration_seconds: 2450,
    created_at: new Date().toISOString(),
  },
  {
    id: "sample-v-2",
    user_id: null,
    title: "Light in the Darkness — A Theological Reflection",
    description:
      "On John 1:5 — the cosmic confrontation between light and darkness, and what it means for the believer today.",
    video_url: "/demo-reels/light.mp4",
    thumbnail_url: null,
    author_name: "Still Waters",
    view_count: 4320,
    duration_seconds: 1180,
    created_at: new Date().toISOString(),
  },
];

export default function VideosPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [paused, setPaused] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [currentTime, setCurrentTime] = useState<Record<string, number>>({});
  const [duration, setDuration] = useState<Record<string, number>>({});
  const [liked, setLiked] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem("videos_liked") || "[]")); } catch { return new Set(); }
  });
  const [saved, setSaved] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem("videos_saved") || "[]")); } catch { return new Set(); }
  });
  const [uploadOpen, setUploadOpen] = useState(false);
  const [commentsFor, setCommentsFor] = useState<VideoItem | null>(null);
  const [moreFor, setMoreFor] = useState<VideoItem | null>(null);

  useEffect(() => {
    localStorage.setItem("videos_liked", JSON.stringify([...liked]));
  }, [liked]);
  useEffect(() => {
    localStorage.setItem("videos_saved", JSON.stringify([...saved]));
  }, [saved]);

  const handleBack = useCallback(() => {
    navigate("/community", { replace: true });
  }, [navigate]);

  const loadVideos = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("teachings")
        .select("*")
        .not("video_url", "is", null)
        .order("created_at", { ascending: false })
        .limit(50);

      let list = (data as VideoItem[]) || [];
      if (list.length === 0) list = SAMPLE_VIDEOS;
      setVideos(list);
      if (list.length) setActiveId((prev) => prev ?? list[0].id);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  useEffect(() => {
    const onPopState = () => handleBack();
    window.history.pushState({ videosFeed: true }, "", window.location.href);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [handleBack]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const listener = CapacitorApp.addListener("backButton", () => handleBack());
    return () => {
      listener.then((l) => l.remove());
    };
  }, [handleBack]);

  useEffect(() => {
    if (!containerRef.current || videos.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = (entry.target as HTMLElement).dataset.videoId;
          if (!id) return;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.65) {
            setActiveId(id);
          }
        });
      },
      { root: containerRef.current, threshold: [0.65] },
    );
    const els = containerRef.current.querySelectorAll("[data-video-id]");
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [videos]);

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
    const stopAll = () => {
      videoRefs.current.forEach((video) => {
        try {
          video.pause();
          video.removeAttribute("src");
          video.load();
        } catch {}
      });
    };
    const onVisibility = () => {
      if (document.hidden) {
        videoRefs.current.forEach((v) => {
          try { v.pause(); } catch {}
        });
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", stopAll);
    window.addEventListener("blur", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", stopAll);
      window.removeEventListener("blur", onVisibility);
      stopAll();
      videoRefs.current.clear();
    };
  }, []);

  const handleLike = (v: VideoItem) => {
    setLiked((s) => {
      const n = new Set(s);
      if (n.has(v.id)) n.delete(v.id);
      else n.add(v.id);
      return n;
    });
  };

  const handleSave = (v: VideoItem) => {
    const wasSaved = saved.has(v.id);
    setSaved((s) => {
      const n = new Set(s);
      if (wasSaved) n.delete(v.id);
      else n.add(v.id);
      return n;
    });
    toast({
      title: wasSaved ? "Removed from saved" : "Saved to your collection",
      description: wasSaved ? undefined : "View under Profile › Saved",
    });
  };

  const handleShare = async (v: VideoItem) => {
    const url = `${window.location.origin}/community/videos#${v.id}`;
    const shareData = { title: v.title, text: v.description || v.title, url };
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share(shareData);
        return;
      } catch (err: any) {
        if (err?.name === "AbortError") return;
      }
    }
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        toast({ title: "Link copied", description: url });
        return;
      }
    } catch {}
    try {
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      toast({ title: "Link copied", description: url });
    } catch {
      toast({ title: "Share link", description: url });
    }
  };

  const handleSeek = (id: string, ratio: number) => {
    const video = videoRefs.current.get(id);
    if (!video || !video.duration) return;
    video.currentTime = video.duration * Math.min(1, Math.max(0, ratio));
  };

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
          {/* title removed per design */}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setUploadOpen(true)}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/15 flex items-center justify-center hover:bg-white/15 active:scale-95 transition"
            aria-label="Upload teaching"
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
              Loading videos
            </div>
          </div>
        </div>
      ) : videos.length === 0 ? (
        <EmptyState onBack={handleBack} />
      ) : (
        <div
          ref={containerRef}
          className="absolute inset-0 overflow-y-scroll snap-y snap-mandatory scrollbar-none"
          style={{ scrollSnapType: "y mandatory" }}
        >
          {videos.map((v) => (
            <VideoFeedItem
              key={v.id}
              video={v}
              isActive={v.id === activeId}
              muted={muted}
              paused={!!paused[v.id]}
              liked={liked.has(v.id)}
              saved={saved.has(v.id)}
              progress={progress[v.id] || 0}
              currentTime={currentTime[v.id] || 0}
              duration={duration[v.id] || v.duration_seconds || 0}
              onTogglePause={() =>
                setPaused((p) => ({ ...p, [v.id]: !p[v.id] }))
              }
              onLike={() => handleLike(v)}
              onSave={() => handleSave(v)}
              onShare={() => handleShare(v)}
              onComment={() => setCommentsFor(v)}
              onMore={() => setMoreFor(v)}
              onFollow={() => toast({ title: `Following @${v.author_name || "user"}` })}
              onSeek={(r) => handleSeek(v.id, r)}
              registerVideo={(el) => {
                if (el) videoRefs.current.set(v.id, el);
                else videoRefs.current.delete(v.id);
              }}
              onProgress={(p, ct, d) => {
                setProgress((prev) =>
                  Math.abs((prev[v.id] || 0) - p) > 0.005
                    ? { ...prev, [v.id]: p }
                    : prev,
                );
                setCurrentTime((prev) =>
                  Math.abs((prev[v.id] || 0) - ct) > 0.5
                    ? { ...prev, [v.id]: ct }
                    : prev,
                );
                if (d && d !== duration[v.id]) {
                  setDuration((prev) => ({ ...prev, [v.id]: d }));
                }
              }}
              onPlaybackError={() =>
                toast({
                  title: "Video unavailable",
                  description: `${v.title} could not be played.`,
                })
              }
            />
          ))}
        </div>
      )}

      <VideoUploadSheet
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        kind="teaching"
        onUploaded={loadVideos}
      />
      <MediaCommentsSheet
        open={!!commentsFor}
        mediaId={commentsFor?.id || null}
        title={commentsFor?.title}
        onClose={() => setCommentsFor(null)}
      />
      <MediaMoreSheet
        open={!!moreFor}
        shareUrl={moreFor ? `${window.location.origin}/community/videos#${moreFor.id}` : undefined}
        videoUrl={moreFor?.video_url || undefined}
        onClose={() => setMoreFor(null)}
      />
    </div>
  );
}

interface VideoFeedItemProps {
  video: VideoItem;
  isActive: boolean;
  muted: boolean;
  paused: boolean;
  liked: boolean;
  saved: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  onTogglePause: () => void;
  onLike: () => void;
  onSave: () => void;
  onShare: () => void;
  onComment: () => void;
  onMore: () => void;
  onFollow: () => void;
  onSeek: (ratio: number) => void;
  onPlaybackError: () => void;
  registerVideo: (el: HTMLVideoElement | null) => void;
  onProgress: (p: number, currentTime: number, duration: number) => void;
}

function VideoFeedItem({
  video,
  isActive,
  muted,
  paused,
  liked,
  saved,
  progress,
  currentTime,
  duration,
  onTogglePause,
  onLike,
  onSave,
  onShare,
  onComment,
  onMore,
  onFollow,
  onSeek,
  onPlaybackError,
  registerVideo,
  onProgress,
}: VideoFeedItemProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  const initial = (video.author_name || "?").charAt(0).toUpperCase();

  return (
    <section
      data-video-id={video.id}
      className="relative w-full h-[100dvh] snap-start overflow-hidden bg-black"
    >
      {video.video_url ? (
        <video
          ref={(el) => {
            videoRef.current = el;
            registerVideo(el);
          }}
          src={video.video_url}
          poster={video.thumbnail_url || undefined}
          muted={muted}
          playsInline
          autoPlay={isActive && !paused}
          preload={isActive ? "auto" : "metadata"}
          onClick={onTogglePause}
          onLoadedMetadata={(e) => {
            const v = e.currentTarget;
            onProgress(0, 0, v.duration || 0);
          }}
          onError={onPlaybackError}
          onTimeUpdate={(e) => {
            const v = e.currentTarget;
            const p = v.duration > 0 ? v.currentTime / v.duration : 0;
            onProgress(p, v.currentTime, v.duration || 0);
          }}
          className="absolute inset-0 w-full h-full object-contain"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent">
          <Film className="w-16 h-16 text-white/30" />
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_60%,rgba(0,0,0,0.55)_100%)]" />
      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-72 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

      {paused && isActive && (
        <button
          onClick={onTogglePause}
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/20"
          aria-label="Play"
        >
          <div className="w-20 h-20 rounded-full bg-white/15 backdrop-blur-xl ring-1 ring-white/30 flex items-center justify-center animate-fade-in">
            <Play className="w-9 h-9 text-white fill-white" />
          </div>
        </button>
      )}

      <div
        className="absolute right-3 z-30 flex flex-col items-center gap-5"
        style={{ bottom: "max(calc(env(safe-area-inset-bottom) + 56px), 56px)" }}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <ActionButton
          icon={Heart}
          active={liked}
          activeColor="rose"
          label={formatCount((liked ? 1 : 0))}
          onClick={onLike}
        />
        <ActionButton icon={MessageCircle} label="Chat" onClick={onComment} />
        <ActionButton icon={Share2} label="Share" onClick={onShare} />
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
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onFollow();
            }}
            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-rose-500 ring-2 ring-black flex items-center justify-center active:scale-90 transition cursor-pointer"
            aria-label="Follow"
          >
            <Plus className="w-3 h-3 text-white" strokeWidth={3} />
          </button>
        </div>
      </div>

      <div className="absolute left-0 right-20 bottom-0 z-30 px-5 pb-12 pt-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="text-sm font-medium text-white">
            @{video.author_name || "anonymous"}
          </div>
          <span className="w-1 h-1 rounded-full bg-white/40" />
          <button className="text-[11px] uppercase tracking-[0.18em] text-white/85 border border-white/30 rounded-full px-2.5 py-0.5 active:scale-95 transition">
            Follow
          </button>
          <span className="ml-auto text-[10px] uppercase tracking-[0.18em] text-white/60">
            {formatCount(video.view_count || 0)} views
          </span>
        </div>
        {video.title && (
          <h3 className="font-playfair text-[15px] leading-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)] mb-1">
            {video.title}
          </h3>
        )}
        {video.description && (
          <p
            className={cn(
              "text-[11px] text-white/75 leading-snug",
              !expanded && "line-clamp-2",
            )}
            onClick={() => setExpanded((e) => !e)}
          >
            {video.description}
          </p>
        )}
      </div>

      {/* Scrubber */}
      <div className="absolute bottom-0 inset-x-0 z-30 px-4 pb-2">
        <div className="flex items-center gap-2 text-[10px] tabular-nums text-white/80">
          <button
            onClick={onTogglePause}
            className="w-6 h-6 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
            aria-label={paused ? "Play" : "Pause"}
          >
            {paused ? (
              <Play className="w-3 h-3 fill-white text-white" />
            ) : (
              <Pause className="w-3 h-3 fill-white text-white" />
            )}
          </button>
          <span>{formatTime(currentTime)}</span>
          <ScrubBar progress={progress} onSeek={onSeek} />
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <style>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { scrollbar-width: none; }
      `}</style>
    </section>
  );
}

function ScrubBar({
  progress,
  onSeek,
}: {
  progress: number;
  onSeek: (ratio: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const handle = (clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    onSeek(ratio);
  };
  return (
    <div
      ref={ref}
      className="flex-1 h-3 flex items-center cursor-pointer touch-none"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        handle(e.clientX);
      }}
      onPointerMove={(e) => {
        if (e.buttons === 1) handle(e.clientX);
      }}
    >
      <div className="relative w-full h-[3px] rounded-full bg-white/15 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-white via-white to-white/80"
          style={{ width: `${Math.min(100, progress * 100)}%` }}
        />
      </div>
    </div>
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
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onClick();
      }}
      onPointerDown={(e) => e.stopPropagation()}
      className="flex flex-col items-center gap-1 active:scale-90 transition cursor-pointer select-none"
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
        <Film className="w-9 h-9 text-white/80" />
      </div>
      <h2 className="font-playfair text-2xl mb-2">No videos yet</h2>
      <p className="text-white/55 text-[14px] max-w-xs leading-relaxed mb-6">
        Long-form teachings and sermons from the community will appear here.
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

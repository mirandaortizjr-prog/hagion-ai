import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import {
  ArrowLeft,
  Heart,
  Share2,
  Volume2,
  VolumeX,
  MoreHorizontal,
  Plus,
  Radio,
  Send,
  Users,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface LiveStream {
  id: string;
  user_id: string | null;
  title: string;
  description: string | null;
  stream_url: string | null;
  thumbnail_url: string | null;
  author_name: string;
  viewer_count: number;
  started_at: string;
}

interface ChatMessage {
  id: string;
  author: string;
  content: string;
  ts: number;
  isMine?: boolean;
  isSystem?: boolean;
}

const formatCount = (n: number) => {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return (n / 1000).toFixed(n < 10_000 ? 1 : 0) + "K";
  return (n / 1_000_000).toFixed(1) + "M";
};

const SAMPLE_LIVES: LiveStream[] = [
  {
    id: "live-0",
    user_id: null,
    title: "Sunday Worship — Live from Grace Chapel",
    description:
      "Join us for live worship, prayer, and the Word. All are welcome to gather around the throne of grace.",
    stream_url: "/demo-reels/john316.mp4",
    thumbnail_url: null,
    author_name: "Grace Chapel",
    viewer_count: 1284,
    started_at: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
  },
  {
    id: "live-1",
    user_id: null,
    title: "Midnight Prayer Watch",
    description:
      "Interceding together for revival, the persecuted Church, and the lost. Come, pray with us.",
    stream_url: "/demo-reels/bestill.mp4",
    thumbnail_url: null,
    author_name: "Watchmen Prayer",
    viewer_count: 432,
    started_at: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
  },
  {
    id: "live-2",
    user_id: null,
    title: "Bible Study — Romans 8 Verse by Verse",
    description: "Live teaching with Q&A. Bring your Bible and your questions.",
    stream_url: "/demo-reels/light.mp4",
    thumbnail_url: null,
    author_name: "Hagion Teachings",
    viewer_count: 962,
    started_at: new Date(Date.now() - 1000 * 60 * 41).toISOString(),
  },
];

const SAMPLE_CHAT: ChatMessage[] = [
  { id: "c0", author: "Naomi", content: "Amen 🙏", ts: Date.now() - 30000 },
  { id: "c1", author: "Daniel", content: "Joining from Manila!", ts: Date.now() - 22000 },
  { id: "c2", author: "Hannah", content: "He is faithful.", ts: Date.now() - 14000 },
  { id: "c3", author: "Eli", content: "Praying for my family right now.", ts: Date.now() - 6000 },
];

const elapsed = (iso: string) => {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  return `${m}m`;
};

export default function LivePage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [muted, setMuted] = useState(true);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [hearts, setHearts] = useState<{ id: number; left: number }[]>([]);
  const [chats, setChats] = useState<Record<string, ChatMessage[]>>({});
  const [draft, setDraft] = useState("");

  const handleBack = useCallback(() => {
    navigate("/community", { replace: true });
  }, [navigate]);

  useEffect(() => {
    // No live_streams table yet — use sample data so the experience is fully featured.
    const list = SAMPLE_LIVES;
    setStreams(list);
    setActiveId(list[0]?.id ?? null);
    const initialChats: Record<string, ChatMessage[]> = {};
    list.forEach((s) => (initialChats[s.id] = [...SAMPLE_CHAT]));
    setChats(initialChats);
    setLoading(false);
  }, []);

  useEffect(() => {
    const onPopState = () => handleBack();
    window.history.pushState({ liveFeed: true }, "", window.location.href);
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
    if (!containerRef.current || streams.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = (entry.target as HTMLElement).dataset.liveId;
          if (!id) return;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.65) {
            setActiveId(id);
          }
        });
      },
      { root: containerRef.current, threshold: [0.65] },
    );
    const els = containerRef.current.querySelectorAll("[data-live-id]");
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [streams]);

  useEffect(() => {
    videoRefs.current.forEach((video, id) => {
      if (id === activeId) {
        video.muted = muted;
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {});
        }
      } else {
        video.pause();
      }
    });
  }, [activeId, muted]);

  // Simulate ambient chat activity for realism.
  useEffect(() => {
    if (!activeId) return;
    const lines = [
      "Glory to God!",
      "Hallelujah",
      "Praying with you",
      "So good 🙌",
      "Tuning in from Brazil",
      "This word is for me today",
      "Amen",
    ];
    const names = ["Sarah", "John", "Ruth", "Peter", "Esther", "Mark"];
    const t = setInterval(() => {
      const msg: ChatMessage = {
        id: `auto-${Date.now()}`,
        author: names[Math.floor(Math.random() * names.length)],
        content: lines[Math.floor(Math.random() * lines.length)],
        ts: Date.now(),
      };
      setChats((c) => ({
        ...c,
        [activeId]: [...(c[activeId] || []), msg].slice(-30),
      }));
    }, 3500);
    return () => clearInterval(t);
  }, [activeId]);

  useEffect(() => {
    return () => {
      videoRefs.current.forEach((video) => {
        video.pause();
        video.currentTime = 0;
      });
    };
  }, []);

  const sendHeart = (sid: string) => {
    setLiked((s) => new Set(s).add(sid));
    const id = Date.now() + Math.random();
    const left = 30 + Math.random() * 40;
    setHearts((h) => [...h, { id, left }]);
    setTimeout(() => setHearts((h) => h.filter((x) => x.id !== id)), 2200);
  };

  const sendChat = (sid: string) => {
    if (!draft.trim()) return;
    const msg: ChatMessage = {
      id: `me-${Date.now()}`,
      author: "You",
      content: draft.trim(),
      ts: Date.now(),
      isMine: true,
    };
    setChats((c) => ({ ...c, [sid]: [...(c[sid] || []), msg].slice(-30) }));
    setDraft("");
  };

  const handleShare = async (s: LiveStream) => {
    const url = `${window.location.origin}/community/live#${s.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: s.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast({ title: "Link copied" });
      }
    } catch {}
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
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
          </span>
          <h1 className="font-playfair text-lg tracking-tight">Live</h1>
        </div>
        <button
          onClick={() => setMuted((m) => !m)}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/15 flex items-center justify-center hover:bg-white/15 active:scale-95 transition"
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </header>

      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center text-white/60">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/55">
              Loading live streams
            </div>
          </div>
        </div>
      ) : streams.length === 0 ? (
        <EmptyState onBack={handleBack} />
      ) : (
        <div
          ref={containerRef}
          className="absolute inset-0 overflow-y-scroll snap-y snap-mandatory scrollbar-none"
          style={{ scrollSnapType: "y mandatory" }}
        >
          {streams.map((s) => (
            <LiveStreamItem
              key={s.id}
              stream={s}
              isActive={s.id === activeId}
              muted={muted}
              liked={liked.has(s.id)}
              chat={chats[s.id] || []}
              hearts={s.id === activeId ? hearts : []}
              draft={s.id === activeId ? draft : ""}
              onDraftChange={setDraft}
              onSendChat={() => sendChat(s.id)}
              onHeart={() => sendHeart(s.id)}
              onShare={() => handleShare(s)}
              onMore={() => toast({ title: "More options coming soon" })}
              registerVideo={(el) => {
                if (el) videoRefs.current.set(s.id, el);
                else videoRefs.current.delete(s.id);
              }}
              onPlaybackError={() =>
                toast({
                  title: "Stream unavailable",
                  description: `${s.title} is offline.`,
                })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface LiveStreamItemProps {
  stream: LiveStream;
  isActive: boolean;
  muted: boolean;
  liked: boolean;
  chat: ChatMessage[];
  hearts: { id: number; left: number }[];
  draft: string;
  onDraftChange: (v: string) => void;
  onSendChat: () => void;
  onHeart: () => void;
  onShare: () => void;
  onMore: () => void;
  registerVideo: (el: HTMLVideoElement | null) => void;
  onPlaybackError: () => void;
}

function LiveStreamItem({
  stream,
  isActive,
  muted,
  liked,
  chat,
  hearts,
  draft,
  onDraftChange,
  onSendChat,
  onHeart,
  onShare,
  onMore,
  registerVideo,
  onPlaybackError,
}: LiveStreamItemProps) {
  const initial = (stream.author_name || "?").charAt(0).toUpperCase();

  return (
    <section
      data-live-id={stream.id}
      className="relative w-full h-[100dvh] snap-start overflow-hidden bg-black"
    >
      {stream.stream_url ? (
        <video
          ref={(el) => registerVideo(el)}
          src={stream.stream_url}
          poster={stream.thumbnail_url || undefined}
          loop
          muted={muted}
          playsInline
          autoPlay={isActive}
          preload={isActive ? "auto" : "metadata"}
          onError={onPlaybackError}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent">
          <Radio className="w-16 h-16 text-white/30" />
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_55%,rgba(0,0,0,0.6)_100%)]" />
      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-80 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />

      {/* Floating hearts */}
      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
        {hearts.map((h) => (
          <Heart
            key={h.id}
            className="absolute bottom-32 w-7 h-7 text-rose-500 fill-rose-500 drop-shadow-[0_0_12px_rgba(244,63,94,0.7)]"
            style={{
              left: `${h.left}%`,
              animation: "heartFloat 2.2s ease-out forwards",
            }}
          />
        ))}
      </div>

      {/* Top live chip + viewer count */}
      <div className="absolute top-[max(env(safe-area-inset-top),12px)] inset-x-0 z-30 flex justify-center pt-14 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-xl border border-white/15">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-rose-400">
              Live
            </span>
          </div>
          <span className="w-px h-3 bg-white/20" />
          <Users className="w-3 h-3 text-white/80" />
          <span className="text-[11px] tabular-nums text-white/90">
            {formatCount(stream.viewer_count)}
          </span>
          <span className="w-px h-3 bg-white/20" />
          <span className="text-[11px] tabular-nums text-white/70">
            {elapsed(stream.started_at)}
          </span>
        </div>
      </div>

      {/* Right action rail */}
      <div
        className="absolute right-3 z-30 flex flex-col items-center gap-5"
        style={{ bottom: "max(calc(env(safe-area-inset-bottom) + 96px), 96px)" }}
      >
        <ActionButton
          icon={Heart}
          active={liked}
          activeColor="rose"
          label="Tap"
          onClick={onHeart}
        />
        <ActionButton icon={Share2} label="Share" onClick={onShare} />
        <ActionButton icon={MoreHorizontal} label="" onClick={onMore} />

        <div className="relative mt-1">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-white/35 via-white/15 to-white/5 ring-2 ring-rose-500/70 flex items-center justify-center overflow-hidden">
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

      {/* Bottom: title + scrolling chat + composer */}
      <div className="absolute left-0 right-0 bottom-0 z-30 px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-10">
        <div className="pr-20">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-sm font-medium text-white">
              @{stream.author_name}
            </div>
            <button className="text-[11px] uppercase tracking-[0.18em] text-white/85 border border-white/30 rounded-full px-2.5 py-0.5 active:scale-95 transition">
              Follow
            </button>
          </div>
          <h3 className="font-playfair text-[18px] leading-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)] mb-3 line-clamp-2">
            {stream.title}
          </h3>
        </div>

        {/* Live chat feed */}
        <div className="pr-20 mb-2 max-h-44 overflow-hidden flex flex-col justify-end gap-1.5">
          {chat.slice(-6).map((m) => (
            <div
              key={m.id}
              className="flex items-start gap-2 animate-fade-in"
            >
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ring-1 shrink-0",
                  m.isMine
                    ? "bg-rose-500/30 ring-rose-400/50 text-rose-100"
                    : "bg-white/15 ring-white/20 text-white/90",
                )}
              >
                {m.author.charAt(0).toUpperCase()}
              </div>
              <div className="rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 px-3 py-1.5 max-w-[85%]">
                <div className="text-[10px] font-semibold text-white/70 leading-none mb-0.5">
                  {m.author}
                </div>
                <div className="text-[12.5px] text-white leading-snug">
                  {m.content}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Composer */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/15 px-4 h-11">
            <Sparkles className="w-3.5 h-3.5 text-white/50 shrink-0" />
            <input
              value={draft}
              onChange={(e) => onDraftChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSendChat();
              }}
              placeholder="Say something kind…"
              className="flex-1 bg-transparent outline-none text-[13.5px] text-white placeholder:text-white/45"
            />
            <button
              onClick={onSendChat}
              disabled={!draft.trim()}
              className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center disabled:opacity-30 active:scale-90 transition"
              aria-label="Send"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            onClick={onHeart}
            className="w-11 h-11 rounded-full bg-rose-500/90 hover:bg-rose-500 ring-1 ring-white/20 flex items-center justify-center active:scale-90 transition"
            aria-label="Send heart"
          >
            <Heart className="w-5 h-5 text-white fill-white" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes heartFloat {
          0% { transform: translateY(0) scale(0.6); opacity: 0; }
          15% { transform: translateY(-20px) scale(1.1); opacity: 1; }
          100% { transform: translateY(-260px) scale(0.9); opacity: 0; }
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
        <Radio className="w-9 h-9 text-white/80" />
      </div>
      <h2 className="font-playfair text-2xl mb-2">No live streams yet</h2>
      <p className="text-white/55 text-[14px] max-w-xs leading-relaxed mb-6">
        Live sermons, prayer sessions, and worship streams will appear here when they go live.
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

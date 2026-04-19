import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PremiumNav } from "@/components/PremiumNav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  HandHeart,
  Sparkles,
  Send,
  ChevronRight,
  Play,
  Users,
  Calendar,
  Church,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Post {
  id: string;
  user_id: string;
  author_name: string | null;
  author_avatar: string | null;
  post_type: "post" | "prayer" | "testimony";
  content: string;
  media_url: string | null;
  media_type: "image" | "video" | null;
  is_anonymous: boolean;
  like_count: number;
  comment_count: number;
  pray_count: number;
  encourage_count: number;
  created_at: string;
}

interface Reel {
  id: string;
  title: string;
  thumbnail_url: string | null;
  author_name: string | null;
  view_count: number;
}

interface Teaching {
  id: string;
  title: string;
  author_name: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
}

interface Group {
  id: string;
  name: string;
  description: string | null;
  member_count: number;
}

interface EventItem {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  image_url: string | null;
  attendee_count: number;
}

interface ChurchItem {
  id: string;
  name: string;
  location: string | null;
  description: string | null;
  image_url: string | null;
}

const SectionHeader = ({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) => (
  <div className="flex items-end justify-between mb-3 px-1">
    <h2 className="font-playfair text-xl text-white tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
      {title}
    </h2>
    {onSeeAll && (
      <button
        onClick={onSeeAll}
        className="flex items-center gap-1 text-[11px] tracking-[0.16em] uppercase text-white/60 hover:text-white transition"
      >
        See all <ChevronRight className="w-3 h-3" />
      </button>
    )}
  </div>
);

export default function PrayerWall() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [reels, setReels] = useState<Reel[]>([]);
  const [teachings, setTeachings] = useState<Teaching[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [churches, setChurches] = useState<ChurchItem[]>([]);
  const [composer, setComposer] = useState("");
  const [composerType, setComposerType] = useState<"post" | "prayer" | "testimony">("post");
  const [posting, setPosting] = useState(false);
  const [myInteractions, setMyInteractions] = useState<Record<string, Set<string>>>({});

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    loadAll();
  }, []);

  const loadAll = async () => {
    const [p, r, t, g, e, c] = await Promise.all([
      supabase.from("posts").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("reels").select("*").order("created_at", { ascending: false }).limit(20),
      supabase.from("teachings").select("*").order("created_at", { ascending: false }).limit(20),
      supabase.from("groups").select("*").order("member_count", { ascending: false }).limit(20),
      supabase.from("events").select("*").order("event_date", { ascending: true }).limit(20),
      supabase.from("churches").select("*").order("created_at", { ascending: false }).limit(20),
    ]);
    setPosts((p.data as any) || []);
    setReels((r.data as any) || []);
    setTeachings((t.data as any) || []);
    setGroups((g.data as any) || []);
    setEvents((e.data as any) || []);
    setChurches((c.data as any) || []);

    const { data: authData } = await supabase.auth.getUser();
    if (authData.user) {
      const { data: ints } = await supabase
        .from("post_interactions")
        .select("post_id, interaction_type")
        .eq("user_id", authData.user.id);
      const map: Record<string, Set<string>> = {};
      (ints || []).forEach((i: any) => {
        if (!map[i.post_id]) map[i.post_id] = new Set();
        map[i.post_id].add(i.interaction_type);
      });
      setMyInteractions(map);
    }
  };

  const handlePost = async () => {
    if (!user) {
      toast({ title: "Please sign in", description: "Sign in to share with the community" });
      navigate("/auth");
      return;
    }
    if (!composer.trim()) return;
    setPosting(true);
    const { error } = await supabase.from("posts").insert({
      user_id: user.id,
      author_name: user.user_metadata?.name || user.email?.split("@")[0] || "Believer",
      post_type: composerType,
      content: composer.trim(),
    });
    setPosting(false);
    if (error) {
      toast({ title: "Could not post", description: error.message, variant: "destructive" });
    } else {
      setComposer("");
      loadAll();
    }
  };

  const toggleInteraction = async (
    postId: string,
    type: "like" | "pray" | "encourage" | "save"
  ) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    const has = myInteractions[postId]?.has(type);
    if (has) {
      await supabase
        .from("post_interactions")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .eq("interaction_type", type);
    } else {
      await supabase
        .from("post_interactions")
        .insert({ post_id: postId, user_id: user.id, interaction_type: type });
    }
    loadAll();
  };

  const sharePost = async (post: Post) => {
    const url = `${window.location.origin}/community/post/${post.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Hagion Community", text: post.content.slice(0, 80), url });
      } else {
        await navigator.clipboard.writeText(url);
        toast({ title: "Link copied" });
      }
    } catch {}
  };

  const fmtDuration = (s: number | null) => {
    if (!s) return "";
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen text-white">
      <main className="px-5 sm:px-8 pb-32 max-w-3xl mx-auto">
        {/* Header */}
        <header className="pt-6 pb-6 animate-fade-in flex flex-col items-center text-center">
          <h1 className="font-playfair text-xl sm:text-2xl leading-[1.05] tracking-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            Christian Community
          </h1>
          <div className="mt-2 h-px w-16 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          <div className="mt-5 w-full max-w-md relative">
            <div className="aspect-[16/9] rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] overflow-hidden flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-white/40">
                <Sparkles className="w-6 h-6" />
                <span className="text-[11px] tracking-[0.18em] uppercase">Add a picture</span>
              </div>
            </div>
            <button
              onClick={() => navigate("/profile")}
              className="absolute left-1/2 -bottom-8 -translate-x-1/2 rounded-full ring-2 ring-background shadow-[0_8px_30px_-10px_rgba(0,0,0,0.8)] hover:ring-white/40 transition"
              aria-label="Open profile"
            >
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-white/[0.08] backdrop-blur-md text-white/80 text-base">
                  {(user?.email?.[0] || "U").toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </button>
          </div>
          <div className="h-10" />
        </header>

        {/* Composer */}
        <section className="mb-8 animate-fade-in">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] p-4">
            <div className="flex gap-2 mb-3">
              {(["post", "prayer", "testimony"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setComposerType(t)}
                  className={cn(
                    "px-3 py-1 rounded-full text-[11px] tracking-[0.16em] uppercase transition",
                    composerType === t
                      ? "bg-white text-black shadow-[0_6px_20px_-4px_rgba(255,255,255,0.4)]"
                      : "bg-white/[0.06] border border-white/15 text-white/70 hover:text-white"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <Textarea
              value={composer}
              onChange={(e) => setComposer(e.target.value)}
              placeholder={
                composerType === "prayer"
                  ? "Share a prayer request..."
                  : composerType === "testimony"
                  ? "Share what God has done..."
                  : "Share with the community..."
              }
              rows={3}
              className="resize-none bg-black/30 border-white/10 text-white placeholder:text-white/40 rounded-xl"
            />
            <div className="flex justify-end mt-3">
              <Button
                onClick={handlePost}
                disabled={posting || !composer.trim()}
                className="rounded-full bg-gradient-to-r from-white/95 to-white/80 text-black hover:from-white hover:to-white/90 shadow-[0_6px_20px_-4px_rgba(255,255,255,0.4)]"
              >
                <Send className="w-4 h-4 mr-1" />
                {posting ? "Sharing..." : "Share"}
              </Button>
            </div>
          </div>
        </section>

        {/* Feed */}
        <section className="mb-10">
          <SectionHeader title="Feed" />
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-8 text-center text-white/60">
                Be the first to share with the community.
              </div>
            ) : (
              posts.map((post) => {
                const isPrayer = post.post_type === "prayer";
                const liked = myInteractions[post.id]?.has("like");
                const prayed = myInteractions[post.id]?.has("pray");
                const encouraged = myInteractions[post.id]?.has("encourage");
                const saved = myInteractions[post.id]?.has("save");
                return (
                  <article
                    key={post.id}
                    onClick={() => navigate(`/community/post/${post.id}`)}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] p-4 cursor-pointer hover:bg-white/[0.06] transition"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-10 w-10 ring-1 ring-white/20">
                        <AvatarFallback className="bg-gradient-to-br from-white/20 to-white/5 text-white text-sm font-playfair">
                          {(post.is_anonymous ? "A" : post.author_name?.[0] || "B").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white truncate">
                          {post.is_anonymous ? "Anonymous" : post.author_name || "Believer"}
                        </div>
                        <div className="text-[11px] text-white/50">
                          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                          {post.post_type !== "post" && (
                            <span className="ml-2 px-2 py-0.5 rounded-full bg-white/[0.08] border border-white/15 text-white/70 uppercase tracking-[0.14em] text-[9px]">
                              {post.post_type}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-white/85 text-[15px] leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>
                    {post.media_url && post.media_type === "image" && (
                      <img
                        src={post.media_url}
                        alt="post media"
                        className="mt-3 rounded-xl border border-white/10 w-full"
                      />
                    )}

                    <div
                      className="flex items-center gap-1 mt-4 pt-3 border-t border-white/10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isPrayer ? (
                        <>
                          <ActionBtn
                            active={prayed}
                            onClick={() => toggleInteraction(post.id, "pray")}
                            icon={HandHeart}
                            label="Pray"
                            count={post.pray_count}
                          />
                          <ActionBtn
                            active={encouraged}
                            onClick={() => toggleInteraction(post.id, "encourage")}
                            icon={Sparkles}
                            label="Encourage"
                            count={post.encourage_count}
                          />
                        </>
                      ) : (
                        <ActionBtn
                          active={liked}
                          onClick={() => toggleInteraction(post.id, "like")}
                          icon={Heart}
                          label="Like"
                          count={post.like_count}
                        />
                      )}
                      <ActionBtn
                        onClick={() => navigate(`/community/post/${post.id}`)}
                        icon={MessageCircle}
                        label="Comment"
                        count={post.comment_count}
                      />
                      <ActionBtn onClick={() => sharePost(post)} icon={Share2} label="Share" />
                      <ActionBtn
                        active={saved}
                        onClick={() => toggleInteraction(post.id, "save")}
                        icon={Bookmark}
                        label="Save"
                      />
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

        {/* Reels */}
        <section className="mb-10">
          <SectionHeader title="Reels" onSeeAll={() => navigate("/community/reels")} />
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
            {reels.length === 0
              ? Array.from({ length: 4 }).map((_, i) => (
                  <PlaceholderReel key={i} onClick={() => navigate("/community/reels")} />
                ))
              : reels.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => navigate(`/community/reels?start=${r.id}`)}
                    className="relative shrink-0 w-32 h-52 rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.02] backdrop-blur-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] group"
                  >
                    {r.thumbnail_url && (
                      <img src={r.thumbnail_url} alt={r.title} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md ring-1 ring-white/40 flex items-center justify-center group-hover:scale-110 transition">
                        <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-2 right-2 text-left">
                      <div className="text-[11px] text-white font-semibold line-clamp-2 leading-tight">
                        {r.title}
                      </div>
                    </div>
                  </button>
                ))}
          </div>
        </section>

        {/* Teachings */}
        <section className="mb-10">
          <SectionHeader title="Teachings & Messages" onSeeAll={() => navigate("/community/teachings")} />
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
            {teachings.map((t) => (
              <button
                key={t.id}
                onClick={() => navigate(`/community/teaching/${t.id}`)}
                className="shrink-0 w-60 rounded-2xl overflow-hidden border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] hover:bg-white/[0.07] transition text-left"
              >
                <div className="relative aspect-video bg-gradient-to-br from-white/10 via-white/5 to-transparent">
                  {t.thumbnail_url ? (
                    <img src={t.thumbnail_url} alt={t.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="w-8 h-8 text-white/40" />
                    </div>
                  )}
                  {t.duration_seconds && (
                    <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-[10px] text-white">
                      {fmtDuration(t.duration_seconds)}
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <div className="text-sm font-semibold text-white line-clamp-2 leading-snug">{t.title}</div>
                  <div className="mt-1 text-[11px] text-white/50">{t.author_name}</div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Groups */}
        <section className="mb-10">
          <SectionHeader title="Groups" onSeeAll={() => navigate("/community/groups")} />
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
            {groups.map((g) => (
              <div
                key={g.id}
                onClick={() => navigate(`/community/group/${g.id}`)}
                className="shrink-0 w-56 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] p-4 cursor-pointer hover:bg-white/[0.07] transition"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/30 via-white/10 to-white/5 ring-1 ring-white/30 flex items-center justify-center mb-3">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="text-sm font-semibold text-white line-clamp-1">{g.name}</div>
                <div className="text-[11px] text-white/50 mt-0.5">{g.member_count} members</div>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/community/group/${g.id}`);
                  }}
                  className="mt-3 w-full rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs"
                >
                  Join Group
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Events */}
        <section className="mb-10">
          <SectionHeader title="Events" onSeeAll={() => navigate("/community/events")} />
          <div className="space-y-3">
            {events.map((e) => (
              <div
                key={e.id}
                onClick={() => navigate(`/community/event/${e.id}`)}
                className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] p-4 cursor-pointer hover:bg-white/[0.07] transition flex gap-4"
              >
                <div className="w-16 h-16 shrink-0 rounded-xl bg-gradient-to-br from-white/20 via-white/10 to-white/5 ring-1 ring-white/20 flex flex-col items-center justify-center">
                  <Calendar className="w-5 h-5 text-white/80" />
                  <span className="text-[10px] text-white/70 mt-1">
                    {new Date(e.event_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white">{e.title}</div>
                  <div className="text-[11px] text-white/50 mt-1">
                    {new Date(e.event_date).toLocaleString(undefined, {
                      weekday: "short",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                    {e.location && ` · ${e.location}`}
                  </div>
                  <Button
                    size="sm"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      navigate(`/community/event/${e.id}`);
                    }}
                    className="mt-2 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs h-7"
                  >
                    Join Event
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Churches */}
        <section className="mb-10">
          <SectionHeader title="Churches" onSeeAll={() => navigate("/community/churches")} />
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
            {churches.map((c) => (
              <div
                key={c.id}
                onClick={() => navigate(`/community/church/${c.id}`)}
                className="shrink-0 w-56 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] p-4 cursor-pointer hover:bg-white/[0.07] transition"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/30 via-white/10 to-white/5 ring-1 ring-white/30 flex items-center justify-center mb-3">
                  <Church className="w-5 h-5 text-white" />
                </div>
                <div className="text-sm font-semibold text-white line-clamp-1">{c.name}</div>
                {c.location && <div className="text-[11px] text-white/50 mt-0.5">{c.location}</div>}
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/community/church/${c.id}`);
                  }}
                  className="mt-3 w-full rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs"
                >
                  View Church
                </Button>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Messenger FAB */}
      <button
        onClick={() => navigate("/community/messenger")}
        aria-label="Messenger"
        className={cn(
          "fixed right-5 z-40",
          "w-14 h-14 rounded-full",
          "bg-gradient-to-br from-white/95 to-white/75 text-black",
          "shadow-[0_10px_40px_-10px_rgba(255,255,255,0.5)] ring-1 ring-white/40",
          "flex items-center justify-center",
          "transition-transform hover:scale-105 active:scale-95"
        )}
        style={{ bottom: "calc(80px + env(safe-area-inset-bottom))" }}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      <PremiumNav />
    </div>
  );
}

const ActionBtn = ({
  active,
  onClick,
  icon: Icon,
  label,
  count,
}: {
  active?: boolean;
  onClick: () => void;
  icon: any;
  label: string;
  count?: number;
}) => (
  <button
    onClick={onClick}
    aria-label={label}
    className={cn(
      "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl transition",
      "text-[12px]",
      active
        ? "text-white bg-white/[0.08]"
        : "text-white/55 hover:text-white hover:bg-white/[0.05]"
    )}
  >
    <Icon className={cn("w-4 h-4", active && "fill-white/80")} />
    {count !== undefined && count > 0 ? <span>{count}</span> : <span className="hidden sm:inline">{label}</span>}
  </button>
);

const PlaceholderReel = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="relative shrink-0 w-32 h-52 rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] flex items-center justify-center"
  >
    <Play className="w-8 h-8 text-white/40" />
  </button>
);

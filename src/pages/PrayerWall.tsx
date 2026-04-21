import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PremiumNav } from "@/components/PremiumNav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Loader2,
  ImagePlus,
  Settings,
  Video,
  Radio,
  Plus,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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

const SectionHeader = ({
  title,
  onSeeAll,
  action,
}: {
  title: string;
  onSeeAll?: () => void;
  action?: React.ReactNode;
}) => (
  <div className="flex items-end justify-between mb-3 px-1">
    <h2 className="font-playfair text-lg text-white tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
      {title}
    </h2>
    <div className="flex items-center gap-3">
      {action}
      {onSeeAll && (
        <button
          onClick={onSeeAll}
          className="flex items-center gap-1 text-[11px] tracking-[0.16em] uppercase text-white/60 hover:text-white transition"
        >
          See all <ChevronRight className="w-3 h-3" />
        </button>
      )}
    </div>
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
  const [authorMeta, setAuthorMeta] = useState<Record<string, { username: string | null; follower_count: number }>>({});
  const [myFollowing, setMyFollowing] = useState<Set<string>>(new Set());
  const [profile, setProfile] = useState<{ avatar_url: string | null; banner_url: string | null } | null>(null);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventLocation, setNewEventLocation] = useState("");
  const [newEventDesc, setNewEventDesc] = useState("");
  const [creatingEvent, setCreatingEvent] = useState(false);

  const handleCreateEvent = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    const title = newEventTitle.trim();
    if (!title || !newEventDate) {
      toast({ title: "Title and date are required", variant: "destructive" });
      return;
    }
    setCreatingEvent(true);
    const { error } = await supabase.from("events").insert({
      title,
      event_date: new Date(newEventDate).toISOString(),
      location: newEventLocation.trim() || null,
      description: newEventDesc.trim() || null,
      creator_id: user.id,
    });
    setCreatingEvent(false);
    if (error) {
      toast({ title: "Could not create event", description: error.message, variant: "destructive" });
      return;
    }
    setNewEventTitle("");
    setNewEventDate("");
    setNewEventLocation("");
    setNewEventDesc("");
    setCreateEventOpen(false);
    toast({ title: "Event created" });
    loadAll();
  };

  const handleCreateGroup = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    const name = newGroupName.trim();
    if (!name) {
      toast({ title: "Group name is required", variant: "destructive" });
      return;
    }
    setCreatingGroup(true);
    const { data, error } = await supabase
      .from("groups")
      .insert({
        name,
        description: newGroupDesc.trim() || null,
        creator_id: user.id,
      })
      .select()
      .single();
    if (!error && data) {
      // auto-join creator
      await supabase.from("group_members").insert({ group_id: data.id, user_id: user.id });
    }
    setCreatingGroup(false);
    if (error) {
      toast({ title: "Could not create group", description: error.message, variant: "destructive" });
      return;
    }
    setNewGroupName("");
    setNewGroupDesc("");
    setCreateGroupOpen(false);
    toast({ title: "Group created" });
    loadAll();
    navigate(`/community/group/${data!.id}`);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) loadProfile(data.user.id);
    });
    loadAll();
    const onRefresh = () => {
      loadAll();
      supabase.auth.getUser().then(({ data }) => data.user && loadProfile(data.user.id));
    };
    window.addEventListener("community:refresh", onRefresh);
    return () => window.removeEventListener("community:refresh", onRefresh);
  }, []);

  const loadProfile = async (uid: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("avatar_url, banner_url")
      .eq("user_id", uid)
      .maybeSingle();
    if (data) setProfile(data as any);
  };

  const uploadBanner = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const f = input.files?.[0];
      if (!f) return;
      if (f.size > 10 * 1024 * 1024) {
        toast({ title: "File too large", description: "Max 10MB", variant: "destructive" });
        return;
      }
      setBannerUploading(true);
      const ext = f.name.split(".").pop() || "jpg";
      const path = `${user.id}/banner-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("community-media")
        .upload(path, f, { contentType: f.type, upsert: true });
      if (upErr) {
        setBannerUploading(false);
        toast({ title: "Upload failed", description: upErr.message, variant: "destructive" });
        return;
      }
      const { data: pub } = supabase.storage.from("community-media").getPublicUrl(path);
      const { error: updErr } = await supabase
        .from("profiles")
        .upsert({ user_id: user.id, banner_url: pub.publicUrl }, { onConflict: "user_id" });
      setBannerUploading(false);
      if (updErr) {
        toast({ title: "Could not save banner", description: updErr.message, variant: "destructive" });
      } else {
        setProfile((p) => ({ avatar_url: p?.avatar_url || null, banner_url: pub.publicUrl }));
        toast({ title: "Banner updated" });
      }
    };
    input.click();
  };

  const loadAll = async () => {
    const [p, r, t, g, e, c] = await Promise.all([
      supabase.from("posts").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("reels").select("*").order("created_at", { ascending: false }).limit(20),
      supabase.from("teachings").select("*").order("created_at", { ascending: false }).limit(20),
      supabase.from("groups").select("*").order("member_count", { ascending: false }).limit(20),
      supabase.from("events").select("*").order("event_date", { ascending: true }).limit(20),
      supabase.from("churches").select("*").order("created_at", { ascending: false }).limit(20),
    ]);
    const postsData = (p.data as any[]) || [];
    setPosts(postsData as any);
    setReels((r.data as any) || []);
    setTeachings((t.data as any) || []);
    setGroups((g.data as any) || []);
    setEvents((e.data as any) || []);
    setChurches((c.data as any) || []);

    // Load author meta (username + follower_count) for everyone in the feed
    const authorIds = Array.from(new Set(postsData.map((x: any) => x.user_id).filter(Boolean)));
    if (authorIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, username, follower_count")
        .in("user_id", authorIds);
      const meta: Record<string, { username: string | null; follower_count: number }> = {};
      (profs || []).forEach((pr: any) => {
        meta[pr.user_id] = { username: pr.username, follower_count: pr.follower_count || 0 };
      });
      setAuthorMeta(meta);
    }

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

      const { data: fws } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", authData.user.id);
      setMyFollowing(new Set((fws || []).map((f: any) => f.following_id)));
    }
  };

  const toggleFollowAuthor = async (targetId: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (targetId === user.id) return;
    const isFollowing = myFollowing.has(targetId);
    if (isFollowing) {
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", targetId);
      setMyFollowing((s) => {
        const n = new Set(s);
        n.delete(targetId);
        return n;
      });
      setAuthorMeta((m) => ({
        ...m,
        [targetId]: {
          username: m[targetId]?.username ?? null,
          follower_count: Math.max((m[targetId]?.follower_count || 1) - 1, 0),
        },
      }));
    } else {
      const { error } = await supabase.from("follows").insert({ follower_id: user.id, following_id: targetId });
      if (error) {
        toast({ title: "Could not follow", description: error.message, variant: "destructive" });
        return;
      }
      setMyFollowing((s) => new Set(s).add(targetId));
      setAuthorMeta((m) => ({
        ...m,
        [targetId]: {
          username: m[targetId]?.username ?? null,
          follower_count: (m[targetId]?.follower_count || 0) + 1,
        },
      }));
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
    <div className="min-h-screen text-white relative overflow-hidden">
      {/* Consistent dark gradient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at center, #2B5681 0%, #000000 100%)",
        }}
      />
      <main className="px-5 sm:px-8 pb-2 max-w-3xl mx-auto">
        {/* Header */}
        <header className="pt-6 pb-6 animate-fade-in flex flex-col items-center text-center relative">
          <button
            onClick={() => navigate("/community/messenger")}
            aria-label="Open messenger"
            className="absolute left-0 top-6 w-8 h-8 rounded-full bg-white/[0.06] border border-white/15 backdrop-blur-xl text-white/80 hover:text-white hover:bg-white/10 transition flex items-center justify-center shadow-[0_6px_20px_-4px_rgba(0,0,0,0.5)]"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate("/settings")}
            aria-label="Open settings"
            className="absolute right-0 top-6 w-8 h-8 rounded-full bg-white/[0.06] border border-white/15 backdrop-blur-xl text-white/80 hover:text-white hover:bg-white/10 transition flex items-center justify-center shadow-[0_6px_20px_-4px_rgba(0,0,0,0.5)]"
          >
            <Settings className="w-4 h-4" />
          </button>
          <h1 className="font-playfair text-xl sm:text-2xl leading-[1.05] tracking-tight bg-gradient-to-b from-white via-white to-sky-200/90 bg-clip-text text-transparent drop-shadow-[0_4px_20px_rgba(56,135,255,0.35)]">
            Christian Community
          </h1>
          <div className="mt-2 h-px w-16 bg-gradient-to-r from-transparent via-sky-400/70 to-transparent" />
          <div className="relative mt-5 -mx-5 w-[calc(100%+2.5rem)] sm:-mx-8 sm:w-[calc(100%+4rem)]">
            <button
              type="button"
              onClick={uploadBanner}
              disabled={bannerUploading}
              className="block w-full aspect-[16/9] border-y border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] overflow-hidden relative group"
              aria-label="Upload community banner"
            >
              {profile?.banner_url ? (
                <img src={profile.banner_url} alt="banner" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-white/40">
                  {bannerUploading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <ImagePlus className="w-6 h-6" />
                  )}
                  <span className="text-[11px] tracking-[0.18em] uppercase">
                    {bannerUploading ? "Uploading..." : "Add a picture"}
                  </span>
                </div>
              )}
              {profile?.banner_url && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="text-[11px] tracking-[0.18em] uppercase text-white">Change</span>
                </div>
              )}
            </button>
            {/* Subtle black shading at bottom edge of banner */}
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black via-black/70 to-transparent pointer-events-none"
            />
            {/* Profile avatar - positioned on top of banner, far left */}
            <div className="absolute left-4 sm:left-8 top-[65%] -translate-y-1/2 flex flex-col items-center z-10">
              <button
                onClick={() => navigate("/profile")}
                className="rounded-full ring-4 ring-background shadow-[0_8px_30px_-10px_rgba(0,0,0,0.8)] hover:ring-white/40 transition"
                aria-label="Open profile"
              >
                <Avatar className="h-24 w-24">
                  {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt="profile" />}
                  <AvatarFallback className="bg-white/[0.08] backdrop-blur-md text-white/80 text-2xl">
                    {(user?.email?.[0] || "U").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
              <span className="mt-2 text-sm font-medium text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {user?.user_metadata?.name || user?.email?.split("@")[0] || "Believer"}
              </span>
            </div>
          </div>

          {/* Black horizontal bar with downward shadow extending below */}
          <div className="relative -mx-5 sm:-mx-8 w-[calc(100%+2.5rem)] sm:w-[calc(100%+4rem)] h-8 bg-black">
            {/* Shadow cast downward from the top edge of the black bar */}
            <div
              aria-hidden
              className="absolute inset-x-0 top-full h-10 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-10"
            />
          </div>

          <div className="h-16" />

          {/* Pill chips: Reels, Videos, Live */}
          <section className="w-full mt-2">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {[
                { label: "Reels", icon: Play, onClick: () => navigate("/community/reels/feed") },
                { label: "Videos", icon: Video, onClick: () => navigate("/community/videos") },
                { label: "Live", icon: Radio, onClick: () => navigate("/community/live") },
              ].map((t, i) => {
                const Icon = t.icon;
                return (
                <button
                    key={i}
                    onClick={t.onClick}
                    className="inline-flex items-center gap-2 rounded-full px-5 py-1.5 bg-white/5 border border-white/15 backdrop-blur-xl shadow-[0_6px_20px_-10px_rgba(0,0,0,0.6)] hover:bg-white/10 hover:border-white/25 active:scale-95 transition-all"
                  >
                    <Icon className="w-4 h-4 text-white/90" />
                    <span className="text-xs font-playfair tracking-[0.2em] uppercase text-white/90">
                      {t.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </header>



        <section className="mb-0">
          <SectionHeader
            title="Events"
            onSeeAll={() => navigate("/community/events")}
            action={
              <button
                onClick={() => {
                  if (!user) {
                    navigate("/auth");
                    return;
                  }
                  setCreateEventOpen((v) => !v);
                }}
                aria-label={createEventOpen ? "Close create event" : "Create event"}
                aria-expanded={createEventOpen}
                className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition"
              >
                {createEventOpen ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              </button>
            }
          />
          {createEventOpen && (
            <div className="mb-3 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] p-4 space-y-3 animate-fade-in">
              <Input
                placeholder="Event title"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                maxLength={100}
                className="bg-white/5 border-white/15 text-white placeholder:text-white/40"
              />
              <Input
                type="datetime-local"
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
                className="bg-white/5 border-white/15 text-white placeholder:text-white/40"
              />
              <Input
                placeholder="Location (optional)"
                value={newEventLocation}
                onChange={(e) => setNewEventLocation(e.target.value)}
                maxLength={120}
                className="bg-white/5 border-white/15 text-white placeholder:text-white/40"
              />
              <Textarea
                placeholder="Description (optional)"
                value={newEventDesc}
                onChange={(e) => setNewEventDesc(e.target.value)}
                rows={2}
                maxLength={500}
                className="bg-white/5 border-white/15 text-white placeholder:text-white/40 resize-none"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleCreateEvent}
                  disabled={creatingEvent || !newEventTitle.trim() || !newEventDate}
                  className="rounded-full bg-gradient-to-r from-white/95 to-white/80 text-black hover:from-white hover:to-white/90"
                >
                  {creatingEvent ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Event"}
                </Button>
              </div>
            </div>
          )}
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

      </main>

      {/* Edge-to-edge feed */}
      <section className="w-full border-t border-white/10 bg-black/20">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-2">
          <h2 className="font-playfair text-lg text-white tracking-tight px-1 mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            Feed
          </h2>
          {posts.length === 0 ? (
            <div className="px-4 py-12 text-center text-white/50 text-sm">
              No posts yet. Tap the + button to share something.
            </div>
          ) : (
            <div className="divide-y divide-white/10 sm:space-y-4 sm:divide-y-0">
              {posts.map((p) => {
                const mine = myInteractions[p.id] || new Set();
                const initial = (p.author_name?.[0] || "B").toUpperCase();
                return (
                  <article
                    key={p.id}
                    className="bg-white/[0.02] sm:bg-white/[0.04] sm:border sm:border-white/10 sm:rounded-2xl sm:backdrop-blur-2xl sm:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)]"
                  >
                    {/* Header */}
                    <header className="flex items-center gap-3 px-4 sm:px-4 pt-4 pb-3">
                      {(() => {
                        const meta = authorMeta[p.user_id];
                        const handle = meta?.username || p.user_id;
                        const followers = meta?.follower_count || 0;
                        const isFollowing = myFollowing.has(p.user_id);
                        const isMe = user?.id === p.user_id;
                        const goProfile = () => !p.is_anonymous && navigate(`/u/${handle}`);
                        return (
                          <>
                            <button
                              onClick={goProfile}
                              disabled={p.is_anonymous}
                              className="w-10 h-10 rounded-full bg-gradient-to-br from-white/30 via-white/10 to-white/5 ring-1 ring-white/30 flex items-center justify-center text-white text-sm font-semibold overflow-hidden disabled:cursor-default"
                            >
                              {p.author_avatar && !p.is_anonymous ? (
                                <img src={p.author_avatar} alt="" className="w-full h-full rounded-full object-cover" />
                              ) : (
                                initial
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <button
                                onClick={goProfile}
                                disabled={p.is_anonymous}
                                className="text-sm font-semibold text-white truncate text-left hover:underline disabled:no-underline disabled:cursor-default block max-w-full"
                              >
                                {p.is_anonymous ? "Anonymous" : p.author_name || "Believer"}
                              </button>
                              <div className="text-[11px] text-white/50 flex items-center gap-1.5 flex-wrap">
                                {!p.is_anonymous && (
                                  <>
                                    <span className="text-white/60">
                                      {followers.toLocaleString()} {followers === 1 ? "follower" : "followers"}
                                    </span>
                                    <span>·</span>
                                  </>
                                )}
                                <span>
                                  {new Date(p.created_at).toLocaleString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    hour: "numeric",
                                    minute: "2-digit",
                                  })}
                                </span>
                                {p.post_type !== "post" && (
                                  <span className="uppercase tracking-[0.14em] text-[10px] text-white/60">
                                    · {p.post_type}
                                  </span>
                                )}
                              </div>
                            </div>
                            {!p.is_anonymous && !isMe && (
                              <button
                                onClick={() => toggleFollowAuthor(p.user_id)}
                                className={cn(
                                  "shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide transition",
                                  isFollowing
                                    ? "bg-white/10 text-white border border-white/20 hover:bg-white/15"
                                    : "bg-white text-black hover:bg-white/90 shadow-[0_4px_14px_-4px_rgba(255,255,255,0.4)]"
                                )}
                              >
                                {isFollowing ? "Following" : "Follow"}
                              </button>
                            )}
                          </>
                        );
                      })()}
                    </header>

                    {/* Content */}
                    {p.content && (
                      <div className="px-4 pb-3 text-[15px] leading-relaxed text-white/90 whitespace-pre-wrap select-none">
                        {p.content}
                      </div>
                    )}

                    {/* Media — edge to edge */}
                    {p.media_url && p.media_type === "image" && (
                      <img
                        src={p.media_url}
                        alt=""
                        draggable={false}
                        onContextMenu={(e) => e.preventDefault()}
                        className="w-full max-h-[600px] object-cover select-none pointer-events-none"
                      />
                    )}
                    {p.media_url && p.media_type === "video" && (
                      <video
                        src={p.media_url}
                        controls
                        controlsList="nodownload noremoteplayback"
                        disablePictureInPicture
                        onContextMenu={(e) => e.preventDefault()}
                        className="w-full max-h-[600px] bg-black"
                      />
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-1 px-2 py-2 border-t border-white/5">
                      <ActionBtn
                        icon={Heart}
                        label="Like"
                        active={mine.has("like")}
                        count={p.like_count}
                        onClick={() => toggleInteraction(p.id, "like")}
                      />
                      <ActionBtn
                        icon={MessageCircle}
                        label="Comment"
                        count={p.comment_count}
                        onClick={() => navigate(`/community/post/${p.id}`)}
                      />
                      <ActionBtn
                        icon={HandHeart}
                        label="Pray"
                        active={mine.has("pray")}
                        count={p.pray_count}
                        onClick={() => toggleInteraction(p.id, "pray")}
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>


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

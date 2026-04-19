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
    <h2 className="font-playfair text-xl text-white tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
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
  const [profile, setProfile] = useState<{ avatar_url: string | null; banner_url: string | null } | null>(null);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [creatingGroup, setCreatingGroup] = useState(false);

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
        <header className="pt-6 pb-6 animate-fade-in flex flex-col items-center text-center relative">
          <button
            onClick={() => navigate("/settings")}
            aria-label="Open settings"
            className="absolute left-0 top-6 w-10 h-10 rounded-full bg-white/[0.06] border border-white/15 backdrop-blur-xl text-white/80 hover:text-white hover:bg-white/10 transition flex items-center justify-center shadow-[0_6px_20px_-4px_rgba(0,0,0,0.5)]"
          >
            <Settings className="w-5 h-5" />
          </button>
          <h1 className="font-playfair text-xl sm:text-2xl leading-[1.05] tracking-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            Christian Community
          </h1>
          <div className="mt-2 h-px w-16 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          <div className="mt-5 w-full max-w-md relative">
            <button
              type="button"
              onClick={uploadBanner}
              disabled={bannerUploading}
              className="block w-full aspect-[16/9] rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] overflow-hidden relative group"
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
            <button
              onClick={() => navigate("/profile")}
              className="absolute left-1/2 -bottom-8 -translate-x-1/2 rounded-full ring-2 ring-background shadow-[0_8px_30px_-10px_rgba(0,0,0,0.8)] hover:ring-white/40 transition"
              aria-label="Open profile"
            >
              <Avatar className="h-16 w-16">
                {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt="profile" />}
                <AvatarFallback className="bg-white/[0.08] backdrop-blur-md text-white/80 text-base">
                  {(user?.email?.[0] || "U").toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </button>
          </div>
          <div className="h-10" />

          {/* Pill chips: Reels, Videos, Live */}
          <section className="w-full mt-2 mb-2">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {[
                { label: "Reels", icon: Play, onClick: () => navigate("/community/reels") },
                { label: "Videos", icon: Video, onClick: () => navigate("/community/videos") },
                { label: "Live", icon: Radio, onClick: () => navigate("/community/live") },
              ].map((t, i) => {
                const Icon = t.icon;
                return (
                  <button
                    key={i}
                    onClick={t.onClick}
                    className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 bg-white/5 border border-white/15 backdrop-blur-xl shadow-[0_6px_20px_-10px_rgba(0,0,0,0.6)] hover:bg-white/10 hover:border-white/25 active:scale-95 transition-all"
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

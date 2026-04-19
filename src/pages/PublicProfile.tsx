import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, MessageSquare, UserPlus, UserCheck, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PremiumNav } from "@/components/PremiumNav";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function PublicProfile() {
  const { handle } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [me, setMe] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    load();
  }, [handle]);

  const load = async () => {
    setLoading(true);
    const { data: auth } = await supabase.auth.getUser();
    setMe(auth.user);

    // Try by username first, then by user_id
    let { data: prof } = await supabase
      .from("profiles")
      .select("*")
      .ilike("username", handle || "")
      .maybeSingle();
    if (!prof) {
      const r = await supabase.from("profiles").select("*").eq("user_id", handle || "").maybeSingle();
      prof = r.data as any;
    }
    setProfile(prof);

    if (prof) {
      const { data: ps } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", prof.user_id)
        .order("created_at", { ascending: false })
        .limit(30);
      setPosts(ps || []);

      if (auth.user && auth.user.id !== prof.user_id) {
        const { data: f } = await supabase
          .from("follows")
          .select("id")
          .eq("follower_id", auth.user.id)
          .eq("following_id", prof.user_id)
          .maybeSingle();
        setIsFollowing(!!f);
      }
    }
    setLoading(false);
  };

  const toggleFollow = async () => {
    if (!me) {
      navigate("/auth");
      return;
    }
    if (!profile) return;
    setBusy(true);
    if (isFollowing) {
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", me.id)
        .eq("following_id", profile.user_id);
      setIsFollowing(false);
    } else {
      const { error } = await supabase
        .from("follows")
        .insert({ follower_id: me.id, following_id: profile.user_id });
      if (error) {
        toast({ title: "Could not follow", description: error.message, variant: "destructive" });
        setBusy(false);
        return;
      }
      setIsFollowing(true);
    }
    setBusy(false);
    load();
  };

  if (loading) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-white/60" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen text-white px-6 py-20 text-center">
        <p className="text-white/70">Profile not found.</p>
        <Button onClick={() => navigate(-1)} className="mt-4">Go back</Button>
      </div>
    );
  }

  const isMe = me?.id === profile.user_id;

  return (
    <div className="min-h-screen text-white">
      <header className="sticky top-0 z-30 bg-black/40 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/community"))}
            aria-label="Back"
            className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/15 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="font-playfair text-lg tracking-tight flex-1 truncate">
            {profile.name || profile.username || "Profile"}
          </h1>
          {!isMe && (
            <button
              onClick={() => navigate(`/community/messenger?to=${profile.user_id}`)}
              aria-label="Message"
              className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/15 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 pb-32">
        <div className="flex items-center gap-5">
          <Avatar className="w-24 h-24 ring-2 ring-white/30">
            {profile.avatar_url && <AvatarImage src={profile.avatar_url} />}
            <AvatarFallback className="bg-white/10 text-white text-2xl">
              {(profile.name?.[0] || profile.username?.[0] || "B").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 grid grid-cols-3 gap-2 text-center">
            <Stat n={posts.length} label="Posts" />
            <Stat n={profile.follower_count || 0} label="Followers" onClick={() => navigate("/friends?tab=followers")} clickable={isMe} />
            <Stat n={profile.following_count || 0} label="Following" onClick={() => navigate("/friends?tab=following")} clickable={isMe} />
          </div>
        </div>

        <div className="mt-4">
          <div className="text-lg font-semibold text-white">{profile.name || "Believer"}</div>
          {profile.username && (
            <div className="text-sm text-white/55">@{profile.username}</div>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          {isMe ? (
            <Button
              onClick={() => navigate("/settings")}
              className="flex-1 rounded-full bg-white/10 text-white border border-white/20 hover:bg-white/15"
            >
              Edit profile
            </Button>
          ) : (
            <>
              <Button
                onClick={toggleFollow}
                disabled={busy}
                className={cn(
                  "flex-1 rounded-full",
                  isFollowing
                    ? "bg-white/10 text-white border border-white/20 hover:bg-white/15"
                    : "bg-gradient-to-r from-white/95 to-white/80 text-black hover:from-white"
                )}
              >
                {busy ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isFollowing ? (
                  <>
                    <UserCheck className="w-4 h-4 mr-1" /> Following
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-1" /> Follow
                  </>
                )}
              </Button>
              <Button
                onClick={() => navigate(`/community/messenger?to=${profile.user_id}`)}
                className="flex-1 rounded-full bg-white/10 text-white border border-white/20 hover:bg-white/15"
              >
                Message
              </Button>
            </>
          )}
        </div>

        <div className="mt-8 grid grid-cols-3 gap-1">
          {posts.map((p) => (
            <button
              key={p.id}
              onClick={() => navigate(`/community/post/${p.id}`)}
              className="aspect-square overflow-hidden bg-white/5 border border-white/5 rounded-md"
            >
              {p.media_url && p.media_type === "image" ? (
                <img src={p.media_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-white/60 px-2 text-center line-clamp-4">
                  {p.content?.slice(0, 80) || "Post"}
                </div>
              )}
            </button>
          ))}
        </div>
        {posts.length === 0 && (
          <div className="mt-8 text-center text-white/50 text-sm">No posts yet.</div>
        )}
      </main>

      <PremiumNav />
    </div>
  );
}

const Stat = ({
  n,
  label,
  onClick,
  clickable,
}: {
  n: number;
  label: string;
  onClick?: () => void;
  clickable?: boolean;
}) => (
  <button
    onClick={clickable ? onClick : undefined}
    className={cn("py-2", clickable && "hover:bg-white/5 rounded-lg transition")}
  >
    <div className="text-lg font-semibold text-white">{n}</div>
    <div className="text-[11px] uppercase tracking-[0.16em] text-white/50">{label}</div>
  </button>
);

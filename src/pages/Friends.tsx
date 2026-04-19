import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Search, MessageSquare, UserPlus, UserCheck, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PremiumNav } from "@/components/PremiumNav";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type Tab = "followers" | "following" | "discover";

interface ProfileRow {
  user_id: string;
  name: string | null;
  username: string | null;
  avatar_url: string | null;
  follower_count?: number;
  following_count?: number;
}

export default function Friends() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const initialTab = (params.get("tab") as Tab) || "followers";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [user, setUser] = useState<any>(null);
  const [followers, setFollowers] = useState<ProfileRow[]>([]);
  const [following, setFollowing] = useState<ProfileRow[]>([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<ProfileRow[]>([]);
  const [searching, setSearching] = useState(false);
  const [myFollowing, setMyFollowing] = useState<Set<string>>(new Set());

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) loadAll(data.user.id);
      else navigate("/auth");
    });
  }, []);

  useEffect(() => {
    setParams({ tab }, { replace: true });
  }, [tab]);

  const loadAll = async (uid: string) => {
    const [{ data: ftrs }, { data: fwng }] = await Promise.all([
      supabase.from("follows").select("follower_id").eq("following_id", uid),
      supabase.from("follows").select("following_id").eq("follower_id", uid),
    ]);
    const followerIds = (ftrs || []).map((r: any) => r.follower_id);
    const followingIds = (fwng || []).map((r: any) => r.following_id);

    const [followersData, followingData] = await Promise.all([
      followerIds.length
        ? supabase.from("profiles").select("user_id, name, username, avatar_url").in("user_id", followerIds)
        : Promise.resolve({ data: [] as any[] }),
      followingIds.length
        ? supabase.from("profiles").select("user_id, name, username, avatar_url").in("user_id", followingIds)
        : Promise.resolve({ data: [] as any[] }),
    ]);
    setFollowers((followersData.data as any) || []);
    setFollowing((followingData.data as any) || []);
    setMyFollowing(new Set(followingIds));
  };

  useEffect(() => {
    if (tab !== "discover") return;
    const q = search.trim();
    if (!q) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      const { data } = await supabase
        .from("profiles")
        .select("user_id, name, username, avatar_url")
        .or(`name.ilike.%${q}%,username.ilike.%${q}%`)
        .limit(30);
      const filtered = (data || []).filter((p: any) => p.user_id !== user?.id);
      setSearchResults(filtered as any);
      setSearching(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [search, tab, user?.id]);

  const toggleFollow = async (targetId: string) => {
    if (!user) return;
    if (myFollowing.has(targetId)) {
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", targetId);
      setMyFollowing((s) => {
        const n = new Set(s);
        n.delete(targetId);
        return n;
      });
    } else {
      const { error } = await supabase.from("follows").insert({ follower_id: user.id, following_id: targetId });
      if (error) {
        toast({ title: "Could not follow", description: error.message, variant: "destructive" });
        return;
      }
      setMyFollowing((s) => new Set(s).add(targetId));
    }
    if (user) loadAll(user.id);
  };

  const list =
    tab === "followers" ? followers : tab === "following" ? following : searchResults;

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
          <h1 className="font-playfair text-xl tracking-tight flex-1">Friends</h1>
          <button
            onClick={() => navigate("/community/messenger")}
            aria-label="Messenger"
            className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/15 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
        <div className="max-w-3xl mx-auto px-4 pb-3 flex gap-2">
          {(["followers", "following", "discover"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 py-2 rounded-full text-[12px] tracking-[0.16em] uppercase transition",
                tab === t
                  ? "bg-white text-black shadow-[0_6px_20px_-4px_rgba(255,255,255,0.4)]"
                  : "bg-white/[0.06] border border-white/15 text-white/70 hover:text-white"
              )}
            >
              {t === "followers" ? `Followers · ${followers.length}` : t === "following" ? `Following · ${following.length}` : "Discover"}
            </button>
          ))}
        </div>
        {tab === "discover" && (
          <div className="max-w-3xl mx-auto px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or @username"
                className="pl-9 bg-white/5 border-white/15 text-white placeholder:text-white/40"
              />
            </div>
          </div>
        )}
      </header>

      <main className="max-w-3xl mx-auto px-4 py-4 pb-32">
        {tab === "discover" && !search.trim() ? (
          <div className="text-center text-white/50 text-sm py-12">
            Type a name or @username to find believers.
          </div>
        ) : searching ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-white/60" />
          </div>
        ) : list.length === 0 ? (
          <div className="text-center text-white/50 text-sm py-12">
            {tab === "followers"
              ? "No followers yet."
              : tab === "following"
              ? "You're not following anyone yet. Try Discover."
              : "No matches found."}
          </div>
        ) : (
          <ul className="space-y-2">
            {list.map((p) => {
              const isFollowing = myFollowing.has(p.user_id);
              const isMe = p.user_id === user?.id;
              return (
                <li
                  key={p.user_id}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl"
                >
                  <button
                    onClick={() => navigate(`/u/${p.username || p.user_id}`)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                  >
                    <Avatar className="w-12 h-12 ring-1 ring-white/20">
                      {p.avatar_url && <AvatarImage src={p.avatar_url} />}
                      <AvatarFallback className="bg-white/10 text-white">
                        {(p.name?.[0] || p.username?.[0] || "B").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white truncate">
                        {p.name || p.username || "Believer"}
                      </div>
                      {p.username && (
                        <div className="text-[12px] text-white/50 truncate">@{p.username}</div>
                      )}
                    </div>
                  </button>
                  {!isMe && (
                    <Button
                      size="sm"
                      onClick={() => toggleFollow(p.user_id)}
                      className={cn(
                        "rounded-full text-xs",
                        isFollowing
                          ? "bg-white/10 text-white border border-white/20 hover:bg-white/15"
                          : "bg-gradient-to-r from-white/95 to-white/80 text-black hover:from-white"
                      )}
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5 mr-1" /> Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5 mr-1" /> Follow
                        </>
                      )}
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </main>

      <PremiumNav />
    </div>
  );
}

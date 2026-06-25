import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PremiumNav } from "@/components/PremiumNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Users,
  Crown,
  CheckCircle2,
  Loader2,
  Pencil,
  Trash2,
  Share2,
  Heart,
  MessageCircle,
  HandHeart,
  Sparkles,
  Send,
  ArrowLeft,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useSafeBackNavigation } from "@/hooks/useSafeBackNavigation";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Group {
  id: string;
  name: string;
  description: string | null;
  member_count: number;
  icon_url: string | null;
  creator_id: string | null;
  created_at: string;
}

interface GroupPost {
  id: string;
  user_id: string;
  author_name: string | null;
  author_avatar: string | null;
  post_type: string;
  content: string;
  like_count: number;
  comment_count: number;
  pray_count: number;
  encourage_count: number;
  created_at: string;
}

interface Member {
  user_id: string;
  joined_at: string;
  profile?: {
    name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
}

export default function GroupDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [group, setGroup] = useState<Group | null>(null);
  const [user, setUser] = useState<any>(null);
  const [joined, setJoined] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const handleBack = useSafeBackNavigation("/community/groups");

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [saving, setSaving] = useState(false);

  // Group feed
  const [posts, setPosts] = useState<GroupPost[]>([]);
  const [composer, setComposer] = useState("");
  const [composerType, setComposerType] = useState<"post" | "prayer" | "testimony">("post");
  const [posting, setPosting] = useState(false);
  const [myInteractions, setMyInteractions] = useState<Record<string, Set<string>>>({});

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    load();
  }, [id]);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    const { data: g } = await supabase
      .from("groups")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    setGroup(g as Group);
    if (g) {
      setEditName(g.name);
      setEditDesc(g.description || "");
    }

    const { data: u } = await supabase.auth.getUser();
    if (u.user) {
      const { data: m } = await supabase
        .from("group_members")
        .select("id")
        .eq("group_id", id)
        .eq("user_id", u.user.id)
        .maybeSingle();
      setJoined(!!m);
    }

    // Members + profile join (manual since no FK)
    const { data: mm } = await supabase
      .from("group_members")
      .select("user_id, joined_at")
      .eq("group_id", id)
      .order("joined_at", { ascending: true })
      .limit(50);
    const ids = (mm || []).map((r: any) => r.user_id);
    let profiles: any[] = [];
    if (ids.length) {
      const { data: ps } = await supabase
        .from("profiles")
        .select("user_id, name, username, avatar_url")
        .in("user_id", ids);
      profiles = ps || [];
    }
    const merged: Member[] = (mm || []).map((r: any) => ({
      user_id: r.user_id,
      joined_at: r.joined_at,
      profile: profiles.find((p) => p.user_id === r.user_id),
    }));
    setMembers(merged);

    // Group-scoped posts feed (Reddit-style)
    const { data: gp } = await supabase
      .from("posts")
      .select("id,user_id,author_name,author_avatar,post_type,content,like_count,comment_count,pray_count,encourage_count,created_at")
      .eq("group_id", id)
      .order("created_at", { ascending: false })
      .limit(50);
    setPosts((gp as GroupPost[]) || []);

    if (u.user && gp && gp.length) {
      const { data: ints } = await supabase
        .from("post_interactions")
        .select("post_id, interaction_type")
        .eq("user_id", u.user.id)
        .in("post_id", gp.map((p: any) => p.id));
      const map: Record<string, Set<string>> = {};
      (ints || []).forEach((r: any) => {
        if (!map[r.post_id]) map[r.post_id] = new Set();
        map[r.post_id].add(r.interaction_type);
      });
      setMyInteractions(map);
    } else {
      setMyInteractions({});
    }

    setLoading(false);
  };

  const handlePost = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!id || !composer.trim()) return;
    if (!joined && !isOwner) {
      toast({ title: "Join the group to post", variant: "destructive" });
      return;
    }
    setPosting(true);
    const { error } = await supabase.from("posts").insert({
      user_id: user.id,
      author_name: user.user_metadata?.name || user.email?.split("@")[0] || "Believer",
      post_type: composerType,
      content: composer.trim(),
      group_id: id,
    });
    setPosting(false);
    if (error) {
      toast({ title: "Could not post", description: error.message, variant: "destructive" });
      return;
    }
    setComposer("");
    load();
  };

  const toggleInteraction = async (postId: string, type: "like" | "pray" | "encourage") => {
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
    load();
  };

  const isOwner = !!user && !!group && group.creator_id === user.id;

  const toggleJoin = async () => {
    if (!user || !id) {
      navigate("/auth");
      return;
    }
    if (isOwner) return;
    setBusy(true);
    if (joined) {
      await supabase
        .from("group_members")
        .delete()
        .eq("group_id", id)
        .eq("user_id", user.id);
    } else {
      await supabase
        .from("group_members")
        .insert({ group_id: id, user_id: user.id });
    }
    setBusy(false);
    load();
  };

  const handleSave = async () => {
    if (!group) return;
    const n = editName.trim();
    if (!n) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("groups")
      .update({ name: n, description: editDesc.trim() || null })
      .eq("id", group.id);
    setSaving(false);
    if (error) {
      toast({ title: "Could not save", description: error.message, variant: "destructive" });
      return;
    }
    setEditOpen(false);
    toast({ title: "Group updated" });
    load();
  };

  const handleDelete = async () => {
    if (!group) return;
    if (!confirm(`Delete "${group.name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("groups").delete().eq("id", group.id);
    if (error) {
      toast({ title: "Could not delete", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Group deleted" });
    navigate("/community/groups");
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/community/group/${group?.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: group?.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast({ title: "Link copied" });
      }
    } catch {}
  };

  return (
    <div className="min-h-screen text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full bg-white/[0.04] blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[480px] h-[480px] rounded-full bg-white/[0.03] blur-3xl" />
      </div>

      <main className="px-5 sm:px-8 pb-32 max-w-3xl mx-auto">
        <CommunityHeader title="Group" />

        {loading ? (
          <div className="flex items-center justify-center py-20 text-white/40">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : !group ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-10 text-center text-white/60">
            Group not found.
          </div>
        ) : (
          <>
            {/* Hero card */}
            <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-transparent backdrop-blur-2xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.7)] animate-fade-in">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_60%)]" />
              <div className="relative p-6 sm:p-7">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/30 via-white/10 to-white/5 ring-1 ring-white/30 flex items-center justify-center shrink-0">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {isOwner && (
                      <div className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.22em] uppercase text-white/65 mb-2">
                        <Crown className="w-3 h-3" />
                        <span>Owner</span>
                      </div>
                    )}
                    <h2 className="font-playfair text-[26px] sm:text-3xl leading-[1.1] tracking-tight">
                      {group.name}
                    </h2>
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-white/55">
                      <span className="inline-flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {group.member_count}{" "}
                        {group.member_count === 1 ? "member" : "members"}
                      </span>
                      <span className="w-px h-3 bg-white/15" />
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(group.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {group.description && (
                  <p className="mt-5 text-[14px] text-white/75 leading-relaxed">
                    {group.description}
                  </p>
                )}

                <div className="mt-6 flex flex-wrap gap-2">
                  <Button
                    onClick={toggleJoin}
                    disabled={busy || isOwner}
                    className={
                      isOwner
                        ? "rounded-full h-11 px-5 bg-white/5 text-white/40 border border-white/10 cursor-default"
                        : joined
                          ? "rounded-full h-11 px-5 bg-white/[0.06] text-white border border-white/15 hover:bg-white/10"
                          : "rounded-full h-11 px-5 bg-gradient-to-b from-white to-white/85 text-black shadow-[0_10px_30px_-10px_rgba(255,255,255,0.5),inset_0_1px_0_rgba(255,255,255,0.6)] hover:from-white hover:to-white/95"
                    }
                  >
                    {busy ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isOwner ? (
                      "Owner"
                    ) : joined ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Joined
                      </>
                    ) : (
                      "Join Group"
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={handleShare}
                    className="rounded-full h-11 px-4 bg-white/[0.04] border border-white/10 text-white hover:bg-white/10"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>

                  {isOwner && (
                    <>
                      <Dialog open={editOpen} onOpenChange={setEditOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            className="rounded-full h-11 px-4 bg-white/[0.04] border border-white/10 text-white hover:bg-white/10"
                          >
                            <Pencil className="w-4 h-4" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="border-white/10 bg-[#0b0b0f]/95 backdrop-blur-2xl text-white max-w-md rounded-3xl">
                          <DialogHeader>
                            <DialogTitle className="font-playfair text-2xl text-center">
                              Edit Group
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 mt-2">
                            <div>
                              <label className="text-[10px] uppercase tracking-[0.18em] text-white/50">
                                Name
                              </label>
                              <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                maxLength={80}
                                className="mt-1.5 bg-white/5 border-white/15 text-white h-11 rounded-xl"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] uppercase tracking-[0.18em] text-white/50">
                                Description
                              </label>
                              <Textarea
                                value={editDesc}
                                onChange={(e) => setEditDesc(e.target.value)}
                                rows={3}
                                maxLength={500}
                                className="mt-1.5 bg-white/5 border-white/15 text-white rounded-xl resize-none"
                              />
                            </div>
                            <Button
                              onClick={handleSave}
                              disabled={saving}
                              className="w-full h-11 rounded-full bg-gradient-to-b from-white to-white/85 text-black hover:from-white hover:to-white/95"
                            >
                              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="ghost"
                        onClick={handleDelete}
                        className="rounded-full h-11 px-4 bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </section>

            {/* Members */}
            <section className="mt-8">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-[10px] tracking-[0.22em] uppercase text-white/55">
                  Members
                </h3>
                <span className="text-[11px] text-white/45">
                  Showing {members.length} of {group.member_count}
                </span>
              </div>
              {members.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-white/55 text-sm">
                  Be the first to join this circle.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {members.map((m) => {
                    const handle =
                      m.profile?.username || m.profile?.name || "Member";
                    const initial = (handle || "?").charAt(0).toUpperCase();
                    return (
                      <button
                        key={m.user_id}
                        onClick={() =>
                          m.profile?.username &&
                          navigate(`/u/${m.profile.username}`)
                        }
                        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-3 hover:bg-white/[0.07] hover:border-white/20 transition text-left"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/25 via-white/10 to-white/5 ring-1 ring-white/25 flex items-center justify-center overflow-hidden shrink-0">
                          {m.profile?.avatar_url ? (
                            <img
                              src={m.profile.avatar_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="font-playfair text-base text-white">
                              {initial}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm text-white truncate">
                            {handle}
                          </div>
                          <div className="text-[10px] uppercase tracking-[0.14em] text-white/45">
                            Joined{" "}
                            {new Date(m.joined_at).toLocaleDateString()}
                          </div>
                        </div>
                        {m.user_id === group.creator_id && (
                          <Crown className="w-3.5 h-3.5 text-white/70 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Composer */}
            <section className="mt-8">
              <h3 className="text-[10px] tracking-[0.22em] uppercase text-white/55 mb-3 px-1">
                Share with the group
              </h3>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-4">
                <div className="flex gap-1.5 mb-3">
                  {(["post", "prayer", "testimony"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setComposerType(t)}
                      className={`text-[10px] tracking-[0.18em] uppercase px-3 py-1.5 rounded-full border transition ${
                        composerType === t
                          ? "bg-white text-black border-white"
                          : "bg-white/[0.04] text-white/65 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <Textarea
                  value={composer}
                  onChange={(e) => setComposer(e.target.value)}
                  placeholder={
                    !user
                      ? "Sign in to share with the group"
                      : !joined && !isOwner
                        ? "Join the group to post"
                        : composerType === "prayer"
                          ? "Share a prayer request..."
                          : composerType === "testimony"
                            ? "Share what God has done..."
                            : "What's on your heart?"
                  }
                  rows={3}
                  maxLength={1000}
                  disabled={!user || (!joined && !isOwner)}
                  className="bg-white/5 border-white/15 text-white rounded-xl resize-none placeholder:text-white/35"
                />
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[10px] text-white/40">
                    {composer.length}/1000
                  </span>
                  <Button
                    onClick={handlePost}
                    disabled={posting || !composer.trim() || !user || (!joined && !isOwner)}
                    className="rounded-full h-10 px-5 bg-gradient-to-b from-white to-white/85 text-black hover:from-white hover:to-white/95"
                  >
                    {posting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" /> Post
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </section>

            {/* Group feed */}
            <section className="mt-8">
              <h3 className="text-[10px] tracking-[0.22em] uppercase text-white/55 mb-3 px-1">
                {posts.length} {posts.length === 1 ? "post" : "posts"}
              </h3>
              {posts.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-white/55 text-sm">
                  No posts yet. Be the first to share.
                </div>
              ) : (
                <div className="space-y-3">
                  {posts.map((p) => {
                    const initial = (p.author_name || "?").charAt(0).toUpperCase();
                    const liked = myInteractions[p.id]?.has("like");
                    const prayed = myInteractions[p.id]?.has("pray");
                    const encouraged = myInteractions[p.id]?.has("encourage");
                    return (
                      <article
                        key={p.id}
                        className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-4"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-white/25 via-white/10 to-white/5 ring-1 ring-white/25 flex items-center justify-center overflow-hidden shrink-0">
                            {p.author_avatar ? (
                              <img src={p.author_avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="font-playfair text-sm text-white">{initial}</span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm text-white truncate">{p.author_name || "Believer"}</div>
                            <div className="text-[10px] uppercase tracking-[0.14em] text-white/45">
                              {p.post_type} · {formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => navigate(`/community/post/${p.id}`)}
                          className="block w-full text-left text-[14px] text-white/85 leading-relaxed whitespace-pre-wrap"
                        >
                          {p.content}
                        </button>
                        <div className="mt-3 flex items-center gap-4 text-[11px] text-white/55">
                          <button
                            onClick={() => toggleInteraction(p.id, "like")}
                            className={`inline-flex items-center gap-1.5 transition ${liked ? "text-rose-300" : "hover:text-white"}`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${liked ? "fill-current" : ""}`} />
                            {p.like_count}
                          </button>
                          <button
                            onClick={() => toggleInteraction(p.id, "pray")}
                            className={`inline-flex items-center gap-1.5 transition ${prayed ? "text-amber-200" : "hover:text-white"}`}
                          >
                            <HandHeart className={`w-3.5 h-3.5 ${prayed ? "fill-current" : ""}`} />
                            {p.pray_count}
                          </button>
                          <button
                            onClick={() => toggleInteraction(p.id, "encourage")}
                            className={`inline-flex items-center gap-1.5 transition ${encouraged ? "text-sky-200" : "hover:text-white"}`}
                          >
                            <Sparkles className={`w-3.5 h-3.5 ${encouraged ? "fill-current" : ""}`} />
                            {p.encourage_count}
                          </button>
                          <button
                            onClick={() => navigate(`/community/post/${p.id}`)}
                            className="inline-flex items-center gap-1.5 hover:text-white ml-auto"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            {p.comment_count}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </main>
      <PremiumNav />
    </div>
  );
}

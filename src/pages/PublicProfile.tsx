import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, MessageSquare, UserPlus, UserCheck, Clock, Check, X, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PremiumNav } from "@/components/PremiumNav";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useSafeBackNavigation } from "@/hooks/useSafeBackNavigation";

type Rel =
  | { kind: "none" }
  | { kind: "friends"; id: string }
  | { kind: "outgoing"; id: string }
  | { kind: "incoming"; id: string };

export default function PublicProfile() {
  const { handle } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const handleBack = useSafeBackNavigation("/community");
  const [me, setMe] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [friendsCount, setFriendsCount] = useState(0);
  const [rel, setRel] = useState<Rel>({ kind: "none" });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    load();
  }, [handle]);

  // Live-update when the friendship row for this pair changes on either side
  useEffect(() => {
    if (!me?.id || !profile?.user_id) return;
    const channel = supabase
      .channel(`pp-friendship-${me.id}-${profile.user_id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "friendships" },
        (payload: any) => {
          const row = (payload.new || payload.old) as any;
          if (!row) return;
          const pair =
            (row.requester_id === me.id && row.addressee_id === profile.user_id) ||
            (row.requester_id === profile.user_id && row.addressee_id === me.id);
          if (pair) load();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [me?.id, profile?.user_id]);

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

      const { count: fcount } = await supabase
        .from("friendships")
        .select("id", { count: "exact", head: true })
        .eq("status", "accepted")
        .or(`requester_id.eq.${prof.user_id},addressee_id.eq.${prof.user_id}`);
      setFriendsCount(fcount || 0);


      if (auth.user && auth.user.id !== prof.user_id) {
        const { data: f } = await supabase
          .from("friendships")
          .select("id, requester_id, addressee_id, status")
          .or(
            `and(requester_id.eq.${auth.user.id},addressee_id.eq.${prof.user_id}),and(requester_id.eq.${prof.user_id},addressee_id.eq.${auth.user.id})`
          )
          .maybeSingle();
        if (f) {
          if (f.status === "accepted") setRel({ kind: "friends", id: f.id });
          else if (f.status === "pending") {
            if (f.requester_id === auth.user.id) setRel({ kind: "outgoing", id: f.id });
            else setRel({ kind: "incoming", id: f.id });
          } else setRel({ kind: "none" });
        } else setRel({ kind: "none" });
      }
    }
    setLoading(false);
  };

  const sendRequest = async () => {
    if (!me) { navigate("/auth"); return; }
    if (!profile) return;
    setBusy(true);
    const { data, error } = await supabase.rpc("send_friend_request", { p_target: profile.user_id });
    setBusy(false);
    if (error) {
      toast({ title: "Could not send request", description: error.message, variant: "destructive" });
      return;
    }
    const status = (data as any)?.status;
    toast({
      title:
        status === "accepted"
          ? "You're now friends"
          : status === "pending"
          ? "Friend request sent"
          : "Done",
    });
    load();
  };

  const doRemove = async () => {
    if (!profile) return;
    setBusy(true);
    await supabase.rpc("remove_friendship", { p_target: profile.user_id });
    setBusy(false);
    load();
  };

  const accept = async () => {
    if (rel.kind !== "incoming") return;
    setBusy(true);
    const { error } = await supabase.rpc("respond_friend_request", {
      p_friendship_id: rel.id,
      p_accept: true,
    });
    setBusy(false);
    if (error) {
      toast({ title: "Could not accept", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "You're now friends" });
    load();
  };

  const doDecline = async () => {
    if (rel.kind !== "incoming") return;
    setBusy(true);
    await supabase.rpc("respond_friend_request", { p_friendship_id: rel.id, p_accept: false });
    setBusy(false);
    load();
  };

  const [confirmKind, setConfirmKind] = useState<null | "decline" | "cancel" | "unfriend">(null);
  const askDecline = () => setConfirmKind("decline");
  const cancelOrUnfriend = () => setConfirmKind(rel.kind === "friends" ? "unfriend" : "cancel");
  const runConfirmed = async () => {
    const k = confirmKind;
    setConfirmKind(null);
    if (k === "decline") await doDecline();
    else await doRemove();
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
        <Button onClick={handleBack} className="mt-4">Go back</Button>
      </div>
    );
  }

  const isMe = me?.id === profile.user_id;

  return (
    <div className="min-h-screen text-white">
      <header className="sticky top-0 z-30 bg-black/40 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={handleBack}
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
              onClick={() => navigate(`/community/messages?to=${profile.user_id}`)}
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
          <div className="flex-1 grid grid-cols-2 gap-2 text-center">
            <Stat n={posts.length} label="Posts" />
            <Stat n={friendsCount} label="Friends" onClick={() => navigate("/friends?tab=friends")} clickable={isMe} />
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
              {rel.kind === "incoming" ? (
                <>
                  <Button
                    onClick={accept}
                    disabled={busy}
                    className="flex-1 rounded-full bg-gradient-to-r from-white/95 to-white/80 text-black hover:from-white"
                  >
                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : (<><Check className="w-4 h-4 mr-1" /> Accept</>)}
                  </Button>
                  <Button
                    onClick={askDecline}
                    disabled={busy}
                    className="rounded-full bg-white/10 text-white border border-white/20 hover:bg-white/15"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Button
                  onClick={
                    rel.kind === "friends" || rel.kind === "outgoing" ? cancelOrUnfriend : sendRequest
                  }
                  disabled={busy}
                  className={cn(
                    "flex-1 rounded-full",
                    rel.kind === "none"
                      ? "bg-gradient-to-r from-white/95 to-white/80 text-black hover:from-white"
                      : "bg-white/10 text-white border border-white/20 hover:bg-white/15"
                  )}
                >
                  {busy ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : rel.kind === "friends" ? (
                    <><UserCheck className="w-4 h-4 mr-1" /> Friends</>
                  ) : rel.kind === "outgoing" ? (
                    <><Clock className="w-4 h-4 mr-1" /> Requested</>
                  ) : (
                    <><UserPlus className="w-4 h-4 mr-1" /> Add friend</>
                  )}
                </Button>
              )}
              <Button
                onClick={() => navigate(`/community/messages?to=${profile.user_id}`)}
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

      <AlertDialog open={!!confirmKind} onOpenChange={(o) => !o && setConfirmKind(null)}>
        <AlertDialogContent className="bg-zinc-900 border border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmKind === "decline"
                ? `Decline request from ${profile?.name || profile?.username || "this person"}?`
                : confirmKind === "cancel"
                ? `Cancel friend request?`
                : `Remove ${profile?.name || profile?.username || "this person"} as a friend?`}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              {confirmKind === "decline"
                ? "They will not be notified."
                : confirmKind === "cancel"
                ? "Your pending request will be removed."
                : "You can send a new friend request later."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/15 text-white hover:bg-white/10">
              Keep
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={runConfirmed}
              className="bg-red-500/90 hover:bg-red-500 text-white"
            >
              {confirmKind === "decline"
                ? "Decline"
                : confirmKind === "cancel"
                ? "Cancel request"
                : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

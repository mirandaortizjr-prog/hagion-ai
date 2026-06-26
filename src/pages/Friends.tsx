import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  Search,
  MessageSquare,
  UserPlus,
  UserCheck,
  UserX,
  Clock,
  Check,
  X,
  Loader2,
  Share2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PremiumNav } from "@/components/PremiumNav";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type Tab = "friends" | "requests" | "discover";

interface ProfileRow {
  user_id: string;
  name: string | null;
  username: string | null;
  avatar_url: string | null;
}

interface FriendshipRow {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: "pending" | "accepted" | "declined";
}

type RelState =
  | { kind: "none" }
  | { kind: "friends"; id: string }
  | { kind: "outgoing"; id: string }
  | { kind: "incoming"; id: string };

export default function Friends() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const initialTab = (params.get("tab") as Tab) || "friends";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [user, setUser] = useState<any>(null);

  const [friends, setFriends] = useState<ProfileRow[]>([]);
  const [incoming, setIncoming] = useState<(ProfileRow & { friendshipId: string })[]>([]);
  const [outgoing, setOutgoing] = useState<(ProfileRow & { friendshipId: string })[]>([]);

  const [relMap, setRelMap] = useState<Map<string, RelState>>(new Map());

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<ProfileRow[]>([]);
  const [searching, setSearching] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [myCode, setMyCode] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (!data.user) { navigate("/auth"); return; }
      loadAll(data.user.id);
      const { data: prof } = await supabase
        .from("profiles")
        .select("invite_code")
        .eq("user_id", data.user.id)
        .maybeSingle();
      setMyCode((prof as any)?.invite_code || null);
    });
  }, []);

  useEffect(() => {
    setParams({ tab }, { replace: true });
  }, [tab]);

  const loadAll = useCallback(async (uid: string) => {
    const { data: rows } = await supabase
      .from("friendships")
      .select("id, requester_id, addressee_id, status")
      .or(`requester_id.eq.${uid},addressee_id.eq.${uid}`);

    const all = (rows || []) as FriendshipRow[];
    const otherIds = new Set<string>();
    const map = new Map<string, RelState>();

    all.forEach((r) => {
      const other = r.requester_id === uid ? r.addressee_id : r.requester_id;
      otherIds.add(other);
      if (r.status === "accepted") map.set(other, { kind: "friends", id: r.id });
      else if (r.status === "pending") {
        if (r.requester_id === uid) map.set(other, { kind: "outgoing", id: r.id });
        else map.set(other, { kind: "incoming", id: r.id });
      }
    });

    const ids = Array.from(otherIds);
    const { data: profs } = ids.length
      ? await supabase
          .from("profiles")
          .select("user_id, name, username, avatar_url")
          .in("user_id", ids)
      : { data: [] as any[] };

    const byId = new Map<string, ProfileRow>(
      (profs || []).map((p: any) => [p.user_id, p as ProfileRow])
    );

    const fr: ProfileRow[] = [];
    const inc: (ProfileRow & { friendshipId: string })[] = [];
    const out: (ProfileRow & { friendshipId: string })[] = [];

    all.forEach((r) => {
      const other = r.requester_id === uid ? r.addressee_id : r.requester_id;
      const p = byId.get(other);
      if (!p) return;
      if (r.status === "accepted") fr.push(p);
      else if (r.status === "pending") {
        if (r.requester_id === uid) out.push({ ...p, friendshipId: r.id });
        else inc.push({ ...p, friendshipId: r.id });
      }
    });

    setFriends(fr);
    setIncoming(inc);
    setOutgoing(out);
    setRelMap(map);
  }, []);

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

  const sendRequest = async (targetId: string) => {
    if (!user) return;
    setBusyId(targetId);
    const { error } = await supabase
      .from("friendships")
      .insert({ requester_id: user.id, addressee_id: targetId, status: "pending" });
    setBusyId(null);
    if (error) {
      toast({ title: "Could not send request", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Friend request sent" });
    loadAll(user.id);
  };

  const cancelOrRemove = async (friendshipId: string, targetId: string) => {
    if (!user) return;
    setBusyId(targetId);
    const { error } = await supabase.from("friendships").delete().eq("id", friendshipId);
    setBusyId(null);
    if (error) {
      toast({ title: "Action failed", description: error.message, variant: "destructive" });
      return;
    }
    loadAll(user.id);
  };

  const accept = async (friendshipId: string, targetId: string) => {
    if (!user) return;
    setBusyId(targetId);
    const { error } = await supabase
      .from("friendships")
      .update({ status: "accepted", responded_at: new Date().toISOString() })
      .eq("id", friendshipId);
    setBusyId(null);
    if (error) {
      toast({ title: "Could not accept", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "You're now friends" });
    loadAll(user.id);
  };

  const decline = async (friendshipId: string, targetId: string) => {
    if (!user) return;
    setBusyId(targetId);
    const { error } = await supabase.from("friendships").delete().eq("id", friendshipId);
    setBusyId(null);
    if (error) {
      toast({ title: "Could not decline", description: error.message, variant: "destructive" });
      return;
    }
    loadAll(user.id);
  };

  const renderDiscoverAction = (p: ProfileRow) => {
    const rel = relMap.get(p.user_id) || { kind: "none" as const };
    const isBusy = busyId === p.user_id;
    if (rel.kind === "friends")
      return (
        <Button
          size="sm"
          onClick={() => cancelOrRemove(rel.id, p.user_id)}
          disabled={isBusy}
          className="rounded-full text-xs bg-white/10 text-white border border-white/20 hover:bg-white/15"
        >
          <UserCheck className="w-3.5 h-3.5 mr-1" /> Friends
        </Button>
      );
    if (rel.kind === "outgoing")
      return (
        <Button
          size="sm"
          onClick={() => cancelOrRemove(rel.id, p.user_id)}
          disabled={isBusy}
          className="rounded-full text-xs bg-white/10 text-white border border-white/20 hover:bg-white/15"
        >
          <Clock className="w-3.5 h-3.5 mr-1" /> Requested
        </Button>
      );
    if (rel.kind === "incoming")
      return (
        <div className="flex gap-1.5">
          <Button
            size="sm"
            onClick={() => accept(rel.id, p.user_id)}
            disabled={isBusy}
            className="rounded-full text-xs bg-gradient-to-r from-white/95 to-white/80 text-black hover:from-white"
          >
            <Check className="w-3.5 h-3.5 mr-1" /> Accept
          </Button>
          <Button
            size="sm"
            onClick={() => decline(rel.id, p.user_id)}
            disabled={isBusy}
            className="rounded-full text-xs bg-white/10 text-white border border-white/20 hover:bg-white/15"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      );
    return (
      <Button
        size="sm"
        onClick={() => sendRequest(p.user_id)}
        disabled={isBusy}
        className="rounded-full text-xs bg-gradient-to-r from-white/95 to-white/80 text-black hover:from-white"
      >
        <UserPlus className="w-3.5 h-3.5 mr-1" /> Add
      </Button>
    );
  };

  const requestsCount = incoming.length + outgoing.length;

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
            onClick={() => navigate("/community/messages")}
            aria-label="Messages"
            className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/15 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
        <div className="max-w-3xl mx-auto px-4 pb-3 flex gap-2">
          {(["friends", "requests", "discover"] as Tab[]).map((t) => {
            const count = t === "friends" ? friends.length : t === "requests" ? requestsCount : null;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "group relative flex-1 py-2 rounded-full text-[10px] tracking-[0.14em] uppercase font-medium",
                  "transition-all duration-300 ease-out active:scale-95",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                  tab === t
                    ? "text-white font-semibold bg-gradient-to-b from-primary/30 to-primary/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_4px_16px_-4px_hsl(var(--primary)/0.5)] drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
                    : "text-white/60 hover:text-white bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] backdrop-blur-xl"
                )}
              >
                <span className="relative inline-flex items-center gap-1.5">
                  {t === "friends" ? "Friends" : t === "requests" ? "Requests" : "Discover"}
                  {count !== null && (
                    <span
                      className={cn(
                        "inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full text-[9px] font-semibold",
                        tab === t
                          ? "bg-primary/30 text-white ring-1 ring-primary/50"
                          : "bg-white/10 text-white/70",
                        t === "requests" && incoming.length > 0 && "bg-primary/60 text-white ring-1 ring-primary"
                      )}
                    >
                      {count}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
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
        {tab === "friends" && (
          friends.length === 0 ? (
            <div className="text-center text-white/50 text-sm py-12">
              No friends yet. Try Discover to find believers.
            </div>
          ) : (
            <ul className="space-y-2">
              {friends.map((p) => (
                <li
                  key={p.user_id}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl"
                >
                  <ProfileLink p={p} onClick={() => navigate(`/u/${p.username || p.user_id}`)} />
                  <Button
                    size="sm"
                    onClick={() => navigate(`/community/messages?to=${p.user_id}`)}
                    className="rounded-full text-xs bg-white/10 text-white border border-white/20 hover:bg-white/15"
                  >
                    <MessageSquare className="w-3.5 h-3.5 mr-1" /> Message
                  </Button>
                </li>
              ))}
            </ul>
          )
        )}

        {tab === "requests" && (
          <div className="space-y-6">
            <section>
              <h2 className="text-[11px] uppercase tracking-[0.18em] text-white/50 mb-2 px-1">
                Incoming {incoming.length > 0 && `(${incoming.length})`}
              </h2>
              {incoming.length === 0 ? (
                <div className="text-center text-white/40 text-xs py-6">No new requests.</div>
              ) : (
                <ul className="space-y-2">
                  {incoming.map((p) => (
                    <li
                      key={p.user_id}
                      className="flex items-center gap-3 p-3 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl"
                    >
                      <ProfileLink p={p} onClick={() => navigate(`/u/${p.username || p.user_id}`)} />
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          onClick={() => accept(p.friendshipId, p.user_id)}
                          disabled={busyId === p.user_id}
                          className="rounded-full text-xs bg-gradient-to-r from-white/95 to-white/80 text-black hover:from-white"
                        >
                          <Check className="w-3.5 h-3.5 mr-1" /> Accept
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => decline(p.friendshipId, p.user_id)}
                          disabled={busyId === p.user_id}
                          className="rounded-full text-xs bg-white/10 text-white border border-white/20 hover:bg-white/15"
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h2 className="text-[11px] uppercase tracking-[0.18em] text-white/50 mb-2 px-1">
                Sent {outgoing.length > 0 && `(${outgoing.length})`}
              </h2>
              {outgoing.length === 0 ? (
                <div className="text-center text-white/40 text-xs py-6">No pending sent requests.</div>
              ) : (
                <ul className="space-y-2">
                  {outgoing.map((p) => (
                    <li
                      key={p.user_id}
                      className="flex items-center gap-3 p-3 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl"
                    >
                      <ProfileLink p={p} onClick={() => navigate(`/u/${p.username || p.user_id}`)} />
                      <Button
                        size="sm"
                        onClick={() => cancelOrRemove(p.friendshipId, p.user_id)}
                        disabled={busyId === p.user_id}
                        className="rounded-full text-xs bg-white/10 text-white border border-white/20 hover:bg-white/15"
                      >
                        <UserX className="w-3.5 h-3.5 mr-1" /> Cancel
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}

        {tab === "discover" && (
          !search.trim() ? (
            <div className="text-center text-white/50 text-sm py-12">
              Type a name or @username to find believers.
            </div>
          ) : searching ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-white/60" />
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center text-white/50 text-sm py-12">No matches found.</div>
          ) : (
            <ul className="space-y-2">
              {searchResults.map((p) => (
                <li
                  key={p.user_id}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl"
                >
                  <ProfileLink p={p} onClick={() => navigate(`/u/${p.username || p.user_id}`)} />
                  {renderDiscoverAction(p)}
                </li>
              ))}
            </ul>
          )
        )}
      </main>

      <PremiumNav />
    </div>
  );
}

const ProfileLink = ({ p, onClick }: { p: ProfileRow; onClick: () => void }) => (
  <button onClick={onClick} className="flex items-center gap-3 flex-1 min-w-0 text-left">
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
      {p.username && <div className="text-[12px] text-white/50 truncate">@{p.username}</div>}
    </div>
  </button>
);

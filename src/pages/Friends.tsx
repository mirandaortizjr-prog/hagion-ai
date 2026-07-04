import { useLanguage } from "@/contexts/LanguageContext";
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
import { InviteSheet } from "@/components/InviteSheet";

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
  const { language } = useLanguage();
  const t = (en: string, es: string) => (language === "es" ? es : en);
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
  const [myName, setMyName] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  const [confirmAction, setConfirmAction] = useState<null | {
    type: "decline" | "cancel" | "unfriend";
    friendshipId?: string;
    targetId: string;
    name: string;
  }>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (!data.user) { navigate("/auth"); return; }
      loadAll(data.user.id);
      const { data: prof } = await supabase
        .from("profiles")
        .select("invite_code, name, username")
        .eq("user_id", data.user.id)
        .maybeSingle();
      setMyCode((prof as any)?.invite_code || null);
      setMyName((prof as any)?.name || (prof as any)?.username || null);

      // Realtime — both parties see updates instantly
      const channel = supabase
        .channel("friendships-" + data.user.id)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "friendships" },
          (payload: any) => {
            const row = (payload.new || payload.old) as any;
            if (!row) return;
            if (row.requester_id === data.user!.id || row.addressee_id === data.user!.id) {
              loadAll(data.user!.id);
            }
          }
        )
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
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
    const { data, error } = await supabase.rpc("send_friend_request", { p_target: targetId });
    setBusyId(null);
    if (error) {
      toast({ title: t("Could not send request", "No se pudo enviar la solicitud"), description: error.message, variant: "destructive" });
      return;
    }
    const status = (data as any)?.status;
    toast({
      title:
        status === "accepted"
          ? t("You're now friends", "Ahora sois amigos")
          : status === "pending"
          ? t("Friend request sent", "Solicitud de amistad enviada")
          : t("Done", "Hecho"),
    });
    loadAll(user.id);
  };

  const doRemove = async (targetId: string) => {
    if (!user) return;
    setBusyId(targetId);
    const { error } = await supabase.rpc("remove_friendship", { p_target: targetId });
    setBusyId(null);
    if (error) {
      toast({ title: t("Action failed", "La acción falló"), description: error.message, variant: "destructive" });
      return;
    }
    loadAll(user.id);
  };

  const accept = async (friendshipId: string, targetId: string) => {
    if (!user) return;
    setBusyId(targetId);
    const { error } = await supabase.rpc("respond_friend_request", {
      p_friendship_id: friendshipId,
      p_accept: true,
    });
    setBusyId(null);
    if (error) {
      toast({ title: t("Could not accept", "No se pudo aceptar"), description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: t("You're now friends", "Ahora sois amigos") });
    loadAll(user.id);
  };

  const doDecline = async (friendshipId: string, targetId: string) => {
    if (!user) return;
    setBusyId(targetId);
    const { error } = await supabase.rpc("respond_friend_request", {
      p_friendship_id: friendshipId,
      p_accept: false,
    });
    setBusyId(null);
    if (error) {
      toast({ title: t("Could not decline", "No se pudo rechazar"), description: error.message, variant: "destructive" });
      return;
    }
    loadAll(user.id);
  };

  // Wrappers that first ask for confirmation
  const askDecline = (friendshipId: string, targetId: string, name: string) =>
    setConfirmAction({ type: "decline", friendshipId, targetId, name });
  const askCancel = (friendshipId: string, targetId: string, name: string) =>
    setConfirmAction({ type: "cancel", friendshipId, targetId, name });
  const askUnfriend = (targetId: string, name: string) =>
    setConfirmAction({ type: "unfriend", targetId, name });

  const runConfirmed = async () => {
    if (!confirmAction) return;
    const c = confirmAction;
    setConfirmAction(null);
    if (c.type === "decline" && c.friendshipId) {
      await doDecline(c.friendshipId, c.targetId);
    } else {
      await doRemove(c.targetId);
    }
  };


  const renderDiscoverAction = (p: ProfileRow) => {
    const rel = relMap.get(p.user_id) || { kind: "none" as const };
    const isBusy = busyId === p.user_id;
    if (rel.kind === "friends")
      return (
        <Button
          size="sm"
          onClick={() => askUnfriend(p.user_id, p.name || p.username || t("this person", "esta persona"))}
          disabled={isBusy}
          className="rounded-full text-xs bg-white/10 text-white border border-white/20 hover:bg-white/15"
        >
          <UserCheck className="w-3.5 h-3.5 mr-1" /> {t("Friends", "Amigos")}
        </Button>
      );
    if (rel.kind === "outgoing")
      return (
        <Button
          size="sm"
          onClick={() => askCancel(rel.id, p.user_id, p.name || p.username || t("this person", "esta persona"))}
          disabled={isBusy}
          className="rounded-full text-xs bg-white/10 text-white border border-white/20 hover:bg-white/15"
        >
          <Clock className="w-3.5 h-3.5 mr-1" /> {t("Requested", "Solicitado")}
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
            <Check className="w-3.5 h-3.5 mr-1" /> {t("Accept", "Aceptar")}
          </Button>
          <Button
            size="sm"
            onClick={() => askDecline(rel.id, p.user_id, p.name || p.username || t("this person", "esta persona"))}
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
        <UserPlus className="w-3.5 h-3.5 mr-1" /> {t("Add", "Añadir")}
      </Button>
    );
  };

  const requestsCount = incoming.length + outgoing.length;

  const handleInvite = () => setInviteOpen(true);


  return (
    <div className="min-h-screen text-white">
      <header className="sticky top-0 z-30 bg-black/40 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/community"))}
            aria-label={t("Back", "Volver")}
            className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/15 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="font-playfair text-xl tracking-tight flex-1">{t("Friends", "Amigos")}</h1>
          <button
            onClick={handleInvite}
            aria-label={t("Invite friends", "Invitar amigos")}
            className="h-9 px-3 rounded-full bg-gradient-to-r from-primary/30 to-primary/10 border border-primary/40 flex items-center gap-1.5 text-xs font-medium text-white hover:from-primary/40 hover:to-primary/20"
          >
            <Share2 className="w-3.5 h-3.5" /> {t("Invite", "Invitar")}
          </button>
          <button
            onClick={() => navigate("/community/messages")}
            aria-label={t("Messages", "Mensajes")}
            className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/15 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
        <div className="max-w-3xl mx-auto px-4 pb-3 flex gap-2">
          {(["friends", "requests", "discover"] as Tab[]).map((tabOption) => {
            const count = tabOption === "friends" ? friends.length : tabOption === "requests" ? requestsCount : null;
            return (
              <button
                key={tabOption}
                onClick={() => setTab(tabOption)}
                className={cn(
                  "group relative flex-1 py-2 rounded-full text-[10px] tracking-[0.14em] uppercase font-medium",
                  "transition-all duration-300 ease-out active:scale-95",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                  tab === tabOption
                    ? "text-white font-semibold bg-gradient-to-b from-primary/30 to-primary/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_4px_16px_-4px_hsl(var(--primary)/0.5)] drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
                    : "text-white/60 hover:text-white bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] backdrop-blur-xl"
                )}
              >
                <span className="relative inline-flex items-center gap-1.5">
                  {tabOption === "friends" ? t("Friends", "Amigos") : tabOption === "requests" ? t("Requests", "Solicitudes") : t("Discover", "Descubrir")}
                  {count !== null && (
                    <span
                      className={cn(
                        "inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full text-[9px] font-semibold",
                        tab === tabOption
                          ? "bg-primary/30 text-white ring-1 ring-primary/50"
                          : "bg-white/10 text-white/70",
                        tabOption === "requests" && incoming.length > 0 && "bg-primary/60 text-white ring-1 ring-primary"
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
                placeholder={t("Search by name or @username", "Buscar por nombre o @usuario")}
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
              {t("No friends yet. Try Discover to find believers.", "Aún no tienes amigos. Prueba a Descubrir para encontrar creyentes.")}
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
                    <MessageSquare className="w-3.5 h-3.5 mr-1" /> {t("Message", "Mensaje")}
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
                 {t("Incoming", "Recibidas")} {incoming.length > 0 && `(${incoming.length})`}
              </h2>
              {incoming.length === 0 ? (
                <div className="text-center text-white/40 text-xs py-6">{t("No new requests.", "No hay nuevas solicitudes.")}</div>
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
                          <Check className="w-3.5 h-3.5 mr-1" /> {t("Accept", "Aceptar")}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => askDecline(p.friendshipId, p.user_id, p.name || p.username || t("this person", "esta persona"))}
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
                 {t("Sent", "Enviadas")} {outgoing.length > 0 && `(${outgoing.length})`}
              </h2>
              {outgoing.length === 0 ? (
                <div className="text-center text-white/40 text-xs py-6">{t("No pending sent requests.", "No hay solicitudes enviadas pendientes.")}</div>
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
                        onClick={() => askCancel(p.friendshipId, p.user_id, p.name || p.username || t("this person", "esta persona"))}
                        disabled={busyId === p.user_id}
                        className="rounded-full text-xs bg-white/10 text-white border border-white/20 hover:bg-white/15"
                      >
                        <UserX className="w-3.5 h-3.5 mr-1" /> {t("Cancel", "Cancelar")}
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
              {t("Type a name or @username to find believers.", "Escribe un nombre o @usuario para encontrar creyentes.")}
            </div>
          ) : searching ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-white/60" />
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center text-white/50 text-sm py-12">{t("No matches found.", "No se encontraron coincidencias.")}</div>
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

      <AlertDialog open={!!confirmAction} onOpenChange={(o) => !o && setConfirmAction(null)}>
        <AlertDialogContent className="bg-zinc-900 border border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === "decline"
                ? t(`Decline request from ${confirmAction?.name}?`, `¿Rechazar solicitud de ${confirmAction?.name}?`)
                : confirmAction?.type === "cancel"
                ? t(`Cancel request to ${confirmAction?.name}?`, `¿Cancelar solicitud a ${confirmAction?.name}?`)
                : t(`Remove ${confirmAction?.name} as a friend?`, `¿Eliminar a ${confirmAction?.name} de tus amigos?`)}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              {confirmAction?.type === "decline"
                ? t("They will not be notified, and the request will disappear.", "No se les notificará y la solicitud desaparecerá.")
                : confirmAction?.type === "cancel"
                ? t("The pending request will be removed.", "Se eliminará la solicitud pendiente.")
                : t("You can send a new friend request later.", "Puedes enviar una nueva solicitud de amistad más tarde.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/15 text-white hover:bg-white/10">
              {t("Keep", "Mantener")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={runConfirmed}
              className="bg-red-500/90 hover:bg-red-500 text-white"
            >
              {confirmAction?.type === "decline"
                ? t("Decline", "Rechazar")
                : confirmAction?.type === "cancel"
                ? t("Cancel request", "Cancelar solicitud")
                : t("Remove", "Eliminar")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PremiumNav />

      <InviteSheet
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        inviteUrl={myCode ? `https://hagion-ai.lovable.app/invite/${myCode}` : null}
        inviterName={myName}
      />

    </div>
  );
}

const ProfileLink = ({ p, onClick }: { p: ProfileRow; onClick: () => void }) => {
  const { language } = useLanguage();
  const t = (en: string, es: string) => (language === "es" ? es : en);
  return (
  <button onClick={onClick} className="flex items-center gap-3 flex-1 min-w-0 text-left">
    <Avatar className="w-12 h-12 ring-1 ring-white/20">
      {p.avatar_url && <AvatarImage src={p.avatar_url} />}
      <AvatarFallback className="bg-white/10 text-white">
        {(p.name?.[0] || p.username?.[0] || "B").toUpperCase()}
      </AvatarFallback>
    </Avatar>
    <div className="min-w-0">
      <div className="text-sm font-semibold text-white truncate">
        {p.name || p.username || t("Believer", "Creyente")}
      </div>
      {p.username && <div className="text-[12px] text-white/50 truncate">@{p.username}</div>}
    </div>
  </button>
  );
};

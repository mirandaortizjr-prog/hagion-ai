import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useSafeBackNavigation } from "@/hooks/useSafeBackNavigation";
import {
  Users,
  Plus,
  Search,
  Loader2,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  X,
  Church as ChurchIcon,
  DoorOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface Group {
  id: string;
  name: string;
  description: string | null;
  member_count: number;
  icon_url: string | null;
  creator_id: string | null;
  created_at: string;
  room_type?: string | null;
}

type Tab = "rooms" | "church";

export default function GroupsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = (en: string, es: string) => (language === "es" ? es : en);
  const handleBack = useSafeBackNavigation("/community");

  const [user, setUser] = useState<any>(null);
  const [rooms, setRooms] = useState<Group[]>([]);
  const [memberships, setMemberships] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("rooms");
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Request a Room dialog
  const [requestOpen, setRequestOpen] = useState(false);
  const [reqName, setReqName] = useState("");
  const [reqDesc, setReqDesc] = useState("");
  const [reqWhy, setReqWhy] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // My Church state
  const [myChurch, setMyChurch] = useState<any>(null);
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    load();
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50);
  }, [searchOpen]);

  const load = async () => {
    setLoading(true);
    const { data: g } = await (supabase
      .from("groups") as any)
      .select("*")
      .eq("room_type", "room")
      .order("member_count", { ascending: false })
      .limit(100);
    setRooms((g as any) || []);

    const { data: u } = await supabase.auth.getUser();
    if (u.user) {
      const { data: m } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", u.user.id);
      setMemberships(new Set((m || []).map((r: any) => r.group_id)));

      // My Church
      const { data: cm } = await supabase
        .from("church_members" as any)
        .select("church_id, churches(*)")
        .eq("user_id", u.user.id)
        .limit(1)
        .maybeSingle();
      setMyChurch((cm as any)?.churches || null);
    }
    setLoading(false);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rooms;
    return rooms.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        (g.description || "").toLowerCase().includes(q),
    );
  }, [rooms, search]);

  const toggleJoin = async (g: Group) => {
    if (!user) return navigate("/auth");
    if (memberships.has(g.id)) {
      await supabase
        .from("group_members")
        .delete()
        .eq("group_id", g.id)
        .eq("user_id", user.id);
      const next = new Set(memberships);
      next.delete(g.id);
      setMemberships(next);
    } else {
      await supabase.from("group_members").insert({ group_id: g.id, user_id: user.id });
      setMemberships(new Set(memberships).add(g.id));
    }
    load();
  };

  const submitRequest = async () => {
    if (!user) return navigate("/auth");
    const n = reqName.trim();
    if (!n) {
      toast({ title: t("Room name is required", "El nombre de la sala es obligatorio"), variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("room_requests" as any).insert({
      requester_id: user.id,
      name: n,
      description: reqDesc.trim() || null,
      rationale: reqWhy.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: t("Could not submit", "No se pudo enviar"), description: error.message, variant: "destructive" });
      return;
    }
    setReqName("");
    setReqDesc("");
    setReqWhy("");
    setRequestOpen(false);
    toast({ title: t("Request submitted", "Solicitud enviada"), description: t("We'll review it shortly.", "La revisaremos pronto.") });
  };

  const handleJoinChurch = async () => {
    if (!user) return navigate("/auth");
    const code = joinCode.trim().toLowerCase();
    if (!code) return;
    setJoining(true);
    const { data, error } = await supabase.rpc("join_church_by_code" as any, { p_code: code });
    setJoining(false);
    if (error || !(data as any)?.ok) {
      toast({
        title: t("Could not join", "No se pudo unir"),
        description: (data as any)?.error === "invalid_code" ? t("Invite code not found", "Código de invitación no encontrado") : (error?.message || t("Try again", "Inténtalo de nuevo")),
        variant: "destructive",
      });
      return;
    }
    toast({ title: t("Welcome to your church 🏛️", "Bienvenido a tu iglesia 🏛️") });
    setJoinCode("");
    load();
  };

  return (
    <div className="min-h-screen text-white">
      <main className="px-4 sm:px-6 pb-32 max-w-2xl mx-auto">
        {/* Header */}
        <header className="pt-5 pb-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              aria-label={t("Back", "Atrás")}
              className="h-9 w-9 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <h1 className="flex-1 font-playfair text-xl leading-none tracking-tight text-white truncate">
              {tab === "rooms" ? t("Rooms", "Salas") : t("My Church", "Mi Iglesia")}
            </h1>

            {tab === "rooms" && (
              !searchOpen ? (
                <button
                  onClick={() => setSearchOpen(true)}
                  aria-label={t("Search", "Buscar")}
                  className="h-9 w-9 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition active:scale-95"
                >
                  <Search className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => { setSearchOpen(false); setSearch(""); }}
                  aria-label={t("Close search", "Cerrar búsqueda")}
                  className="h-9 w-9 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition active:scale-95"
                >
                  <X className="w-4 h-4" />
                </button>
              )
            )}
          </div>

          {tab === "rooms" && searchOpen && (
            <div className="relative mt-3 animate-fade-in">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
              <Input
                ref={searchRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("Search rooms", "Buscar salas")}
                className="pl-9 h-9 text-[13px] rounded-full bg-white/[0.05] border-white/10 text-white placeholder:text-white/40"
              />
            </div>
          )}
        </header>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-4 p-1 rounded-full bg-white/[0.04] border border-white/10">
          {(
            [
              { id: "rooms", label: t("Rooms", "Salas"), icon: DoorOpen },
              { id: "church", label: t("My Church", "Mi Iglesia"), icon: ChurchIcon },
            ] as const
          ).map((tab_) => {
            const Icon = tab_.icon;
            return (
              <button
                key={tab_.id}
                onClick={() => setTab(tab_.id as Tab)}
                className={cn(
                  "flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 rounded-full text-[11.5px] tracking-wide font-medium transition-all active:scale-95",
                  tab === tab_.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-white/55 hover:text-white/85",
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab_.label}
              </button>
            );
          })}
        </div>

        {tab === "rooms" ? (
          <>
            {/* Intro strip */}
            <section className="mb-4 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-3 flex items-center gap-3 animate-fade-in">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-primary/5 ring-1 ring-primary/30 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-white leading-tight">
                  {t("Open to the whole Body", "Abierto a todo el Cuerpo")}
                </div>
                <div className="text-[11px] text-white/55 mt-0.5">
                  {t("Jump into any room. Same family, different conversations.", "Únete a cualquier sala. Misma familia, distintas conversaciones.")}
                </div>
              </div>
              <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="rounded-full h-8 px-3 text-[12px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="w-3.5 h-3.5" />
                    {t("Request", "Solicitar")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="border-white/10 bg-[#0b0b0f]/95 backdrop-blur-2xl text-white max-w-md rounded-3xl">
                  <DialogHeader>
                    <DialogTitle className="font-playfair text-xl">{t("Request a Room", "Solicitar una Sala")}</DialogTitle>
                    <DialogDescription className="text-white/55 text-[13px]">
                      {t("We curate Rooms to keep conversations focused. Tell us what you'd add.", "Curamos las Salas para mantener las conversaciones enfocadas. Cuéntanos qué aportarías.")}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 mt-2">
                    <Input value={reqName} onChange={(e) => setReqName(e.target.value)} placeholder={t("Room name", "Nombre de la sala")} maxLength={60}
                      className="bg-white/5 border-white/15 text-white placeholder:text-white/35 h-10 rounded-xl" />
                    <Textarea value={reqDesc} onChange={(e) => setReqDesc(e.target.value)} placeholder={t("What's it about?", "¿De qué se trata?")} rows={2} maxLength={200}
                      className="bg-white/5 border-white/15 text-white placeholder:text-white/35 rounded-xl resize-none" />
                    <Textarea value={reqWhy} onChange={(e) => setReqWhy(e.target.value)} placeholder={t("Why does it belong? (optional)", "¿Por qué encaja? (opcional)")} rows={2} maxLength={300}
                      className="bg-white/5 border-white/15 text-white placeholder:text-white/35 rounded-xl resize-none" />
                    <Button onClick={submitRequest} disabled={submitting || !reqName.trim()}
                      className="w-full h-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{t("Submit Request", "Enviar solicitud")} <ArrowRight className="w-4 h-4" /></>}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </section>

            {/* List */}
            <section className="space-y-2">
              {loading ? (
                <div className="flex items-center justify-center py-16 text-white/40">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
                  <div className="mx-auto w-12 h-12 rounded-xl bg-white/[0.06] ring-1 ring-white/15 flex items-center justify-center mb-3">
                    <DoorOpen className="w-5 h-5 text-white/70" />
                  </div>
                  <h3 className="font-playfair text-lg mb-1">No rooms found</h3>
                  <p className="text-[12px] text-white/55">Try a different search.</p>
                </div>
              ) : (
                filtered.map((g) => {
                  const joined = memberships.has(g.id);
                  return (
                    <div key={g.id} className="group relative rounded-xl border border-white/10 bg-white/[0.035] hover:bg-white/[0.06] hover:border-white/20 transition p-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => navigate(`/community/group/${g.id}`)}
                          className="shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-white/20 via-white/8 to-white/5 ring-1 ring-white/20 flex items-center justify-center"
                        >
                          <DoorOpen className="w-5 h-5 text-white" />
                        </button>
                        <button
                          onClick={() => navigate(`/community/group/${g.id}`)}
                          className="flex-1 min-w-0 text-left"
                        >
                          <h4 className="text-[14px] font-semibold text-white leading-tight truncate">{g.name}</h4>
                          <div className="text-[11px] text-white/50 mt-0.5">
                            {g.member_count} {g.member_count === 1 ? "member" : "members"}
                            {g.description && <span className="text-white/40"> · {g.description}</span>}
                          </div>
                        </button>
                        <button
                          onClick={() => toggleJoin(g)}
                          className={cn(
                            "shrink-0 h-7 px-3 rounded-full text-[11px] font-semibold transition-all active:scale-95",
                            joined
                              ? "bg-white/[0.06] text-white/80 border border-white/15 hover:bg-white/10"
                              : "bg-primary text-primary-foreground hover:bg-primary/90",
                          )}
                        >
                          {joined ? (
                            <span className="inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Joined</span>
                          ) : "Join"}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </section>
          </>
        ) : (
          // My Church tab
          <section className="space-y-3 animate-fade-in">
            {myChurch ? (
              <button
                onClick={() => navigate("/community/my-church")}
                className="w-full text-left rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-4 hover:border-white/20 hover:bg-white/[0.06] transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-300/30 to-amber-700/10 ring-1 ring-amber-300/30 flex items-center justify-center">
                    <ChurchIcon className="w-5 h-5 text-amber-100" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-playfair text-[16px] truncate">{myChurch.name}</h3>
                      {myChurch.verified && <CheckCircle2 className="w-3.5 h-3.5 text-sky-300" />}
                    </div>
                    <div className="text-[11.5px] text-white/55 mt-0.5">
                      {[myChurch.city, myChurch.state].filter(Boolean).join(", ") || "Your local body"} · {myChurch.member_count || 0} members
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/40" />
                </div>
              </button>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-300/30 to-amber-700/10 ring-1 ring-amber-300/30 flex items-center justify-center">
                    <ChurchIcon className="w-5 h-5 text-amber-100" />
                  </div>
                  <div>
                    <h3 className="font-playfair text-[16px]">Join your church</h3>
                    <p className="text-[11.5px] text-white/55">Enter the invite code from your pastor.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="invite code"
                    className="h-10 rounded-xl bg-white/5 border-white/15 text-white placeholder:text-white/35 font-mono tracking-wider"
                  />
                  <Button onClick={handleJoinChurch} disabled={joining || !joinCode.trim()}
                    className="h-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 px-4">
                    {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : "Join"}
                  </Button>
                </div>
                <p className="mt-3 text-[11px] text-white/45">
                  Are you a pastor? <button onClick={() => navigate("/community/my-church?register=1")} className="underline hover:text-white/80">Register your church</button>
                </p>
              </div>
            )}
          </section>
        )}
      </main>
      <PremiumNav />
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CommunityHeader } from "@/components/community/CommunityHeader";
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
import {
  Users,
  Plus,
  Search,
  Sparkles,
  Loader2,
  Crown,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Group {
  id: string;
  name: string;
  description: string | null;
  member_count: number;
  icon_url: string | null;
  creator_id: string | null;
  created_at: string;
}

type Tab = "discover" | "joined" | "mine";

export default function GroupsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [user, setUser] = useState<any>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [memberships, setMemberships] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("discover");
  const [search, setSearch] = useState("");

  // Create dialog
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    load();
    const onRefresh = () => load();
    window.addEventListener("groups:refresh", onRefresh);
    return () => window.removeEventListener("groups:refresh", onRefresh);
  }, []);

  const load = async () => {
    setLoading(true);
    const { data: g } = await supabase
      .from("groups")
      .select("*")
      .order("member_count", { ascending: false })
      .limit(100);
    setGroups((g as Group[]) || []);

    const { data: u } = await supabase.auth.getUser();
    if (u.user) {
      const { data: m } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", u.user.id);
      setMemberships(new Set((m || []).map((r: any) => r.group_id)));
    }
    setLoading(false);
  };

  const filtered = useMemo(() => {
    let list = groups;
    if (tab === "joined") list = list.filter((g) => memberships.has(g.id));
    if (tab === "mine") list = list.filter((g) => g.creator_id === user?.id);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          (g.description || "").toLowerCase().includes(q),
      );
    }
    // Avoid showing the same items twice when the Featured rail is visible
    if (tab === "discover" && !q && groups.length > 3) {
      const top = new Set(groups.slice(0, 3).map((g) => g.id));
      list = list.filter((g) => !top.has(g.id));
    }
    return list;
  }, [groups, tab, search, memberships, user]);

  const featured = useMemo(() => (groups.length > 3 ? groups.slice(0, 3) : []), [groups]);
  const featuredIds = useMemo(() => new Set(featured.map((g) => g.id)), [featured]);
  const totalMembers = useMemo(
    () => groups.reduce((s, g) => s + (g.member_count || 0), 0),
    [groups],
  );

  const toggleJoin = async (g: Group) => {
    if (!user) {
      navigate("/auth");
      return;
    }
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
      const next = new Set(memberships);
      next.add(g.id);
      setMemberships(next);
    }
    load();
  };

  const handleCreate = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    const n = name.trim();
    if (!n) {
      toast({ title: "Group name is required", variant: "destructive" });
      return;
    }
    if (n.length > 80) {
      toast({ title: "Name must be 80 characters or less", variant: "destructive" });
      return;
    }
    setCreating(true);
    const { data, error } = await supabase
      .from("groups")
      .insert({
        name: n,
        description: desc.trim() || null,
        creator_id: user.id,
      })
      .select()
      .single();
    if (!error && data) {
      await supabase.from("group_members").insert({ group_id: data.id, user_id: user.id });
    }
    setCreating(false);
    if (error) {
      toast({
        title: "Could not create group",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    setName("");
    setDesc("");
    setOpen(false);
    toast({ title: "Group created" });
    navigate(`/community/group/${data!.id}`);
  };

  return (
    <div className="min-h-screen text-white">
      {/* Ambient backdrop glows */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full bg-white/[0.04] blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[480px] h-[480px] rounded-full bg-white/[0.03] blur-3xl" />
      </div>

      <main className="px-5 sm:px-8 pb-32 max-w-3xl mx-auto">
        <CommunityHeader
          title="Groups"
          subtitle="Find your circle. Build sacred community."
        />

        {/* Hero */}
        <section className="relative mb-7 overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-transparent backdrop-blur-2xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.7)] animate-fade-in">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_60%)]" />
          <div className="relative p-6 sm:p-7">
            <div className="flex items-center gap-2 text-[10px] tracking-[0.22em] uppercase text-white/55 mb-3">
              <Crown className="w-3 h-3" />
              <span>Sacred Circles</span>
            </div>
            <h2 className="font-playfair text-[26px] sm:text-3xl leading-[1.1] tracking-tight">
              Gather in faith.
              <br />
              <span className="text-white/65">Grow together.</span>
            </h2>
            <p className="mt-3 text-[13px] text-white/60 max-w-md leading-relaxed">
              Create a private circle for your church, study group, or ministry — or
              discover communities walking the same path.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-full h-11 px-5 text-white font-semibold bg-gradient-to-b from-primary/35 to-primary/10 border border-primary/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_8px_24px_-6px_hsl(var(--primary)/0.55)] drop-shadow-[0_0_10px_hsl(var(--primary)/0.45)] hover:from-primary/45 hover:to-primary/15">
                    <Plus className="w-4 h-4" />
                    Create Group
                  </Button>
                </DialogTrigger>
                <DialogContent className="border-white/10 bg-[#0b0b0f]/95 backdrop-blur-2xl text-white max-w-md rounded-3xl">
                  <DialogHeader>
                    <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-white/25 via-white/10 to-white/5 ring-1 ring-white/25 flex items-center justify-center mb-2">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <DialogTitle className="font-playfair text-2xl text-center">
                      Create a Group
                    </DialogTitle>
                    <DialogDescription className="text-center text-white/55">
                      Name your circle and invite hearts to gather.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-2">
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.18em] text-white/50">
                        Name
                      </label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Morning Prayer Warriors"
                        maxLength={80}
                        className="mt-1.5 bg-white/5 border-white/15 text-white placeholder:text-white/35 h-11 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.18em] text-white/50">
                        Description
                      </label>
                      <Textarea
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        placeholder="What is this group about? Who is it for?"
                        rows={3}
                        maxLength={500}
                        className="mt-1.5 bg-white/5 border-white/15 text-white placeholder:text-white/35 rounded-xl resize-none"
                      />
                      <div className="text-right text-[10px] text-white/35 mt-1">
                        {desc.length}/500
                      </div>
                    </div>
                    <Button
                      onClick={handleCreate}
                      disabled={creating || !name.trim()}
                      className="w-full h-11 rounded-full bg-gradient-to-b from-white to-white/85 text-black hover:from-white hover:to-white/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
                    >
                      {creating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          Create Group <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="flex items-center gap-4 text-[11px] text-white/55">
                <div className="flex items-center gap-1.5">
                  <span className="font-playfair text-base text-white">
                    {groups.length}
                  </span>
                  <span className="uppercase tracking-[0.16em]">Groups</span>
                </div>
                <div className="w-px h-4 bg-white/15" />
                <div className="flex items-center gap-1.5">
                  <span className="font-playfair text-base text-white">
                    {totalMembers}
                  </span>
                  <span className="uppercase tracking-[0.16em]">Members</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search groups by name or topic"
            className="pl-11 h-11 rounded-full bg-white/[0.04] border-white/10 text-white placeholder:text-white/40 backdrop-blur-xl"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 p-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-xl">
          {(
            [
              { id: "discover", label: "Discover" },
              { id: "joined", label: "Joined" },
              { id: "mine", label: "Mine" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "group relative flex-1 py-2 rounded-full text-[10px] tracking-[0.14em] uppercase font-medium",
                "transition-all duration-300 ease-out active:scale-95",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                tab === t.id
                  ? "text-white font-semibold bg-gradient-to-b from-primary/30 to-primary/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_4px_16px_-4px_hsl(var(--primary)/0.5)] drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
                  : "text-white/55 hover:text-white/85",
              )}
            >
              <span
                className="absolute inset-0 rounded-full pointer-events-none opacity-0 group-active:opacity-100 transition-opacity duration-150"
                style={{
                  background:
                    "radial-gradient(circle at center, hsl(var(--primary) / 0.35), transparent 70%)",
                }}
              />
              <span className="relative">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Featured rail (only on Discover, no search) */}
        {tab === "discover" && !search && featured.length > 0 && (
          <section className="mb-7">
            <div className="flex items-center gap-2 mb-3 px-1">
              <Sparkles className="w-3.5 h-3.5 text-white/70" />
              <h3 className="text-[10px] tracking-[0.22em] uppercase text-white/55">
                Featured
              </h3>
            </div>
            <div className="flex gap-3 overflow-x-auto -mx-5 px-5 pb-2 snap-x snap-mandatory scrollbar-none">
              {featured.map((g) => (
                <button
                  key={g.id}
                  onClick={() => navigate(`/community/group/${g.id}`)}
                  className="snap-start shrink-0 w-[260px] text-left relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.09] via-white/[0.04] to-transparent backdrop-blur-2xl p-5 shadow-[0_14px_40px_-14px_rgba(0,0,0,0.7)] hover:border-white/20 transition"
                >
                  <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/[0.06] blur-2xl" />
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/30 via-white/10 to-white/5 ring-1 ring-white/25 flex items-center justify-center mb-3">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-playfair text-lg leading-tight line-clamp-2">
                      {g.name}
                    </h4>
                    <div className="text-[10px] uppercase tracking-[0.16em] text-white/50 mt-2">
                      {g.member_count} {g.member_count === 1 ? "member" : "members"}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* List */}
        <section className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-white/40">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-10 text-center">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-white/20 via-white/10 to-white/5 ring-1 ring-white/20 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white/70" />
              </div>
              <h3 className="font-playfair text-xl mb-1">
                {tab === "mine"
                  ? "You haven't created any groups yet"
                  : tab === "joined"
                    ? "You haven't joined any groups yet"
                    : "No groups found"}
              </h3>
              <p className="text-[13px] text-white/55 mb-5">
                {tab === "mine"
                  ? "Start a circle and invite others to walk in faith with you."
                  : "Try a different search, or be the first to start one."}
              </p>
              <Button
                onClick={() => setOpen(true)}
                className="rounded-full bg-gradient-to-b from-white to-white/85 text-black hover:from-white hover:to-white/95"
              >
                <Plus className="w-4 h-4" />
                Create Group
              </Button>
            </div>
          ) : (
            filtered.map((g) => {
              const joined = memberships.has(g.id);
              const isMine = g.creator_id === user?.id;
              return (
                <div
                  key={g.id}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] p-4 hover:border-white/20 hover:bg-white/[0.06] transition"
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => navigate(`/community/group/${g.id}`)}
                      className="shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-white/25 via-white/10 to-white/5 ring-1 ring-white/25 flex items-center justify-center"
                    >
                      <Users className="w-6 h-6 text-white" />
                    </button>
                    <button
                      onClick={() => navigate(`/community/group/${g.id}`)}
                      className="flex-1 min-w-0 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <h4 className="font-playfair text-lg text-white leading-tight truncate">
                          {g.name}
                        </h4>
                        {isMine && (
                          <span className="text-[9px] uppercase tracking-[0.16em] px-2 py-0.5 rounded-full bg-white/10 text-white/70 border border-white/15">
                            Owner
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-white/50 mt-0.5">
                        {g.member_count} {g.member_count === 1 ? "member" : "members"}
                      </div>
                      {g.description && (
                        <p className="text-[13px] text-white/65 mt-2 line-clamp-2 leading-relaxed">
                          {g.description}
                        </p>
                      )}
                    </button>
                    <button
                      onClick={() => toggleJoin(g)}
                      disabled={isMine}
                      className={cn(
                        "shrink-0 h-8 px-3 rounded-full text-[11px] uppercase tracking-[0.14em] font-medium transition-all active:scale-95",
                        isMine
                          ? "bg-white/5 text-white/40 border border-white/10 cursor-default"
                          : joined
                            ? "bg-white/[0.06] text-white border border-white/15 hover:bg-white/10"
                            : "text-white font-semibold bg-gradient-to-b from-primary/35 to-primary/10 border border-primary/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_4px_16px_-4px_hsl(var(--primary)/0.55)] drop-shadow-[0_0_8px_hsl(var(--primary)/0.45)] hover:from-primary/45 hover:to-primary/15",
                      )}
                    >
                      {isMine ? (
                        "Owner"
                      ) : joined ? (
                        <span className="inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Joined
                        </span>
                      ) : (
                        "Join"
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </main>
      <PremiumNav />
    </div>
  );
}

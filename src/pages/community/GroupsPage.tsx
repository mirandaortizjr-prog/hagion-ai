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
  const handleBack = useSafeBackNavigation("/community");

  const [user, setUser] = useState<any>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [memberships, setMemberships] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("discover");
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50);
  }, [searchOpen]);

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
    return list;
  }, [groups, tab, search, memberships, user]);

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
      <main className="px-4 sm:px-6 pb-32 max-w-2xl mx-auto">
        {/* Top bar: back + title + search */}
        <header className="pt-5 pb-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              aria-label="Back"
              className="h-9 w-9 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <h1 className="flex-1 font-playfair text-xl leading-none tracking-tight text-white truncate">
              Groups
            </h1>

            {!searchOpen ? (
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="h-9 w-9 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition active:scale-95"
              >
                <Search className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setSearch("");
                }}
                aria-label="Close search"
                className="h-9 w-9 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {searchOpen && (
            <div className="relative mt-3 animate-fade-in">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
              <Input
                ref={searchRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search groups"
                className="pl-9 h-9 text-[13px] rounded-full bg-white/[0.05] border-white/10 text-white placeholder:text-white/40"
              />
            </div>
          )}
        </header>

        {/* Compact summary strip */}
        <section className="mb-4 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-3 flex items-center gap-3 animate-fade-in">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-primary/5 ring-1 ring-primary/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium text-white leading-tight">
              Sacred Circles
            </div>
            <div className="text-[11px] text-white/55 mt-0.5">
              {groups.length} {groups.length === 1 ? "group" : "groups"} · {totalMembers}{" "}
              {totalMembers === 1 ? "member" : "members"}
            </div>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="rounded-full h-8 px-3 text-[12px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="w-3.5 h-3.5" />
                Create
              </Button>
            </DialogTrigger>
            <DialogContent className="border-white/10 bg-[#0b0b0f]/95 backdrop-blur-2xl text-white max-w-md rounded-3xl">
              <DialogHeader>
                <DialogTitle className="font-playfair text-xl">
                  Create a Group
                </DialogTitle>
                <DialogDescription className="text-white/55 text-[13px]">
                  Name your circle and invite hearts to gather.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 mt-2">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.16em] text-white/50">
                    Name
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Morning Prayer Warriors"
                    maxLength={80}
                    className="mt-1.5 bg-white/5 border-white/15 text-white placeholder:text-white/35 h-10 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.16em] text-white/50">
                    Description
                  </label>
                  <Textarea
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="What is this group about?"
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
                  className="w-full h-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
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
        </section>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-4 p-1 rounded-full bg-white/[0.04] border border-white/10">
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
                "flex-1 py-1.5 rounded-full text-[11px] tracking-wide font-medium transition-all active:scale-95",
                tab === t.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-white/55 hover:text-white/85",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* List */}
        <section className="space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-white/40">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
              <div className="mx-auto w-12 h-12 rounded-xl bg-white/[0.06] ring-1 ring-white/15 flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-white/70" />
              </div>
              <h3 className="font-playfair text-lg mb-1">
                {tab === "mine"
                  ? "No groups yet"
                  : tab === "joined"
                    ? "You haven't joined any groups"
                    : "No groups found"}
              </h3>
              <p className="text-[12px] text-white/55 mb-4">
                {tab === "mine"
                  ? "Start a circle and invite others."
                  : "Try a different search, or start one."}
              </p>
              <Button
                onClick={() => setOpen(true)}
                size="sm"
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="w-3.5 h-3.5" />
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
                  className="group relative rounded-xl border border-white/10 bg-white/[0.035] hover:bg-white/[0.06] hover:border-white/20 transition p-3"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate(`/community/group/${g.id}`)}
                      className="shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-white/20 via-white/8 to-white/5 ring-1 ring-white/20 flex items-center justify-center"
                    >
                      <Users className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={() => navigate(`/community/group/${g.id}`)}
                      className="flex-1 min-w-0 text-left"
                    >
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-[14px] font-semibold text-white leading-tight truncate">
                          {g.name}
                        </h4>
                        {isMine && (
                          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-white/10 text-white/70 border border-white/15">
                            Owner
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-white/50 mt-0.5">
                        {g.member_count} {g.member_count === 1 ? "member" : "members"}
                        {g.description && (
                          <span className="text-white/40"> · {g.description}</span>
                        )}
                      </div>
                    </button>
                    <button
                      onClick={() => toggleJoin(g)}
                      disabled={isMine}
                      className={cn(
                        "shrink-0 h-7 px-3 rounded-full text-[11px] font-semibold transition-all active:scale-95",
                        isMine
                          ? "bg-white/5 text-white/40 border border-white/10 cursor-default"
                          : joined
                            ? "bg-white/[0.06] text-white/80 border border-white/15 hover:bg-white/10"
                            : "bg-primary text-primary-foreground hover:bg-primary/90",
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

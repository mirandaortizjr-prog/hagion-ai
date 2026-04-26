import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Plus, FileText, Trash2, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PremiumNav } from "@/components/PremiumNav";
import { SERMON_STEPS, type SermonDraft } from "@/lib/sermonSteps";
import { useTierAccess } from "@/hooks/useTierAccess";
import { LimitReachedDialog } from "@/components/LimitReachedDialog";

const MONTHLY_LIMIT = 5;

const PublicSpeaking = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const access = useTierAccess();
  const isPro = access.canUse("sermon_lab");
  const [drafts, setDrafts] = useState<SermonDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showGate, setShowGate] = useState(false);

  const monthlyCount = useMemo(() => {
    const start = new Date();
    start.setDate(1); start.setHours(0, 0, 0, 0);
    return drafts.filter((d) => new Date(d.created_at) >= start).length;
  }, [drafts]);
  const remaining = Math.max(0, MONTHLY_LIMIT - monthlyCount);
  const atLimit = isPro && remaining === 0;

  const loadDrafts = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("sermon_drafts")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) {
      console.error(error);
      toast({ title: "Could not load sermons", variant: "destructive" });
    } else {
      setDrafts((data || []) as SermonDraft[]);
    }
    setLoading(false);
  };

  useEffect(() => { loadDrafts(); }, []);

  const handleCreate = async () => {
    const title = newTitle.trim() || "Untitled Sermon";
    setCreating(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({ title: "Sign in required", variant: "destructive" });
      setCreating(false);
      return;
    }
    const { data, error } = await supabase
      .from("sermon_drafts")
      .insert({ user_id: session.user.id, title })
      .select()
      .single();
    setCreating(false);
    if (error || !data) {
      toast({ title: "Could not create sermon", description: error?.message, variant: "destructive" });
      return;
    }
    setNewTitle("");
    setShowNew(false);
    navigate(`/sermon-lab/${data.id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this sermon? This cannot be undone.")) return;
    const { error } = await supabase.from("sermon_drafts").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", variant: "destructive" });
      return;
    }
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  };

  const completedCount = (d: SermonDraft) =>
    SERMON_STEPS.filter((s) => ((d as any)[s.key] as string)?.trim().length > 0).length;

  return (
    <div className="min-h-screen flex flex-col page-transition">
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-background/40 border-b border-white/5">
        <div className="flex items-center gap-3 px-4 py-3 max-w-3xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/main-menu?tab=hagion-university")}
            className="tap-scale rounded-full hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 text-center">
            <p className="text-[11px] uppercase tracking-[0.25em] text-foreground/60">
              Hagion University
            </p>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 overflow-auto px-5 sm:px-6 pt-8 pb-32">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-center text-3xl sm:text-4xl font-bold leading-tight tracking-tight text-white mb-3 px-2">
            Sermon Lab
          </h1>

          <div className="flex justify-center mb-10">
            <span className="text-[10px] uppercase tracking-[0.3em] text-accent/90 px-3 py-1 rounded-full border border-accent/20 bg-accent/5">
              Craft & Discern
            </span>
          </div>

          <div className="flex items-center justify-center mb-10">
            <span className="h-px w-10 bg-foreground/20" />
            <span className="mx-3 text-foreground/30 text-xs">✦</span>
            <span className="h-px w-10 bg-foreground/20" />
          </div>

          {/* Your sermons */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[11px] uppercase tracking-[0.3em] text-accent font-semibold flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />
                Your Sermons
              </h2>
              <Button
                size="sm"
                onClick={() => setShowNew((s) => !s)}
                className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full h-8 px-3 text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                New
              </Button>
            </div>

            {showNew && (
              <div className="mb-5 border border-white/10 rounded-2xl p-4 bg-white/[0.03] backdrop-blur-sm">
                <Input
                  autoFocus
                  placeholder="Sermon title (e.g. Easter 2026)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-transparent border-white/10 text-white placeholder:text-white/40"
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
                />
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={handleCreate}
                    disabled={creating}
                    className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 rounded-full"
                  >
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { setShowNew(false); setNewTitle(""); }}
                    className="rounded-full text-white/70"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-white/50" />
              </div>
            ) : drafts.length === 0 ? (
              <div className="text-center text-[13px] text-white/50 py-6 border border-dashed border-white/10 rounded-2xl">
                No sermons yet. Tap <span className="text-accent">New</span> to start.
              </div>
            ) : (
              <ul className="space-y-3">
                {drafts.map((d) => {
                  const done = completedCount(d);
                  return (
                    <li
                      key={d.id}
                      className="border border-white/10 rounded-2xl bg-white/[0.03] backdrop-blur-sm overflow-hidden"
                    >
                      <button
                        onClick={() => navigate(`/sermon-lab/${d.id}`)}
                        className="w-full text-left p-4 flex items-center gap-3 hover:bg-white/[0.04] transition-colors"
                      >
                        <div className="shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-white/10 ring-1 ring-white/15">
                          <FileText className="w-4 h-4 text-white/80" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-[14.5px] font-medium truncate">{d.title}</p>
                          <p className="text-[12px] text-white/55 mt-0.5">
                            {done}/10 steps · updated {new Date(d.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(d.id); }}
                          className="text-white/40 hover:text-destructive p-2 rounded-full"
                          aria-label="Delete sermon"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <div className="flex items-center justify-center mb-10">
            <span className="h-px w-10 bg-foreground/20" />
            <span className="mx-3 text-foreground/30 text-xs">✦</span>
            <span className="h-px w-10 bg-foreground/20" />
          </div>

          {/* How to write a sermon */}
          <section>
            <h2 className="text-[11px] uppercase tracking-[0.3em] text-accent mb-5 font-semibold flex items-center justify-center gap-2">
              <BookOpen className="w-3.5 h-3.5" />
              How to Write a Sermon
            </h2>
            <p className="text-center text-[14px] text-white/70 leading-relaxed mb-6">
              A faithful guide to preparing sermons rooted in Scripture and shaped by prayer.
            </p>

            <ol className="space-y-3">
              {SERMON_STEPS.map((s) => (
                <li
                  key={s.num}
                  className="flex items-start gap-3 border border-white/10 rounded-2xl p-4 bg-white/[0.03] backdrop-blur-sm"
                >
                  <span className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium bg-white/10 text-white/85 ring-1 ring-white/15">
                    {s.num}
                  </span>
                  <div className="min-w-0">
                    <p className="text-white text-[14.5px] font-medium leading-snug">{s.title}</p>
                    <p className="text-[13px] text-white/60 mt-0.5 leading-relaxed">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </main>

      <PremiumNav />
    </div>
  );
};

export default PublicSpeaking;

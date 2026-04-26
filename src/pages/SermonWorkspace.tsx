import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Circle, Sparkles, Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PremiumNav } from "@/components/PremiumNav";
import { SERMON_STEPS, type SermonDraft } from "@/lib/sermonSteps";

const SermonWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [draft, setDraft] = useState<SermonDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [scriptureDraft, setScriptureDraft] = useState("");

  useEffect(() => {
    (async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("sermon_drafts")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error || !data) {
        toast({ title: "Sermon not found", variant: "destructive" });
        navigate("/public-speaking");
        return;
      }
      const d = data as SermonDraft;
      setDraft(d);
      setTitleDraft(d.title);
      setScriptureDraft(d.scripture_ref || "");
      setLoading(false);
    })();
  }, [id]);

  const saveTitle = async () => {
    if (!draft) return;
    const newTitle = titleDraft.trim() || "Untitled Sermon";
    const newScripture = scriptureDraft.trim() || null;
    const { error } = await supabase
      .from("sermon_drafts")
      .update({ title: newTitle, scripture_ref: newScripture })
      .eq("id", draft.id);
    if (error) {
      toast({ title: "Save failed", variant: "destructive" });
      return;
    }
    setDraft({ ...draft, title: newTitle, scripture_ref: newScripture });
    setEditingTitle(false);
  };

  if (loading || !draft) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-white/50" />
      </div>
    );
  }

  const completed = SERMON_STEPS.filter(
    (s) => ((draft as any)[s.key] as string)?.trim().length > 0,
  ).length;

  return (
    <div className="min-h-screen flex flex-col page-transition">
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-background/40 border-b border-white/5">
        <div className="flex items-center gap-3 px-4 py-3 max-w-3xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/public-speaking")}
            className="tap-scale rounded-full hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 text-center">
            <p className="text-[11px] uppercase tracking-[0.25em] text-foreground/60">
              Sermon Lab
            </p>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 overflow-auto px-5 sm:px-6 pt-8 pb-32">
        <div className="max-w-2xl mx-auto">
          {editingTitle ? (
            <div className="border border-white/10 rounded-2xl p-4 bg-white/[0.03] backdrop-blur-sm mb-8 space-y-3">
              <Input
                autoFocus
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                placeholder="Sermon title"
                className="bg-transparent border-white/10 text-white text-lg font-semibold"
              />
              <Input
                value={scriptureDraft}
                onChange={(e) => setScriptureDraft(e.target.value)}
                placeholder="Scripture reference (e.g. Romans 8:28-39)"
                className="bg-transparent border-white/10 text-white/90 text-sm"
              />
              <div className="flex gap-2">
                <Button onClick={saveTitle} size="sm" className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 rounded-full">
                  Save
                </Button>
                <Button onClick={() => { setEditingTitle(false); setTitleDraft(draft.title); setScriptureDraft(draft.scripture_ref || ""); }} size="sm" variant="ghost" className="rounded-full text-white/70">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <button onClick={() => setEditingTitle(true)} className="w-full text-center mb-8 group">
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight text-white mb-2 px-2 group-hover:opacity-80 transition-opacity">
                {draft.title}
              </h1>
              {draft.scripture_ref && (
                <p className="text-[13px] text-accent/90 italic">{draft.scripture_ref}</p>
              )}
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/40 mt-2 flex items-center justify-center gap-1">
                <Pencil className="w-3 h-3" /> Tap to edit
              </p>
            </button>
          )}

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.25em] text-white/60 mb-2">
              <span>Progress</span>
              <span>{completed}/10</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${(completed / 10) * 100}%` }}
              />
            </div>
          </div>

          {/* Steps */}
          <ol className="space-y-3 mb-8">
            {SERMON_STEPS.map((s) => {
              const filled = ((draft as any)[s.key] as string)?.trim().length > 0;
              return (
                <li key={s.num}>
                  <button
                    onClick={() => navigate(`/sermon-lab/${draft.id}/step/${s.num}`)}
                    className="w-full flex items-start gap-3 border border-white/10 rounded-2xl p-4 bg-white/[0.03] backdrop-blur-sm hover:bg-white/[0.05] transition-colors text-left"
                  >
                    <span className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium bg-white/10 text-white/85 ring-1 ring-white/15">
                      {s.num}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-[14.5px] font-medium leading-snug">{s.title}</p>
                      <p className="text-[13px] text-white/60 mt-0.5 leading-relaxed">{s.desc}</p>
                    </div>
                    {filled ? (
                      <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-white/25 shrink-0" />
                    )}
                  </button>
                </li>
              );
            })}
          </ol>

          {/* Refine CTA */}
          <Button
            onClick={() => navigate(`/sermon-lab/${draft.id}/refine`)}
            disabled={completed === 0}
            className="w-full h-12 bg-accent text-accent-foreground hover:bg-accent/90 rounded-full text-[14px] font-semibold"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Assemble & Refine with AI
          </Button>
          {completed === 0 && (
            <p className="text-center text-[12px] text-white/40 mt-3">
              Write at least one step to enable AI refinement.
            </p>
          )}
        </div>
      </main>

      <PremiumNav />
    </div>
  );
};

export default SermonWorkspace;

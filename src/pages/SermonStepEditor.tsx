import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PremiumNav } from "@/components/PremiumNav";
import { SERMON_STEPS } from "@/lib/sermonSteps";
import { FeatureLockCard } from "@/components/FeatureLockCard";
import { useTierAccess } from "@/hooks/useTierAccess";
import { useLanguage } from "@/contexts/LanguageContext";

const SermonStepEditor = () => {
  const { language: __lockLang } = useLanguage();
  const __lockAccess = useTierAccess();
  if (!__lockAccess.isLoading && !__lockAccess.canUse("sermon_lab")) {
    return (
      <FeatureLockCard
        requiredTier="pro"
        featureName={__lockLang === "es" ? "Laboratorio de Sermones" : "Sermon Lab"}
      />
    );
  }

  const { id, stepNum } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const stepIndex = Math.max(0, Math.min(9, parseInt(stepNum || "1", 10) - 1));
  const step = SERMON_STEPS[stepIndex];

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimer = useRef<number | null>(null);
  const initial = useRef("");

  useEffect(() => {
    (async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("sermon_drafts")
        .select(`id, ${step.key}`)
        .eq("id", id)
        .maybeSingle();
      if (error || !data) {
        toast({ title: "Sermon not found", variant: "destructive" });
        navigate("/public-speaking");
        return;
      }
      const v = (data as any)[step.key] || "";
      setText(v);
      initial.current = v;
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, stepNum]);

  // Debounced autosave
  useEffect(() => {
    if (loading) return;
    if (text === initial.current) return;
    setSaveState("saving");
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(async () => {
      const { error } = await supabase
        .from("sermon_drafts")
        .update({ [step.key]: text })
        .eq("id", id!);
      if (error) {
        setSaveState("idle");
        toast({ title: "Save failed", description: error.message, variant: "destructive" });
        return;
      }
      initial.current = text;
      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 1500);
    }, 600);
    return () => { if (saveTimer.current) window.clearTimeout(saveTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const goToStep = (n: number) => navigate(`/sermon-lab/${id}/step/${n}`);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-white/50" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col page-transition">
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-background/40 border-b border-white/5">
        <div className="flex items-center gap-3 px-4 py-3 max-w-3xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/sermon-lab/${id}`)}
            className="tap-scale rounded-full hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 text-center">
            <p className="text-[11px] uppercase tracking-[0.25em] text-foreground/60">
              Step {step.num} of 10
            </p>
          </div>
          <div className="w-10 flex items-center justify-end">
            {saveState === "saving" && <Loader2 className="w-4 h-4 animate-spin text-white/40" />}
            {saveState === "saved" && <Check className="w-4 h-4 text-accent" />}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto px-5 sm:px-6 pt-8 pb-32">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white text-base font-semibold ring-1 ring-white/15 mb-4">
              {step.num}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
              {step.title}
            </h1>
            <p className="text-[13.5px] text-white/65 leading-relaxed max-w-md mx-auto">
              {step.desc}
            </p>
          </div>

          <div className="border border-white/10 rounded-2xl p-4 bg-white/[0.03] backdrop-blur-sm mb-6">
            <p className="text-[11px] uppercase tracking-[0.25em] text-accent mb-3 font-semibold">
              Prompt
            </p>
            <p className="text-[13.5px] text-white/75 leading-relaxed">{step.prompt}</p>
          </div>

          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write here…"
            className="min-h-[320px] bg-white/[0.03] border-white/10 text-white placeholder:text-white/40 focus-visible:ring-accent/40 resize-none rounded-2xl backdrop-blur-sm"
          />

          <div className="flex items-center justify-between mt-6">
            <Button
              variant="ghost"
              onClick={() => goToStep(step.num - 1)}
              disabled={step.num === 1}
              className="rounded-full text-white/70 disabled:opacity-30"
            >
              ← Previous
            </Button>
            {step.num < 10 ? (
              <Button
                onClick={() => goToStep(step.num + 1)}
                className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Next →
              </Button>
            ) : (
              <Button
                onClick={() => navigate(`/sermon-lab/${id}/refine`)}
                className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Refine →
              </Button>
            )}
          </div>
        </div>
      </main>

      <PremiumNav />
    </div>
  );
};

export default SermonStepEditor;

import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PremiumNav } from "@/components/PremiumNav";
import { SERMON_STEPS } from "@/lib/sermonSteps";
import { useLanguage } from "@/contexts/LanguageContext";

const SermonStepEditor = () => {
  const { id, stepNum } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = (en: string, es: string) => (language === "es" ? es : en);

  const stepIndex = Math.max(0, Math.min(9, parseInt(stepNum || "1", 10) - 1));
  const step = SERMON_STEPS[stepIndex];

  const stepTranslations: Record<number, { title: string; desc: string; prompt: string }> = {
    1: { title: "Oración y Escritura", desc: "Comienza con oración y selecciona un pasaje bíblico.", prompt: "Escribe una nota breve sobre tu tiempo de oración y el pasaje de las Escrituras que Dios puso en tu corazón. Incluye la referencia." },
    2: { title: "Estudia el Texto", desc: "Investiga el contexto histórico, el idioma original y el significado teológico.", prompt: "Captura el contexto histórico, la audiencia, el género y cualquier idea de los idiomas originales o comentarios." },
    3: { title: "Identifica el Punto Principal", desc: "Determina el mensaje central que Dios quiere comunicar.", prompt: "Expresa, en una oración, la verdad central que este sermón proclamará." },
    4: { title: "Estructura el Sermón", desc: "Esboza la introducción, los puntos principales y la conclusión.", prompt: "Dibuja el esquema: gancho, puntos principales (2–4) y conclusión." },
    5: { title: "Desarrolla Aplicaciones", desc: "Muestra cómo el texto se aplica a la vida moderna.", prompt: "Enumera formas concretas en que este texto llama a los creyentes a pensar, vivir y responder hoy." },
    6: { title: "Agrega Ilustraciones", desc: "Usa historias y ejemplos para que los puntos sean memorables.", prompt: "Anota historias, analogías o ejemplos que hagan tangible la verdad." },
    7: { title: "Escribe la Introducción", desc: "Atrapa a la audiencia e introduce el tema.", prompt: "Redacta tu apertura: el gancho, la tensión y la entrada al texto." },
    8: { title: "Escribe el Cuerpo", desc: "Expande cada punto con las Escrituras y una explicación.", prompt: "Escribe el cuerpo completo del sermón, punto por punto, con las Escrituras y la explicación." },
    9: { title: "Escribe la Conclusión", desc: "Resume y llama al oyente a la acción.", prompt: "Redacta la conclusión: resumen, llamado al evangelio y respuesta." },
    10: { title: "Revisar y Pulir", desc: "Edita para mayor claridad, tiempo y precisión teológica.", prompt: "Notas de tu propia revisión: qué ajustar, cortar o fortalecer." },
  };

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
        toast({ title: t("Sermon not found", "Sermón no encontrado"), variant: "destructive" });
        navigate("/public-speaking");
        return;
      }
      const v = (data as any)[step.key] || "";
      setText(v);
      initial.current = v;
      setLoading(false);
    })();
  }, [id, step.key, navigate, toast, t]);

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
        toast({ title: t("Save failed", "Error al guardar"), description: error.message, variant: "destructive" });
        return;
      }
      initial.current = text;
      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 1500);
    }, 600);
    return () => { if (saveTimer.current) window.clearTimeout(saveTimer.current); };
  }, [text, id, step.key, loading, toast, t]);

  const goToStep = (n: number) => navigate(`/sermon-lab/${id}/step/${n}`);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-white/50" />
      </div>
    );
  }

  const s = language === "es" ? stepTranslations[step.num] : step;

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
              {t(`Step ${step.num} of 10`, `Paso ${step.num} de 10`)}
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
              {s.title}
            </h1>
            <p className="text-[13.5px] text-white/65 leading-relaxed max-w-md mx-auto">
              {s.desc}
            </p>
          </div>

          <div className="border border-white/10 rounded-2xl p-4 bg-white/[0.03] backdrop-blur-sm mb-6">
            <p className="text-[11px] uppercase tracking-[0.25em] text-accent mb-3 font-semibold">
              {t("Prompt", "Indicación")}
            </p>
            <p className="text-[13.5px] text-white/75 leading-relaxed">{s.prompt}</p>
          </div>

          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("Write here…", "Escribe aquí…")}
            className="min-h-[320px] bg-white/[0.03] border-white/10 text-white placeholder:text-white/40 focus-visible:ring-accent/40 resize-none rounded-2xl backdrop-blur-sm"
          />

          <div className="flex items-center justify-between mt-6">
            <Button
              variant="ghost"
              onClick={() => goToStep(step.num - 1)}
              disabled={step.num === 1}
              className="rounded-full text-white/70 disabled:opacity-30"
            >
              {t("← Previous", "← Anterior")}
            </Button>
            {step.num < 10 ? (
              <Button
                onClick={() => goToStep(step.num + 1)}
                className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {t("Next →", "Siguiente →")}
              </Button>
            ) : (
              <Button
                onClick={() => navigate(`/sermon-lab/${id}/refine`)}
                className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {t("Refine →", "Pulir →")}
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

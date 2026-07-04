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
import { useLanguage } from "@/contexts/LanguageContext";

const MONTHLY_LIMIT = 5;

const PublicSpeaking = () => {
  const { language } = useLanguage();
  const t = (en: string, es: string) => (language === "es" ? es : en);
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

  const stepTranslations: Record<number, { title: string; desc: string }> = {
    1: { title: "Oración y Escritura", desc: "Comienza con oración y selecciona un pasaje bíblico." },
    2: { title: "Estudia el Texto", desc: "Investiga el contexto histórico, el idioma original y el significado teológico." },
    3: { title: "Identifica el Punto Principal", desc: "Determina el mensaje central que Dios quiere comunicar." },
    4: { title: "Estructura el Sermón", desc: "Esboza la introducción, los puntos principales y la conclusión." },
    5: { title: "Desarrolla Aplicaciones", desc: "Muestra cómo el texto se aplica a la vida moderna." },
    6: { title: "Agrega Ilustraciones", desc: "Usa historias y ejemplos para que los puntos sean memorables." },
    7: { title: "Escribe la Introducción", desc: "Capta la atención de la audiencia e introduce el tema." },
    8: { title: "Escribe el Cuerpo", desc: "Desarrolla cada punto con las Escrituras y explicación." },
    9: { title: "Escribe la Conclusión", desc: "Resume y llama al oyente a la acción." },
    10: { title: "Revisa y Refina", desc: "Edita para mayor claridad, tiempo y precisión teológica." },
  };

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
      toast({ title: t("Could not load sermons", "No se pudieron cargar los sermones"), variant: "destructive" });
    } else {
      setDrafts((data || []) as SermonDraft[]);
    }
    setLoading(false);
  };

  useEffect(() => { loadDrafts(); }, []);

  const handleCreate = async () => {
    if (!isPro) { setShowGate(true); return; }
    if (atLimit) {
      toast({ 
        title: t("Monthly limit reached", "Límite mensual alcanzado"), 
        description: t(`You can create up to ${MONTHLY_LIMIT} sermons per month.`, `Puedes crear hasta ${MONTHLY_LIMIT} sermones al mes.`), 
        variant: "destructive" 
      });
      return;
    }
    const title = newTitle.trim() || t("Untitled Sermon", "Sermón sin título");
    setCreating(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({ title: t("Sign in required", "Se requiere iniciar sesión"), variant: "destructive" });
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
      const msg = error?.message || "";
      if (msg.includes("Pro plan")) setShowGate(true);
      else if (msg.includes("Monthly sermon limit")) toast({ 
        title: t("Monthly limit reached", "Límite mensual alcanzado"), 
        description: t(`Limit is ${MONTHLY_LIMIT} sermons per month.`, `El límite es de ${MONTHLY_LIMIT} sermones al mes.`), 
        variant: "destructive" 
      });
      else toast({ title: t("Could not create sermon", "No se pudo crear el sermón"), description: msg, variant: "destructive" });
      return;
    }
    setNewTitle("");
    setShowNew(false);
    setDrafts((prev) => [data as SermonDraft, ...prev]);
    navigate(`/sermon-lab/${data.id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("Delete this sermon? This cannot be undone.", "¿Eliminar este sermón? Esta acción no se puede deshacer."))) return;
    const { error } = await supabase.from("sermon_drafts").delete().eq("id", id);
    if (error) {
      toast({ title: t("Delete failed", "Error al eliminar"), variant: "destructive" });
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
              {t("Hagion University", "Hagion University")}
            </p>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 overflow-auto px-5 sm:px-6 pt-8 pb-32">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-center text-3xl sm:text-4xl font-bold leading-tight tracking-tight text-white mb-3 px-2">
            {t("Sermon Lab", "Laboratorio de Sermones")}
          </h1>

          <div className="flex justify-center mb-4">
            <span className="text-[10px] uppercase tracking-[0.3em] text-accent/90 px-3 py-1 rounded-full border border-accent/20 bg-accent/5">
              {t("Pastors & Theologians · Pro", "Pastores y Teólogos · Pro")}
            </span>
          </div>

          {isPro && (
            <p className="text-center text-[12px] text-white/55 mb-8">
              {t(`${remaining} of ${MONTHLY_LIMIT} sermons remaining this month`, `${remaining} de ${MONTHLY_LIMIT} sermones restantes este mes`)}
            </p>
          )}

          {!isPro && (
            <div className="mb-10 border border-white/10 rounded-2xl p-5 bg-white/[0.03] backdrop-blur-sm text-center">
              <Lock className="w-5 h-5 mx-auto mb-2 text-white/60" />
              <p className="text-white text-[14.5px] font-medium mb-1">{t("Sermon Lab is a Pro feature", "Laboratorio de Sermones es una función Pro")}</p>
              <p className="text-[12.5px] text-white/60 mb-4 leading-relaxed">
                {t(`Designed for pastors and theologians. Includes up to ${MONTHLY_LIMIT} AI-refined sermons per month.`, `Diseñado para pastores y teólogos. Incluye hasta ${MONTHLY_LIMIT} sermones refinados por IA al mes.`)}
              </p>
              <Button
                size="sm"
                onClick={() => navigate("/premium")}
                className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full h-9 px-5 text-xs"
              >
                {t("Upgrade to Pro", "Actualizar a Pro")}
              </Button>
            </div>
          )}

          <div className="flex items-center justify-center mb-10">
            <span className="h-px w-10 bg-foreground/20" />
            <span className="mx-3 text-foreground/30 text-xs">✦</span>
            <span className="h-px w-10 bg-foreground/20" />
          </div>

          <section className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[11px] uppercase tracking-[0.3em] text-accent font-semibold flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />
                {t("Your Sermons", "Tus Sermones")}
              </h2>
              <Button
                size="sm"
                disabled={!isPro || atLimit}
                onClick={() => {
                  if (!isPro) { setShowGate(true); return; }
                  setShowNew((s) => !s);
                }}
                className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full h-8 px-3 text-xs disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                {t("New", "Nuevo")}
              </Button>
            </div>

            {showNew && (
              <div className="mb-5 border border-white/10 rounded-2xl p-4 bg-white/[0.03] backdrop-blur-sm">
                <Input
                  autoFocus
                  placeholder={t("Sermon title (e.g. Easter 2026)", "Título del sermón (ej. Pascua 2026)")}
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
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : t("Create", "Crear")}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { setShowNew(false); setNewTitle(""); }}
                    className="rounded-full text-white/70"
                  >
                    {t("Cancel", "Cancelar")}
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
                {t("No sermons yet. Tap ", "Aún no hay sermones. Toca ")}<span className="text-accent">{t("New", "Nuevo")}</span>{t(" to start.", " para comenzar.")}
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
                            {t(`${done}/10 steps · updated ${new Date(d.updated_at).toLocaleDateString()}`, `${done}/10 pasos · actualizado el ${new Date(d.updated_at).toLocaleDateString(language === "es" ? "es-ES" : "en-US")}`)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(d.id); }}
                          className="text-white/40 hover:text-destructive p-2 rounded-full"
                          aria-label={t("Delete sermon", "Eliminar sermón")}
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

          <section>
            <h2 className="text-[11px] uppercase tracking-[0.3em] text-accent mb-5 font-semibold flex items-center justify-center gap-2">
              <BookOpen className="w-3.5 h-3.5" />
              {t("How to Write a Sermon", "Cómo escribir un sermón")}
            </h2>
            <p className="text-center text-[14px] text-white/70 leading-relaxed mb-6">
              {t("A faithful guide to preparing sermons rooted in Scripture and shaped by prayer.", "Una guía fiel para preparar sermones arraigados en las Escrituras y formados por la oración.")}
            </p>

            <ol className="space-y-3">
              {SERMON_STEPS.map((s) => {
                const handleStepTap = async () => {
                  if (!isPro) { setShowGate(true); return; }
                  let draftId = drafts[0]?.id;
                  if (!draftId) {
                    if (atLimit) {
                      toast({ 
                        title: t("Monthly limit reached", "Límite mensual alcanzado"), 
                        description: t(`Limit is ${MONTHLY_LIMIT} sermons per month.`, `El límite es de ${MONTHLY_LIMIT} sermones al mes.`), 
                        variant: "destructive" 
                      });
                      return;
                    }
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) { toast({ title: t("Sign in required", "Se requiere iniciar sesión"), variant: "destructive" }); return; }
                    const { data, error } = await supabase
                      .from("sermon_drafts")
                      .insert({ user_id: session.user.id, title: t("Untitled Sermon", "Sermón sin título") })
                      .select()
                      .single();
                    if (error || !data) {
                      toast({ title: t("Could not create sermon", "No se pudo crear el sermón"), description: error?.message, variant: "destructive" });
                      return;
                    }
                    draftId = data.id;
                    setDrafts((prev) => [data as SermonDraft, ...prev]);
                  }
                  navigate(`/sermon-lab/${draftId}/step/${s.num}`);
                };
                return (
                  <li key={s.num}>
                    <button
                      onClick={handleStepTap}
                      className="w-full text-left flex items-start gap-3 border border-white/10 rounded-2xl p-4 bg-white/[0.03] backdrop-blur-sm hover:bg-white/[0.06] transition-colors tap-scale"
                    >
                      <span className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium bg-white/10 text-white/85 ring-1 ring-white/15">
                        {s.num}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-white text-[14.5px] font-medium leading-snug">
                          {t(s.title, stepTranslations[s.num].title)}
                        </p>
                        <p className="text-[13px] text-white/60 mt-0.5 leading-relaxed">
                          {t(s.desc, stepTranslations[s.num].desc)}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>
      </main>

      <PremiumNav />
      <LimitReachedDialog open={showGate} onOpenChange={setShowGate} requiredTier="pro" reason="gated" />
    </div>
  );
};

export default PublicSpeaking;

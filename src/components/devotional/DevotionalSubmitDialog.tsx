import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { Loader2, Sparkles, ShieldCheck } from "lucide-react";

const DRAFT_KEY = "user_devotional_draft_v1";
const GUIDELINES_ACK_KEY = "user_devotional_guidelines_ack_v1";

export function DevotionalSubmitDialog({
  open,
  onOpenChange,
  onSubmitted,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmitted?: () => void;
}) {
  const { language } = useLanguage();
  const t = (en: string, es: string) => (language === "es" ? es : en);

  const [title, setTitle] = useState("");
  const [scriptureRef, setScriptureRef] = useState("");
  const [scriptureText, setScriptureText] = useState("");
  const [reflection, setReflection] = useState("");
  const [prayer, setPrayer] = useState("");
  const [tags, setTags] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const alreadyAcked = typeof window !== "undefined" && localStorage.getItem(GUIDELINES_ACK_KEY) === "1";


  // Auto-save + restore draft
  useEffect(() => {
    if (!open) return;
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) {
      try {
        const d = JSON.parse(raw);
        setTitle(d.title || "");
        setScriptureRef(d.scriptureRef || "");
        setScriptureText(d.scriptureText || "");
        setReflection(d.reflection || "");
        setPrayer(d.prayer || "");
        setTags(d.tags || "");
      } catch {}
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, scriptureRef, scriptureText, reflection, prayer, tags }));
    }, 500);
    return () => clearTimeout(timer);
  }, [open, title, scriptureRef, scriptureText, reflection, prayer, tags]);

  const submit = async () => {
    if (!alreadyAcked && !acknowledged) { toast.error(t("Please acknowledge the Community Guidelines", "Por favor acepta las Normas de la Comunidad")); return; }
    if (!title.trim() || title.length > 120) { toast.error(t("Title required (max 120 chars)", "Título requerido (máx 120)")); return; }
    if (!scriptureRef.trim() || scriptureRef.length > 100) { toast.error(t("Scripture reference required", "Referencia bíblica requerida")); return; }
    if (reflection.trim().length < 100) { toast.error(t("Reflection is too short (min 100 chars)", "La reflexión es muy corta (mín 100)")); return; }
    if (reflection.length > 5000) { toast.error(t("Reflection is too long (max 5000)", "Reflexión muy larga (máx 5000)")); return; }
    if (prayer.trim().length < 30) { toast.error(t("Prayer is too short (min 30 chars)", "La oración es muy corta (mín 30)")); return; }
    if (prayer.length > 1500) { toast.error(t("Prayer is too long (max 1500)", "Oración muy larga (máx 1500)")); return; }

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) { toast.error(t("Sign in to submit", "Inicia sesión para enviar")); return; }

    setSubmitting(true);
    const tagArr = tags.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean).slice(0, 6);

    const { data: rpcData, error } = await supabase.rpc("submit_user_devotional", {
      p_title: title.trim(),
      p_scripture_ref: scriptureRef.trim(),
      p_scripture_text: scriptureText.trim() || null,
      p_reflection: reflection.trim(),
      p_prayer: prayer.trim(),
      p_tags: tagArr,
      p_language: language,
    });

    const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;

    if (error || !row?.allowed) {
      setSubmitting(false);
      const code = row?.error;
      if (code === "rate_limited") {
        toast.error(t("Daily submission limit reached (3 per day). Try again tomorrow.", "Límite diario alcanzado (3 por día). Intenta mañana."));
      } else if (code === "premium_required") {
        toast.error(t("Premium required to submit devotionals.", "Se requiere Premium para enviar devocionales."));
      } else if (code === "not_authenticated") {
        toast.error(t("Sign in to submit", "Inicia sesión para enviar"));
      } else {
        toast.error(error?.message || t("Submission failed", "Error al enviar"));
      }
      return;
    }

    const insertedId = row.id as string;


    toast.loading(t("Moderating with AI…", "Moderando con IA…"), { id: "mod" });
    const { data: modData, error: modErr } = await supabase.functions.invoke("moderate-user-devotional", {
      body: { devotional_id: insertedId },
    });
    toast.dismiss("mod");

    if (modErr) {
      toast.error(t("Moderation error. Your draft is saved.", "Error de moderación. Tu borrador está guardado."));
    } else if (modData?.status === "approved") {
      toast.success(t("Approved! Your devotional is in the library.", "¡Aprobado! Tu devocional está en la biblioteca."));
      localStorage.removeItem(DRAFT_KEY);
      localStorage.setItem(GUIDELINES_ACK_KEY, "1");
      setTitle(""); setScriptureRef(""); setScriptureText(""); setReflection(""); setPrayer(""); setTags("");
    } else if (modData?.status === "needs_revision") {
      toast.warning(t("Needs revision. See feedback in My Devotionals.", "Necesita revisión. Ver feedback en Mis Devocionales."));
    } else {
      toast.error(t("Rejected. See feedback in My Devotionals.", "Rechazado. Ver feedback en Mis Devocionales."));
    }
    setSubmitting(false);
    onSubmitted?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-950 border-white/10">
        <DialogHeader>
          <DialogTitle className="font-playfair text-xl">{t("Write a Devotional", "Escribe un Devocional")}</DialogTitle>
          <DialogDescription className="text-white/60 text-xs">
            {t(
              "Every submission is AI-reviewed for biblical soundness and quality before it enters the library.",
              "Cada envío es revisado por IA para asegurar solidez bíblica y calidad antes de entrar a la biblioteca."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div>
            <Label className="text-xs uppercase tracking-wider text-white/60">{t("Title", "Título")}</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder={t("A short, clear title", "Un título claro y breve")} />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-white/60">{t("Scripture Reference", "Referencia Bíblica")}</Label>
            <Input value={scriptureRef} onChange={(e) => setScriptureRef(e.target.value)} maxLength={100} placeholder="John 3:16" />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-white/60">{t("Scripture Text (optional)", "Texto Bíblico (opcional)")}</Label>
            <Textarea value={scriptureText} onChange={(e) => setScriptureText(e.target.value)} maxLength={800} rows={2} />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-white/60">{t("Reflection", "Reflexión")}</Label>
            <Textarea value={reflection} onChange={(e) => setReflection(e.target.value)} maxLength={5000} rows={8} placeholder={t("Share what God is teaching you…", "Comparte lo que Dios te está enseñando…")} />
            <p className="text-[10px] text-white/40 mt-1">{reflection.length} / 5000</p>
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-white/60">{t("Prayer", "Oración")}</Label>
            <Textarea value={prayer} onChange={(e) => setPrayer(e.target.value)} maxLength={1500} rows={4} />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-wider text-white/60">{t("Tags (comma separated, max 6)", "Etiquetas (separadas por coma, máx 6)")}</Label>
            <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="hope, prayer, suffering" />
          </div>

          <Button onClick={submit} disabled={submitting} className="w-full">
            {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t("Submitting…", "Enviando…")}</>
              : <><Sparkles className="h-4 w-4 mr-2" />{t("Submit for AI review", "Enviar para revisión de IA")}</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { Loader2, Scale } from "lucide-react";

export function AppealDialog({
  open,
  onOpenChange,
  devotionalId,
  onResolved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  devotionalId: string;
  onResolved?: () => void;
}) {
  const { language } = useLanguage();
  const t = (en: string, es: string) => (language === "es" ? es : en);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (reason.trim().length < 20) {
      toast.error(t("Please explain your appeal (min 20 chars)", "Explica tu apelación (mín 20 caracteres)"));
      return;
    }
    setSubmitting(true);
    toast.loading(t("Second-opinion review in progress…", "Segunda opinión en progreso…"), { id: "appeal" });
    const { data, error } = await supabase.functions.invoke("appeal-user-devotional", {
      body: { devotional_id: devotionalId, appeal_reason: reason.trim() },
    });
    toast.dismiss("appeal");
    setSubmitting(false);

    if (error) {
      const msg = (error as any)?.context?.error || (error as any)?.message || "";
      if (msg.includes("appeal_limit_reached")) toast.error(t("You've already appealed this devotional.", "Ya has apelado este devocional."));
      else if (msg.includes("already_approved")) toast.info(t("This devotional is already approved.", "Este devocional ya está aprobado."));
      else toast.error(t("Appeal failed. Try again.", "Falló la apelación."));
      return;
    }

    if (data?.status === "approved") {
      toast.success(t("Appeal upheld — your devotional is now approved!", "¡Apelación aceptada — tu devocional fue aprobado!"));
    } else if (data?.status === "needs_revision") {
      toast.warning(t("Reviewer suggests revisions. See updated feedback.", "El revisor sugiere cambios. Ver comentarios actualizados."));
    } else {
      toast.error(t("Appeal denied. See updated feedback.", "Apelación denegada. Ver comentarios actualizados."));
    }
    setReason("");
    onResolved?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-zinc-950 border-white/10">
        <DialogHeader>
          <DialogTitle className="font-playfair text-xl flex items-center gap-2">
            <Scale className="h-4 w-4 text-amber-300" />
            {t("Request Re-review", "Solicitar Nueva Revisión")}
          </DialogTitle>
          <DialogDescription className="text-white/60 text-xs">
            {t(
              "A senior reviewer will re-evaluate your devotional with fresh eyes. You can appeal once per submission.",
              "Un revisor senior evaluará tu devocional con ojos nuevos. Puedes apelar una vez por envío."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          <Label className="text-xs uppercase tracking-wider text-white/60">
            {t("Why should this be reconsidered?", "¿Por qué debería reconsiderarse?")}
          </Label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={1000}
            rows={5}
            placeholder={t(
              "Explain where the prior review missed something or why the content is doctrinally sound…",
              "Explica dónde la revisión anterior falló o por qué el contenido es doctrinalmente sólido…"
            )}
          />
          <p className="text-[10px] text-white/40">{reason.length} / 1000</p>

          <Button onClick={submit} disabled={submitting || reason.trim().length < 20} className="w-full">
            {submitting ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t("Reviewing…", "Revisando…")}</>
            ) : (
              <><Scale className="h-4 w-4 mr-2" />{t("Submit appeal", "Enviar apelación")}</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

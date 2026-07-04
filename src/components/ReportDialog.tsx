import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { Flag, Loader2 } from "lucide-react";

type TargetType = "user_devotional" | "user_devotional_comment";

const REASONS: { value: string; en: string; es: string }[] = [
  { value: "heresy", en: "Theological error / heresy", es: "Error teológico / herejía" },
  { value: "abuse", en: "Abuse or harassment", es: "Abuso o acoso" },
  { value: "spam", en: "Spam", es: "Spam" },
  { value: "self_promotion", en: "Self-promotion", es: "Autopromoción" },
  { value: "off_topic", en: "Off-topic", es: "Fuera de tema" },
  { value: "other", en: "Other", es: "Otro" },
];

export function ReportDialog({
  open,
  onOpenChange,
  targetType,
  targetId,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  targetType: TargetType;
  targetId: string;
}) {
  const { language } = useLanguage();
  const t = (en: string, es: string) => (language === "es" ? es : en);
  const [reason, setReason] = useState<string>("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!reason) {
      toast.error(t("Choose a reason", "Elige una razón"));
      return;
    }
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      toast.error(t("Sign in to report", "Inicia sesión para reportar"));
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("content_reports").insert({
      reporter_id: userData.user.id,
      target_type: targetType,
      target_id: targetId,
      reason,
      details: details.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      if (error.code === "23505") {
        toast.info(t("You already reported this", "Ya reportaste esto"));
      } else {
        toast.error(error.message);
      }
      return;
    }
    toast.success(t("Reported. Thank you — our team will review.", "Reportado. Gracias, nuestro equipo revisará."));
    setReason("");
    setDetails("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-zinc-950 border-white/10">
        <DialogHeader>
          <DialogTitle className="font-playfair text-xl flex items-center gap-2">
            <Flag className="h-4 w-4" />
            {t("Report Content", "Reportar Contenido")}
          </DialogTitle>
          <DialogDescription className="text-white/60 text-xs">
            {t(
              "Reports are reviewed by our team. Content with multiple reports is hidden pending review.",
              "Los reportes son revisados por nuestro equipo. El contenido con varios reportes se oculta pendiente de revisión."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div>
            <Label className="text-xs uppercase tracking-wider text-white/60 mb-2 block">
              {t("Reason", "Razón")}
            </Label>
            <RadioGroup value={reason} onValueChange={setReason} className="space-y-2">
              {REASONS.map((r) => (
                <div key={r.value} className="flex items-center gap-2">
                  <RadioGroupItem value={r.value} id={`reason-${r.value}`} />
                  <Label htmlFor={`reason-${r.value}`} className="text-sm cursor-pointer font-normal">
                    {t(r.en, r.es)}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label className="text-xs uppercase tracking-wider text-white/60">
              {t("Details (optional)", "Detalles (opcional)")}
            </Label>
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder={t("What's wrong with this content?", "¿Qué está mal con este contenido?")}
            />
          </div>

          <Button onClick={submit} disabled={submitting || !reason} className="w-full" variant="destructive">
            {submitting ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t("Submitting…", "Enviando…")}</>
            ) : (
              <><Flag className="h-4 w-4 mr-2" />{t("Submit report", "Enviar reporte")}</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

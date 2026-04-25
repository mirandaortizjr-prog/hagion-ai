import { useEffect, useState } from "react";
import { Sparkles, Upload, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { usePremium } from "@/contexts/PremiumContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Submission {
  id: string;
  status: string;
  rejection_reason: string | null;
  image_url: string;
}

export const HeroImageUploadDialog = ({ open, onOpenChange }: Props) => {
  const { isPremium } = usePremium();
  const { language } = useLanguage();
  const t = (en: string, es: string) => (language === "es" ? es : en);
  const [active, setActive] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open) return;
    loadActive();
  }, [open]);

  const loadActive = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("hero_images")
      .select("id, status, rejection_reason, image_url")
      .eq("user_id", user.id)
      .in("status", ["pending", "approved"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setActive(data);
    setLoading(false);
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error(t("Please select an image", "Selecciona una imagen"));
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error(t("Image must be under 8MB", "La imagen debe ser menor a 8MB"));
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");

      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("hero-images")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from("hero-images").getPublicUrl(path);
      const image_url = pub.publicUrl;

      const { data: row, error: insErr } = await supabase
        .from("hero_images")
        .insert({ user_id: user.id, image_url, storage_path: path, status: "pending" })
        .select("id")
        .single();
      if (insErr) throw insErr;

      // Trigger moderation (fire-and-forget; UI shows pending)
      supabase.functions.invoke("moderate-hero-image", {
        body: { hero_image_id: row.id, image_url },
      }).then(() => loadActive());

      toast.success(t("Submitted! Reviewing now…", "¡Enviada! Revisando…"));
      await loadActive();
    } catch (e: any) {
      const msg = e?.message || "Upload failed";
      if (msg.includes("violates row-level security")) {
        toast.error(t(
          "You already have a submission in progress.",
          "Ya tienes un envío en proceso.",
        ));
      } else {
        toast.error(msg);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!active) return;
    const { error } = await supabase.from("hero_images").delete().eq("id", active.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t("Withdrawn", "Retirada"));
    setActive(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="font-playfair text-xl flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-300" />
            {t("Share an inspiration", "Comparte una inspiración")}
          </DialogTitle>
          <DialogDescription className="text-white/60 text-[13px] leading-relaxed">
            {t(
              "Premium members can submit one image at a time to the worship hero. Once your image has had its moment in the rotation, you can submit another.",
              "Los miembros Premium pueden enviar una imagen a la vez al hero de adoración. Cuando tu imagen haya tenido su momento, puedes enviar otra.",
            )}
          </DialogDescription>
        </DialogHeader>

        {!isPremium ? (
          <div className="rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-center">
            <p className="text-[13px] text-white/80 mb-3">
              {t("This is a Premium feature.", "Esta es una función Premium.")}
            </p>
            <Button onClick={() => (window.location.href = "/premium")} className="bg-amber-300 text-black hover:bg-amber-200">
              {t("Upgrade to Premium", "Mejorar a Premium")}
            </Button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-white/50" />
          </div>
        ) : active ? (
          <div className="space-y-3">
            <div className="rounded-xl overflow-hidden border border-white/10">
              <img src={active.image_url} alt="" className="w-full aspect-[4/3] object-cover" />
            </div>
            {active.status === "pending" && (
              <div className="flex items-center gap-2 rounded-lg bg-white/5 p-3 text-[13px] text-white/80">
                <Clock className="h-4 w-4 text-amber-300" />
                {t("Reviewing your image…", "Revisando tu imagen…")}
              </div>
            )}
            {active.status === "approved" && (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-[13px] text-emerald-200">
                <CheckCircle2 className="h-4 w-4" />
                {t("Live in the rotation ✨", "En la rotación ✨")}
              </div>
            )}
            <Button
              variant="outline"
              onClick={handleWithdraw}
              className="w-full border-white/15 bg-transparent text-white/80 hover:bg-white/5"
            >
              {t("Withdraw to submit another", "Retirar para enviar otra")}
            </Button>
          </div>
        ) : (
          <label className="block">
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            <div className="rounded-xl border-2 border-dashed border-white/15 hover:border-white/30 transition-colors p-8 text-center cursor-pointer bg-white/[0.02]">
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-white/60" />
                  <p className="text-[13px] text-white/60">{t("Uploading…", "Subiendo…")}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-6 w-6 text-white/50" />
                  <p className="text-[13px] text-white/80">{t("Tap to choose an image", "Toca para elegir una imagen")}</p>
                  <p className="text-[11px] text-white/45">
                    {t("Peaceful, reverent, JPG/PNG · max 8MB", "Pacífica, reverente, JPG/PNG · máx 8MB")}
                  </p>
                </div>
              )}
            </div>
          </label>
        )}

        <p className="text-[10px] text-white/40 leading-relaxed">
          {t(
            "Images are auto-screened and rotate fairly so every member gets their moment.",
            "Las imágenes se revisan automáticamente y rotan de forma justa para que cada miembro tenga su momento.",
          )}
        </p>
      </DialogContent>
    </Dialog>
  );
};

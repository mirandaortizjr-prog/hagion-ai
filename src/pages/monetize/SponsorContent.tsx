import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRevenueCat } from "@/hooks/useRevenueCat";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Megaphone, Smartphone } from "lucide-react";

type Target = "post" | "event" | "teaching" | "church";

const NATIVE_SPONSOR_PRICES: Record<number, string> = {
  3: "$15",
  7: "$31.50",
  14: "$63",
  30: "$112.50",
  60: "$225",
};

const NATIVE_FEATURED_PRICES: Record<number, string> = {
  3: "$24",
  7: "$50.40",
  14: "$100.80",
  30: "$180",
  60: "$360",
};

function nativeProductId(targetType: Target, days: number): string {
  if (targetType === "church") {
    return `featured_church_${days}_days`;
  }
  return `sponsor_content_${days}_days`;
}

export default function SponsorContent() {
  const { language } = useLanguage();
  const t = (en: string, es: string) => (language === "es" ? es : en);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { isNative, products, purchase, isLoading: rcLoading } = useRevenueCat();

  const [targetType, setTargetType] = useState<Target>("post");
  const [items, setItems] = useState<Array<{ id: string; label: string }>>([]);
  const [targetId, setTargetId] = useState<string>("");
  const [days, setDays] = useState(7);
  const [sponsorName, setSponsorName] = useState("");
  const [sponsorUrl, setSponsorUrl] = useState("");
  const [processing, setProcessing] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);

  useEffect(() => {
    if (params.get("success")) toast.success(t("Sponsorship activated!", "¡Patrocinio activado!"));
    if (params.get("canceled")) toast.info(t("Checkout canceled", "Pago cancelado"));
  }, [params]);

  useEffect(() => {
    (async () => {
      setLoadingItems(true);
      setTargetId("");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }

      if (targetType === "post") {
        const { data } = await supabase.from("posts").select("id, content").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
        setItems((data ?? []).map(p => ({ id: p.id, label: (p.content ?? "").slice(0, 60) || "(no text)" })));
      } else if (targetType === "event") {
        const { data } = await supabase.from("events").select("id, title").eq("creator_id", user.id).order("event_date", { ascending: false }).limit(50);
        setItems((data ?? []).map(x => ({ id: x.id, label: x.title })));
      } else if (targetType === "teaching") {
        const { data } = await supabase.from("teachings").select("id, title").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
        setItems((data ?? []).map(x => ({ id: x.id, label: x.title })));
      } else if (targetType === "church") {
        const { data } = await supabase.from("churches").select("id, name").eq("pastor_id", user.id);
        setItems((data ?? []).map(x => ({ id: x.id, label: x.name })));
      }
      setLoadingItems(false);
    })();
  }, [targetType, navigate]);

  const baseDaily = targetType === "church" ? 8 : 5;
  const raw = baseDaily * days;
  const webEstimate = days >= 30 ? Math.floor(raw * 0.75) : days >= 7 ? Math.floor(raw * 0.9) : raw;
  const nativeEstimate = targetType === "church" ? NATIVE_FEATURED_PRICES[days] : NATIVE_SPONSOR_PRICES[days];

  const nativeProduct = products.find((p) => p.id === nativeProductId(targetType, days));
  const displayedPrice = isNative
    ? nativeProduct?.priceString || nativeEstimate || `$${webEstimate}`
    : `$${webEstimate}`;

  const checkout = async () => {
    if (!targetId) {
      toast.error(t("Select something to promote", "Selecciona algo para promocionar"));
      return;
    }
    setProcessing(true);
    try {
      if (isNative) {
        const productId = nativeProductId(targetType, days);
        const attrs: Record<string, string | null> =
          targetType === "church"
            ? { church_id: targetId }
            : { target_type: targetType, target_id: targetId };
        const result = await purchase(productId, attrs);
        if (result.success) {
          toast.success(t("Sponsorship activated!", "¡Patrocinio activado!"));
          navigate("/main-menu");
        } else if (result.error && result.error !== "Purchase cancelled") {
          toast.error(t("Purchase failed", "La compra falló") + ": " + result.error);
        }
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-sponsorship-checkout", {
        body: {
          target_type: targetType,
          target_id: targetId,
          duration_days: days,
          sponsor_name: sponsorName || null,
          sponsor_url: sponsorUrl || null,
        },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (e) {
      toast.error(t("Failed to start checkout", "No se pudo iniciar el pago"));
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">{t("Promote on Hagion", "Promociona en Hagion")}</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <Card className="border-primary/40 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Megaphone className="h-6 w-6 text-primary" />
              <CardTitle>{t("Reach more of the community", "Llega a más personas de la comunidad")}</CardTitle>
            </div>
            <CardDescription>
              {t(
                "Boost your post, event, teaching, or church so more believers see it. Clearly labeled as Sponsored.",
                "Impulsa tu publicación, evento, enseñanza o iglesia para que más creyentes lo vean. Se muestra claramente como Patrocinado."
              )}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="space-y-4 pt-6">
            <div>
              <Label>{t("What do you want to promote?", "¿Qué quieres promocionar?")}</Label>
              <Select value={targetType} onValueChange={(v) => setTargetType(v as Target)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="post">{t("A post", "Una publicación")}</SelectItem>
                  <SelectItem value="event">{t("An event", "Un evento")}</SelectItem>
                  <SelectItem value="teaching">{t("A teaching", "Una enseñanza")}</SelectItem>
                  <SelectItem value="church">{t("A church page", "Una página de iglesia")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t("Select item", "Selecciona el elemento")}</Label>
              {loadingItems ? (
                <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />{t("Loading…", "Cargando…")}</div>
              ) : items.length === 0 ? (
                <div className="mt-2 text-sm text-muted-foreground">{t("Nothing available. Create one first.", "No hay nada disponible. Crea uno primero.")}</div>
              ) : (
                <Select value={targetId} onValueChange={setTargetId}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder={t("Choose…", "Elige…")} /></SelectTrigger>
                  <SelectContent>
                    {items.map(i => <SelectItem key={i.id} value={i.id}>{i.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              <Label>{t("Duration (days)", "Duración (días)")}</Label>
              <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 {t("days", "días")}</SelectItem>
                  <SelectItem value="7">7 {t("days", "días")}</SelectItem>
                  <SelectItem value="14">14 {t("days", "días")}</SelectItem>
                  <SelectItem value="30">30 {t("days", "días")}</SelectItem>
                  <SelectItem value="60">60 {t("days", "días")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {targetType === "post" && (
              <>
                <div>
                  <Label>{t("Sponsor name (optional)", "Nombre del patrocinador (opcional)")}</Label>
                  <Input className="mt-1" value={sponsorName} onChange={(e) => setSponsorName(e.target.value)} placeholder={t("e.g. Grace Community Church", "ej. Iglesia Comunidad de Gracia")} />
                </div>
                <div>
                  <Label>{t("Sponsor link (optional)", "Enlace del patrocinador (opcional)")}</Label>
                  <Input className="mt-1" value={sponsorUrl} onChange={(e) => setSponsorUrl(e.target.value)} placeholder="https://" />
                </div>
              </>
            )}

            <div className="rounded-lg bg-muted p-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t("Estimated total", "Total estimado")}</span>
              <span className="text-xl font-bold">{displayedPrice}</span>
            </div>

            <Button className="w-full" size="lg" disabled={processing || !targetId || rcLoading} onClick={checkout}>
              {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : isNative ? <Smartphone className="h-4 w-4 mr-2" /> : null}
              {isNative ? t("Pay with Google Play", "Pagar con Google Play") : t("Continue to payment", "Continuar al pago")}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              {isNative
                ? t("Billed through Google Play. Web purchases use Stripe.", "Cobro a través de Google Play. En la web se usa Stripe.")
                : t("Secure checkout by Stripe.", "Pago seguro con Stripe.")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

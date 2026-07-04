import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, BadgeCheck, TrendingUp, BarChart3, Sparkles, Loader2 } from "lucide-react";

export default function ChurchPro() {
  const { language } = useLanguage();
  const t = (en: string, es: string) => (language === "es" ? es : en);
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [churches, setChurches] = useState<Array<{ id: string; name: string }>>([]);
  const [selected, setSelected] = useState<string>("");
  const [plan, setPlan] = useState<"monthly" | "yearly">("monthly");
  const [activeSub, setActiveSub] = useState<{ status: string; current_period_end: string | null } | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }
      const { data } = await supabase.from("churches").select("id, name").eq("pastor_id", user.id);
      setChurches(data ?? []);
      if (data && data.length > 0) setSelected(data[0].id);
      setLoading(false);
    })();
  }, [navigate]);

  useEffect(() => {
    if (!selected) return;
    supabase.from("church_subscriptions")
      .select("status, current_period_end")
      .eq("church_id", selected)
      .in("status", ["active", "trialing"])
      .maybeSingle()
      .then(({ data }) => setActiveSub(data));
  }, [selected]);

  useEffect(() => {
    if (params.get("success")) toast.success(t("Subscription activated!", "¡Suscripción activada!"));
    if (params.get("canceled")) toast.info(t("Checkout canceled", "Pago cancelado"));
  }, [params]);

  const checkout = async () => {
    if (!selected) return;
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-church-pro-checkout", {
        body: { church_id: selected, plan },
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
          <h1 className="text-lg font-semibold">{t("Ministry Pro", "Ministerio Pro")}</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <Card className="border-primary/40 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-6 w-6 text-primary" />
              <CardTitle>{t("Grow your ministry on Hagion", "Haz crecer tu ministerio en Hagion")}</CardTitle>
            </div>
            <CardDescription>
              {t(
                "Get verified, stand out in search, and reach more believers in your area.",
                "Verifícate, destaca en las búsquedas y llega a más creyentes en tu zona."
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-3"><BadgeCheck className="h-5 w-5 text-primary mt-0.5" /><div><b>{t("Verified badge", "Insignia verificada")}</b><p className="text-muted-foreground">{t("Blue check on your church page and every mention.", "Marca azul en la página de tu iglesia y en cada mención.")}</p></div></div>
            <div className="flex items-start gap-3"><TrendingUp className="h-5 w-5 text-primary mt-0.5" /><div><b>{t("Featured placement", "Ubicación destacada")}</b><p className="text-muted-foreground">{t("Priority in the church directory and map.", "Prioridad en el directorio de iglesias y en el mapa.")}</p></div></div>
            <div className="flex items-start gap-3"><Sparkles className="h-5 w-5 text-primary mt-0.5" /><div><b>{t("Unlimited events + custom banner", "Eventos ilimitados + banner personalizado")}</b><p className="text-muted-foreground">{t("Publish as many events as you need with your own branding.", "Publica todos los eventos que necesites con tu propia imagen.")}</p></div></div>
            <div className="flex items-start gap-3"><BarChart3 className="h-5 w-5 text-primary mt-0.5" /><div><b>{t("Analytics", "Analíticas")}</b><p className="text-muted-foreground">{t("Page views, new members, event RSVPs.", "Vistas, nuevos miembros, confirmaciones de eventos.")}</p></div></div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : churches.length === 0 ? (
          <Card><CardContent className="py-6 text-center text-sm text-muted-foreground">
            {t("You don't own a church page yet. Create one first.", "Aún no eres dueño de una página de iglesia. Crea una primero.")}
            <div className="mt-3"><Button onClick={() => navigate("/community/my-church")}>{t("Set up my church", "Configurar mi iglesia")}</Button></div>
          </CardContent></Card>
        ) : (
          <Card>
            <CardHeader><CardTitle className="text-base">{t("Choose your church & plan", "Elige tu iglesia y plan")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Select value={selected} onValueChange={setSelected}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {churches.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>

              {activeSub ? (
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
                  <div className="flex items-center gap-2 font-medium"><BadgeCheck className="h-4 w-4 text-primary" />{t("Ministry Pro is active", "Ministerio Pro está activo")}</div>
                  {activeSub.current_period_end && (
                    <p className="text-muted-foreground mt-1">
                      {t("Renews", "Se renueva")} {new Date(activeSub.current_period_end).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setPlan("monthly")} className={`rounded-lg border p-3 text-left ${plan==="monthly" ? "border-primary bg-primary/10" : "border-border"}`}>
                      <div className="text-sm font-medium">{t("Monthly", "Mensual")}</div>
                      <div className="text-xl font-bold">$19<span className="text-xs font-normal text-muted-foreground">/mo</span></div>
                    </button>
                    <button onClick={() => setPlan("yearly")} className={`rounded-lg border p-3 text-left relative ${plan==="yearly" ? "border-primary bg-primary/10" : "border-border"}`}>
                      <Badge className="absolute -top-2 right-2">{t("Save 17%", "Ahorra 17%")}</Badge>
                      <div className="text-sm font-medium">{t("Yearly", "Anual")}</div>
                      <div className="text-xl font-bold">$190<span className="text-xs font-normal text-muted-foreground">/yr</span></div>
                    </button>
                  </div>
                  <Button className="w-full" size="lg" disabled={processing} onClick={checkout}>
                    {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {t("Upgrade to Ministry Pro", "Actualizar a Ministerio Pro")}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    {t("Secure checkout by Stripe. Cancel anytime.", "Pago seguro con Stripe. Cancela cuando quieras.")}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

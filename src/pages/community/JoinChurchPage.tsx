import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Church as ChurchIcon, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

export default function JoinChurchPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = (en: string, es: string) => (language === "es" ? es : en);
  const [church, setChurch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    (async () => {
      if (!code) { setLoading(false); return; }
      const { data } = await (supabase.from("churches") as any)
        .select("id, name, city, state, country, member_count, verified, description")
        .eq("invite_code", code.toLowerCase())
        .maybeSingle();
      setChurch(data);
      setLoading(false);
    })();
  }, [code]);

  const join = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) {
      sessionStorage.setItem("pendingChurchCode", code || "");
      navigate("/auth");
      return;
    }
    setJoining(true);
    const { data, error } = await supabase.rpc("join_church_by_code" as any, { p_code: code });
    setJoining(false);
    if (error || !(data as any)?.ok) {
      toast({ title: t("Could not join", "No se pudo unir"), description: (data as any)?.error || error?.message, variant: "destructive" });
      return;
    }
    toast({ title: t(`Welcome to ${church.name}`, `Bienvenido a ${church.name}`) });
    navigate("/community/my-church");
  };

  return (
    <div className="min-h-screen text-white flex items-center justify-center px-5">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-7 text-center">
        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-white/50" />
        ) : !church ? (
          <>
            <h2 className="font-playfair text-xl mb-2">{t("Invite not found", "Invitación no encontrada")}</h2>
            <p className="text-white/55 text-[13px] mb-4">{t("This church invite code is invalid or expired.", "Este código de invitación es inválido o expiró.")}</p>
            <Button onClick={() => navigate("/community")} variant="outline" className="rounded-full border-white/20 bg-white/5">{t("Back to community", "Volver a la comunidad")}</Button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-300/30 to-amber-700/10 ring-1 ring-amber-300/30 flex items-center justify-center mb-4">
              <ChurchIcon className="w-8 h-8 text-amber-100" />
            </div>
            <h2 className="font-playfair text-2xl mb-1 inline-flex items-center justify-center gap-2">
              {church.name}
              {church.verified && <CheckCircle2 className="w-5 h-5 text-sky-300" />}
            </h2>
            <p className="text-white/60 text-[13px] mb-1">
              {[church.city, church.state, church.country].filter(Boolean).join(", ")}
            </p>
            <p className="text-white/45 text-[11.5px] mb-5">{church.member_count || 0} {t("members", "miembros")}</p>
            {church.description && <p className="text-white/70 text-[13px] mb-5">{church.description}</p>}
            <Button onClick={join} disabled={joining} className="w-full h-11 rounded-full bg-primary text-primary-foreground">
              {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : t("Join this church", "Únete a esta iglesia")}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

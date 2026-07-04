import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSafeBackNavigation } from "@/hooks/useSafeBackNavigation";
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2, XCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const statusMap = {
  approved: { Icon: CheckCircle2, color: "text-emerald-300", en: "Approved", es: "Aprobado" },
  needs_revision: { Icon: AlertCircle, color: "text-amber-300", en: "Needs revision", es: "Necesita revisión" },
  rejected: { Icon: XCircle, color: "text-rose-300", en: "Rejected", es: "Rechazado" },
  pending: { Icon: Clock, color: "text-white/50", en: "Pending", es: "Pendiente" },
};

const MyDevotionals = () => {
  const { language } = useLanguage();
  const t = (en: string, es: string) => (language === "es" ? es : en);
  const back = useSafeBackNavigation("/daily-devotional");
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) { setLoading(false); return; }
      const { data } = await supabase.from("user_devotionals").select("*").eq("author_id", userData.user.id).order("created_at", { ascending: false });
      setItems(data || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen text-white">
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-black/40 border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={back} className="p-2 rounded-full hover:bg-white/10"><ArrowLeft className="h-5 w-5" /></button>
          <h1 className="font-playfair text-lg tracking-tight">{t("My Devotionals", "Mis Devocionales")}</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-4 pb-24 space-y-3">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-white/40" /></div>
        ) : items.length === 0 ? (
          <p className="text-center py-16 text-white/50 text-sm">{t("You haven't submitted any devotionals yet.", "Aún no has enviado devocionales.")}</p>
        ) : items.map((i) => {
          const s = statusMap[i.status as keyof typeof statusMap] || statusMap.pending;
          const Icon = s.Icon;
          return (
            <div key={i.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${s.color}`} />
                  <span className={`text-xs uppercase tracking-wider ${s.color}`}>{language === "es" ? s.es : s.en}</span>
                </div>
                <span className="text-[11px] text-white/40">{formatDistanceToNow(new Date(i.created_at), { addSuffix: true })}</span>
              </div>
              <h3 className="font-playfair text-lg">{i.title}</h3>
              <p className="text-[11px] text-amber-200/70 uppercase tracking-wider mt-0.5">{i.scripture_ref}</p>

              {i.status === "approved" && (
                <button onClick={() => navigate(`/devotional/${i.id}`)} className="mt-3 text-xs text-sky-300 hover:underline">
                  {t("View →", "Ver →")}
                </button>
              )}

              {i.moderation_feedback?.feedback && i.status !== "approved" && (
                <div className="mt-3 rounded-xl bg-white/[0.03] border border-white/10 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-white/50 mb-1">{t("AI Feedback", "Comentarios de IA")}</p>
                  <p className="text-[13px] text-white/80 leading-relaxed">{i.moderation_feedback.feedback}</p>
                </div>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
};

export default MyDevotionals;

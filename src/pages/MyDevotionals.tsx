import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSafeBackNavigation } from "@/hooks/useSafeBackNavigation";
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2, XCircle, Clock, Scale } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AppealDialog } from "@/components/devotional/AppealDialog";

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
  const [appealFor, setAppealFor] = useState<string | null>(null);

  const load = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) { setLoading(false); return; }
    const { data } = await supabase.from("user_devotionals").select("*").eq("author_id", userData.user.id).order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

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
          const canAppeal = (i.status === "rejected" || i.status === "needs_revision") && (i.appeal_count || 0) < 1;
          const wasAppealed = (i.appeal_count || 0) >= 1;
          return (
            <div key={i.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${s.color}`} />
                  <span className={`text-xs uppercase tracking-wider ${s.color}`}>{language === "es" ? s.es : s.en}</span>
                  {wasAppealed && (
                    <span className="text-[10px] uppercase tracking-wider text-white/40 flex items-center gap-1">
                      <Scale className="h-3 w-3" />
                      {t("appealed", "apelado")}
                    </span>
                  )}
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
                  <p className="text-[10px] uppercase tracking-wider text-white/50 mb-1">
                    {wasAppealed ? t("Reviewer Feedback (post-appeal)", "Comentarios (post-apelación)") : t("AI Feedback", "Comentarios de IA")}
                  </p>
                  <p className="text-[13px] text-white/80 leading-relaxed whitespace-pre-wrap">{i.moderation_feedback.feedback}</p>
                </div>
              )}

              {i.moderation_feedback?.autohidden && (
                <div className="mt-2 rounded-xl bg-rose-500/5 border border-rose-300/20 p-3">
                  <p className="text-[11px] text-rose-200/90 leading-relaxed">
                    {t(
                      "Auto-hidden after multiple community reports. It will stay hidden pending team review.",
                      "Ocultado automáticamente tras varios reportes. Permanecerá oculto hasta revisión del equipo."
                    )}
                  </p>
                </div>
              )}

              {canAppeal && (
                <button
                  onClick={() => setAppealFor(i.id)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-300/25 px-3 py-1.5 text-[12px] text-amber-200 hover:bg-amber-500/20 transition-colors"
                >
                  <Scale className="h-3.5 w-3.5" />
                  {t("Request re-review", "Solicitar nueva revisión")}
                </button>
              )}
              {wasAppealed && i.status !== "approved" && (
                <p className="mt-3 text-[11px] text-white/40 italic">
                  {t("You've used your one appeal for this devotional.", "Ya usaste tu única apelación para este devocional.")}
                </p>
              )}
            </div>
          );
        })}
      </main>

      {appealFor && (
        <AppealDialog
          open={!!appealFor}
          onOpenChange={(o) => !o && setAppealFor(null)}
          devotionalId={appealFor}
          onResolved={load}
        />
      )}
    </div>
  );
};

export default MyDevotionals;

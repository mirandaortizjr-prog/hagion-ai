import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSafeBackNavigation } from "@/hooks/useSafeBackNavigation";
import { ArrowLeft, Loader2, Bookmark, BookmarkCheck, MessageCircle, Flag } from "lucide-react";
import { UserDevotionalCommentThread } from "@/components/devotional/UserDevotionalCommentThread";
import { ReportDialog } from "@/components/ReportDialog";
import heroLiquidLight from "@/assets/hero-liquid-light.jpg";
import { toast } from "sonner";

const UserDevotionalDetail = () => {
  const { id } = useParams();
  const { language } = useLanguage();
  const t = (en: string, es: string) => (language === "es" ? es : en);
  const back = useSafeBackNavigation("/devotional-library");

  const [dev, setDev] = useState<any>(null);
  const [author, setAuthor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUid(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase.from("user_devotionals").select("*").eq("id", id).eq("status", "approved").maybeSingle();
      setDev(data);
      if (data) {
        const { data: p } = await supabase.from("profiles").select("name, username, avatar_url").eq("user_id", data.author_id).maybeSingle();
        setAuthor(p);
        // increment read count (best-effort, non-blocking)
        supabase.from("user_devotionals").update({ read_count: (data.read_count || 0) + 1 }).eq("id", id).then(() => {});
      }
      setLoading(false);
    })();
  }, [id]);

  useEffect(() => {
    if (!uid || !id) return;
    supabase.from("user_devotional_saves").select("id").eq("user_id", uid).eq("devotional_id", id).maybeSingle()
      .then(({ data }) => setSaved(!!data));
  }, [uid, id]);

  const toggleSave = async () => {
    if (!uid || !id) { toast.error(t("Sign in", "Inicia sesión")); return; }
    if (saved) {
      await supabase.from("user_devotional_saves").delete().eq("user_id", uid).eq("devotional_id", id);
      setSaved(false);
    } else {
      await supabase.from("user_devotional_saves").insert({ user_id: uid, devotional_id: id });
      setSaved(true);
      toast.success(t("Saved", "Guardado"));
    }
  };

  return (
    <div className="min-h-screen text-white">
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-black/40 border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={back} className="p-2 rounded-full hover:bg-white/10"><ArrowLeft className="h-5 w-5" /></button>
          <h1 className="font-playfair text-lg tracking-tight flex-1">{t("Devotional", "Devocional")}</h1>
          {dev && (
            <>
              <button onClick={() => setReportOpen(true)} className="p-2 rounded-full hover:bg-white/10" aria-label={t("Report", "Reportar")}>
                <Flag className="h-4 w-4 text-white/70" />
              </button>
              <button onClick={toggleSave} className="p-2 rounded-full hover:bg-white/10">
                {saved ? <BookmarkCheck className="h-5 w-5 text-amber-300" /> : <Bookmark className="h-5 w-5" />}
              </button>
            </>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto pb-24">
        {loading ? (
          <div className="flex justify-center py-32"><Loader2 className="h-6 w-6 animate-spin text-white/50" /></div>
        ) : !dev ? (
          <p className="text-center py-24 text-white/50">{t("Not found.", "No encontrado.")}</p>
        ) : (
          <>
            <section className="relative">
              <img src={heroLiquidLight} alt="" className="w-full h-[30vh] min-h-[220px] max-h-[320px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/90" />
              <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8">
                <p className="text-[10px] tracking-[0.22em] uppercase text-amber-200/80">{dev.scripture_ref}</p>
                <h2 className="mt-1.5 font-playfair text-2xl sm:text-3xl tracking-tight">{dev.title}</h2>
                <p className="mt-2 text-[11px] text-white/60">
                  {t("By", "Por")} {author?.name || author?.username || "Friend"}
                </p>
              </div>
            </section>

            <article className="px-5 sm:px-8 pt-8 space-y-8">
              {dev.scripture_text && (
                <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                  <blockquote className="font-playfair italic text-lg leading-relaxed text-white/95">
                    "{dev.scripture_text}"
                  </blockquote>
                </section>
              )}

              <section>
                <p className="text-[10px] tracking-[0.22em] uppercase text-white/55 mb-3">{t("Reflection", "Reflexión")}</p>
                <p className="font-inter text-[15px] leading-[1.75] text-white/85 whitespace-pre-wrap">{dev.reflection}</p>
              </section>

              <section>
                <p className="text-[10px] tracking-[0.22em] uppercase text-white/55 mb-3">{t("Prayer", "Oración")}</p>
                <p className="font-playfair italic text-[15px] leading-[1.75] text-white/85 whitespace-pre-wrap">{dev.prayer}</p>
              </section>

              <section className="pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <MessageCircle className="h-4 w-4 text-white/60" />
                  <h3 className="font-playfair text-xl tracking-tight">{t("Discussion", "Discusión")}</h3>
                </div>
                <UserDevotionalCommentThread devotionalId={dev.id} />
              </section>
            </article>
          </>
        )}
      </main>
    </div>
  );
};

export default UserDevotionalDetail;

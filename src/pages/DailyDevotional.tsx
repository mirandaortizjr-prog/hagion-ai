import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import heroLiquidLight from "@/assets/hero-liquid-light.jpg";
import { CommentThread } from "@/components/devotional/CommentThread";
import { useSafeBackNavigation } from "@/hooks/useSafeBackNavigation";

type Devotional = {
  id: string;
  day_of_year: number;
  title_en: string;
  title_es: string;
  scripture_ref_en: string;
  scripture_ref_es: string;
  scripture_text_en: string;
  scripture_text_es: string;
  reflection_en: string;
  reflection_es: string;
  application_question_en: string;
  application_question_es: string;
  prayer_en: string;
  prayer_es: string;
};

function dayOfYear(d = new Date()) {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

const DailyDevotional = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (en: string, es: string) => (language === "es" ? es : en);
  const handleBack = useSafeBackNavigation("/main-menu?tab=discipleship");
  const [dev, setDev] = useState<Devotional | null>(null);
  const [loading, setLoading] = useState(true);

  const today = useMemo(() => dayOfYear(), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      // Try today; fall back to nearest available
      const { data } = await supabase
        .from("daily_devotionals")
        .select("*")
        .lte("day_of_year", today)
        .order("day_of_year", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!cancelled) {
        setDev(data as Devotional | null);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [today]);

  return (
    <div className="min-h-screen text-white">
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-black/40 border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 rounded-full hover:bg-white/10 transition"
            aria-label={t("Back", "Atrás")}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-playfair text-lg tracking-tight">
            {t("Daily Devotional", "Devocional Diario")}
          </h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="h-6 w-6 animate-spin text-white/50" />
          </div>
        ) : !dev ? (
          <div className="px-6 py-20 text-center text-white/60 font-inter text-sm">
            {t(
              "Today's devotional is being prepared. Check back shortly.",
              "El devocional de hoy se está preparando. Vuelve pronto."
            )}
          </div>
        ) : (
          <>
            {/* Hero */}
            <section className="relative animate-fade-in">
              <div className="relative overflow-hidden">
                <img
                  src={heroLiquidLight}
                  alt=""
                  className="w-full h-[34vh] min-h-[240px] max-h-[360px] object-cover object-top"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/90"
                />
                <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8">
                  <p className="text-[10px] tracking-[0.22em] uppercase text-white/60 font-inter">
                    {t("Day", "Día")} {dev.day_of_year}
                  </p>
                  <h2 className="mt-1.5 font-playfair text-2xl sm:text-3xl tracking-tight text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)]">
                    {language === "es" ? dev.title_es : dev.title_en}
                  </h2>
                </div>
              </div>
            </section>

            {/* Body */}
            <article className="px-5 sm:px-8 pt-8 space-y-8 animate-fade-in">
              {/* Scripture */}
              <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
                <p className="text-[10px] tracking-[0.22em] uppercase text-amber-200/70 font-inter">
                  {t("Scripture", "Escritura")}
                </p>
                <blockquote className="mt-3 font-playfair italic text-lg leading-relaxed text-white/95">
                  “{language === "es" ? dev.scripture_text_es : dev.scripture_text_en}”
                </blockquote>
                <p className="mt-3 text-[11px] tracking-[0.2em] uppercase text-white/55 font-inter">
                  {language === "es" ? dev.scripture_ref_es : dev.scripture_ref_en}
                </p>
              </section>

              {/* Reflection */}
              <section>
                <p className="text-[10px] tracking-[0.22em] uppercase text-white/55 font-inter mb-3">
                  {t("Reflection", "Reflexión")}
                </p>
                <p className="font-inter text-[15px] leading-[1.75] text-white/85 whitespace-pre-wrap">
                  {language === "es" ? dev.reflection_es : dev.reflection_en}
                </p>
              </section>

              {/* Application */}
              <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 p-6">
                <p className="text-[10px] tracking-[0.22em] uppercase text-violet-200/80 font-inter">
                  {t("Consider", "Considera")}
                </p>
                <p className="mt-2 font-playfair text-lg italic text-white/95 leading-snug">
                  {language === "es" ? dev.application_question_es : dev.application_question_en}
                </p>
              </section>

              {/* Prayer */}
              <section>
                <p className="text-[10px] tracking-[0.22em] uppercase text-white/55 font-inter mb-3">
                  {t("Prayer", "Oración")}
                </p>
                <p className="font-playfair italic text-[15px] leading-[1.75] text-white/85">
                  {language === "es" ? dev.prayer_es : dev.prayer_en}
                </p>
              </section>

              {/* Discussion */}
              <section className="pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <MessageCircle className="h-4 w-4 text-white/60" />
                  <h3 className="font-playfair text-xl tracking-tight">
                    {t("Discussion", "Discusión")}
                  </h3>
                </div>
                <CommentThread devotionalId={dev.id} />
              </section>
            </article>
          </>
        )}
      </main>
    </div>
  );
};

export default DailyDevotional;

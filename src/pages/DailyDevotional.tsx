import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, Loader2, PenSquare, Library as LibraryIcon, FileText, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePremium } from "@/contexts/PremiumContext";
import heroLiquidLight from "@/assets/hero-liquid-light.jpg";
import { CommentThread } from "@/components/devotional/CommentThread";
import { UserDevotionalCommentThread } from "@/components/devotional/UserDevotionalCommentThread";
import { DevotionalSubmitDialog } from "@/components/devotional/DevotionalSubmitDialog";
import { useSafeBackNavigation } from "@/hooks/useSafeBackNavigation";
import { toast } from "sonner";

type SeedDevotional = {
  id: string;
  day_of_year: number;
  title_en: string; title_es: string;
  scripture_ref_en: string; scripture_ref_es: string;
  scripture_text_en: string; scripture_text_es: string;
  reflection_en: string; reflection_es: string;
  application_question_en: string; application_question_es: string;
  prayer_en: string; prayer_es: string;
};

type UserDevotional = {
  id: string;
  title: string;
  scripture_ref: string;
  scripture_text: string | null;
  reflection: string;
  prayer: string;
  author_id: string;
  author_name?: string;
};

function dayOfYear(d = new Date()) {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86400000);
}

const DailyDevotional = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { isPremium, isPremiumPlus, isPro } = usePremium();
  const canSubmit = isPremium || isPremiumPlus || isPro;
  const t = (en: string, es: string) => (language === "es" ? es : en);
  const handleBack = useSafeBackNavigation("/main-menu?tab=discipleship");

  const [userDev, setUserDev] = useState<UserDevotional | null>(null);
  const [seedDev, setSeedDev] = useState<SeedDevotional | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitOpen, setSubmitOpen] = useState(false);

  const today = useMemo(() => dayOfYear(), []);
  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const load = async () => {
    setLoading(true);

    // 1. Try today's picked user devotional
    const { data: pick } = await supabase
      .from("devotional_daily_pick")
      .select("devotional_id")
      .eq("pick_date", todayISO)
      .maybeSingle();

    let picked: UserDevotional | null = null;
    if (pick?.devotional_id) {
      const { data } = await supabase
        .from("user_devotionals")
        .select("id, title, scripture_ref, scripture_text, reflection, prayer, author_id")
        .eq("id", pick.devotional_id)
        .eq("status", "approved")
        .maybeSingle();
      picked = data as UserDevotional | null;
    }

    // 2. If no pick yet today, ask the edge function to pick one (fair rotation)
    if (!picked) {
      try {
        const { data: newPick } = await supabase.functions.invoke("pick-daily-devotional", { body: {} });
        if (newPick?.devotional_id) {
          const { data } = await supabase
            .from("user_devotionals")
            .select("id, title, scripture_ref, scripture_text, reflection, prayer, author_id")
            .eq("id", newPick.devotional_id)
            .eq("status", "approved")
            .maybeSingle();
          picked = data as UserDevotional | null;
        }
      } catch {}
    }

    if (picked) {
      const { data: p } = await supabase.from("profiles").select("name, username").eq("user_id", picked.author_id).maybeSingle();
      picked.author_name = (p as any)?.name || (p as any)?.username || "Friend";
      setUserDev(picked);
      setSeedDev(null);
      // best-effort read count
      supabase.rpc as any;
      supabase.from("user_devotionals").update({ read_count: undefined as any }).eq("id", picked.id); // no-op safe
    } else {
      // 3. Fall back to Hagion's seeded devotional
      const { data } = await supabase
        .from("daily_devotionals")
        .select("*")
        .lte("day_of_year", today)
        .order("day_of_year", { ascending: false })
        .limit(1)
        .maybeSingle();
      setSeedDev(data as SeedDevotional | null);
      setUserDev(null);
    }
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [todayISO]);

  const handleWriteClick = () => {
    if (!canSubmit) {
      toast.error(t("Writing devotionals is a Premium feature.", "Escribir devocionales es una función Premium."));
      navigate("/premium");
      return;
    }
    setSubmitOpen(true);
  };

  return (
    <div className="min-h-screen text-white">
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-black/40 border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-2">
          <button onClick={handleBack} className="p-2 rounded-full hover:bg-white/10" aria-label={t("Back", "Atrás")}>
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-playfair text-lg tracking-tight flex-1">
            {t("Daily Devotional", "Devocional Diario")}
          </h1>
          <button
            onClick={() => navigate("/my-devotionals")}
            className="p-2 rounded-full hover:bg-white/10"
            aria-label={t("My devotionals", "Mis devocionales")}
          >
            <FileText className="h-5 w-5" />
          </button>
          <button
            onClick={() => navigate("/devotional-library")}
            className="p-2 rounded-full hover:bg-white/10"
            aria-label={t("Library", "Biblioteca")}
          >
            <LibraryIcon className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-32"><Loader2 className="h-6 w-6 animate-spin text-white/50" /></div>
        ) : userDev ? (
          <>
            <section className="relative animate-fade-in">
              <div className="relative overflow-hidden">
                <img src={heroLiquidLight} alt="" className="w-full h-[34vh] min-h-[240px] max-h-[360px] object-cover object-top" />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/90" />
                <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8">
                  <p className="text-[10px] tracking-[0.22em] uppercase text-white/60">
                    {t("From the Community", "De la Comunidad")}
                  </p>
                  <h2 className="mt-1.5 font-playfair text-2xl sm:text-3xl tracking-tight text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)]">
                    {userDev.title}
                  </h2>
                  <p className="mt-2 text-[11px] text-white/60">{t("By", "Por")} {userDev.author_name}</p>
                </div>
              </div>
            </section>

            <article className="px-5 sm:px-8 pt-8 space-y-8 animate-fade-in">
              <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
                <p className="text-[10px] tracking-[0.22em] uppercase text-amber-200/70">{t("Scripture", "Escritura")}</p>
                {userDev.scripture_text && (
                  <blockquote className="mt-3 font-playfair italic text-lg leading-relaxed text-white/95">
                    "{userDev.scripture_text}"
                  </blockquote>
                )}
                <p className="mt-3 text-[11px] tracking-[0.2em] uppercase text-white/55">{userDev.scripture_ref}</p>
              </section>

              <section>
                <p className="text-[10px] tracking-[0.22em] uppercase text-white/55 mb-3">{t("Reflection", "Reflexión")}</p>
                <p className="font-inter text-[15px] leading-[1.75] text-white/85 whitespace-pre-wrap">{userDev.reflection}</p>
              </section>

              <section>
                <p className="text-[10px] tracking-[0.22em] uppercase text-white/55 mb-3">{t("Prayer", "Oración")}</p>
                <p className="font-playfair italic text-[15px] leading-[1.75] text-white/85 whitespace-pre-wrap">{userDev.prayer}</p>
              </section>

              <section className="pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <MessageCircle className="h-4 w-4 text-white/60" />
                  <h3 className="font-playfair text-xl tracking-tight">{t("Discussion", "Discusión")}</h3>
                  <span className="text-[11px] text-white/40 ml-1">{t("Iron sharpens iron", "Hierro con hierro se aguza")}</span>
                </div>
                <UserDevotionalCommentThread devotionalId={userDev.id} />
              </section>
            </article>
          </>
        ) : seedDev ? (
          <>
            <section className="relative animate-fade-in">
              <div className="relative overflow-hidden">
                <img src={heroLiquidLight} alt="" className="w-full h-[34vh] min-h-[240px] max-h-[360px] object-cover object-top" />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/90" />
                <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8">
                  <p className="text-[10px] tracking-[0.22em] uppercase text-white/60">{t("Day", "Día")} {seedDev.day_of_year}</p>
                  <h2 className="mt-1.5 font-playfair text-2xl sm:text-3xl tracking-tight text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)]">
                    {language === "es" ? seedDev.title_es : seedDev.title_en}
                  </h2>
                </div>
              </div>
            </section>

            <article className="px-5 sm:px-8 pt-8 space-y-8 animate-fade-in">
              <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
                <p className="text-[10px] tracking-[0.22em] uppercase text-amber-200/70">{t("Scripture", "Escritura")}</p>
                <blockquote className="mt-3 font-playfair italic text-lg leading-relaxed text-white/95">
                  "{language === "es" ? seedDev.scripture_text_es : seedDev.scripture_text_en}"
                </blockquote>
                <p className="mt-3 text-[11px] tracking-[0.2em] uppercase text-white/55">
                  {language === "es" ? seedDev.scripture_ref_es : seedDev.scripture_ref_en}
                </p>
              </section>

              <section>
                <p className="text-[10px] tracking-[0.22em] uppercase text-white/55 mb-3">{t("Reflection", "Reflexión")}</p>
                <p className="font-inter text-[15px] leading-[1.75] text-white/85 whitespace-pre-wrap">
                  {language === "es" ? seedDev.reflection_es : seedDev.reflection_en}
                </p>
              </section>

              <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 p-6">
                <p className="text-[10px] tracking-[0.22em] uppercase text-violet-200/80">{t("Consider", "Considera")}</p>
                <p className="mt-2 font-playfair text-lg italic text-white/95 leading-snug">
                  {language === "es" ? seedDev.application_question_es : seedDev.application_question_en}
                </p>
              </section>

              <section>
                <p className="text-[10px] tracking-[0.22em] uppercase text-white/55 mb-3">{t("Prayer", "Oración")}</p>
                <p className="font-playfair italic text-[15px] leading-[1.75] text-white/85">
                  {language === "es" ? seedDev.prayer_es : seedDev.prayer_en}
                </p>
              </section>

              <section className="pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <MessageCircle className="h-4 w-4 text-white/60" />
                  <h3 className="font-playfair text-xl tracking-tight">{t("Discussion", "Discusión")}</h3>
                </div>
                <CommentThread devotionalId={seedDev.id} />
              </section>
            </article>
          </>
        ) : (
          <div className="px-6 py-20 text-center text-white/60 font-inter text-sm">
            {t("Today's devotional is being prepared.", "El devocional de hoy se está preparando.")}
          </div>
        )}

        {/* Floating Write CTA */}
        <button
          onClick={handleWriteClick}
          className="fixed bottom-24 right-5 z-30 flex items-center gap-2 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 px-4 py-3 text-sm font-inter text-white shadow-lg shadow-black/40 hover:scale-105 active:scale-95 transition-transform"
        >
          {canSubmit ? <PenSquare className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
          {t("Write", "Escribir")}
        </button>
      </main>

      <DevotionalSubmitDialog open={submitOpen} onOpenChange={setSubmitOpen} onSubmitted={load} />
    </div>
  );
};

export default DailyDevotional;

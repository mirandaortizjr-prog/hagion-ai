import { useNavigate } from "react-router-dom";
import { GraduationCap, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PremiumNav } from "@/components/PremiumNav";
import { cn } from "@/lib/utils";

const Learning = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (en: string, es: string) => (language === "es" ? es : en);

  return (
    <div className="min-h-screen home-gradient text-white">
      <PremiumNav />
      <main className="px-5 sm:px-8 pb-24 max-w-3xl mx-auto">
        <header className="pt-6 pb-8 animate-fade-in">
          <p className="text-[11px] tracking-[0.22em] uppercase text-white/50">
            {t("Section", "Sección")}
          </p>
          <h1 className="mt-2 font-playfair text-4xl sm:text-5xl tracking-tight">
            {t("Learning", "Aprendizaje")}
          </h1>
          <p className="mt-3 text-white/65 max-w-md text-[15px] italic font-playfair">
            {t(
              "“You are the light of the world.” — Matthew 5:14",
              "“Vosotros sois la luz del mundo.” — Mateo 5:14"
            )}
          </p>
        </header>

        <section>
          <button
            onClick={() => navigate("/main-menu?tab=hagion-university")}
            className={cn(
              "group relative w-full text-left overflow-hidden",
              "rounded-3xl p-6 sm:p-7",
              "bg-white/[0.04] backdrop-blur-2xl border border-white/10",
              "shadow-[0_15px_50px_-20px_rgba(0,0,0,0.7)] ring-1 ring-sky-300/30",
              "transition-all duration-500 ease-out hover:-translate-y-1 hover:bg-white/[0.07] active:scale-[0.99]",
              "animate-fade-in"
            )}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -top-16 -right-12 w-56 h-56 rounded-full blur-3xl opacity-70 bg-gradient-to-br from-sky-300/40 via-cyan-400/25 to-blue-700/40"
            />
            <div className="relative flex items-center gap-5">
              <div className="shrink-0 w-14 h-14 rounded-2xl bg-white/10 ring-1 ring-white/25 flex items-center justify-center backdrop-blur-md shadow-inner">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-playfair text-2xl tracking-tight">
                  {t("Hagion University Lite", "Universidad Hagion Lite")}
                </h2>
                <p className="mt-1 text-[13.5px] text-white/65 leading-snug">
                  {t(
                    "Daily wisdom, biblical storytelling, curriculum tracks, sermon lab.",
                    "Sabiduría diaria, narrativa bíblica, rutas curriculares, laboratorio de sermones."
                  )}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-white/50 transition-transform group-hover:translate-x-1" />
            </div>
          </button>
        </section>
      </main>
    </div>
  );
};

export default Learning;

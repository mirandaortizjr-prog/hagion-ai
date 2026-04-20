import { useNavigate } from "react-router-dom";
import { GraduationCap, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PremiumNav } from "@/components/PremiumNav";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

const Learning = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (en: string, es: string) => (language === "es" ? es : en);

  // Send the user straight to the original Hagion University Lite experience.
  useEffect(() => {
    navigate("/main-menu?tab=hagion-university", { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen text-white">
      <PremiumNav />
      <main className="px-5 sm:px-8 pb-24 max-w-3xl mx-auto">
        <header className="pt-6 pb-8 animate-fade-in">
          <p className="text-[11px] tracking-[0.22em] uppercase text-white/50">
            {t("Section", "Sección")}
          </p>
          <h1 className="mt-2 font-playfair text-4xl sm:text-5xl tracking-tight">
            {t("Learning", "Aprendizaje")}
          </h1>
        </header>

        <button
          onClick={() => navigate("/main-menu?tab=hagion-university")}
          className={cn(
            "group relative w-full text-left overflow-hidden rounded-3xl p-6",
            "bg-white/[0.04] backdrop-blur-2xl border border-white/10",
            "ring-1 ring-sky-300/30 animate-fade-in"
          )}
        >
          <div className="relative flex items-center gap-5">
            <div className="shrink-0 w-14 h-14 rounded-2xl bg-white/10 ring-1 ring-white/25 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-playfair text-2xl tracking-tight">
                {t("Hagion University Lite", "Universidad Hagion Lite")}
              </h2>
              <p className="mt-1 text-[13.5px] text-white/65 leading-snug">
                {t("Opening…", "Abriendo…")}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/50" />
          </div>
        </button>
      </main>
    </div>
  );
};

export default Learning;

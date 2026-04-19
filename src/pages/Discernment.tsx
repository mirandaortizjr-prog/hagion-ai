import { useNavigate } from "react-router-dom";
import { Microscope, Sparkles, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PremiumNav } from "@/components/PremiumNav";
import { cn } from "@/lib/utils";

const Discernment = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (en: string, es: string) => (language === "es" ? es : en);

  const boxes = [
    {
      title: t("Analyst of Faith", "Analista de la Fe"),
      desc: t(
        "Reason, evidence and apologetics from specialized voices.",
        "Razonamiento, evidencia y apologética desde voces especializadas."
      ),
      icon: Microscope,
      // Analyst of Faith = the assistants/discernment hub from existing MainMenu
      onClick: () => navigate("/main-menu?tab=assistants"),
      gradient: "from-amber-400/40 via-orange-500/25 to-rose-700/40",
      ring: "ring-amber-300/30",
    },
    {
      title: t("Divine Guidance", "Guía Divina"),
      desc: t(
        "Speak with the Father, the Son, the Spirit, and the Trinity.",
        "Habla con el Padre, el Hijo, el Espíritu y la Trinidad."
      ),
      icon: Sparkles,
      onClick: () => navigate("/main-menu?tab=divine"),
      gradient: "from-sky-300/40 via-cyan-400/25 to-blue-700/40",
      ring: "ring-sky-300/30",
    },
  ];

  return (
    <div className="min-h-screen home-gradient text-white">
      <PremiumNav />
      <main className="px-5 sm:px-8 pb-24 max-w-3xl mx-auto">
        <header className="pt-6 pb-8 animate-fade-in">
          <p className="text-[11px] tracking-[0.22em] uppercase text-white/50">
            {t("Section", "Sección")}
          </p>
          <h1 className="mt-2 font-playfair text-4xl sm:text-5xl tracking-tight">
            {t("Discernment", "Discernimiento")}
          </h1>
          <p className="mt-3 text-white/65 max-w-md text-[15px] italic font-playfair">
            {t(
              "“Test the spirits to see whether they are from God.” — 1 John 4:1",
              "“Probad los espíritus si son de Dios.” — 1 Juan 4:1"
            )}
          </p>
        </header>

        <section className="space-y-5">
          {boxes.map((b, i) => {
            const Icon = b.icon;
            return (
              <button
                key={b.title}
                onClick={b.onClick}
                className={cn(
                  "group relative w-full text-left overflow-hidden",
                  "rounded-3xl p-6 sm:p-7",
                  "bg-white/[0.04] backdrop-blur-2xl border border-white/10",
                  "shadow-[0_15px_50px_-20px_rgba(0,0,0,0.7)] ring-1",
                  b.ring,
                  "transition-all duration-500 ease-out hover:-translate-y-1 hover:bg-white/[0.07] active:scale-[0.99]",
                  "animate-fade-in"
                )}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute -top-16 -right-12 w-56 h-56 rounded-full blur-3xl opacity-70 bg-gradient-to-br",
                    b.gradient
                  )}
                />
                <div className="relative flex items-center gap-5">
                  <div className="shrink-0 w-14 h-14 rounded-2xl bg-white/10 ring-1 ring-white/25 flex items-center justify-center backdrop-blur-md shadow-inner">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-playfair text-2xl tracking-tight">{b.title}</h2>
                    <p className="mt-1 text-[13.5px] text-white/65 leading-snug">{b.desc}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/50 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}
        </section>
      </main>
    </div>
  );
};

export default Discernment;

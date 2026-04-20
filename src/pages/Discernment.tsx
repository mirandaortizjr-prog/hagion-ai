import { useNavigate } from "react-router-dom";
import {
  Microscope,
  ShieldCheck,
  Mic,
  Music,
  Film,
  Church,
  ScrollText,
  ChevronRight,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PremiumNav } from "@/components/PremiumNav";
import { cn } from "@/lib/utils";

const Discernment = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (en: string, es: string) => (language === "es" ? es : en);

  const tools = [
    {
      title: t("Analysts of Faith", "Analistas de la Fe"),
      desc: t("Specialized voices.", "Voces especializadas."),
      icon: Microscope,
      onClick: () => navigate("/main-menu?tab=assistants"),
      ring: "ring-amber-300/25",
      glow: "from-amber-400/30 via-orange-500/15 to-rose-700/25",
    },
    {
      title: t("Test the Spirits", "Probad los Espíritus"),
      desc: t("Discern truth from error.", "Distingue verdad y error."),
      icon: ShieldCheck,
      onClick: () => navigate("/discern"),
      ring: "ring-sky-300/25",
      glow: "from-sky-300/30 via-cyan-400/15 to-blue-700/25",
    },
    {
      title: t("Sermon Analyzer", "Analizador de Sermones"),
      desc: t("Weigh teaching by Scripture.", "Mide la enseñanza por la Escritura."),
      icon: Mic,
      onClick: () => navigate("/chat?voice=sermon&context=discernment"),
      ring: "ring-emerald-300/25",
      glow: "from-emerald-300/30 via-teal-400/15 to-cyan-700/25",
    },
    {
      title: t("Music Analyzer", "Analizador Musical"),
      desc: t("Lyrics tested in light.", "Letras a la luz de la Palabra."),
      icon: Music,
      onClick: () => navigate("/chat?voice=music&context=discernment"),
      ring: "ring-violet-300/25",
      glow: "from-violet-300/30 via-fuchsia-400/15 to-purple-700/25",
    },
    {
      title: t("Video Analyzer", "Analizador de Video"),
      desc: t("Examine media with wisdom.", "Examina medios con sabiduría."),
      icon: Film,
      onClick: () => navigate("/chat?voice=video&context=discernment"),
      ring: "ring-rose-300/25",
      glow: "from-rose-300/30 via-pink-400/15 to-red-700/25",
    },
    {
      title: t("Church Checker", "Verificador de Iglesias"),
      desc: t("Doctrine and fruit.", "Doctrina y fruto."),
      icon: Church,
      onClick: () => navigate("/discern"),
      ring: "ring-indigo-300/25",
      glow: "from-indigo-300/30 via-blue-400/15 to-violet-700/25",
    },
    {
      title: t("Prophecy Checker", "Verificador de Profecía"),
      desc: t("True or false foretelling.", "Profecía verdadera o falsa."),
      icon: ScrollText,
      onClick: () => navigate("/chat?voice=prophecy&context=discernment"),
      ring: "ring-yellow-300/25",
      glow: "from-yellow-300/30 via-amber-400/15 to-orange-700/25",
    },
  ];

  return (
    <div className="min-h-screen text-white">
      <PremiumNav />
      <main className="px-5 sm:px-8 pb-24 max-w-3xl mx-auto">
        <header className="pt-6 pb-6 animate-fade-in">
          <p className="text-[11px] tracking-[0.22em] uppercase text-white/50">
            {t("Section", "Sección")}
          </p>
          <h1 className="mt-2 font-playfair text-4xl sm:text-5xl tracking-tight">
            {t("Discernment", "Discernimiento")}
          </h1>
          <p className="mt-3 text-white/60 max-w-md text-[13.5px] italic font-playfair">
            {t(
              "“Test the spirits to see whether they are from God.” — 1 John 4:1",
              "“Probad los espíritus si son de Dios.” — 1 Juan 4:1"
            )}
          </p>
        </header>

        <section className="grid grid-cols-2 gap-3.5 sm:gap-4">
          {tools.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.title}
                onClick={tool.onClick}
                className={cn(
                  "group relative w-full text-left overflow-hidden",
                  "rounded-2xl p-4",
                  "bg-white/[0.04] backdrop-blur-2xl border border-white/10",
                  "shadow-[0_10px_30px_-15px_rgba(0,0,0,0.7)] ring-1",
                  tool.ring,
                  "transition-all duration-500 ease-out hover:-translate-y-0.5 hover:bg-white/[0.07] active:scale-[0.98]",
                  "animate-fade-in"
                )}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-60 bg-gradient-to-br",
                    tool.glow
                  )}
                />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-white/10 ring-1 ring-white/20 flex items-center justify-center backdrop-blur-md shadow-inner">
                      <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/35 transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <h2 className="mt-3 font-playfair text-[15px] leading-snug tracking-tight">
                    {tool.title}
                  </h2>
                  <p className="mt-0.5 text-[11.5px] text-white/55 leading-snug">
                    {tool.desc}
                  </p>
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

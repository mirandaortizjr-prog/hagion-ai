import { useNavigate } from "react-router-dom";
import {
  Sun,
  BookOpen,
  Flame,
  Brain,
  Shield,
  Mic,
  ChevronRight,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PremiumNav } from "@/components/PremiumNav";
import { cn } from "@/lib/utils";

const Learning = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (en: string, es: string) => (language === "es" ? es : en);

  const tiles = [
    {
      title: t("Daily Wisdom", "Sabiduría Diaria"),
      desc: t("A word for today.", "Una palabra para hoy."),
      icon: Sun,
      onClick: () => navigate("/daily-wisdom"),
      ring: "ring-amber-300/25",
      glow: "from-amber-300/30 via-yellow-400/15 to-orange-700/25",
    },
    {
      title: t("Biblical Stories", "Historias Bíblicas"),
      desc: t("Sacred narratives.", "Narrativas sagradas."),
      icon: BookOpen,
      onClick: () => navigate("/chat?voice=biblical-stories&context=storytelling"),
      ring: "ring-sky-300/25",
      glow: "from-sky-300/30 via-cyan-400/15 to-blue-700/25",
    },
    {
      title: t("Martyrs", "Mártires"),
      desc: t("Witnesses unto blood.", "Testigos hasta la sangre."),
      icon: Flame,
      onClick: () => navigate("/chat?voice=martyrs&context=storytelling"),
      ring: "ring-rose-300/25",
      glow: "from-rose-300/30 via-red-400/15 to-rose-700/25",
    },
    {
      title: t("Logic & Reasoning", "Lógica y Razón"),
      desc: t("Think with clarity.", "Piensa con claridad."),
      icon: Brain,
      onClick: () => navigate("/logos-circle/track/foundations"),
      ring: "ring-indigo-300/25",
      glow: "from-indigo-300/30 via-violet-400/15 to-blue-700/25",
    },
    {
      title: t("Apologetics", "Apologética"),
      desc: t("Defend the faith.", "Defiende la fe."),
      icon: Shield,
      onClick: () => navigate("/logos-circle/track/apologetics"),
      ring: "ring-emerald-300/25",
      glow: "from-emerald-300/30 via-teal-400/15 to-green-700/25",
    },
    {
      title: t("Sermon Lab", "Laboratorio de Sermones"),
      desc: t("Craft and refine.", "Crea y refina."),
      icon: Mic,
      onClick: () => navigate("/public-speaking"),
      ring: "ring-violet-300/25",
      glow: "from-violet-300/30 via-fuchsia-400/15 to-purple-700/25",
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
            {t("Learning", "Aprendizaje")}
          </h1>
          <p className="mt-3 text-white/60 max-w-md text-[13.5px] italic font-playfair">
            {t(
              "“You are the light of the world.” — Matthew 5:14",
              "“Vosotros sois la luz del mundo.” — Mateo 5:14"
            )}
          </p>
        </header>

        <section className="grid grid-cols-2 gap-3.5 sm:gap-4">
          {tiles.map((tile, i) => {
            const Icon = tile.icon;
            return (
              <button
                key={tile.title}
                onClick={tile.onClick}
                className={cn(
                  "group relative w-full text-left overflow-hidden",
                  "rounded-2xl p-4",
                  "bg-white/[0.04] backdrop-blur-2xl border border-white/10",
                  "shadow-[0_10px_30px_-15px_rgba(0,0,0,0.7)] ring-1",
                  tile.ring,
                  "transition-all duration-500 ease-out hover:-translate-y-0.5 hover:bg-white/[0.07] active:scale-[0.98]",
                  "animate-fade-in"
                )}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-60 bg-gradient-to-br",
                    tile.glow
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
                    {tile.title}
                  </h2>
                  <p className="mt-0.5 text-[11.5px] text-white/55 leading-snug">
                    {tile.desc}
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

export default Learning;

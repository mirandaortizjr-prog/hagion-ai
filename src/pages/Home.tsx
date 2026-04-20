import { useNavigate } from "react-router-dom";
import { ArrowRight, Sun, HandHeart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PremiumNav } from "@/components/PremiumNav";
import { cn } from "@/lib/utils";
import heroLiquidLight from "@/assets/hero-liquid-light.jpg";
import { getVerseOfTheDay } from "@/data/versesOfTheDay";

const Home = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (en: string, es: string) => (language === "es" ? es : en);

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? t("Good morning", "Buenos días")
      : hour < 18
      ? t("Good afternoon", "Buenas tardes")
      : t("Good evening", "Buenas noches");

  const verse = getVerseOfTheDay();
  const v = language === "es" ? verse.es : verse.en;

  const tiles = [
    {
      title: t("Daily Devotional", "Devocional Diario"),
      desc: t("A quiet word for today.", "Una palabra para hoy."),
      icon: Sun,
      onClick: () => navigate("/daily-wisdom"),
      accent: "from-amber-300/35 via-orange-400/20 to-rose-600/30",
      ring: "ring-amber-300/30",
    },
    {
      title: t("Prayer Wall", "Muro de Oración"),
      desc: t("Lift one another up.", "Levantémonos unos a otros."),
      icon: HandHeart,
      onClick: () => navigate("/prayer-wall"),
      accent: "from-violet-300/35 via-fuchsia-400/20 to-purple-700/30",
      ring: "ring-violet-300/30",
    },
  ];

  return (
    <div className="min-h-screen text-white">
      <PremiumNav />

      <main className="pb-24 max-w-3xl mx-auto">
        {/* Hero backsplash — full bleed, runs under status bar */}
        <section
          className="relative animate-fade-in"
          style={{ marginTop: "calc(-1 * env(safe-area-inset-top))" }}
        >
          <div className="relative overflow-hidden">
            <img
              src={heroLiquidLight}
              alt=""
              width={928}
              height={1152}
              fetchPriority="high"
              decoding="async"
              className="w-full h-[40vh] min-h-[260px] max-h-[400px] object-cover"
              style={{ paddingTop: "env(safe-area-inset-top)" }}
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/5 to-black/85"
            />

            <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8">
              <p className="text-[10px] tracking-[0.22em] uppercase text-white/65 font-inter">
                {greeting}
              </p>
              <h1 className="mt-1.5 font-playfair italic text-[15px] sm:text-lg leading-snug tracking-tight text-white/95 drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)] max-w-[34ch]">
                “{v.text}”
              </h1>
              <p className="mt-2 text-[9.5px] tracking-[0.22em] uppercase text-white/60 font-inter">
                {v.ref}
              </p>
            </div>
          </div>
        </section>

        <div className="px-5 sm:px-8 pt-6">
          {/* Tiles */}
          <section className="space-y-4">
            {tiles.map((tile, i) => {
              const Icon = tile.icon;
              return (
                <button
                  key={tile.title}
                  onClick={tile.onClick}
                  className={cn(
                    "group relative w-full overflow-hidden text-left p-6 rounded-3xl",
                    "bg-white/[0.04] backdrop-blur-2xl border border-white/10",
                    "shadow-[0_15px_50px_-20px_rgba(0,0,0,0.7)] ring-1",
                    tile.ring,
                    "transition-all duration-500 ease-out hover:-translate-y-1 hover:bg-white/[0.07] active:scale-[0.99]",
                    "animate-fade-in"
                  )}
                  style={{ animationDelay: `${i * 90}ms` }}
                >
                  <div
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute -top-16 -right-12 w-56 h-56 rounded-full blur-3xl opacity-70 transition-opacity duration-500 group-hover:opacity-100 bg-gradient-to-br",
                      tile.accent
                    )}
                  />
                  <div className="relative flex items-center gap-5">
                    <div className="shrink-0 w-14 h-14 rounded-2xl bg-white/10 ring-1 ring-white/25 flex items-center justify-center backdrop-blur-md shadow-inner">
                      <Icon className="w-6 h-6" strokeWidth={1.9} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-playfair text-2xl tracking-tight">{tile.title}</h2>
                      <p className="mt-1 text-[13.5px] text-white/65 leading-snug">{tile.desc}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/45 transition-transform group-hover:translate-x-1" />
                  </div>
                </button>
              );
            })}
          </section>

          <p className="mt-10 text-center text-[12px] text-white/40 italic font-playfair">
            {t(
              "“Your word is a lamp to my feet.” — Psalm 119:105",
              "“Lámpara es a mis pies tu palabra.” — Salmo 119:105"
            )}
          </p>
        </div>
      </main>
    </div>
  );
};

export default Home;

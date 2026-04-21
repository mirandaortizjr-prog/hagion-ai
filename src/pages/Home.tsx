import { useNavigate } from "react-router-dom";
import { ArrowRight, Sun, HandHeart, BookOpen } from "lucide-react";
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
      onClick: () => navigate("/daily-devotional"),
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
    {
      title: t("Bible", "Biblia"),
      desc: t("Read Scripture in multiple translations.", "Lee la Escritura en varias traducciones."),
      icon: BookOpen,
      onClick: () => navigate("/bible-translations"),
      accent: "from-sky-300/35 via-blue-400/20 to-indigo-700/30",
      ring: "ring-sky-300/30",
    },
  ];

  return (
    <div className="min-h-screen text-white">
      <main className="max-w-3xl mx-auto">
        <section className="relative animate-fade-in">
          <div className="relative overflow-hidden">
            <img
              src={heroLiquidLight}
              alt=""
              width={928}
              height={1152}
              decoding="async"
              className="w-full h-[40vh] min-h-[260px] max-h-[400px] object-cover object-top scale-[1.08]"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/5 to-black/85"
            />

            <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8">
              <p className="text-[10px] tracking-[0.22em] uppercase text-white/65 font-inter">
                {greeting}
              </p>
              <h1 className="mt-1.5 max-w-[34ch] font-playfair text-[15px] italic leading-snug tracking-tight text-white/95 drop-shadow-[0_2px_20px_rgba(0,0,0,0.5)] sm:text-lg">
                “{v.text}”
              </h1>
              <p className="mt-2 text-[9.5px] tracking-[0.22em] uppercase text-white/60 font-inter">
                {v.ref}
              </p>
            </div>
          </div>
        </section>

        <div className="px-5 pt-6 sm:px-8">
          <section className="space-y-3">
            {tiles.map((tile, i) => {
              const Icon = tile.icon;
              return (
                <button
                  key={tile.title}
                  onClick={tile.onClick}
                  className={cn(
                    "group relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-left ring-1 shadow-[0_10px_35px_-18px_rgba(0,0,0,0.7)] backdrop-blur-2xl",
                    tile.ring,
                    "animate-fade-in transition-all duration-500 ease-out hover:-translate-y-0.5 hover:bg-white/[0.07] active:scale-[0.99]"
                  )}
                  style={{ animationDelay: `${i * 90}ms` }}
                >
                  <div
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-gradient-to-br opacity-60 blur-3xl transition-opacity duration-500 group-hover:opacity-90",
                      tile.accent
                    )}
                  />
                  <div className="relative flex items-center gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 shadow-inner ring-1 ring-white/25 backdrop-blur-md">
                      <Icon className="h-5 w-5" strokeWidth={1.9} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="font-playfair text-lg tracking-tight leading-tight">{tile.title}</h2>
                      <p className="mt-0.5 text-[12px] leading-snug text-white/60">{tile.desc}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-white/45 transition-transform group-hover:translate-x-1" />
                  </div>
                </button>
              );
            })}
          </section>

          <p className="mt-10 text-center font-playfair text-[12px] italic text-white/40">
            {t(
              "“Your word is a lamp to my feet.” — Psalm 119:105",
              "“Lámpara es a mis pies tu palabra.” — Salmo 119:105"
            )}
          </p>
        </div>
      </main>

      <PremiumNav />
    </div>
  );
};

export default Home;

import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Sun, HandHeart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PremiumNav } from "@/components/PremiumNav";
import { cn } from "@/lib/utils";

const Home = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (en: string, es: string) => (language === "es" ? es : en);

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

      <main className="px-5 sm:px-8 pb-24 max-w-3xl mx-auto">
        {/* Hero */}
        <section className="pt-6 pb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/15 backdrop-blur-md text-[11px] tracking-[0.18em] uppercase text-white/70">
            <Sparkles className="w-3 h-3" />
            {t("Welcome to Hagion", "Bienvenido a Hagion")}
          </div>
          <h1 className="mt-4 font-playfair text-4xl sm:text-5xl leading-[1.05] tracking-tight">
            {t("Truth, illumined.", "La verdad, iluminada.")}
          </h1>
          <p className="mt-3 text-white/65 max-w-md leading-relaxed text-[15px]">
            {t(
              "Begin your day in stillness, prayer, and the Word.",
              "Comienza tu día en quietud, oración y la Palabra."
            )}
          </p>

          <button
            onClick={() => navigate("/chat?voice=friend")}
            className={cn(
              "group mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-full",
              "bg-gradient-to-r from-white/95 to-white/80 text-black font-semibold tracking-wide",
              "shadow-[0_10px_40px_-10px_rgba(255,255,255,0.45)]",
              "transition-all duration-300 hover:scale-[1.02] active:scale-95"
            )}
          >
            {t("Begin a conversation", "Comenzar una conversación")}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </section>

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
      </main>
    </div>
  );
};

export default Home;

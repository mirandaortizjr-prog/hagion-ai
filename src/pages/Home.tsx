import { useNavigate } from "react-router-dom";
import { Flame, BookOpen, Globe, User, Sparkles, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PremiumNav } from "@/components/PremiumNav";
import { cn } from "@/lib/utils";

const Home = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const t = (en: string, es: string) => (language === "es" ? es : en);

  const tiles = [
    {
      title: t("Discernment", "Discernimiento"),
      desc: t("Test the spirits with truth.", "Prueba los espíritus con la verdad."),
      icon: Flame,
      path: "/discernment",
      accent: "from-amber-400/30 via-orange-500/20 to-rose-600/30",
      ring: "ring-amber-300/30",
    },
    {
      title: t("Learning", "Aprendizaje"),
      desc: t("Hagion University Lite.", "Universidad Hagion Lite."),
      icon: BookOpen,
      path: "/learning",
      accent: "from-sky-300/30 via-cyan-400/20 to-blue-600/30",
      ring: "ring-sky-300/30",
    },
    {
      title: t("Community", "Comunidad"),
      desc: t("Prayer & testimony wall.", "Muro de oración y testimonios."),
      icon: Globe,
      path: "/community",
      accent: "from-emerald-300/30 via-teal-400/20 to-cyan-600/30",
      ring: "ring-emerald-300/30",
    },
    {
      title: t("Profile", "Perfil"),
      desc: t("Your sanctuary settings.", "Tu santuario y ajustes."),
      icon: User,
      path: "/profile",
      accent: "from-violet-300/30 via-fuchsia-400/20 to-purple-600/30",
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
              "A sanctuary for reasoned faith — divine counsel, discernment, and learning, in one place.",
              "Un santuario para la fe razonada — consejo divino, discernimiento y aprendizaje, en un solo lugar."
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
        <section className="grid grid-cols-2 gap-4 sm:gap-5">
          {tiles.map((tile, i) => {
            const Icon = tile.icon;
            return (
              <button
                key={tile.path}
                onClick={() => navigate(tile.path)}
                className={cn(
                  "group relative overflow-hidden text-left p-5 rounded-3xl",
                  "bg-white/[0.04] backdrop-blur-2xl border border-white/10",
                  "shadow-[0_10px_40px_-15px_rgba(0,0,0,0.6)] ring-1",
                  tile.ring,
                  "transition-all duration-500 ease-out hover:-translate-y-1 hover:bg-white/[0.07] active:scale-[0.98]",
                  "animate-fade-in"
                )}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {/* accent glow */}
                <div
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-60 transition-opacity duration-500 group-hover:opacity-90 bg-gradient-to-br",
                    tile.accent
                  )}
                />
                <div className="relative">
                  <div className="w-11 h-11 rounded-2xl bg-white/10 ring-1 ring-white/20 flex items-center justify-center backdrop-blur-md shadow-inner">
                    <Icon className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <h3 className="mt-4 font-playfair text-xl tracking-tight">{tile.title}</h3>
                  <p className="mt-1 text-[12.5px] text-white/60 leading-snug">{tile.desc}</p>
                </div>
              </button>
            );
          })}
        </section>

        {/* Footer scripture */}
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

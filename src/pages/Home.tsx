import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, Home as HomeIcon, Globe, Brain } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PremiumNav } from "@/components/PremiumNav";
import { cn } from "@/lib/utils";

const Home = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (en: string, es: string) => (language === "es" ? es : en);

  const pillars = [
    {
      title: t("Discipleship", "Discipulado"),
      desc: t(
        "Your daily walk — wisdom, prayer, and quiet counsel.",
        "Tu caminar diario — sabiduría, oración y consejo."
      ),
      icon: HomeIcon,
      onClick: () => navigate("/daily-wisdom"),
      accent: "from-amber-300/35 via-orange-400/20 to-rose-600/30",
      ring: "ring-amber-300/30",
    },
    {
      title: t("Community", "Comunidad"),
      desc: t(
        "Believers in conversation — prayer, testimony, fellowship.",
        "Creyentes en conversación — oración, testimonio, comunión."
      ),
      icon: Globe,
      onClick: () => navigate("/community"),
      accent: "from-emerald-300/35 via-teal-400/20 to-cyan-600/30",
      ring: "ring-emerald-300/30",
    },
    {
      title: t("Hagion AI", "Hagion AI"),
      desc: t(
        "The full mind — analysts, divine guidance, and the university.",
        "La mente completa — analistas, guía divina y la universidad."
      ),
      icon: Brain,
      onClick: () => navigate("/main-menu"),
      accent: "from-sky-300/35 via-indigo-400/20 to-blue-700/30",
      ring: "ring-sky-300/30",
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
              "A sanctuary for reasoned faith — three doors, one journey.",
              "Un santuario para la fe razonada — tres puertas, un camino."
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

        {/* Three pillars */}
        <section className="space-y-4">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <button
                key={pillar.title}
                onClick={pillar.onClick}
                className={cn(
                  "group relative w-full overflow-hidden text-left p-6 rounded-3xl",
                  "bg-white/[0.04] backdrop-blur-2xl border border-white/10",
                  "shadow-[0_15px_50px_-20px_rgba(0,0,0,0.7)] ring-1",
                  pillar.ring,
                  "transition-all duration-500 ease-out hover:-translate-y-1 hover:bg-white/[0.07] active:scale-[0.99]",
                  "animate-fade-in"
                )}
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <div
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute -top-16 -right-12 w-56 h-56 rounded-full blur-3xl opacity-70 transition-opacity duration-500 group-hover:opacity-100 bg-gradient-to-br",
                    pillar.accent
                  )}
                />
                <div className="relative flex items-center gap-5">
                  <div className="shrink-0 w-14 h-14 rounded-2xl bg-white/10 ring-1 ring-white/25 flex items-center justify-center backdrop-blur-md shadow-inner">
                    <Icon className="w-6 h-6" strokeWidth={1.9} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-playfair text-2xl tracking-tight">{pillar.title}</h2>
                    <p className="mt-1 text-[13.5px] text-white/65 leading-snug">{pillar.desc}</p>
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

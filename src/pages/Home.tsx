import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sun, HandHeart, BookOpen, MessagesSquare, Flame } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { PremiumNav } from "@/components/PremiumNav";
import { cn } from "@/lib/utils";
import heroLiquidLight from "@/assets/hero-liquid-light.jpg";
import { getVerseOfTheDay } from "@/data/versesOfTheDay";
import { supabase } from "@/integrations/supabase/client";
import { getCategory } from "@/data/discussionCategories";
import { formatDistanceToNow } from "date-fns";

const Home = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (en: string, es: string) => (language === "es" ? es : en);

  const [trending, setTrending] = useState<any[]>([]);
  useEffect(() => {
    supabase
      .from("posts")
      .select("id, content, category, vote_score, comment_count, created_at, author_name, is_anonymous")
      .eq("post_type", "discussion")
      .order("hot_score", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data }) => setTrending(data || []));
  }, []);

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
            {/* Subtle black shading at bottom edge */}
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent"
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

        {/* Black horizontal bar - 1/3 height of hero, full width */}
        <div className="w-full h-[13vh] min-h-[86px] max-h-[133px] bg-black" />

        <div className="px-5 pt-6 sm:px-8">
          <section className="space-y-3">
            {tiles.map((tile, i) => {
              const Icon = tile.icon;
              return (
                <button
                  key={tile.title}
                  onClick={tile.onClick}
                  className={cn(
                    "group relative w-full overflow-hidden rounded-2xl border border-sky-400/30 bg-white/[0.04] px-4 py-3.5 text-left backdrop-blur-2xl",
                    "shadow-[0_0_0_1px_rgba(56,189,248,0.25),0_0_18px_-2px_rgba(56,189,248,0.45),0_10px_35px_-18px_rgba(0,0,0,0.7)]",
                    "animate-fade-in transition-all duration-500 ease-out hover:-translate-y-0.5 hover:bg-white/[0.07] hover:border-sky-300/60 hover:shadow-[0_0_0_1px_rgba(56,189,248,0.45),0_0_28px_-2px_rgba(56,189,248,0.7),0_14px_40px_-16px_rgba(0,0,0,0.8)] active:scale-[0.99]"
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
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-sky-300/70 to-transparent"
                  />
                  <div className="relative flex items-center gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 shadow-inner ring-1 ring-sky-300/40 backdrop-blur-md">
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

          {/* Trending Discussions preview */}
          <section className="mt-7">
            <div className="flex items-center justify-between mb-2.5 px-1">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-amber-300" />
                <h2 className="font-playfair text-[17px] tracking-tight">
                  {t("Trending Discussions", "Discusiones Populares")}
                </h2>
              </div>
              <button
                onClick={() => navigate("/community/discussions")}
                className="text-[11px] tracking-wide uppercase text-white/55 hover:text-white/90 transition-colors flex items-center gap-1"
              >
                {t("See all", "Ver todo")} <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {trending.length === 0 ? (
              <button
                onClick={() => navigate("/community/discussions")}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-5 text-left hover:border-white/20 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                    <MessagesSquare className="h-5 w-5" strokeWidth={1.9} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-playfair text-base">{t("Start a discussion", "Inicia una discusión")}</h3>
                    <p className="text-[12px] text-white/55">
                      {t("Theology, prayer, questions & more.", "Teología, oración, preguntas y más.")}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-white/45 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ) : (
              <div className="space-y-2">
                {trending.map((p) => {
                  const c = getCategory(p.category || "general");
                  const m = p.content.match(/^\*\*(.+?)\*\*/);
                  const title = m ? m[1] : p.content.split("\n")[0].slice(0, 80);
                  return (
                    <button
                      key={p.id}
                      onClick={() => navigate(`/community/post/${p.id}`)}
                      className="w-full text-left rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-3.5 hover:border-white/20 hover:bg-white/[0.06] transition-all"
                    >
                      <div className="flex items-center gap-2 mb-1 text-[10.5px] text-white/50">
                        <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-white/75">
                          {c.emoji} {language === "es" ? c.es : c.en}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5">
                          <Flame className="h-3 w-3 text-amber-300/80" /> {p.vote_score}
                        </span>
                        <span>·</span>
                        <span>💬 {p.comment_count}</span>
                      </div>
                      <h3 className="font-playfair text-[14.5px] leading-snug text-white/95 line-clamp-2">
                        {title}
                      </h3>
                    </button>
                  );
                })}
              </div>
            )}
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

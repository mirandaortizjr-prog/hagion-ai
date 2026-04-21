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
      desc: t(
        "Consult specialized AI voices — theologians, apologists, and pastors — for nuanced answers.",
        "Consulta voces de IA especializadas: teólogos, apologistas y pastores."
      ),
      icon: Microscope,
      onClick: () => navigate("/main-menu?tab=assistants"),
      glow: "from-amber-300/70 via-orange-400/40 to-rose-500/60",
      edgeColor: "251,191,36",
    },
    {
      title: t("Test the Spirits", "Probad los Espíritus"),
      desc: t(
        "Submit teachings, claims, or movements and weigh them against Scripture line by line.",
        "Somete enseñanzas y movimientos a la prueba de las Escrituras línea por línea."
      ),
      icon: ShieldCheck,
      onClick: () => navigate("/discern"),
      glow: "from-sky-300/70 via-cyan-400/40 to-blue-500/60",
      edgeColor: "56,189,248",
    },
    {
      title: t("Sermon Analyzer", "Analizador de Sermones"),
      desc: t(
        "Paste a sermon or transcript — receive a Berean review of doctrine, exegesis, and fruit.",
        "Pega un sermón y recibe una revisión berea de doctrina, exégesis y fruto."
      ),
      icon: Mic,
      onClick: () => navigate("/chat?voice=sermon&context=discernment"),
      glow: "from-emerald-300/70 via-teal-400/40 to-cyan-500/60",
      edgeColor: "52,211,153",
    },
    {
      title: t("Music Analyzer", "Analizador Musical"),
      desc: t(
        "Examine song lyrics for theology, spirit, and alignment with the Word of God.",
        "Examina letras por teología, espíritu y alineación con la Palabra."
      ),
      icon: Music,
      onClick: () => navigate("/chat?voice=music&context=discernment"),
      glow: "from-violet-300/70 via-fuchsia-400/40 to-purple-500/60",
      edgeColor: "192,132,252",
    },
    {
      title: t("Video Analyzer", "Analizador de Video"),
      desc: t(
        "Drop a link or transcript — uncover hidden messages, symbolism, and worldview.",
        "Comparte un enlace o transcripción — descubre mensajes y cosmovisión."
      ),
      icon: Film,
      onClick: () => navigate("/chat?voice=video&context=discernment"),
      glow: "from-rose-300/70 via-pink-400/40 to-red-500/60",
      edgeColor: "251,113,133",
    },
    {
      title: t("Church Checker", "Verificador de Iglesias"),
      desc: t(
        "Investigate a church's doctrine, leadership, and visible fruit before you commit.",
        "Investiga la doctrina, liderazgo y fruto visible de una iglesia."
      ),
      icon: Church,
      onClick: () => navigate("/discern"),
      glow: "from-indigo-300/70 via-blue-400/40 to-violet-500/60",
      edgeColor: "129,140,248",
    },
    {
      title: t("Prophecy Checker", "Verificador de Profecía"),
      desc: t(
        "Test modern prophecies and prophets by the unchanging standard of Scripture.",
        "Prueba profecías y profetas modernos por el estándar inmutable de la Escritura."
      ),
      icon: ScrollText,
      onClick: () => navigate("/chat?voice=prophecy&context=discernment"),
      glow: "from-yellow-300/70 via-amber-400/40 to-orange-500/60",
      edgeColor: "252,211,77",
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

        <section className="grid grid-cols-2 gap-4 sm:gap-5 [perspective:1200px]">
          {tools.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.title}
                onClick={tool.onClick}
                onMouseMove={(e) => {
                  const el = e.currentTarget;
                  const r = el.getBoundingClientRect();
                  const x = (e.clientX - r.left) / r.width;
                  const y = (e.clientY - r.top) / r.height;
                  el.style.setProperty("--rx", `${(0.5 - y) * 10}deg`);
                  el.style.setProperty("--ry", `${(x - 0.5) * 12}deg`);
                  el.style.setProperty("--mx", `${x * 100}%`);
                  el.style.setProperty("--my", `${y * 100}%`);
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.setProperty("--rx", `0deg`);
                  el.style.setProperty("--ry", `0deg`);
                }}
                className={cn(
                  "group relative w-full text-left overflow-hidden isolate",
                  "rounded-[22px] p-[1px]",
                  "transition-transform duration-300 ease-out will-change-transform",
                  "[transform:perspective(1000px)_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))]",
                  "hover:[transform:perspective(1000px)_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))_translateZ(8px)]",
                  "active:scale-[0.98] animate-fade-in"
                )}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Liquid glass gradient border */}
                <div
                  aria-hidden
                  className="absolute inset-0 rounded-[22px] bg-gradient-to-br from-white/30 via-white/5 to-white/20 opacity-80"
                />

                {/* Inner glass surface */}
                <div className="relative rounded-[21px] p-4 h-full bg-white/[0.06] backdrop-blur-2xl border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_0_rgba(0,0,0,0.35),0_20px_45px_-20px_rgba(0,0,0,0.85)] overflow-hidden">
                  {/* Colored aurora glow */}
                  <div
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-70 bg-gradient-to-br transition-opacity duration-500 group-hover:opacity-100",
                      tool.glow
                    )}
                  />
                  {/* Liquid highlight following cursor */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background:
                        "radial-gradient(220px circle at var(--mx,50%) var(--my,0%), rgba(255,255,255,0.18), transparent 60%)",
                    }}
                  />
                  {/* Top sheen */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent"
                  />
                  {/* Bottom refraction */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  />

                  <div className="relative [transform:translateZ(30px)]">
                    <div className="flex items-center justify-between">
                      <div className="relative w-11 h-11 rounded-2xl bg-white/15 ring-1 ring-white/25 flex items-center justify-center backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-2px_4px_rgba(0,0,0,0.25),0_6px_18px_-6px_rgba(0,0,0,0.6)]">
                        <div
                          aria-hidden
                          className={cn(
                            "absolute inset-0 rounded-2xl opacity-50 bg-gradient-to-br",
                            tool.glow
                          )}
                        />
                        <Icon className="relative w-[19px] h-[19px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" strokeWidth={1.8} />
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/40 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white/70" />
                    </div>
                    <h2 className="mt-4 font-playfair text-[15.5px] leading-snug tracking-tight drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
                      {tool.title}
                    </h2>
                    <p className="mt-1 text-[11.5px] text-white/60 leading-snug">
                      {tool.desc}
                    </p>
                  </div>
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

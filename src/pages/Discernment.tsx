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

        <section className="grid grid-cols-1 gap-5 [perspective:1400px]">
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
                  el.style.setProperty("--rx", `${(0.5 - y) * 6}deg`);
                  el.style.setProperty("--ry", `${(x - 0.5) * 8}deg`);
                  el.style.setProperty("--mx", `${x * 100}%`);
                  el.style.setProperty("--my", `${y * 100}%`);
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.setProperty("--rx", `0deg`);
                  el.style.setProperty("--ry", `0deg`);
                }}
                className={cn(
                  "group relative w-full text-left isolate rounded-[26px]",
                  "transition-transform duration-500 ease-out will-change-transform",
                  "[transform:perspective(1200px)_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))]",
                  "active:scale-[0.985] animate-fade-in"
                )}
                style={{
                  animationDelay: `${i * 70}ms`,
                  boxShadow: `0 0 0 1px rgba(96,165,250,0.9), 0 0 6px 0 rgba(96,165,250,0.7), 0 0 12px 0 rgba(96,165,250,0.35)`,
                }}
              >

                <div
                  className="relative rounded-[26px] p-5 overflow-hidden border border-white/15 backdrop-blur-xl"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 45%, rgba(255,255,255,0.06) 100%)",
                  }}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-60 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(280px circle at var(--mx,50%) var(--my,0%), rgba(${tool.edgeColor},0.22), transparent 60%)`,
                    }}
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/15 to-transparent"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-6 bottom-0 h-px"
                    style={{
                      background: `linear-gradient(90deg, transparent, rgba(${tool.edgeColor},0.7), transparent)`,
                    }}
                  />

                  <div className="relative flex items-start gap-4 [transform:translateZ(40px)]">
                    <div
                      className="relative shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-2xl border border-white/25"
                      style={{
                        background: `linear-gradient(135deg, rgba(${tool.edgeColor},0.25), rgba(${tool.edgeColor},0.05))`,
                        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.4), 0 6px 20px -6px rgba(${tool.edgeColor},0.6)`,
                      }}
                    >
                      <Icon
                        className="w-[20px] h-[20px] drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]"
                        strokeWidth={1.8}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="font-playfair text-[17px] leading-snug tracking-tight drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
                          {tool.title}
                        </h2>
                        <ChevronRight className="w-4 h-4 text-white/45 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white/80" />
                      </div>
                      <p className="mt-1.5 text-[12.5px] text-white/65 leading-relaxed">
                        {tool.desc}
                      </p>
                    </div>
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

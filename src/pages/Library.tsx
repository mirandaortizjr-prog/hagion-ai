import { useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { PremiumNav } from "@/components/PremiumNav";
import { useTierAccess } from "@/hooks/useTierAccess";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  ScrollText,
  Scroll,
  BookMarked,
  Library as LibraryIcon,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Lock,
  Download,
} from "lucide-react";

interface Text {
  titleEn: string;
  titleEs: string;
  descEn: string;
  descEs: string;
  url: string;
  publicDomain?: boolean;
  /** True when the text is bundled offline inside the app. */
  inApp?: boolean;
  /** Tier-access feature key (used with useTierAccess). */
  featureKey?: string;
}

interface Tradition {
  id: string;
  nameEn: string;
  nameEs: string;
  icon: typeof BookOpen;
  edge: string; // rgb triplet
  texts: Text[];
}

const traditions: Tradition[] = [
  {
    id: "christianity",
    nameEn: "Christianity",
    nameEs: "Cristianismo",
    icon: BookOpen,
    edge: "96,165,250",
    texts: [
      {
        titleEn: "Holy Bible (multiple translations)",
        titleEs: "Santa Biblia (varias traducciones)",
        descEn: "Read Scripture in KJV, WEB, RVR1960 and more — fully offline.",
        descEs: "Lee la Escritura en RVR1960, RVR1909, KJV y más — sin conexión.",
        url: "/bible-translations",
        publicDomain: true,
        inApp: true,
      },
      {
        titleEn: "Church Fathers (CCEL)",
        titleEs: "Padres de la Iglesia (CCEL)",
        descEn: "Ante-Nicene, Nicene & Post-Nicene Fathers — public domain.",
        descEs: "Padres ante-nicenos, nicenos y post-nicenos — dominio público.",
        url: "https://ccel.org/fathers",
        publicDomain: true,
      },
      {
        titleEn: "Catholic Catechism",
        titleEs: "Catecismo Católico",
        descEn: "Official Catechism of the Catholic Church.",
        descEs: "Catecismo oficial de la Iglesia Católica.",
        url: "https://www.vatican.va/archive/ENG0015/_INDEX.HTM",
      },
      {
        titleEn: "Didache (Teaching of the Twelve)",
        titleEs: "Didaché (Enseñanza de los Doce)",
        descEn: "Earliest Christian church manual — c. AD 50–120, free offline.",
        descEs: "El manual cristiano más antiguo — c. 50–120 d.C., gratis sin conexión.",
        url: "/scripture/apostolicfathers",
        publicDomain: true,
        inApp: true,
      },
      {
        titleEn: "Westminster Confession",
        titleEs: "Confesión de Westminster",
        descEn: "Reformed confession of faith — public domain.",
        descEs: "Confesión reformada de fe — dominio público.",
        url: "https://www.ccel.org/creeds/westminster-conf/",
        publicDomain: true,
      },
    ],
  },
  {
    id: "islam",
    nameEn: "Islam",
    nameEs: "Islam",
    icon: BookMarked,
    edge: "52,211,153",
    texts: [
      {
        titleEn: "The Qur'an",
        titleEs: "El Corán",
        descEn: "All 114 surahs — Sahih International (EN) & Cortés (ES), offline.",
        descEs: "Las 114 suras — Sahih International (EN) y Cortés (ES), sin conexión.",
        url: "/scripture/quran",
        publicDomain: true,
        inApp: true,
        featureKey: "scripture_quran",
      },
      {
        titleEn: "Sahih al-Bukhari (Hadith)",
        titleEs: "Sahih al-Bujari (Hadiz)",
        descEn: "One of the six canonical Hadith collections.",
        descEs: "Una de las seis colecciones canónicas de hadices.",
        url: "https://sunnah.com/bukhari",
      },
    ],
  },
  {
    id: "lds",
    nameEn: "Mormonism (LDS)",
    nameEs: "Mormonismo (SUD)",
    icon: ScrollText,
    edge: "251,191,36",
    texts: [
      {
        titleEn: "Book of Mormon",
        titleEs: "Libro de Mormón",
        descEn: "Joseph Smith's foundational text — full offline access.",
        descEs: "Texto fundacional de José Smith — acceso completo sin conexión.",
        url: "/scripture/bookofmormon",
        publicDomain: true,
        inApp: true,
        featureKey: "scripture_lds",
      },
      {
        titleEn: "Doctrine & Covenants",
        titleEs: "Doctrina y Convenios",
        descEn: "138 sections of revelations from LDS prophets.",
        descEs: "138 secciones de revelaciones de los profetas SUD.",
        url: "/scripture/doctrineandcovenants",
        publicDomain: true,
        inApp: true,
        featureKey: "scripture_lds",
      },
      {
        titleEn: "Pearl of Great Price",
        titleEs: "Perla de Gran Precio",
        descEn: "Moses, Abraham, Joseph Smith—History, Articles of Faith.",
        descEs: "Moisés, Abraham, José Smith—Historia, Artículos de Fe.",
        url: "/scripture/pearlofgreatprice",
        publicDomain: true,
        inApp: true,
        featureKey: "scripture_lds",
      },
    ],
  },
  {
    id: "judaism",
    nameEn: "Judaism",
    nameEs: "Judaísmo",
    icon: Scroll,
    edge: "129,140,248",
    texts: [
      {
        titleEn: "Torah (JPS 1917)",
        titleEs: "Torá (JPS 1917)",
        descEn: "Five Books of Moses — Jewish Publication Society 1917, free offline.",
        descEs: "Los cinco libros de Moisés — Jewish Publication Society 1917, gratis sin conexión.",
        url: "/scripture/tanakh",
        publicDomain: true,
        inApp: true,
      },
      {
        titleEn: "Mishnah & Talmud",
        titleEs: "Mishná y Talmud",
        descEn: "Rabbinic legal and theological writings.",
        descEs: "Escritos legales y teológicos rabínicos.",
        url: "https://www.sefaria.org/texts/Talmud",
      },
    ],
  },
  {
    id: "hinduism",
    nameEn: "Hinduism",
    nameEs: "Hinduismo",
    icon: BookOpen,
    edge: "251,113,133",
    texts: [
      {
        titleEn: "Bhagavad Gita",
        titleEs: "Bhagavad Gita",
        descEn: "Krishna & Arjuna's dialogue — 18 chapters offline.",
        descEs: "Diálogo de Krishna y Arjuna — 18 capítulos sin conexión.",
        url: "/scripture/bhagavadgita",
        publicDomain: true,
        inApp: true,
        featureKey: "scripture_eastern",
      },
      {
        titleEn: "Upanishads",
        titleEs: "Upanishads",
        descEn: "Foundational philosophical texts.",
        descEs: "Textos filosóficos fundacionales.",
        url: "https://sacred-texts.com/hin/upan/",
        publicDomain: true,
      },
    ],
  },
  {
    id: "buddhism",
    nameEn: "Buddhism",
    nameEs: "Budismo",
    icon: ScrollText,
    edge: "192,132,252",
    texts: [
      {
        titleEn: "Dhammapada",
        titleEs: "Dhammapada",
        descEn: "Sayings of the Buddha — 26 chapters offline.",
        descEs: "Dichos de Buda — 26 capítulos sin conexión.",
        url: "/scripture/dhammapada",
        publicDomain: true,
        inApp: true,
        featureKey: "scripture_eastern",
      },
      {
        titleEn: "Pali Canon (Tipitaka)",
        titleEs: "Canon Pali (Tipitaka)",
        descEn: "Earliest preserved Buddhist scriptures.",
        descEs: "Las escrituras budistas más antiguas conservadas.",
        url: "https://www.accesstoinsight.org/tipitaka/",
        publicDomain: true,
      },
    ],
  },
  {
    id: "other",
    nameEn: "Other Movements",
    nameEs: "Otros Movimientos",
    icon: BookMarked,
    edge: "56,189,248",
    texts: [
      {
        titleEn: "Guru Granth Sahib (Sikhism)",
        titleEs: "Guru Granth Sahib (Sijismo)",
        descEn: "Central religious scripture of Sikhism.",
        descEs: "Escritura central del sijismo.",
        url: "https://www.sikhitothemax.org",
      },
      {
        titleEn: "Baháʼí Writings",
        titleEs: "Escritos Baháʼí",
        descEn: "Writings of Baháʼu'lláh and the Báb.",
        descEs: "Escritos de Baháʼu'lláh y el Báb.",
        url: "https://www.bahai.org/library/",
      },
      {
        titleEn: "Nag Hammadi (Gnostic)",
        titleEs: "Nag Hammadi (Gnóstico)",
        descEn: "Gnostic gospels and apocryphal texts.",
        descEs: "Evangelios gnósticos y textos apócrifos.",
        url: "https://gnosis.org/naghamm/nhl.html",
        publicDomain: true,
      },
    ],
  },
];

const Library = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { canUse } = useTierAccess();
  const [params] = useSearchParams();
  const t = (en: string, es: string) => (language === "es" ? es : en);

  const analyzeMode = params.get("mode") === "analyze";

  const isLocked = (text: Text) =>
    !analyzeMode && !!text.featureKey && !canUse(text.featureKey);

  const openText = (text: Text) => {
    if (analyzeMode) {
      const prompt = `${text.titleEn} — ${text.descEn}`;
      navigate(`/chat?discern=texts&seed=${encodeURIComponent(prompt)}`);
      return;
    }
    if (isLocked(text)) {
      navigate("/premium");
      return;
    }
    if (text.url.startsWith("/")) {
      navigate(text.url);
    } else {
      window.open(text.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="min-h-screen text-white">
      <main className="px-5 sm:px-8 pt-8 pb-24 max-w-3xl mx-auto">
        <header className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 ring-1 ring-white/25 flex items-center justify-center backdrop-blur-xl">
              {analyzeMode ? (
                <ShieldCheck className="w-6 h-6" strokeWidth={1.8} />
              ) : (
                <LibraryIcon className="w-6 h-6" strokeWidth={1.8} />
              )}
            </div>
            <div>
              <p className="text-[11px] tracking-[0.22em] uppercase text-white/50">
                {analyzeMode
                  ? t("Discernment", "Discernimiento")
                  : t("Discipleship", "Discipulado")}
              </p>
              <h1 className="font-playfair text-3xl tracking-tight">
                {analyzeMode
                  ? t("Analyze Religious Texts", "Analizar Textos Religiosos")
                  : t("Religious Library", "Biblioteca Religiosa")}
              </h1>
            </div>
          </div>
          <p className="mt-3 text-[13px] text-white/65 leading-relaxed">
            {analyzeMode
              ? t(
                  "Choose a text to weigh against Scripture line by line.",
                  "Elige un texto para examinar a la luz de la Escritura."
                )
              : t(
                  "Read the world's sacred texts at the source — Scripture and beyond. Know what others believe so you can give a reasoned defense (1 Peter 3:15).",
                  "Lee los textos sagrados del mundo desde la fuente — la Escritura y más allá. Conoce lo que otros creen para dar una defensa razonada (1 Pedro 3:15)."
                )}
          </p>
          {!analyzeMode && (
            <button
              onClick={() => navigate("/library?mode=analyze")}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] border border-white/15 text-[12px] hover:bg-white/10 transition"
            >
              <ShieldCheck className="w-4 h-4" />
              {t("Switch to Analyze Mode", "Cambiar a Modo Análisis")}
            </button>
          )}
        </header>

        <section className="space-y-6">
          {traditions.map((tr, i) => {
            const Icon = tr.icon;
            return (
              <div
                key={tr.id}
                className="animate-fade-in"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-center gap-2.5 mb-2 px-1">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center backdrop-blur-xl border border-white/20"
                    style={{
                      background: `linear-gradient(135deg, rgba(${tr.edge},0.25), rgba(${tr.edge},0.05))`,
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                  </div>
                  <h2 className="font-playfair text-[16px] tracking-tight">
                    {language === "es" ? tr.nameEs : tr.nameEn}
                  </h2>
                </div>
                <div className="space-y-2">
                  {tr.texts.map((text) => {
                    const locked = isLocked(text);
                    const isExternal = !text.url.startsWith("/");
                    return (
                      <button
                        key={text.titleEn}
                        onClick={() => openText(text)}
                        className={cn(
                          "group w-full text-left rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-4",
                          "hover:bg-white/[0.07] hover:border-white/20 transition-all"
                        )}
                        style={{
                          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 6px 20px -10px rgba(${tr.edge},0.3)`,
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="font-playfair text-[15px] leading-snug">
                                {language === "es" ? text.titleEs : text.titleEn}
                              </h3>
                              {text.inApp && !locked && (
                                <span className="inline-flex items-center gap-1 text-[9px] tracking-[0.16em] uppercase px-1.5 py-0.5 rounded-full bg-emerald-400/15 text-emerald-300 border border-emerald-400/30">
                                  <Download className="w-2.5 h-2.5" />
                                  {t("In-app", "En la app")}
                                </span>
                              )}
                              {locked && (
                                <span className="inline-flex items-center gap-1 text-[9px] tracking-[0.16em] uppercase px-1.5 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30">
                                  <Lock className="w-2.5 h-2.5" />
                                  {t("Premium", "Premium")}
                                </span>
                              )}
                              {isExternal && !text.inApp && (
                                <span className="text-[9px] tracking-[0.16em] uppercase px-1.5 py-0.5 rounded-full bg-white/[0.06] text-white/50 border border-white/10">
                                  {t("External", "Externo")}
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-[12px] text-white/60 leading-relaxed">
                              {language === "es" ? text.descEs : text.descEn}
                            </p>
                          </div>
                          {locked ? (
                            <Lock className="w-4 h-4 text-amber-300/70 mt-1" />
                          ) : isExternal && !analyzeMode ? (
                            <ExternalLink className="w-3.5 h-3.5 text-white/45 mt-1" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-white/45 mt-1 group-hover:translate-x-1 transition-transform" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>

        <p className="mt-10 text-center font-playfair text-[12px] italic text-white/40">
          {t(
            "“Test everything; hold fast what is good.” — 1 Thessalonians 5:21",
            "“Examinadlo todo; retened lo bueno.” — 1 Tesalonicenses 5:21"
          )}
        </p>
      </main>
      <PremiumNav />
    </div>
  );
};

export default Library;

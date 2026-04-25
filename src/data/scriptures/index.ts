// Unified non-Bible scripture loader. Mirrors src/data/bibles/index.ts.
// Each text has its own folder of per-book chapter JSON files (Vite code-splits each).
import type { Tier } from "@/hooks/useSubscription";

export interface ScriptureBook {
  slug: string;
  nameEn: string;
  nameEs: string;
  chapters: number;
  /** Optional label for what a "chapter" is in this text (e.g. "Section", "Sūrah"). */
  unitEn?: string;
  unitEs?: string;
}

export interface ScriptureText {
  id: string;
  titleEn: string;
  titleEs: string;
  /** Short tagline shown on the Library card. */
  descEn: string;
  descEs: string;
  /** Tradition the text belongs to (must match a Library tradition id). */
  tradition: string;
  /** Books in this text. Use a single book if the text has no inner book divisions. */
  books: ScriptureBook[];
  /** Minimum tier required to read this text in-app. */
  minTier: Tier;
  /** Display gradient edge color (RGB triplet). */
  edge: string;
}

// Qur'an surah metadata (loaded from manifest)
import quranManifest from "./quran/_manifest.json";

const quranBooks: ScriptureBook[] = (quranManifest as Array<{
  slug: string; num: number; nameEn: string; translationEn: string; ayahs: number;
}>).map((s) => ({
  slug: s.slug,
  nameEn: `${s.num}. ${s.nameEn} (${s.translationEn})`,
  nameEs: `${s.num}. ${s.nameEn}`,
  chapters: 1,
  unitEn: "Surah",
  unitEs: "Sura",
}));

export const SCRIPTURE_TEXTS: ScriptureText[] = [
  // ============== LDS Triple ==============
  {
    id: "bookofmormon",
    titleEn: "Book of Mormon",
    titleEs: "Libro de Mormón",
    descEn: "Joseph Smith's foundational text — full offline access.",
    descEs: "Texto fundacional de José Smith — acceso completo sin conexión.",
    tradition: "lds",
    minTier: "premium",
    edge: "251,191,36",
    books: [
      { slug: "1nephi", nameEn: "1 Nephi", nameEs: "1 Nefi", chapters: 22 },
      { slug: "2nephi", nameEn: "2 Nephi", nameEs: "2 Nefi", chapters: 33 },
      { slug: "jacob", nameEn: "Jacob", nameEs: "Jacob", chapters: 7 },
      { slug: "enos", nameEn: "Enos", nameEs: "Enós", chapters: 1 },
      { slug: "jarom", nameEn: "Jarom", nameEs: "Jarom", chapters: 1 },
      { slug: "omni", nameEn: "Omni", nameEs: "Omni", chapters: 1 },
      { slug: "wordsofmormon", nameEn: "Words of Mormon", nameEs: "Palabras de Mormón", chapters: 1 },
      { slug: "mosiah", nameEn: "Mosiah", nameEs: "Mosíah", chapters: 29 },
      { slug: "alma", nameEn: "Alma", nameEs: "Alma", chapters: 63 },
      { slug: "helaman", nameEn: "Helaman", nameEs: "Helamán", chapters: 16 },
      { slug: "3nephi", nameEn: "3 Nephi", nameEs: "3 Nefi", chapters: 30 },
      { slug: "4nephi", nameEn: "4 Nephi", nameEs: "4 Nefi", chapters: 1 },
      { slug: "mormon", nameEn: "Mormon", nameEs: "Mormón", chapters: 9 },
      { slug: "ether", nameEn: "Ether", nameEs: "Éter", chapters: 15 },
      { slug: "moroni", nameEn: "Moroni", nameEs: "Moroni", chapters: 10 },
    ],
  },
  {
    id: "doctrineandcovenants",
    titleEn: "Doctrine & Covenants",
    titleEs: "Doctrina y Convenios",
    descEn: "138 sections of revelations recorded by LDS prophets.",
    descEs: "138 secciones de revelaciones de los profetas SUD.",
    tradition: "lds",
    minTier: "premium",
    edge: "251,191,36",
    books: [
      {
        slug: "doctrineandcovenants",
        nameEn: "Doctrine and Covenants",
        nameEs: "Doctrina y Convenios",
        chapters: 138,
        unitEn: "Section",
        unitEs: "Sección",
      },
    ],
  },
  {
    id: "pearlofgreatprice",
    titleEn: "Pearl of Great Price",
    titleEs: "Perla de Gran Precio",
    descEn: "Moses, Abraham, Joseph Smith—History, Articles of Faith.",
    descEs: "Moisés, Abraham, José Smith—Historia, Artículos de Fe.",
    tradition: "lds",
    minTier: "premium",
    edge: "251,191,36",
    books: [
      { slug: "moses", nameEn: "Moses", nameEs: "Moisés", chapters: 8 },
      { slug: "abraham", nameEn: "Abraham", nameEs: "Abraham", chapters: 5 },
      { slug: "josephsmithmatthew", nameEn: "Joseph Smith—Matthew", nameEs: "José Smith—Mateo", chapters: 1 },
      { slug: "josephsmithhistory", nameEn: "Joseph Smith—History", nameEs: "José Smith—Historia", chapters: 1 },
      { slug: "articlesoffaith", nameEn: "Articles of Faith", nameEs: "Artículos de Fe", chapters: 1 },
    ],
  },
];

  // ============== Hinduism ==============
  {
    id: "bhagavadgita",
    titleEn: "Bhagavad Gita",
    titleEs: "Bhagavad Gita",
    descEn: "Krishna and Arjuna's dialogue — Edwin Arnold translation, full offline.",
    descEs: "Diálogo de Krishna y Arjuna — traducción de Edwin Arnold, sin conexión.",
    tradition: "hinduism",
    minTier: "premium",
    edge: "251,113,133",
    books: [
      { slug: "bhagavadgita", nameEn: "Bhagavad Gita", nameEs: "Bhagavad Gita", chapters: 18 },
    ],
  },
  // ============== Buddhism ==============
  {
    id: "dhammapada",
    titleEn: "Dhammapada",
    titleEs: "Dhammapada",
    descEn: "Sayings of the Buddha — F.L. Woodward translation, 26 chapters offline.",
    descEs: "Dichos de Buda — traducción de F.L. Woodward, 26 capítulos sin conexión.",
    tradition: "buddhism",
    minTier: "premium",
    edge: "192,132,252",
    books: [
      { slug: "dhammapada", nameEn: "Dhammapada", nameEs: "Dhammapada", chapters: 26 },
    ],
  },
  // ============== Islam ==============
  {
    id: "quran",
    titleEn: "The Qur'an",
    titleEs: "El Corán",
    descEn: "All 114 surahs — Sahih International (EN) and Cortés (ES), fully offline.",
    descEs: "Las 114 suras — Sahih International (EN) y Cortés (ES), sin conexión.",
    tradition: "islam",
    minTier: "premium",
    edge: "52,211,153",
    books: quranBooks,
  },
];

// Vite code-splits one chunk per chapter file.
const chapterModules = import.meta.glob<Record<string, string[]>>(
  "./*/*.json",
  { import: "default" }
);

export async function loadScriptureChapter(
  textId: string,
  bookSlug: string,
  chapter: number,
  language: "en" | "es" = "en"
): Promise<string[]> {
  const key = `./${textId}/${bookSlug}.json`;
  const loader = chapterModules[key];
  if (!loader) throw new Error(`Scripture file not found: ${key}`);
  const book = await loader();
  // Bilingual support: if a "<chapter>_es" key exists and language === "es", use it.
  if (language === "es") {
    const esKey = `${chapter}_es`;
    if (book[esKey]) return book[esKey];
  }
  return book[String(chapter)] ?? [];
}

export function getScriptureText(id: string): ScriptureText | undefined {
  return SCRIPTURE_TEXTS.find((t) => t.id === id);
}

export function getScriptureBook(textId: string, bookSlug: string): ScriptureBook | undefined {
  return getScriptureText(textId)?.books.find((b) => b.slug === bookSlug);
}

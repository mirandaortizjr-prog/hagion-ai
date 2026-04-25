import manifest from "./manifest.json";

export type TranslationId = "kjv" | "web" | "rv1960" | "rv1909";

export interface BibleBook {
  slug: string;
  en: string;
  es: string;
  chapters: number;
}

export interface TranslationMeta {
  id: TranslationId;
  name: string;
  fullNameEn: string;
  fullNameEs: string;
  language: "en" | "es";
}

export const BIBLE_BOOKS: BibleBook[] = manifest.books as BibleBook[];
export const TRANSLATIONS: TranslationMeta[] = manifest.translations as TranslationMeta[];

// Vite eager-glob -> code-split per file. Each book file becomes a separate JS chunk
// loaded only when requested. JSON is small (~60KB avg) and cached by the browser.
const bookModules = import.meta.glob<Record<string, string[]>>(
  "./*/*.json",
  { import: "default" }
);

export async function loadChapter(
  translation: TranslationId,
  bookSlug: string,
  chapter: number
): Promise<string[]> {
  const key = `./${translation}/${bookSlug}.json`;
  const loader = bookModules[key];
  if (!loader) throw new Error(`Bible file not found: ${key}`);
  const book = await loader();
  return book[String(chapter)] ?? [];
}

export function getBook(slug: string): BibleBook | undefined {
  return BIBLE_BOOKS.find((b) => b.slug === slug);
}

export function getTranslation(id: TranslationId): TranslationMeta | undefined {
  return TRANSLATIONS.find((t) => t.id === id);
}

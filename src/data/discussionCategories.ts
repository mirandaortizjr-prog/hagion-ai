export interface DiscussionCategory {
  id: string;
  en: string;
  es: string;
  emoji: string;
  accent: string;
}

export const DISCUSSION_CATEGORIES: DiscussionCategory[] = [
  { id: "theology", en: "Theology", es: "Teología", emoji: "✝️", accent: "from-amber-300/30 to-rose-500/20" },
  { id: "apologetics", en: "Apologetics", es: "Apologética", emoji: "🛡️", accent: "from-sky-300/30 to-indigo-500/20" },
  { id: "prayer", en: "Prayer Requests", es: "Peticiones", emoji: "🙏", accent: "from-violet-300/30 to-purple-600/20" },
  { id: "testimony", en: "Testimonies", es: "Testimonios", emoji: "✨", accent: "from-emerald-300/30 to-teal-600/20" },
  { id: "bible", en: "Bible Study", es: "Estudio Bíblico", emoji: "📖", accent: "from-orange-300/30 to-amber-600/20" },
  { id: "questions", en: "Questions", es: "Preguntas", emoji: "❓", accent: "from-cyan-300/30 to-blue-600/20" },
  { id: "general", en: "General", es: "General", emoji: "💬", accent: "from-slate-300/30 to-slate-600/20" },
];

export const getCategory = (id: string) =>
  DISCUSSION_CATEGORIES.find((c) => c.id === id) || DISCUSSION_CATEGORIES[DISCUSSION_CATEGORIES.length - 1];

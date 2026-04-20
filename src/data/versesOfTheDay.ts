export type Verse = {
  en: { text: string; ref: string };
  es: { text: string; ref: string };
};

export const VERSES: Verse[] = [
  {
    en: { text: "Be still, and know that I am God.", ref: "Psalm 46:10" },
    es: { text: "Estad quietos, y conoced que yo soy Dios.", ref: "Salmo 46:10" },
  },
  {
    en: { text: "The Lord is my shepherd; I shall not want.", ref: "Psalm 23:1" },
    es: { text: "Jehová es mi pastor; nada me faltará.", ref: "Salmo 23:1" },
  },
  {
    en: { text: "Your word is a lamp to my feet and a light to my path.", ref: "Psalm 119:105" },
    es: { text: "Lámpara es a mis pies tu palabra, y lumbrera a mi camino.", ref: "Salmo 119:105" },
  },
  {
    en: { text: "I can do all things through Christ who strengthens me.", ref: "Philippians 4:13" },
    es: { text: "Todo lo puedo en Cristo que me fortalece.", ref: "Filipenses 4:13" },
  },
  {
    en: { text: "Trust in the Lord with all your heart.", ref: "Proverbs 3:5" },
    es: { text: "Fíate de Jehová de todo tu corazón.", ref: "Proverbios 3:5" },
  },
  {
    en: { text: "The Lord is near to the brokenhearted.", ref: "Psalm 34:18" },
    es: { text: "Cercano está Jehová a los quebrantados de corazón.", ref: "Salmo 34:18" },
  },
  {
    en: { text: "Cast all your anxiety on him because he cares for you.", ref: "1 Peter 5:7" },
    es: { text: "Echando toda vuestra ansiedad sobre él, porque él tiene cuidado de vosotros.", ref: "1 Pedro 5:7" },
  },
  {
    en: { text: "For I know the plans I have for you, declares the Lord.", ref: "Jeremiah 29:11" },
    es: { text: "Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová.", ref: "Jeremías 29:11" },
  },
  {
    en: { text: "This is the day the Lord has made; let us rejoice and be glad in it.", ref: "Psalm 118:24" },
    es: { text: "Este es el día que hizo Jehová; nos gozaremos y alegraremos en él.", ref: "Salmo 118:24" },
  },
  {
    en: { text: "Come to me, all who labor, and I will give you rest.", ref: "Matthew 11:28" },
    es: { text: "Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar.", ref: "Mateo 11:28" },
  },
];

export function getVerseOfTheDay(): Verse {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = Date.now() - start.getTime();
  const dayOfYear = Math.floor(diff / 86400000);
  return VERSES[dayOfYear % VERSES.length];
}

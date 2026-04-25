import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, BookOpen, Sparkles } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { PremiumNav } from "@/components/PremiumNav";
import {
  BIBLE_BOOKS,
  TRANSLATIONS,
  loadChapter,
  getBook,
  getTranslation,
  type TranslationId,
} from "@/data/bibles";

const BibleTranslations = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const defaultTranslation: TranslationId = language === "es" ? "rv1960" : "kjv";

  const [activeTranslation, setActiveTranslation] = useState<TranslationId>(defaultTranslation);
  const [selectedBook, setSelectedBook] = useState("genesis");
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [verses, setVerses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentBook = useMemo(() => getBook(selectedBook), [selectedBook]);
  const currentTranslation = useMemo(
    () => getTranslation(activeTranslation),
    [activeTranslation]
  );
  const chapters = useMemo(
    () => (currentBook ? Array.from({ length: currentBook.chapters }, (_, i) => i + 1) : []),
    [currentBook]
  );

  const bookDisplayName = (slug: string) => {
    const b = getBook(slug);
    if (!b) return slug;
    return language === "es" ? b.es : b.en;
  };

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setReadProgress(0);
    loadChapter(activeTranslation, selectedBook, selectedChapter)
      .then((data) => {
        if (!cancelled) setVerses(data);
      })
      .catch((err) => {
        console.error("Bible load error:", err);
        if (!cancelled) {
          setVerses([]);
          toast({
            title: t("error"),
            description: language === "es"
              ? "No se pudo cargar el capítulo."
              : "Unable to load chapter.",
            variant: "destructive",
          });
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    // Scroll to top on chapter change
    requestAnimationFrame(() => {
      const el = scrollRef.current?.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement | null;
      if (el) el.scrollTop = 0;
    });
    return () => {
      cancelled = true;
    };
  }, [selectedBook, selectedChapter, activeTranslation, language, t]);

  // Reading progress
  useEffect(() => {
    const el = scrollRef.current?.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement | null;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight;
      setReadProgress(max > 0 ? (el.scrollTop / max) * 100 : 0);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [verses]);

  const goPrevious = () => {
    if (selectedChapter > 1) {
      setSelectedChapter(selectedChapter - 1);
      return;
    }
    const idx = BIBLE_BOOKS.findIndex((b) => b.slug === selectedBook);
    if (idx > 0) {
      const prev = BIBLE_BOOKS[idx - 1];
      setSelectedBook(prev.slug);
      setSelectedChapter(prev.chapters);
    }
  };

  const goNext = () => {
    const max = currentBook?.chapters ?? 1;
    if (selectedChapter < max) {
      setSelectedChapter(selectedChapter + 1);
      return;
    }
    const idx = BIBLE_BOOKS.findIndex((b) => b.slug === selectedBook);
    if (idx < BIBLE_BOOKS.length - 1) {
      const next = BIBLE_BOOKS[idx + 1];
      setSelectedBook(next.slug);
      setSelectedChapter(1);
    }
  };

  const isAtStart = selectedBook === "genesis" && selectedChapter === 1;
  const isAtEnd = selectedBook === "revelation" && selectedChapter === 22;

  return (
    <div className="min-h-screen flex flex-col page-transition relative">
      {/* Ambient glow background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-[520px] h-[520px] rounded-full opacity-30 blur-3xl"
             style={{ background: "radial-gradient(circle, hsl(197 88% 65% / 0.55), transparent 70%)" }} />
        <div className="absolute top-1/3 -left-40 w-[480px] h-[480px] rounded-full opacity-25 blur-3xl"
             style={{ background: "radial-gradient(circle, hsl(210 90% 55% / 0.5), transparent 70%)" }} />
      </div>

      {/* Premium glass header */}
      <header className="sticky top-0 z-20 glass-strong">
        {/* Reading progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5">
          <div
            className="h-full transition-[width] duration-150 ease-out"
            style={{
              width: `${readProgress}%`,
              background: "linear-gradient(90deg, hsl(197 88% 65%), hsl(210 90% 55%))",
              boxShadow: "0 0 12px hsl(197 88% 65% / 0.6)",
            }}
          />
        </div>

        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-white/90 hover:text-white hover:bg-white/10 tap-scale rounded-full"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                 style={{
                   background: "linear-gradient(135deg, hsl(197 88% 65%), hsl(210 90% 45%))",
                   boxShadow: "0 8px 24px -8px hsl(197 88% 65% / 0.6), inset 0 1px 0 hsl(0 0% 100% / 0.3)",
                 }}>
              <BookOpen className="w-5 h-5 text-white" strokeWidth={2.2} />
              <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-white/90" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold leading-tight text-white truncate"
                  style={{ fontFamily: "'Playfair Display', serif" }}>
                {language === "es" ? "Sagrada Escritura" : "Holy Scripture"}
              </h1>
              <p className="text-xs text-white/60 truncate">
                {bookDisplayName(selectedBook)} {selectedChapter} · {currentTranslation?.name}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 pt-5 pb-32 max-w-3xl">
        {/* Translation pills */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1 -mx-4 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TRANSLATIONS.map((tr) => {
            const active = tr.id === activeTranslation;
            return (
              <button
                key={tr.id}
                onClick={() => setActiveTranslation(tr.id)}
                className={`tap-scale shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 border ${
                  active
                    ? "text-white border-transparent"
                    : "text-white/70 border-white/15 hover:text-white hover:border-white/30 bg-white/[0.04]"
                }`}
                style={
                  active
                    ? {
                        background: "linear-gradient(135deg, hsl(197 88% 60%), hsl(210 90% 50%))",
                        boxShadow: "0 8px 24px -8px hsl(197 88% 60% / 0.65), inset 0 1px 0 hsl(0 0% 100% / 0.25)",
                      }
                    : undefined
                }
              >
                {tr.name}
              </button>
            );
          })}
        </div>

        {/* Book + Chapter selectors */}
        <div className="glass rounded-2xl p-4 mb-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] uppercase tracking-wider font-semibold mb-1.5 block text-white/50">
                {t("book")}
              </label>
              <Select
                value={selectedBook}
                onValueChange={(v) => { setSelectedBook(v); setSelectedChapter(1); }}
              >
                <SelectTrigger className="bg-white/5 border-white/15 text-white hover:bg-white/10 transition rounded-xl h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[hsl(210_50%_10%)] border-white/15 text-white">
                  <ScrollArea className="h-[300px]">
                    {BIBLE_BOOKS.map((book) => (
                      <SelectItem key={book.slug} value={book.slug} className="focus:bg-white/10 focus:text-white">
                        {language === "es" ? book.es : book.en}
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider font-semibold mb-1.5 block text-white/50">
                {t("chapter")}
              </label>
              <Select
                value={selectedChapter.toString()}
                onValueChange={(val) => setSelectedChapter(parseInt(val))}
              >
                <SelectTrigger className="bg-white/5 border-white/15 text-white hover:bg-white/10 transition rounded-xl h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[hsl(210_50%_10%)] border-white/15 text-white">
                  <ScrollArea className="h-[300px]">
                    {chapters.map((c) => (
                      <SelectItem key={c} value={c.toString()} className="focus:bg-white/10 focus:text-white">
                        {t("chapter")} {c}
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Scripture card */}
        <article
          key={`${activeTranslation}-${selectedBook}-${selectedChapter}`}
          className="glass-strong rounded-3xl overflow-hidden animate-fade-in"
          style={{
            boxShadow:
              "0 30px 80px -30px hsl(0 0% 0% / 0.7), inset 0 1px 0 hsl(0 0% 100% / 0.18)",
          }}
        >
          {/* Header band */}
          <div className="px-6 pt-6 pb-4 border-b border-white/10 text-center relative">
            <div className="text-[10px] uppercase tracking-[0.25em] text-white/50 mb-1">
              {currentTranslation
                ? language === "es" ? currentTranslation.fullNameEs : currentTranslation.fullNameEn
                : ""}
            </div>
            <h2
              className="text-3xl md:text-4xl font-bold text-white"
              style={{ fontFamily: "'Playfair Display', serif", letterSpacing: "-0.01em" }}
            >
              {bookDisplayName(selectedBook)}{" "}
              <span className="text-transparent bg-clip-text"
                    style={{ backgroundImage: "linear-gradient(135deg, hsl(197 88% 70%), hsl(210 90% 60%))" }}>
                {selectedChapter}
              </span>
            </h2>
            {/* Ornament divider */}
            <div className="flex items-center justify-center gap-2 mt-3 opacity-70">
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-white/40" />
              <Sparkles className="w-3 h-3 text-white/60" />
              <span className="h-px w-10 bg-gradient-to-l from-transparent to-white/40" />
            </div>
          </div>

          {/* Verses */}
          <ScrollArea ref={scrollRef as any} className="h-[58vh] min-h-[420px]">
            <div className="px-6 py-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 skeleton-shimmer w-[90%]" />
                      <div className="h-4 skeleton-shimmer w-[75%]" />
                    </div>
                  ))}
                </div>
              ) : verses.length > 0 ? (
                <div className="stagger-children space-y-4">
                  {verses.map((text, idx) => {
                    const isFirst = idx === 0;
                    return (
                      <p
                        key={idx}
                        className="text-white/90 leading-[1.85] text-[17px]"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                      >
                        {isFirst ? (
                          <>
                            <span className="text-xs align-top font-bold mr-1.5"
                                  style={{ color: "hsl(197 88% 70%)" }}>
                              {idx + 1}
                            </span>
                            <span
                              className="float-left text-6xl leading-[0.85] mr-2 mt-1 font-bold text-transparent bg-clip-text"
                              style={{
                                fontFamily: "'Playfair Display', serif",
                                backgroundImage: "linear-gradient(135deg, hsl(197 88% 75%), hsl(210 90% 55%))",
                              }}
                            >
                              {text.charAt(0)}
                            </span>
                            <span>{text.slice(1)}</span>
                          </>
                        ) : (
                          <>
                            <sup className="text-[11px] font-bold mr-1.5"
                                 style={{ color: "hsl(197 88% 70%)" }}>
                              {idx + 1}
                            </sup>
                            <span>{text}</span>
                          </>
                        )}
                      </p>
                    );
                  })}
                  {/* End ornament */}
                  <div className="flex items-center justify-center gap-2 pt-6 pb-2 opacity-50">
                    <span className="h-px w-12 bg-gradient-to-r from-transparent to-white/40" />
                    <span className="text-white/50 text-xs tracking-[0.3em]">✦</span>
                    <span className="h-px w-12 bg-gradient-to-l from-transparent to-white/40" />
                  </div>
                </div>
              ) : (
                <p className="text-white/60 text-center py-10">{language === "es" ? "Sin texto disponible" : "No text available"}</p>
              )}
            </div>
          </ScrollArea>
        </article>
      </main>

      {/* Floating chapter navigation */}
      <div className="fixed bottom-[88px] left-0 right-0 z-10 px-4 pointer-events-none">
        <div className="container mx-auto max-w-3xl flex justify-between items-center pointer-events-auto">
          <button
            onClick={goPrevious}
            disabled={isAtStart}
            aria-label={t("previous_chapter")}
            className="tap-scale glass-strong rounded-full w-12 h-12 flex items-center justify-center text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-white/15 transition"
            style={{ boxShadow: "0 12px 30px -10px hsl(0 0% 0% / 0.7)" }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="glass rounded-full px-4 py-2 text-xs text-white/80 font-semibold tracking-wide">
            {selectedChapter} / {currentBook?.chapters ?? 1}
          </div>
          <button
            onClick={goNext}
            disabled={isAtEnd}
            aria-label={t("next_chapter")}
            className="tap-scale rounded-full w-12 h-12 flex items-center justify-center text-white disabled:opacity-30 disabled:pointer-events-none transition"
            style={{
              background: "linear-gradient(135deg, hsl(197 88% 60%), hsl(210 90% 50%))",
              boxShadow: "0 12px 30px -8px hsl(197 88% 60% / 0.7), inset 0 1px 0 hsl(0 0% 100% / 0.25)",
            }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <PremiumNav />
    </div>
  );
};

export default BibleTranslations;

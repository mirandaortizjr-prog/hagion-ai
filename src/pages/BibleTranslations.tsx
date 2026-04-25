import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ChevronDown, BookOpen, Type, Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
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

const FONT_SIZES = [15, 17, 19, 22] as const;

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
  const [fontSize, setFontSize] = useState<number>(17);
  const [pickerOpen, setPickerOpen] = useState(false);
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

  // Old Testament / New Testament split (first 39 / last 27)
  const otBooks = BIBLE_BOOKS.slice(0, 39);
  const ntBooks = BIBLE_BOOKS.slice(39);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setReadProgress(0);
    loadChapter(activeTranslation, selectedBook, selectedChapter)
      .then((data) => { if (!cancelled) setVerses(data); })
      .catch((err) => {
        console.error("Bible load error:", err);
        if (!cancelled) {
          setVerses([]);
          toast({
            title: t("error"),
            description: language === "es" ? "No se pudo cargar el capítulo." : "Unable to load chapter.",
            variant: "destructive",
          });
        }
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    requestAnimationFrame(() => {
      const el = scrollRef.current?.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement | null;
      if (el) el.scrollTop = 0;
    });
    return () => { cancelled = true; };
  }, [selectedBook, selectedChapter, activeTranslation, language, t]);

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
    if (selectedChapter > 1) { setSelectedChapter(selectedChapter - 1); return; }
    const idx = BIBLE_BOOKS.findIndex((b) => b.slug === selectedBook);
    if (idx > 0) {
      const prev = BIBLE_BOOKS[idx - 1];
      setSelectedBook(prev.slug);
      setSelectedChapter(prev.chapters);
    }
  };
  const goNext = () => {
    const max = currentBook?.chapters ?? 1;
    if (selectedChapter < max) { setSelectedChapter(selectedChapter + 1); return; }
    const idx = BIBLE_BOOKS.findIndex((b) => b.slug === selectedBook);
    if (idx < BIBLE_BOOKS.length - 1) {
      const next = BIBLE_BOOKS[idx + 1];
      setSelectedBook(next.slug);
      setSelectedChapter(1);
    }
  };

  const isAtStart = selectedBook === "genesis" && selectedChapter === 1;
  const isAtEnd = selectedBook === "revelation" && selectedChapter === 22;

  // Apple-ish system font stack
  const sf = `-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Inter", "Segoe UI", system-ui, sans-serif`;
  const serif = `"New York", "Charter", "Iowan Old Style", "Apple Garamond", Georgia, serif`;

  return (
    <div
      className="min-h-screen flex flex-col page-transition"
      style={{ fontFamily: sf, background: "hsl(0 0% 4%)" }}
    >
      {/* iOS-style large nav bar */}
      <header
        className="sticky top-0 z-20"
        style={{
          background: "hsl(0 0% 6% / 0.72)",
          backdropFilter: "saturate(180%) blur(24px)",
          WebkitBackdropFilter: "saturate(180%) blur(24px)",
          borderBottom: "1px solid hsl(0 0% 100% / 0.08)",
        }}
      >
        {/* Reading progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px]">
          <div
            className="h-full transition-[width] duration-150"
            style={{ width: `${readProgress}%`, background: "hsl(211 100% 60%)" }}
          />
        </div>

        <div className="px-4 h-12 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center -ml-1 tap-scale"
            style={{ color: "hsl(211 100% 60%)" }}
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={2.4} />
            <span className="text-[17px] -ml-1" style={{ letterSpacing: "-0.01em" }}>
              {language === "es" ? "Atrás" : "Back"}
            </span>
          </button>

          <div className="text-[15px] font-semibold text-white/95 truncate max-w-[55%]"
               style={{ letterSpacing: "-0.01em" }}>
            {bookDisplayName(selectedBook)} {selectedChapter}
          </div>

          {/* Aa font size */}
          <button
            onClick={() => {
              const i = FONT_SIZES.indexOf(fontSize as any);
              const next = FONT_SIZES[(i + 1) % FONT_SIZES.length];
              setFontSize(next);
            }}
            className="tap-scale w-8 h-8 rounded-full flex items-center justify-center"
            style={{ color: "hsl(211 100% 60%)" }}
            aria-label="Font size"
          >
            <Type className="w-[18px] h-[18px]" strokeWidth={2.2} />
          </button>
        </div>

        {/* Large title row */}
        <div className="px-4 pb-3 pt-1">
          <h1
            className="text-[34px] font-bold text-white leading-tight"
            style={{ letterSpacing: "-0.022em" }}
          >
            {language === "es" ? "Biblia" : "Bible"}
          </h1>
          <p className="text-[13px] text-white/55 mt-0.5" style={{ letterSpacing: "-0.005em" }}>
            {currentTranslation
              ? language === "es" ? currentTranslation.fullNameEs : currentTranslation.fullNameEn
              : ""}
          </p>
        </div>

        {/* Translation segmented control */}
        <div className="px-4 pb-3">
          <div
            className="grid grid-cols-4 p-[3px] rounded-[10px] gap-[2px]"
            style={{ background: "hsl(0 0% 100% / 0.08)" }}
          >
            {TRANSLATIONS.map((tr) => {
              const active = tr.id === activeTranslation;
              return (
                <button
                  key={tr.id}
                  onClick={() => setActiveTranslation(tr.id)}
                  className="text-[13px] font-semibold py-[7px] rounded-[8px] transition-all duration-200"
                  style={{
                    color: active ? "white" : "hsl(0 0% 100% / 0.7)",
                    background: active ? "hsl(0 0% 100% / 0.18)" : "transparent",
                    boxShadow: active
                      ? "0 1px 0 hsl(0 0% 100% / 0.18) inset, 0 2px 6px hsl(0 0% 0% / 0.35)"
                      : "none",
                    letterSpacing: "-0.005em",
                  }}
                >
                  {tr.name}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 pt-5 pb-32 max-w-[700px] w-full mx-auto">
        {/* Book / Chapter picker (single tap → iOS sheet) */}
        <Sheet open={pickerOpen} onOpenChange={setPickerOpen}>
          <SheetTrigger asChild>
            <button
              className="tap-scale w-full flex items-center justify-between rounded-[14px] px-4 py-3.5 mb-5"
              style={{
                background: "hsl(0 0% 100% / 0.06)",
                border: "1px solid hsl(0 0% 100% / 0.08)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-[8px] flex items-center justify-center"
                  style={{ background: "hsl(211 100% 60%)" }}
                >
                  <BookOpen className="w-4 h-4 text-white" strokeWidth={2.4} />
                </div>
                <div className="text-left">
                  <div className="text-[11px] uppercase tracking-[0.08em] text-white/45 font-semibold">
                    {language === "es" ? "Capítulo" : "Chapter"}
                  </div>
                  <div className="text-[16px] font-semibold text-white -mt-0.5"
                       style={{ letterSpacing: "-0.01em" }}>
                    {bookDisplayName(selectedBook)} {selectedChapter}
                  </div>
                </div>
              </div>
              <ChevronDown className="w-5 h-5 text-white/50" />
            </button>
          </SheetTrigger>

          <SheetContent
            side="bottom"
            className="border-0 p-0 rounded-t-[18px] h-[85vh] max-h-[85vh]"
            style={{
              background: "hsl(0 0% 9%)",
              backdropFilter: "blur(40px) saturate(180%)",
              WebkitBackdropFilter: "blur(40px) saturate(180%)",
            }}
          >
            {/* Grabber */}
            <div className="pt-2 pb-1 flex justify-center">
              <div className="w-9 h-[5px] rounded-full" style={{ background: "hsl(0 0% 100% / 0.25)" }} />
            </div>
            <SheetHeader className="px-5 pt-2 pb-3">
              <SheetTitle className="text-white text-[17px] font-semibold text-center"
                          style={{ letterSpacing: "-0.01em", fontFamily: sf }}>
                {language === "es" ? "Seleccionar capítulo" : "Select Chapter"}
              </SheetTitle>
            </SheetHeader>

            <ScrollArea className="h-[calc(85vh-72px)]">
              <div className="px-4 pb-10">
                {[
                  { label: language === "es" ? "Antiguo Testamento" : "Old Testament", books: otBooks },
                  { label: language === "es" ? "Nuevo Testamento" : "New Testament", books: ntBooks },
                ].map((section) => (
                  <div key={section.label} className="mb-6">
                    <div className="text-[12px] uppercase tracking-[0.06em] text-white/45 font-semibold px-2 mb-2">
                      {section.label}
                    </div>
                    <div
                      className="rounded-[14px] overflow-hidden"
                      style={{ background: "hsl(0 0% 100% / 0.05)" }}
                    >
                      {section.books.map((book, idx) => {
                        const isOpen = book.slug === selectedBook;
                        return (
                          <div key={book.slug}>
                            {idx > 0 && (
                              <div className="ml-4 h-px" style={{ background: "hsl(0 0% 100% / 0.06)" }} />
                            )}
                            <button
                              onClick={() => {
                                if (isOpen) return;
                                setSelectedBook(book.slug);
                                setSelectedChapter(1);
                              }}
                              className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                            >
                              <span className="text-[16px] text-white" style={{ letterSpacing: "-0.01em" }}>
                                {language === "es" ? book.es : book.en}
                              </span>
                              {isOpen ? (
                                <Check className="w-5 h-5" style={{ color: "hsl(211 100% 60%)" }} />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-white/30" />
                              )}
                            </button>

                            {isOpen && (
                              <div className="px-3 pb-4 pt-1">
                                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                                  {Array.from({ length: book.chapters }, (_, i) => i + 1).map((c) => {
                                    const sel = c === selectedChapter;
                                    return (
                                      <button
                                        key={c}
                                        onClick={() => {
                                          setSelectedChapter(c);
                                          setPickerOpen(false);
                                        }}
                                        className="tap-scale aspect-square rounded-[10px] text-[14px] font-semibold transition"
                                        style={{
                                          background: sel ? "hsl(211 100% 60%)" : "hsl(0 0% 100% / 0.08)",
                                          color: sel ? "white" : "hsl(0 0% 100% / 0.85)",
                                        }}
                                      >
                                        {c}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>

        {/* Reading surface — clean Apple Books style */}
        <article
          key={`${activeTranslation}-${selectedBook}-${selectedChapter}`}
          className="rounded-[18px] overflow-hidden animate-fade-in"
          style={{
            background: "hsl(0 0% 100% / 0.04)",
            border: "1px solid hsl(0 0% 100% / 0.07)",
          }}
        >
          <div className="px-5 pt-6 pb-3 text-center">
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/40 font-semibold">
              {currentTranslation?.name}
            </div>
            <h2
              className="text-[28px] font-bold text-white mt-1"
              style={{ fontFamily: serif, letterSpacing: "-0.015em" }}
            >
              {bookDisplayName(selectedBook)} {selectedChapter}
            </h2>
          </div>

          <ScrollArea ref={scrollRef as any} className="h-[58vh] min-h-[440px]">
            <div className="px-5 pb-8">
              {isLoading ? (
                <div className="space-y-3 pt-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 skeleton-shimmer w-[92%]" />
                      <div className="h-4 skeleton-shimmer w-[70%]" />
                    </div>
                  ))}
                </div>
              ) : verses.length > 0 ? (
                <div className="stagger-children">
                  {verses.map((text, idx) => {
                    const isFirst = idx === 0;
                    return (
                      <p
                        key={idx}
                        className="text-white/90"
                        style={{
                          fontFamily: serif,
                          fontSize: `${fontSize}px`,
                          lineHeight: 1.65,
                          marginTop: idx === 0 ? "0.5rem" : "0.9rem",
                          letterSpacing: "-0.003em",
                        }}
                      >
                        {isFirst && (
                          <span
                            className="float-left mr-2 mt-1 font-bold text-white"
                            style={{
                              fontFamily: serif,
                              fontSize: `${fontSize * 3.2}px`,
                              lineHeight: 0.85,
                            }}
                          >
                            {text.charAt(0)}
                          </span>
                        )}
                        <sup
                          className="font-semibold mr-1.5 align-super"
                          style={{ color: "hsl(211 100% 60%)", fontSize: "0.62em", fontFamily: sf }}
                        >
                          {idx + 1}
                        </sup>
                        <span>{isFirst ? text.slice(1) : text}</span>
                      </p>
                    );
                  })}
                </div>
              ) : (
                <p className="text-white/50 text-center py-10">
                  {language === "es" ? "Sin texto disponible" : "No text available"}
                </p>
              )}
            </div>
          </ScrollArea>
        </article>
      </main>

      {/* iOS-style floating toolbar */}
      <div className="fixed bottom-[88px] left-0 right-0 z-10 px-4 pointer-events-none">
        <div className="max-w-[700px] mx-auto pointer-events-auto">
          <div
            className="flex items-center justify-between rounded-full px-2 py-1.5"
            style={{
              background: "hsl(0 0% 12% / 0.72)",
              backdropFilter: "saturate(180%) blur(24px)",
              WebkitBackdropFilter: "saturate(180%) blur(24px)",
              border: "1px solid hsl(0 0% 100% / 0.08)",
              boxShadow: "0 12px 40px -12px hsl(0 0% 0% / 0.7)",
            }}
          >
            <button
              onClick={goPrevious}
              disabled={isAtStart}
              className="tap-scale w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none"
              style={{ color: "hsl(211 100% 60%)" }}
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" strokeWidth={2.4} />
            </button>

            <button
              onClick={() => setPickerOpen(true)}
              className="flex-1 mx-1 text-center text-[14px] font-semibold text-white tap-scale py-2"
              style={{ letterSpacing: "-0.01em" }}
            >
              {bookDisplayName(selectedBook)} {selectedChapter}
              <span className="text-white/40 font-normal ml-1.5">
                · {selectedChapter}/{currentBook?.chapters ?? 1}
              </span>
            </button>

            <button
              onClick={goNext}
              disabled={isAtEnd}
              className="tap-scale w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none"
              style={{ color: "hsl(211 100% 60%)" }}
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" strokeWidth={2.4} />
            </button>
          </div>
        </div>
      </div>

      <PremiumNav />
    </div>
  );
};

export default BibleTranslations;

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ChevronDown, BookOpen, Type, Check, X, List } from "lucide-react";
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

const FONT_SIZES = [16, 18, 20, 23, 26] as const;
const SF = `-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Inter", "Segoe UI", system-ui, sans-serif`;
const SERIF = `"New York", "Charter", "Iowan Old Style", Georgia, serif`;

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
  const [fontSize, setFontSize] = useState<number>(19);

  const [readerOpen, setReaderOpen] = useState(false);
  const [chromeVisible, setChromeVisible] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);

  const readerScrollRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const currentBook = useMemo(() => getBook(selectedBook), [selectedBook]);
  const currentTranslation = useMemo(() => getTranslation(activeTranslation), [activeTranslation]);
  const chapters = useMemo(
    () => (currentBook ? Array.from({ length: currentBook.chapters }, (_, i) => i + 1) : []),
    [currentBook]
  );

  const bookDisplayName = useCallback(
    (slug: string) => {
      const b = getBook(slug);
      if (!b) return slug;
      return language === "es" ? b.es : b.en;
    },
    [language]
  );

  const otBooks = BIBLE_BOOKS.slice(0, 39);
  const ntBooks = BIBLE_BOOKS.slice(39);

  // Load chapter
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
      const el = readerScrollRef.current?.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement | null;
      if (el) el.scrollTop = 0;
    });
    return () => { cancelled = true; };
  }, [selectedBook, selectedChapter, activeTranslation, language, t]);

  // Reading progress (reader)
  useEffect(() => {
    if (!readerOpen) return;
    const el = readerScrollRef.current?.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement | null;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight;
      setReadProgress(max > 0 ? (el.scrollTop / max) * 100 : 0);
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [verses, readerOpen]);

  // ESC closes reader, arrow keys navigate
  useEffect(() => {
    if (!readerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setReaderOpen(false);
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrevious();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readerOpen, selectedBook, selectedChapter]);

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

  // Open reader for a given chapter
  const openReader = (bookSlug?: string, chapter?: number) => {
    if (bookSlug) setSelectedBook(bookSlug);
    if (chapter) setSelectedChapter(chapter);
    setReaderOpen(true);
    setChromeVisible(true);
    setPickerOpen(false);
  };

  // Swipe handlers
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null || touchStartY.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) goNext();
      else goPrevious();
    }
  };

  // ===== BROWSE VIEW =====
  if (!readerOpen) {
    return (
      <div className="min-h-screen flex flex-col page-transition" style={{ fontFamily: SF, background: "hsl(0 0% 4%)" }}>
        {/* iOS large title nav */}
        <header
          className="sticky top-0 z-20"
          style={{
            background: "hsl(0 0% 6% / 0.72)",
            backdropFilter: "saturate(180%) blur(24px)",
            WebkitBackdropFilter: "saturate(180%) blur(24px)",
            borderBottom: "1px solid hsl(0 0% 100% / 0.08)",
          }}
        >
          <div className="px-4 h-12 flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="flex items-center -ml-1 tap-scale" style={{ color: "hsl(211 100% 60%)" }}>
              <ChevronLeft className="w-6 h-6" strokeWidth={2.4} />
              <span className="text-[17px] -ml-1" style={{ letterSpacing: "-0.01em" }}>
                {language === "es" ? "Atrás" : "Back"}
              </span>
            </button>
            <div className="text-[15px] font-semibold text-white/95" style={{ letterSpacing: "-0.01em" }}>
              {language === "es" ? "Biblia" : "Bible"}
            </div>
            <div className="w-12" />
          </div>

          <div className="px-4 pb-3 pt-1">
            <h1 className="text-[34px] font-bold text-white leading-tight" style={{ letterSpacing: "-0.022em" }}>
              {language === "es" ? "Biblia" : "Bible"}
            </h1>
            <p className="text-[13px] text-white/55 mt-0.5">
              {currentTranslation ? (language === "es" ? currentTranslation.fullNameEs : currentTranslation.fullNameEn) : ""}
            </p>
          </div>

          {/* Translation segmented */}
          <div className="px-4 pb-3">
            <div className="grid grid-cols-4 p-[3px] rounded-[10px] gap-[2px]" style={{ background: "hsl(0 0% 100% / 0.08)" }}>
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
                      boxShadow: active ? "0 1px 0 hsl(0 0% 100% / 0.18) inset, 0 2px 6px hsl(0 0% 0% / 0.35)" : "none",
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
          {/* Continue reading card */}
          <button
            onClick={() => openReader()}
            className="tap-scale w-full flex items-center justify-between rounded-[16px] px-4 py-4 mb-6 text-left"
            style={{
              background: "linear-gradient(135deg, hsl(211 100% 55%), hsl(211 100% 40%))",
              boxShadow: "0 14px 36px -12px hsl(211 100% 50% / 0.55), inset 0 1px 0 hsl(0 0% 100% / 0.25)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "hsl(0 0% 100% / 0.2)" }}>
                <BookOpen className="w-5 h-5 text-white" strokeWidth={2.2} />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.08em] text-white/80 font-semibold">
                  {language === "es" ? "Continuar leyendo" : "Continue Reading"}
                </div>
                <div className="text-[17px] font-bold text-white" style={{ letterSpacing: "-0.01em" }}>
                  {bookDisplayName(selectedBook)} {selectedChapter}
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white" />
          </button>

          {/* Books list — Old Testament / New Testament */}
          {[
            { label: language === "es" ? "Antiguo Testamento" : "Old Testament", books: otBooks },
            { label: language === "es" ? "Nuevo Testamento" : "New Testament", books: ntBooks },
          ].map((section) => (
            <div key={section.label} className="mb-7">
              <div className="text-[12px] uppercase tracking-[0.06em] text-white/45 font-semibold px-2 mb-2">
                {section.label}
              </div>
              <div className="rounded-[14px] overflow-hidden" style={{ background: "hsl(0 0% 100% / 0.05)", border: "1px solid hsl(0 0% 100% / 0.06)" }}>
                {section.books.map((book, idx) => (
                  <BookRow
                    key={book.slug}
                    book={book}
                    isFirst={idx === 0}
                    language={language}
                    selectedChapter={book.slug === selectedBook ? selectedChapter : null}
                    onPickChapter={(c) => openReader(book.slug, c)}
                  />
                ))}
              </div>
            </div>
          ))}
        </main>

        <PremiumNav />
      </div>
    );
  }

  // ===== READER VIEW (full-screen immersive) =====
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col animate-fade-in"
      style={{ background: "hsl(0 0% 4%)", fontFamily: SF }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Top bar — auto-hide */}
      <div
        className="absolute top-0 left-0 right-0 z-20 transition-all duration-300"
        style={{
          transform: chromeVisible ? "translateY(0)" : "translateY(-100%)",
          opacity: chromeVisible ? 1 : 0,
          background: "hsl(0 0% 6% / 0.78)",
          backdropFilter: "saturate(180%) blur(24px)",
          WebkitBackdropFilter: "saturate(180%) blur(24px)",
          borderBottom: "1px solid hsl(0 0% 100% / 0.06)",
        }}
      >
        <div className="px-4 h-14 flex items-center justify-between safe-area-top">
          <button
            onClick={() => setReaderOpen(false)}
            className="tap-scale flex items-center gap-1 -ml-1"
            style={{ color: "hsl(211 100% 60%)" }}
            aria-label="Close"
          >
            <X className="w-5 h-5" strokeWidth={2.4} />
            <span className="text-[15px] font-medium">{language === "es" ? "Cerrar" : "Done"}</span>
          </button>

          <div className="text-center">
            <div className="text-[15px] font-semibold text-white" style={{ letterSpacing: "-0.01em" }}>
              {bookDisplayName(selectedBook)} {selectedChapter}
            </div>
            <div className="text-[11px] text-white/45 -mt-0.5">{currentTranslation?.name}</div>
          </div>

          <button
            onClick={() => {
              const i = FONT_SIZES.indexOf(fontSize as any);
              const next = FONT_SIZES[(i + 1) % FONT_SIZES.length];
              setFontSize(next);
            }}
            className="tap-scale w-9 h-9 rounded-full flex items-center justify-center"
            style={{ color: "hsl(211 100% 60%)" }}
            aria-label="Font size"
          >
            <Type className="w-[18px] h-[18px]" strokeWidth={2.2} />
          </button>
        </div>
        {/* Progress */}
        <div className="h-[2px]">
          <div
            className="h-full transition-[width] duration-150"
            style={{ width: `${readProgress}%`, background: "hsl(211 100% 60%)" }}
          />
        </div>
      </div>

      {/* Full-page scripture */}
      <ScrollArea ref={readerScrollRef as any} className="flex-1 h-full">
        <div
          className="min-h-full px-6 max-w-[680px] mx-auto"
          style={{ paddingTop: "92px", paddingBottom: "120px" }}
          onClick={() => setChromeVisible((v) => !v)}
        >
          {/* Chapter heading */}
          <div className="text-center mb-8">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/40 font-semibold mb-2">
              {currentTranslation?.name}
            </div>
            <h2
              className="text-[36px] font-bold text-white"
              style={{ fontFamily: SERIF, letterSpacing: "-0.02em" }}
            >
              {bookDisplayName(selectedBook)} {selectedChapter}
            </h2>
            <div className="flex items-center justify-center gap-2 mt-3 opacity-50">
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-white/40" />
              <span className="text-white/50 text-[10px]">✦</span>
              <span className="h-px w-10 bg-gradient-to-l from-transparent to-white/40" />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 skeleton-shimmer w-[92%]" />
                  <div className="h-4 skeleton-shimmer w-[70%]" />
                </div>
              ))}
            </div>
          ) : verses.length > 0 ? (
            <div>
              {verses.map((text, idx) => {
                const isFirst = idx === 0;
                return (
                  <p
                    key={idx}
                    className="text-white/90"
                    style={{
                      fontFamily: SERIF,
                      fontSize: `${fontSize}px`,
                      lineHeight: 1.7,
                      marginTop: idx === 0 ? 0 : "1rem",
                      letterSpacing: "-0.003em",
                    }}
                  >
                    {isFirst && (
                      <span
                        className="float-left mr-2 mt-1 font-bold text-white"
                        style={{ fontFamily: SERIF, fontSize: `${fontSize * 3.4}px`, lineHeight: 0.85 }}
                      >
                        {text.charAt(0)}
                      </span>
                    )}
                    <sup
                      className="font-semibold mr-1.5 align-super"
                      style={{ color: "hsl(211 100% 60%)", fontSize: "0.62em", fontFamily: SF }}
                    >
                      {idx + 1}
                    </sup>
                    <span>{isFirst ? text.slice(1) : text}</span>
                  </p>
                );
              })}

              <div className="flex items-center justify-center gap-2 mt-10 mb-6 opacity-40">
                <span className="h-px w-12 bg-gradient-to-r from-transparent to-white/40" />
                <span className="text-white/50 text-xs">✦</span>
                <span className="h-px w-12 bg-gradient-to-l from-transparent to-white/40" />
              </div>

              {/* End-of-chapter swipe hint / next */}
              {!isAtEnd && (
                <button
                  onClick={(e) => { e.stopPropagation(); goNext(); }}
                  className="tap-scale w-full text-center py-4 rounded-[14px] mt-2"
                  style={{ background: "hsl(0 0% 100% / 0.05)", border: "1px solid hsl(0 0% 100% / 0.08)" }}
                >
                  <span className="text-[13px] text-white/60">
                    {language === "es" ? "Siguiente capítulo" : "Next chapter"}
                  </span>
                  <div className="text-[15px] font-semibold text-white mt-0.5" style={{ letterSpacing: "-0.01em" }}>
                    {selectedChapter < (currentBook?.chapters ?? 1)
                      ? `${bookDisplayName(selectedBook)} ${selectedChapter + 1}`
                      : (() => {
                          const idx = BIBLE_BOOKS.findIndex((b) => b.slug === selectedBook);
                          const nb = BIBLE_BOOKS[idx + 1];
                          return nb ? `${bookDisplayName(nb.slug)} 1` : "";
                        })()}
                  </div>
                </button>
              )}
            </div>
          ) : (
            <p className="text-white/50 text-center py-10">
              {language === "es" ? "Sin texto disponible" : "No text available"}
            </p>
          )}
        </div>
      </ScrollArea>

      {/* Bottom toolbar — auto-hide */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20 transition-all duration-300 px-3 pb-3"
        style={{
          transform: chromeVisible ? "translateY(0)" : "translateY(120%)",
          opacity: chromeVisible ? 1 : 0,
        }}
      >
        <div
          className="max-w-[700px] mx-auto rounded-full flex items-center justify-between px-2 py-1.5"
          style={{
            background: "hsl(0 0% 12% / 0.78)",
            backdropFilter: "saturate(180%) blur(24px)",
            WebkitBackdropFilter: "saturate(180%) blur(24px)",
            border: "1px solid hsl(0 0% 100% / 0.08)",
            boxShadow: "0 14px 40px -10px hsl(0 0% 0% / 0.7)",
          }}
        >
          <button
            onClick={goPrevious}
            disabled={isAtStart}
            className="tap-scale w-11 h-11 rounded-full flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none"
            style={{ color: "hsl(211 100% 60%)" }}
            aria-label="Previous chapter"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2.4} />
          </button>

          <button
            onClick={() => setPickerOpen(true)}
            className="flex-1 mx-1 flex items-center justify-center gap-2 py-2 tap-scale"
          >
            <List className="w-4 h-4 text-white/70" />
            <span className="text-[14px] font-semibold text-white" style={{ letterSpacing: "-0.01em" }}>
              {bookDisplayName(selectedBook)} {selectedChapter}
            </span>
            <span className="text-[12px] text-white/45">
              {selectedChapter}/{currentBook?.chapters ?? 1}
            </span>
          </button>

          <button
            onClick={goNext}
            disabled={isAtEnd}
            className="tap-scale w-11 h-11 rounded-full flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none"
            style={{ color: "hsl(211 100% 60%)" }}
            aria-label="Next chapter"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={2.4} />
          </button>
        </div>
      </div>

      {/* Chapter picker sheet (within reader) */}
      <Sheet open={pickerOpen} onOpenChange={setPickerOpen}>
        <SheetContent
          side="bottom"
          className="border-0 p-0 rounded-t-[18px] h-[85vh] max-h-[85vh] z-[110]"
          style={{ background: "hsl(0 0% 9%)" }}
        >
          <div className="pt-2 pb-1 flex justify-center">
            <div className="w-9 h-[5px] rounded-full" style={{ background: "hsl(0 0% 100% / 0.25)" }} />
          </div>
          <SheetHeader className="px-5 pt-2 pb-3">
            <SheetTitle className="text-white text-[17px] font-semibold text-center" style={{ fontFamily: SF }}>
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
                  <div className="rounded-[14px] overflow-hidden" style={{ background: "hsl(0 0% 100% / 0.05)" }}>
                    {section.books.map((book, idx) => (
                      <BookRow
                        key={book.slug}
                        book={book}
                        isFirst={idx === 0}
                        language={language}
                        selectedChapter={book.slug === selectedBook ? selectedChapter : null}
                        onPickChapter={(c) => {
                          setSelectedBook(book.slug);
                          setSelectedChapter(c);
                          setPickerOpen(false);
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
};

// === Reusable book row with inline chapter grid ===
const BookRow = ({
  book,
  isFirst,
  language,
  selectedChapter,
  onPickChapter,
}: {
  book: { slug: string; en: string; es: string; chapters: number };
  isFirst: boolean;
  language: string;
  selectedChapter: number | null;
  onPickChapter: (c: number) => void;
}) => {
  const [open, setOpen] = useState(false);
  const isSelected = selectedChapter !== null;

  return (
    <div>
      {!isFirst && <div className="ml-4 h-px" style={{ background: "hsl(0 0% 100% / 0.06)" }} />}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left"
      >
        <span className="text-[16px] text-white" style={{ letterSpacing: "-0.01em" }}>
          {language === "es" ? book.es : book.en}
        </span>
        <div className="flex items-center gap-2">
          {isSelected && (
            <span className="text-[12px] font-semibold" style={{ color: "hsl(211 100% 60%)" }}>
              {selectedChapter}
            </span>
          )}
          <ChevronDown
            className="w-4 h-4 text-white/40 transition-transform duration-200"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </div>
      </button>
      {open && (
        <div className="px-3 pb-4 pt-1 animate-fade-in">
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
            {Array.from({ length: book.chapters }, (_, i) => i + 1).map((c) => {
              const sel = c === selectedChapter;
              return (
                <button
                  key={c}
                  onClick={() => onPickChapter(c)}
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
};

export default BibleTranslations;

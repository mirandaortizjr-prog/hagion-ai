import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, X, Type, List, Lock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { PremiumNav } from "@/components/PremiumNav";
import { useTierAccess } from "@/hooks/useTierAccess";
import {
  SCRIPTURE_TEXTS,
  getScriptureText,
  getScriptureBook,
  loadScriptureChapter,
} from "@/data/scriptures";

const FONT_SIZES = [16, 18, 20, 23, 26] as const;
const SF = `-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Inter", "Segoe UI", system-ui, sans-serif`;
const SERIF = `"New York", "Charter", "Iowan Old Style", Georgia, serif`;

const TIER_FEATURE: Record<string, string> = {
  bookofmormon: "scripture_lds",
  doctrineandcovenants: "scripture_lds",
  pearlofgreatprice: "scripture_lds",
  quran: "scripture_quran",
  bhagavadgita: "scripture_eastern",
  dhammapada: "scripture_eastern",
  // Free, no gating:
  // tanakh, apostolicfathers
};

const ScriptureReader = () => {
  const navigate = useNavigate();
  const { textId } = useParams<{ textId: string }>();
  const { language, t } = useLanguage();
  const { canUse } = useTierAccess();

  const text = useMemo(() => (textId ? getScriptureText(textId) : undefined), [textId]);
  const tr = (en: string, es: string) => (language === "es" ? es : en);

  // Tier gate
  const featureKey = textId ? TIER_FEATURE[textId] ?? "scripture_premium_plus" : "";
  const hasAccess = featureKey ? canUse(featureKey) : true;

  const [selectedBook, setSelectedBook] = useState<string>(text?.books[0]?.slug ?? "");
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [verses, setVerses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [readerOpen, setReaderOpen] = useState(false);
  const [chromeVisible, setChromeVisible] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [fontSize, setFontSize] = useState<number>(19);
  const [readProgress, setReadProgress] = useState(0);

  const readerScrollRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const currentBook = useMemo(
    () => (text ? getScriptureBook(text.id, selectedBook) : undefined),
    [text, selectedBook]
  );
  const chapters = useMemo(
    () => (currentBook ? Array.from({ length: currentBook.chapters }, (_, i) => i + 1) : []),
    [currentBook]
  );
  const unitLabel = currentBook?.unitEn
    ? tr(currentBook.unitEn, currentBook.unitEs ?? currentBook.unitEn)
    : tr("Chapter", "Capítulo");

  // Load chapter
  useEffect(() => {
    if (!text || !selectedBook || !hasAccess) return;
    let cancelled = false;
    setIsLoading(true);
    setReadProgress(0);
    loadScriptureChapter(text.id, selectedBook, selectedChapter, language as "en" | "es")
      .then((data) => { if (!cancelled) setVerses(data); })
      .catch((err) => {
        console.error("Scripture load error:", err);
        if (!cancelled) {
          setVerses([]);
          toast({
            title: t("error"),
            description: tr("Unable to load chapter.", "No se pudo cargar el capítulo."),
            variant: "destructive",
          });
        }
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    requestAnimationFrame(() => {
      const el = readerScrollRef.current?.querySelector(
        "[data-radix-scroll-area-viewport]"
      ) as HTMLElement | null;
      if (el) el.scrollTop = 0;
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text?.id, selectedBook, selectedChapter, hasAccess, language]);

  // Reading progress
  useEffect(() => {
    if (!readerOpen) return;
    const el = readerScrollRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLElement | null;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight;
      setReadProgress(max > 0 ? (el.scrollTop / max) * 100 : 0);
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [verses, readerOpen]);

  // Keyboard nav
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

  if (!text) {
    return (
      <div className="min-h-screen text-foreground flex items-center justify-center">
        <p className="text-muted-foreground">{tr("Text not found.", "Texto no encontrado.")}</p>
      </div>
    );
  }

  // ============== Tier-locked view ==============
  if (!hasAccess) {
    return (
      <div className="min-h-screen text-foreground" style={{ fontFamily: SF }}>
        <div className="px-5 pt-12 pb-24 max-w-2xl mx-auto">
          <button
            onClick={() => navigate("/library")}
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-4 h-4" />
            {tr("Library", "Biblioteca")}
          </button>
          <div
            className="rounded-3xl p-8 border border-white/10"
            style={{
              background: `linear-gradient(135deg, rgba(${text.edge},0.18), rgba(${text.edge},0.04))`,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 20px 60px -25px rgba(${text.edge},0.4)`,
            }}
          >
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-5 backdrop-blur-xl">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="font-playfair text-3xl tracking-tight mb-2">
              {language === "es" ? text.titleEs : text.titleEn}
            </h1>
            <p className="text-[14px] text-white/65 leading-relaxed mb-6">
              {language === "es" ? text.descEs : text.descEn}
            </p>
            <p className="text-[13px] text-white/55 leading-relaxed mb-6">
              {tr(
                "Read this scripture fully offline inside Hagion — included with Premium.",
                "Lee esta escritura sin conexión dentro de Hagion — incluido con Premium."
              )}
            </p>
            <button
              onClick={() => navigate("/premium")}
              className="w-full py-3.5 rounded-xl font-medium text-[15px] transition active:scale-[0.98]"
              style={{
                background: `linear-gradient(135deg, rgba(${text.edge},0.95), rgba(${text.edge},0.75))`,
                color: "#0a0a0a",
              }}
            >
              {tr("Unlock with Premium", "Desbloquear con Premium")}
            </button>
          </div>
        </div>
        <PremiumNav />
      </div>
    );
  }

  // ============== Navigation ==============
  const goPrevious = () => {
    if (selectedChapter > 1) { setSelectedChapter(selectedChapter - 1); return; }
    const idx = text.books.findIndex((b) => b.slug === selectedBook);
    if (idx > 0) {
      const prev = text.books[idx - 1];
      setSelectedBook(prev.slug);
      setSelectedChapter(prev.chapters);
    }
  };
  const goNext = () => {
    if (currentBook && selectedChapter < currentBook.chapters) {
      setSelectedChapter(selectedChapter + 1);
      return;
    }
    const idx = text.books.findIndex((b) => b.slug === selectedBook);
    if (idx >= 0 && idx < text.books.length - 1) {
      setSelectedBook(text.books[idx + 1].slug);
      setSelectedChapter(1);
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const t0 = e.touches[0];
    touchStartX.current = t0.clientX;
    touchStartY.current = t0.clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null || touchStartY.current == null) return;
    const t0 = e.changedTouches[0];
    const dx = t0.clientX - touchStartX.current;
    const dy = t0.clientY - touchStartY.current;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      if (dx < 0) goNext();
      else goPrevious();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const cycleFont = () => {
    const i = FONT_SIZES.indexOf(fontSize as typeof FONT_SIZES[number]);
    setFontSize(FONT_SIZES[(i + 1) % FONT_SIZES.length]);
  };

  const openChapter = (bookSlug: string, ch: number) => {
    setSelectedBook(bookSlug);
    setSelectedChapter(ch);
    setReaderOpen(true);
    setChromeVisible(true);
    setPickerOpen(false);
  };

  const bookNameDisplay = (slug: string) => {
    const b = text.books.find((x) => x.slug === slug);
    if (!b) return slug;
    return language === "es" ? b.nameEs : b.nameEn;
  };

  // ============== Browse view ==============
  return (
    <div className="min-h-screen text-foreground" style={{ fontFamily: SF }}>
      {/* Browse header */}
      <header
        className="sticky top-0 z-30"
        style={{
          background: "hsl(0 0% 6% / 0.78)",
          backdropFilter: "saturate(180%) blur(24px)",
          WebkitBackdropFilter: "saturate(180%) blur(24px)",
          borderBottom: "1px solid hsl(0 0% 100% / 0.08)",
        }}
      >
        <div className="px-4 py-3 flex items-center gap-2 max-w-2xl mx-auto">
          <button
            onClick={() => navigate("/library")}
            className="flex items-center gap-1 text-[15px] text-white/85 hover:text-white -ml-2 px-2 py-1.5 rounded-lg active:bg-white/10"
          >
            <ChevronLeft className="w-5 h-5" />
            {tr("Library", "Biblioteca")}
          </button>
        </div>
        <div className="px-5 pb-4 max-w-2xl mx-auto">
          <h1 className="font-playfair text-[34px] leading-tight tracking-tight">
            {language === "es" ? text.titleEs : text.titleEn}
          </h1>
          <p className="mt-1 text-[13px] text-white/55">
            {language === "es" ? text.descEs : text.descEn}
          </p>
        </div>
      </header>

      <main className="px-4 pt-5 pb-28 max-w-2xl mx-auto">
        <p className="px-2 mb-3 text-[11px] tracking-[0.2em] uppercase text-white/45">
          {tr("Books", "Libros")}
        </p>
        <div className="space-y-2">
          {text.books.map((b) => (
            <BookRow
              key={b.slug}
              nameEn={b.nameEn}
              nameEs={b.nameEs}
              language={language}
              chapters={b.chapters}
              unitLabel={
                b.unitEn ? tr(b.unitEn, b.unitEs ?? b.unitEn) : tr("Chapter", "Capítulo")
              }
              edge={text.edge}
              onPickChapter={(ch) => openChapter(b.slug, ch)}
              isCurrent={b.slug === selectedBook}
              currentChapter={selectedChapter}
            />
          ))}
        </div>
      </main>

      {/* ============== Reader (full-screen overlay) ============== */}
      {readerOpen && (
        <div
          className="fixed inset-0 z-50 text-foreground"
          style={{ background: "hsl(0 0% 4%)", fontFamily: SF }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Top chrome */}
          <div
            className={`absolute top-0 left-0 right-0 z-10 transition-all duration-300 ${
              chromeVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
            }`}
            style={{
              background: "hsl(0 0% 4% / 0.82)",
              backdropFilter: "saturate(180%) blur(24px)",
              WebkitBackdropFilter: "saturate(180%) blur(24px)",
              borderBottom: "1px solid hsl(0 0% 100% / 0.08)",
            }}
          >
            <div className="h-0.5 w-full bg-white/5">
              <div
                className="h-full transition-[width] duration-150"
                style={{
                  width: `${readProgress}%`,
                  background: `linear-gradient(90deg, rgba(${text.edge},0.9), rgba(${text.edge},0.5))`,
                }}
              />
            </div>
            <div className="flex items-center justify-between px-3 py-2.5 max-w-2xl mx-auto">
              <button
                onClick={() => setReaderOpen(false)}
                className="flex items-center gap-1 text-[15px] text-white/85 active:bg-white/10 px-2 py-1.5 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
                {tr("Books", "Libros")}
              </button>
              <button
                onClick={() => setPickerOpen(true)}
                className="text-[15px] font-medium px-3 py-1.5 rounded-full bg-white/[0.08] border border-white/10 active:bg-white/15 flex items-center gap-1.5"
              >
                <List className="w-4 h-4 opacity-70" />
                {bookNameDisplay(selectedBook)} {selectedChapter}
              </button>
              <button
                onClick={cycleFont}
                className="w-9 h-9 rounded-full bg-white/[0.08] border border-white/10 flex items-center justify-center active:bg-white/15"
              >
                <Type className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scripture body */}
          <ScrollArea className="h-full" ref={readerScrollRef}>
            <div
              className="px-6 pt-24 pb-40 max-w-2xl mx-auto"
              onClick={() => setChromeVisible((v) => !v)}
            >
              <p className="text-[11px] tracking-[0.24em] uppercase text-white/40 mb-2">
                {bookNameDisplay(selectedBook)} · {unitLabel} {selectedChapter}
              </p>
              <h2 className="font-playfair text-[28px] leading-tight tracking-tight mb-8">
                {language === "es" ? text.titleEs : text.titleEn}
              </h2>

              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-4 rounded bg-white/5 animate-pulse" style={{ width: `${70 + Math.random() * 28}%` }} />
                  ))}
                </div>
              ) : verses.length === 0 ? (
                <p className="text-white/50 text-[14px]">
                  {tr("No content available.", "Sin contenido disponible.")}
                </p>
              ) : (
                <article
                  style={{
                    fontFamily: SERIF,
                    fontSize: `${fontSize}px`,
                    lineHeight: 1.72,
                    color: "hsl(0 0% 92%)",
                  }}
                >
                  {verses.map((v, i) => (
                    <p key={i} className="mb-4">
                      <sup
                        className="mr-1.5 align-super text-[0.6em] font-semibold tabular-nums"
                        style={{ color: `rgb(${text.edge})`, fontFamily: SF }}
                      >
                        {i + 1}
                      </sup>
                      {i === 0 ? (
                        <>
                          <span
                            className="float-left mr-2 mt-1 leading-[0.85]"
                            style={{
                              fontSize: `${fontSize * 2.6}px`,
                              fontFamily: SERIF,
                              fontWeight: 600,
                              color: `rgb(${text.edge})`,
                            }}
                          >
                            {v.charAt(0)}
                          </span>
                          {v.slice(1)}
                        </>
                      ) : (
                        v
                      )}
                    </p>
                  ))}
                </article>
              )}

              {/* End-of-chapter card */}
              {!isLoading && verses.length > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); goNext(); }}
                  className="mt-10 w-full rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left active:bg-white/[0.08] transition"
                >
                  <p className="text-[11px] tracking-[0.2em] uppercase text-white/45">
                    {tr("Continue reading", "Continuar leyendo")}
                  </p>
                  <p className="mt-1 font-playfair text-[18px] flex items-center justify-between">
                    {currentBook && selectedChapter < currentBook.chapters
                      ? `${bookNameDisplay(selectedBook)} ${selectedChapter + 1}`
                      : tr("Next book", "Siguiente libro")}
                    <ChevronRight className="w-4 h-4 text-white/45" />
                  </p>
                </button>
              )}
            </div>
          </ScrollArea>

          {/* Bottom toolbar */}
          <div
            className={`absolute bottom-5 left-1/2 -translate-x-1/2 z-10 transition-all duration-300 ${
              chromeVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
            }`}
          >
            <div
              className="flex items-center gap-1 px-2 py-2 rounded-full border border-white/12"
              style={{
                background: "hsl(0 0% 8% / 0.82)",
                backdropFilter: "saturate(180%) blur(24px)",
                WebkitBackdropFilter: "saturate(180%) blur(24px)",
                boxShadow: "0 12px 40px -10px rgba(0,0,0,0.6)",
              }}
            >
              <button
                onClick={goPrevious}
                className="w-10 h-10 rounded-full active:bg-white/10 flex items-center justify-center"
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPickerOpen(true)}
                className="px-4 h-10 rounded-full text-[14px] font-medium active:bg-white/10"
              >
                {bookNameDisplay(selectedBook)} {selectedChapter}
              </button>
              <button
                onClick={goNext}
                className="w-10 h-10 rounded-full active:bg-white/10 flex items-center justify-center"
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============== Bottom-sheet picker ============== */}
      <Sheet open={pickerOpen} onOpenChange={setPickerOpen}>
        <SheetContent
          side="bottom"
          className="h-[85vh] rounded-t-3xl border-white/10 p-0 overflow-hidden"
          style={{ background: "hsl(0 0% 7%)" }}
        >
          <div className="pt-2 pb-1 flex items-center justify-center">
            <div className="w-9 h-1 rounded-full bg-white/25" />
          </div>
          <SheetHeader className="px-5 pt-2 pb-3 flex-row items-center justify-between">
            <SheetTitle className="font-playfair text-xl text-left">
              {tr("Choose chapter", "Elige capítulo")}
            </SheetTitle>
            <button
              onClick={() => setPickerOpen(false)}
              className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </SheetHeader>
          <ScrollArea className="h-[calc(85vh-88px)] px-5 pb-8">
            {text.books.map((b) => (
              <BookRow
                key={b.slug}
                nameEn={b.nameEn}
                nameEs={b.nameEs}
                language={language}
                chapters={b.chapters}
                unitLabel={
                  b.unitEn ? tr(b.unitEn, b.unitEs ?? b.unitEn) : tr("Chapter", "Capítulo")
                }
                edge={text.edge}
                onPickChapter={(ch) => openChapter(b.slug, ch)}
                isCurrent={b.slug === selectedBook}
                currentChapter={selectedChapter}
              />
            ))}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {!readerOpen && <PremiumNav />}
    </div>
  );
};

// ============== Book row ==============
function BookRow({
  nameEn,
  nameEs,
  language,
  chapters,
  unitLabel,
  edge,
  onPickChapter,
  isCurrent,
  currentChapter,
}: {
  nameEn: string;
  nameEs: string;
  language: string;
  chapters: number;
  unitLabel: string;
  edge: string;
  onPickChapter: (ch: number) => void;
  isCurrent: boolean;
  currentChapter: number;
}) {
  const [open, setOpen] = useState(false);
  const list = Array.from({ length: chapters }, (_, i) => i + 1);

  return (
    <div
      className="rounded-2xl border border-white/10 overflow-hidden"
      style={{ background: "hsl(0 0% 100% / 0.03)" }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full px-4 py-3.5 flex items-center justify-between active:bg-white/[0.04]"
      >
        <span className="font-playfair text-[16px]">
          {language === "es" ? nameEs : nameEn}
        </span>
        <span className="text-[12px] text-white/45 tabular-nums">
          {chapters} {chapters === 1 ? unitLabel : unitLabel + (language === "es" ? "es" : "s")}
        </span>
      </button>
      {open && (
        <div className="px-3 pb-4 pt-1">
          <div className="grid grid-cols-6 gap-2">
            {list.map((ch) => {
              const active = isCurrent && ch === currentChapter;
              return (
                <button
                  key={ch}
                  onClick={() => onPickChapter(ch)}
                  className="aspect-square rounded-xl text-[14px] font-medium tabular-nums transition active:scale-95"
                  style={{
                    background: active
                      ? `linear-gradient(135deg, rgba(${edge},0.9), rgba(${edge},0.6))`
                      : "hsl(0 0% 100% / 0.05)",
                    color: active ? "#0a0a0a" : "hsl(0 0% 92%)",
                    border: active ? "none" : "1px solid hsl(0 0% 100% / 0.08)",
                  }}
                >
                  {ch}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default ScriptureReader;

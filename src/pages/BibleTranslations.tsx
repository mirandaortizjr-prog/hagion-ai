import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  // Language-aware default translation
  const defaultTranslation: TranslationId = language === "es" ? "rv1960" : "kjv";

  const [activeTranslation, setActiveTranslation] = useState<TranslationId>(defaultTranslation);
  const [selectedBook, setSelectedBook] = useState("genesis");
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [verses, setVerses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
    return () => {
      cancelled = true;
    };
  }, [selectedBook, selectedChapter, activeTranslation, language, t]);

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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/main-menu?tab=hagion-university")}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3BB4F2] to-[#0052D4] flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{t("bible_translations")}</h1>
              <p className="text-sm text-muted-foreground">
                {bookDisplayName(selectedBook)} {selectedChapter}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="space-y-4">
          {/* Translation Tabs */}
          <Tabs
            value={activeTranslation}
            onValueChange={(v) => setActiveTranslation(v as TranslationId)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4 mb-4">
              {TRANSLATIONS.map((tr) => (
                <TabsTrigger key={tr.id} value={tr.id} className="text-xs sm:text-sm">
                  {tr.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Book + Chapter selectors */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">{t("book")}</label>
                  <Select value={selectedBook} onValueChange={(v) => { setSelectedBook(v); setSelectedChapter(1); }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <ScrollArea className="h-[300px]">
                        {BIBLE_BOOKS.map((book) => (
                          <SelectItem key={book.slug} value={book.slug}>
                            {language === "es" ? book.es : book.en}
                          </SelectItem>
                        ))}
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">{t("chapter")}</label>
                  <Select
                    value={selectedChapter.toString()}
                    onValueChange={(val) => setSelectedChapter(parseInt(val))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <ScrollArea className="h-[300px]">
                        {chapters.map((c) => (
                          <SelectItem key={c} value={c.toString()}>
                            {t("chapter")} {c}
                          </SelectItem>
                        ))}
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bible text */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                {bookDisplayName(selectedBook)} {selectedChapter}
              </CardTitle>
              <CardDescription>
                {currentTranslation
                  ? language === "es"
                    ? currentTranslation.fullNameEs
                    : currentTranslation.fullNameEn
                  : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] w-full pr-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full py-20">
                    <div className="text-muted-foreground">{t("loading")}...</div>
                  </div>
                ) : verses.length > 0 ? (
                  <div className="space-y-2">
                    {verses.map((text, idx) => (
                      <p key={idx} className="text-sm leading-relaxed">
                        <span className="font-semibold text-primary mr-2">{idx + 1}</span>
                        <span>{text}</span>
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No text available</p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Nav buttons */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={goPrevious} disabled={isAtStart}>
              {t("previous_chapter")}
            </Button>
            <Button variant="outline" className="flex-1" onClick={goNext} disabled={isAtEnd}>
              {t("next_chapter")}
            </Button>
          </div>
        </div>
      </main>
      <PremiumNav />
    </div>
  );
};

export default BibleTranslations;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, BookOpen, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { PremiumNav } from "@/components/PremiumNav";

const BibleTranslations = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [activeTranslation, setActiveTranslation] = useState("kjv");
  const [selectedBook, setSelectedBook] = useState("Genesis");
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [bibleText, setBibleText] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const translations = [
    {
      id: "kjv",
      name: "KJV",
      fullName: t('kjv_full'),
      description: t('kjv_desc'),
      year: "1611",
      about: t('kjv_about'),
      language: "en",
    },
    {
      id: "web",
      name: "WEB",
      fullName: t('web_full'),
      description: t('web_desc'),
      year: "2000",
      about: t('web_about'),
      language: "en",
    },
    {
      id: "rva",
      name: "RVA",
      fullName: t('rva_full'),
      description: t('rva_desc'),
      year: "2015",
      about: t('rva_about'),
      language: "es",
    },
  ];

  const bibleBooks = [
    // Old Testament
    { name: "Genesis", chapters: 50 },
    { name: "Exodus", chapters: 40 },
    { name: "Leviticus", chapters: 27 },
    { name: "Numbers", chapters: 36 },
    { name: "Deuteronomy", chapters: 34 },
    { name: "Joshua", chapters: 24 },
    { name: "Judges", chapters: 21 },
    { name: "Ruth", chapters: 4 },
    { name: "1 Samuel", chapters: 31 },
    { name: "2 Samuel", chapters: 24 },
    { name: "1 Kings", chapters: 22 },
    { name: "2 Kings", chapters: 25 },
    { name: "1 Chronicles", chapters: 29 },
    { name: "2 Chronicles", chapters: 36 },
    { name: "Ezra", chapters: 10 },
    { name: "Nehemiah", chapters: 13 },
    { name: "Esther", chapters: 10 },
    { name: "Job", chapters: 42 },
    { name: "Psalms", chapters: 150 },
    { name: "Proverbs", chapters: 31 },
    { name: "Ecclesiastes", chapters: 12 },
    { name: "Song of Solomon", chapters: 8 },
    { name: "Isaiah", chapters: 66 },
    { name: "Jeremiah", chapters: 52 },
    { name: "Lamentations", chapters: 5 },
    { name: "Ezekiel", chapters: 48 },
    { name: "Daniel", chapters: 12 },
    { name: "Hosea", chapters: 14 },
    { name: "Joel", chapters: 3 },
    { name: "Amos", chapters: 9 },
    { name: "Obadiah", chapters: 1 },
    { name: "Jonah", chapters: 4 },
    { name: "Micah", chapters: 7 },
    { name: "Nahum", chapters: 3 },
    { name: "Habakkuk", chapters: 3 },
    { name: "Zephaniah", chapters: 3 },
    { name: "Haggai", chapters: 2 },
    { name: "Zechariah", chapters: 14 },
    { name: "Malachi", chapters: 4 },
    // New Testament
    { name: "Matthew", chapters: 28 },
    { name: "Mark", chapters: 16 },
    { name: "Luke", chapters: 24 },
    { name: "John", chapters: 21 },
    { name: "Acts", chapters: 28 },
    { name: "Romans", chapters: 16 },
    { name: "1 Corinthians", chapters: 16 },
    { name: "2 Corinthians", chapters: 13 },
    { name: "Galatians", chapters: 6 },
    { name: "Ephesians", chapters: 6 },
    { name: "Philippians", chapters: 4 },
    { name: "Colossians", chapters: 4 },
    { name: "1 Thessalonians", chapters: 5 },
    { name: "2 Thessalonians", chapters: 3 },
    { name: "1 Timothy", chapters: 6 },
    { name: "2 Timothy", chapters: 4 },
    { name: "Titus", chapters: 3 },
    { name: "Philemon", chapters: 1 },
    { name: "Hebrews", chapters: 13 },
    { name: "James", chapters: 5 },
    { name: "1 Peter", chapters: 5 },
    { name: "2 Peter", chapters: 3 },
    { name: "1 John", chapters: 5 },
    { name: "2 John", chapters: 1 },
    { name: "3 John", chapters: 1 },
    { name: "Jude", chapters: 1 },
    { name: "Revelation", chapters: 22 },
  ];

  const fetchBibleText = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://bible-api.com/${selectedBook}+${selectedChapter}?translation=${activeTranslation}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch Bible text");
      }

      const data = await response.json();
      setBibleText(data.verses || []);
    } catch (error) {
      console.error("Error fetching Bible text:", error);
      toast({
        title: t('error'),
        description: "Unable to load Bible text. Please try again.",
        variant: "destructive",
      });
      setBibleText([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBibleText();
  }, [selectedBook, selectedChapter, activeTranslation]);

  const currentBook = bibleBooks.find(book => book.name === selectedBook);
  const chapters = currentBook ? Array.from({ length: currentBook.chapters }, (_, i) => i + 1) : [];

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
              <h1 className="text-xl font-bold">{t('bible_translations')}</h1>
              <p className="text-sm text-muted-foreground">{selectedBook} {selectedChapter}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="space-y-4">
          {/* Translation Selector */}
          <Tabs value={activeTranslation} onValueChange={setActiveTranslation} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              {translations.map((translation) => (
                <TabsTrigger key={translation.id} value={translation.id}>
                  {translation.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Navigation Controls */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('book')}</label>
                  <Select value={selectedBook} onValueChange={setSelectedBook}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <ScrollArea className="h-[300px]">
                        {bibleBooks.map((book) => (
                          <SelectItem key={book.name} value={book.name}>
                            {book.name}
                          </SelectItem>
                        ))}
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('chapter')}</label>
                  <Select value={selectedChapter.toString()} onValueChange={(val) => setSelectedChapter(parseInt(val))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <ScrollArea className="h-[300px]">
                        {chapters.map((chapter) => (
                          <SelectItem key={chapter} value={chapter.toString()}>
                            {t('chapter')} {chapter}
                          </SelectItem>
                        ))}
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bible Text Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                {selectedBook} {selectedChapter}
              </CardTitle>
              <CardDescription>
                {translations.find(t => t.id === activeTranslation)?.fullName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] w-full">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-muted-foreground">{t('loading')}...</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {bibleText.length > 0 ? (
                      bibleText.map((verse: any) => (
                        <p key={verse.verse} className="text-sm leading-relaxed">
                          <span className="font-semibold text-primary mr-2">{verse.verse}</span>
                          <span>{verse.text}</span>
                        </p>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No text available</p>
                    )}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                if (selectedChapter > 1) {
                  setSelectedChapter(selectedChapter - 1);
                } else {
                  const currentIndex = bibleBooks.findIndex(b => b.name === selectedBook);
                  if (currentIndex > 0) {
                    const prevBook = bibleBooks[currentIndex - 1];
                    setSelectedBook(prevBook.name);
                    setSelectedChapter(prevBook.chapters);
                  }
                }
              }}
              disabled={selectedBook === "Genesis" && selectedChapter === 1}
            >
              {t('previous_chapter')}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                const maxChapters = currentBook?.chapters || 1;
                if (selectedChapter < maxChapters) {
                  setSelectedChapter(selectedChapter + 1);
                } else {
                  const currentIndex = bibleBooks.findIndex(b => b.name === selectedBook);
                  if (currentIndex < bibleBooks.length - 1) {
                    const nextBook = bibleBooks[currentIndex + 1];
                    setSelectedBook(nextBook.name);
                    setSelectedChapter(1);
                  }
                }
              }}
              disabled={selectedBook === "Revelation" && selectedChapter === 22}
            >
              {t('next_chapter')}
            </Button>
          </div>
        </div>
      </main>
      <PremiumNav />
    </div>
  );
};

export default BibleTranslations;

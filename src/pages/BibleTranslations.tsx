import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";

const BibleTranslations = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeTranslation, setActiveTranslation] = useState("asv");

  const translations = [
    {
      id: "asv",
      name: "ASV",
      fullName: t('asv_full'),
      description: t('asv_desc'),
      year: "1901",
      about: t('asv_about'),
    },
    {
      id: "ylt",
      name: "YLT",
      fullName: t('ylt_full'),
      description: t('ylt_desc'),
      year: "1862",
      about: t('ylt_about'),
    },
    {
      id: "web",
      name: "WEB",
      fullName: t('web_full'),
      description: t('web_desc'),
      year: "2000",
      about: t('web_about'),
    },
    {
      id: "kjv",
      name: "KJV",
      fullName: t('kjv_full'),
      description: t('kjv_desc'),
      year: "1611",
      about: t('kjv_about'),
    },
  ];

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
              <p className="text-sm text-muted-foreground">{t('bible_translations_subtitle')}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <Tabs value={activeTranslation} onValueChange={setActiveTranslation} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            {translations.map((translation) => (
              <TabsTrigger key={translation.id} value={translation.id}>
                {translation.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {translations.map((translation) => (
            <TabsContent key={translation.id} value={translation.id}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    {translation.fullName}
                  </CardTitle>
                  <CardDescription>
                    {translation.description} • {t('published_in')} {translation.year}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground">
                      {t('bible_translation_intro')}
                    </p>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <h3 className="font-semibold text-sm">{t('about')} {translation.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {translation.about}
                    </p>
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => window.open(`https://www.biblegateway.com/versions/${translation.name}/`, '_blank')}
                  >
                    {t('read')} {translation.name}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
};

export default BibleTranslations;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const BibleTranslations = () => {
  const navigate = useNavigate();
  const [activeTranslation, setActiveTranslation] = useState("asv");

  const translations = [
    {
      id: "asv",
      name: "ASV",
      fullName: "American Standard Version",
      description: "Closest to original manuscripts among public domain options.",
      year: "1901",
    },
    {
      id: "ylt",
      name: "YLT",
      fullName: "Young's Literal Translation",
      description: "Best for literal study.",
      year: "1862",
    },
    {
      id: "web",
      name: "WEB",
      fullName: "World English Bible",
      description: "Modern, readable, and faithful.",
      year: "2000",
    },
    {
      id: "kjv",
      name: "KJV",
      fullName: "King James Version",
      description: "Legacy-rich and poetic.",
      year: "1611",
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
              <h1 className="text-xl font-bold">Bible Translations</h1>
              <p className="text-sm text-muted-foreground">Choose your preferred translation</p>
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
                    {translation.description} • Published in {translation.year}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground">
                      This translation provides a unique perspective on the Holy Scriptures.
                      Select this version to explore the Bible with {translation.name}'s distinctive approach.
                    </p>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <h3 className="font-semibold text-sm">About {translation.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {translation.id === "asv" && "The ASV aimed to improve upon the King James Version with more accurate translation from the original Hebrew, Aramaic, and Greek texts."}
                      {translation.id === "ylt" && "Young's Literal Translation emphasizes a word-for-word approach, making it invaluable for serious Bible study and understanding the structure of original languages."}
                      {translation.id === "web" && "A modern update of the American Standard Version, the WEB is freely available and offers clear, contemporary English while maintaining accuracy."}
                      {translation.id === "kjv" && "The King James Version has been the most influential English Bible translation for over 400 years, known for its majestic language and literary excellence."}
                    </p>
                  </div>

                  <Button className="w-full" size="lg">
                    Read {translation.name}
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

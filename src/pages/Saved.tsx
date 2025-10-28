import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Trash2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface SavedAnswer {
  id: string;
  content: string;
  question: string;
  voice: string;
  timestamp: number;
}

const Saved = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [savedAnswers, setSavedAnswers] = useState<SavedAnswer[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("saved_answers");
    if (stored) {
      try {
        const answers = JSON.parse(stored);
        setSavedAnswers(answers.sort((a: SavedAnswer, b: SavedAnswer) => b.timestamp - a.timestamp));
      } catch (error) {
        console.error("Failed to load saved answers:", error);
      }
    }
  }, []);

  const handleDelete = (id: string) => {
    const updated = savedAnswers.filter(answer => answer.id !== id);
    setSavedAnswers(updated);
    localStorage.setItem("saved_answers", JSON.stringify(updated));
    toast({
      title: t('deleted'),
      description: t('conversation_deleted'),
    });
  };

  const handleCopy = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      toast({
        title: t('copied'),
        description: t('message_copied_clipboard'),
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: t('failed_copy_message'),
        variant: "destructive",
      });
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const voiceNames: Record<string, string> = {
    elohim: t('elohim'),
    christ: t('christ'),
    "holy-spirit": t('holy_spirit'),
    trinity: t('trinity'),
    "biblical-stories": t('biblical_stories'),
    martyrs: t('martyrs_faith'),
    apologetics: "Miranda-Ortiz",
    science: "Sophia",
    medical: "Asher",
    forensic: "Kenan",
    philosophical: "Thaddeus",
    psychology: "Caleb",
    historical: "Brooke",
    friend: t('friend'),
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center gap-4 px-4 py-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => navigate("/main-menu")}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{t('saved')}</h1>
          <p className="text-sm text-muted-foreground">
            {savedAnswers.length} {savedAnswers.length === 1 ? t('answer_saved') : t('answers_saved')}
          </p>
        </div>
      </header>

      <ScrollArea className="flex-1 px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {savedAnswers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-2">{t('no_saved_answers')}</p>
              <p className="text-sm text-muted-foreground">
                {t('save_favorite_answers')}
              </p>
            </div>
          ) : (
            savedAnswers.map((answer) => (
              <Card key={answer.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-primary">
                        {voiceNames[answer.voice] || answer.voice}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(answer.timestamp)}
                      </span>
                    </div>
                    {answer.question && (
                      <p className="text-sm font-medium text-muted-foreground italic">
                        "{answer.question}"
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {answer.content}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(answer.content, answer.id)}
                    className="gap-2"
                  >
                    {copiedId === answer.id ? (
                      <>
                        <Check className="w-4 h-4" />
                        {t('copied')}
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        {t('copy')}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(answer.id)}
                    className="gap-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t('delete')}
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Saved;

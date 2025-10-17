import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Sparkles, Cross, Wind, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

interface Voice {
  id: string;
  name: string;
  persona: string;
  description: string;
  icon: any;
  color: string;
}

const DivineGuidance = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [selectedContext, setSelectedContext] = useState<string>("");

  const voices: Voice[] = [
    {
      id: "elohim",
      name: t('elohim'),
      persona: t('voice_of_god'),
      description: t('elohim_desc'),
      icon: Sparkles,
      color: "from-blue-600 to-indigo-700",
    },
    {
      id: "emmanuel",
      name: t('christ'),
      persona: t('voice_of_christ'),
      description: t('christ_desc'),
      icon: Cross,
      color: "from-rose-500 to-red-600",
    },
    {
      id: "ruach",
      name: t('holy_spirit'),
      persona: t('voice_of_spirit'),
      description: t('spirit_desc'),
      icon: Wind,
      color: "from-cyan-500 to-teal-600",
    },
    {
      id: "trinity",
      name: t('trinity'),
      persona: t('all_three_as_one'),
      description: t('trinity_desc'),
      icon: Flame,
      color: "from-primary to-accent",
    },
  ];

  const contexts = [
    {
      id: "throne",
      name: t('before_throne'),
      description: t('before_throne_desc'),
    },
    {
      id: "cross",
      name: t('at_cross'),
      description: t('at_cross_desc'),
    },
    {
      id: "spirit",
      name: t('led_by_spirit'),
      description: t('led_by_spirit_desc'),
    },
  ];


  const canStartConversation = selectedVoice && selectedContext;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-white">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/menu")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-secondary">{t('divine_guidance')}</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl font-bold text-secondary mb-3">
            {t('choose_voice')}
          </h2>
          <p className="text-muted-foreground">
            {t('select_voice_context')}
          </p>
        </div>

        <div className="space-y-12">
          <section className="animate-slide-up">
            <h3 className="text-xl font-semibold text-secondary mb-6">{t('divine_voice')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {voices.map((voice) => {
                const Icon = voice.icon;
                const isSelected = selectedVoice === voice.id;
                return (
                  <Card
                    key={voice.id}
                    className={`p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      isSelected
                        ? "border-2 border-primary ring-4 ring-primary/20"
                        : "border-2 hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedVoice(voice.id)}
                  >
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-br from-[#3BB4F2] to-[#0052D4] flex items-center justify-center flex-shrink-0">
                        <div
                          className={`w-full h-full rounded-full bg-gradient-to-br ${voice.color} flex items-center justify-center`}
                        >
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-lg font-bold text-secondary">
                              {voice.name}
                            </h4>
                            <p className="text-sm text-primary font-medium">
                              {voice.persona}
                            </p>
                          </div>
                          {isSelected && (
                            <Badge className="bg-primary">{t('selected')}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {voice.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>

          <section className="animate-slide-up" style={{ animationDelay: "200ms" }}>
            <h3 className="text-xl font-semibold text-secondary mb-6">
              {t('spiritual_context')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {contexts.map((context) => {
                const isSelected = selectedContext === context.id;
                return (
                  <Card
                    key={context.id}
                    className={`p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      isSelected
                        ? "border-2 border-secondary ring-4 ring-secondary/20 bg-secondary/5"
                        : "border-2 hover:border-secondary/50"
                    }`}
                    onClick={() => setSelectedContext(context.id)}
                  >
                    <h4 className="text-lg font-bold text-secondary mb-2">
                      {context.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {context.description}
                    </p>
                  </Card>
                );
              })}
            </div>
          </section>


          <div className="flex justify-center pt-6 animate-slide-up" style={{ animationDelay: "400ms" }}>
            <Button
              size="lg"
              disabled={!canStartConversation}
              onClick={() =>
                navigate(`/chat?voice=${selectedVoice}&context=${selectedContext}`)
              }
              className="bg-gradient-to-r from-primary to-accent text-white px-12 py-6 text-lg font-semibold shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {t('start_conversation')}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DivineGuidance;

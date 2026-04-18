import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Heart, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import holySpirItFire from "@/assets/holy-spirit-fire.png";
import christCross from "@/assets/christ-cross.png";
import elohimSymbol from "@/assets/elohim-symbol.png";
import triuneGod from "@/assets/triune-god.png";
import hagionLogo from "@/assets/hagion-logo.png";
import planOfSalvation from "@/assets/plan-of-salvation.png";
import { BottomNav } from "@/components/BottomNav";

interface Voice {
  id: string;
  name: string;
  persona: string;
  description: string;
  icon: string;
  color: string;
}

const DivineGuidance = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [selectedContext, setSelectedContext] = useState<string>("");
  const [yearlyCount, setYearlyCount] = useState<number>(0);
  const [isAccepting, setIsAccepting] = useState(false);
  const [salvationOpen, setSalvationOpen] = useState(false);

  useEffect(() => {
    fetchYearlyCount();
  }, []);

  const fetchYearlyCount = async () => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const { count, error } = await supabase
      .from('salvation_acceptances')
      .select('*', { count: 'exact', head: true })
      .gte('accepted_at', oneYearAgo.toISOString());

    if (!error && count !== null) {
      setYearlyCount(count);
    }
  };

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('salvation_acceptances')
        .insert({
          user_id: user?.id || null
        });

      if (error) throw error;

      toast({
        title: t('welcome_toast'),
        description: t('decision_recorded'),
      });

      await fetchYearlyCount();
    } catch (error) {
      console.error('Error recording acceptance:', error);
      toast({
        title: t('acceptance_error'),
        description: t('acceptance_error_desc'),
        variant: "destructive",
      });
    } finally {
      setIsAccepting(false);
    }
  };

  const voices: Voice[] = [
    {
      id: "elohim",
      name: t('elohim'),
      persona: t('voice_of_god'),
      description: t('elohim_desc'),
      icon: elohimSymbol,
      color: "from-blue-600 to-indigo-700",
    },
    {
      id: "emmanuel",
      name: t('christ'),
      persona: t('voice_of_christ'),
      description: t('christ_desc'),
      icon: christCross,
      color: "from-rose-500 to-red-600",
    },
    {
      id: "ruach",
      name: t('holy_spirit'),
      persona: t('voice_of_spirit'),
      description: t('spirit_desc'),
      icon: holySpirItFire,
      color: "from-cyan-500 to-teal-600",
    },
    {
      id: "trinity",
      name: t('triune_god'),
      persona: t('all_three_as_one'),
      description: t('trinity_desc'),
      icon: triuneGod,
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
    <div className="min-h-screen blue-sky-gradient">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/main-menu")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <img 
              src={hagionLogo} 
              alt="Hagion AI" 
              className="w-8 h-8 object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-secondary">{t('divine_guidance')}</h1>
          <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
            <Settings className="w-5 h-5" />
          </Button>
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
                      <div className="w-16 h-16 rounded-lg p-0.5 bg-gradient-to-br from-[#3BB4F2] to-[#0052D4] flex items-center justify-center flex-shrink-0">
                        <div
                          className={`w-full h-full rounded-lg bg-black flex items-center justify-center p-2`}
                        >
                          <img src={voice.icon} alt={voice.name} className="w-full h-full object-contain" />
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

          <section className="animate-slide-up mt-12 flex flex-col items-center" style={{ animationDelay: "400ms" }}>
            <button
              type="button"
              onClick={() => setSalvationOpen(true)}
              className="group flex flex-col items-center gap-1.5 focus:outline-none"
              aria-label={t('plan_of_salvation')}
            >
              <div className="w-[clamp(56px,18vw,84px)] h-[clamp(56px,18vw,84px)] rounded-full p-0.5 bg-gradient-to-br from-[#3BB4F2] to-[#0052D4] shadow-[0_8px_30px_-6px_hsl(var(--primary)/0.55)] transition-transform duration-300 group-hover:scale-105 group-active:scale-95">
                <div className="w-full h-full rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center overflow-hidden shadow-[inset_0_-12px_24px_-8px_rgba(0,0,0,0.55)]">
                  <img
                    src={planOfSalvation}
                    alt={t('plan_of_salvation')}
                    className="w-[88%] h-[88%] object-contain"
                    loading="lazy"
                    width={1024}
                    height={1024}
                  />
                </div>
              </div>
              <p className="text-[11px] font-semibold text-center text-white/90 max-w-[110px] leading-tight">
                {t('plan_of_salvation')}
              </p>
              <p className="text-[10px] text-white/60">{t('salvation_tap_to_open')}</p>
            </button>
          </section>

          <Dialog open={salvationOpen} onOpenChange={setSalvationOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-background via-card to-primary/5">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary z-10"></div>

              <DialogHeader className="px-6 pt-6 pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                    <Heart className="w-6 h-6 text-white fill-white" />
                  </div>
                  <div className="min-w-0">
                    <DialogTitle className="text-2xl font-bold text-secondary leading-tight">
                      {t('sal_full_title')}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground mt-1">
                      {t('sal_full_subtitle')}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <ScrollArea className="max-h-[60vh] px-6">
                <div className="space-y-5 text-sm text-muted-foreground leading-relaxed pb-4">
                  <h4 className="font-bold text-secondary text-base">{t('sal_full_h1')}</h4>
                  <p>{t('sal_full_p1')}</p>

                  <h4 className="font-bold text-secondary text-base">{t('sal_full_h2')}</h4>
                  <p>{t('sal_full_p2')}</p>

                  <h4 className="font-bold text-secondary text-base">{t('sal_full_h3')}</h4>
                  <p>{t('sal_full_p3')}</p>

                  <h4 className="font-bold text-secondary text-base">{t('sal_full_h4')}</h4>
                  <p>{t('sal_full_p4')}</p>

                  <h4 className="font-bold text-secondary text-base">{t('sal_full_h5')}</h4>
                  <p>{t('sal_full_p5')}</p>

                  <h4 className="font-bold text-secondary text-base">{t('sal_full_h6')}</h4>
                  <p>{t('sal_full_p6')}</p>

                  <h4 className="font-bold text-secondary text-base">{t('sal_full_h7')}</h4>
                  <p>{t('sal_full_p7')}</p>

                  <div className="border-l-4 border-primary pl-4 my-4 bg-primary/5 py-4 rounded-r">
                    <p className="font-bold text-secondary mb-2">{t('sal_full_decision')}</p>
                    <p>{t('sal_full_decision_p')}</p>
                  </div>

                  <div className="border-2 border-primary/30 rounded-xl p-5 bg-gradient-to-br from-primary/10 to-accent/10">
                    <p className="font-bold text-secondary mb-3 text-base">{t('sal_full_prayer_title')}</p>
                    <p className="italic text-foreground/90">{t('sal_full_prayer')}</p>
                  </div>

                  <p className="font-semibold text-secondary">{t('sal_full_after')}</p>
                </div>
              </ScrollArea>

              <div className="flex items-center justify-between gap-3 px-6 py-4 border-t bg-card/50">
                <Button
                  onClick={handleAccept}
                  disabled={isAccepting}
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  {isAccepting ? t('accepting') : t('accept')}
                </Button>

                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground mb-0.5">{t('acceptances_year')}</p>
                  <p className="text-xl font-bold text-primary">{yearlyCount.toLocaleString()}</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default DivineGuidance;

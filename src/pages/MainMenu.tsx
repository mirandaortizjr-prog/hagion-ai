import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings, MessageCircle, FileText, Clock, Swords, BookOpen, Shield, Scroll, Brain, Heart, Info, Search, Mic, Sparkles } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card } from "@/components/ui/card";
import dailyWisdomIcon from "@/assets/daily-wisdom-icon.png";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import elohimSymbol from "@/assets/elohim-symbol.png";
import christCross from "@/assets/christ-cross.png";
import holySpirItFire from "@/assets/holy-spirit-fire.png";
import triuneGod from "@/assets/triune-god.png";
import faithfulFriendIcon from "@/assets/faithful-friend-icon.png";
import hagionLogo from "@/assets/hagion-logo.png";
import martyrsImage from "@/assets/martyrs-symbol.jpg";
import sophiaImage from "@/assets/sophia-avatar.jpg";
import brookeImage from "@/assets/brooke-avatar.jpg";
import mirandaImage from "@/assets/miranda-avatar.jpg";
import thaddeuSImage from "@/assets/thaddeus-avatar.jpg";
import kenanImage from "@/assets/kenan-avatar.jpg";
import raphaelImage from "@/assets/raphael-avatar.jpg";
import biblicalScrollImage from "@/assets/biblical-scroll.jpg";
import historyChristianityImage from "@/assets/history-christianity.jpg";
import atheistDebateImage from "@/assets/atheist-debate.jpg";
import discernmentFlameImage from "@/assets/discernment-flame.jpg";
import megaphoneIcon from "@/assets/megaphone-icon.png";
import lightbulbIcon from "@/assets/lightbulb-icon.png";
import scrollIcon from "@/assets/scroll-icon.png";
import brainIcon from "@/assets/brain-icon.png";
import shieldIcon from "@/assets/shield-icon.png";
import logicReasoningIcon from "@/assets/logic-reasoning-icon.png";
import martyrsIcon from "@/assets/martyrs-icon.png";
import historyIcon from "@/assets/history-icon.png";
import bibleIcon from "@/assets/bible-icon.png";
import sermonIcon from "@/assets/sermon-icon.png";
import apologeticsIcon from "@/assets/apologetics-icon.png";

const MainMenu = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || "assistants");
  const [yearlyCount, setYearlyCount] = useState<number>(0);
  const [isAccepting, setIsAccepting] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  useEffect(() => {
    if (activeTab === "divine") {
      fetchYearlyCount();
    }
  }, [activeTab]);

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

  const divineGuidance = [
    {
      id: "elohim",
      name: t('elohim'),
      image: elohimSymbol,
      isPro: false,
    },
    {
      id: "christ",
      name: t('christ'),
      image: christCross,
      isPro: false,
    },
    {
      id: "holy-spirit",
      name: t('holy_spirit'),
      image: holySpirItFire,
      isPro: false,
    },
    {
      id: "trinity",
      name: t('triune_god'),
      image: triuneGod,
      isPro: false,
    },
    {
      id: "faithful-friend",
      name: "Faithful Friend",
      image: faithfulFriendIcon,
      isPro: true,
      externalLink: "https://faithfulfriend.app",
    },
  ];


  const storytelling = [
    {
      id: "biblical-stories",
      name: t('biblical_stories'),
      subtitle: "",
      image: biblicalScrollImage,
      icon: undefined,
      borderColor: "border-black",
      isPro: false,
      isSpecial: false,
      type: "storytelling" as const,
    },
    {
      id: "martyrs",
      name: t('martyrs_faith'),
      subtitle: "",
      image: martyrsIcon,
      icon: undefined,
      color: "bg-black",
      isPro: true,
      isSpecial: false,
      type: "storytelling" as const,
    },
    {
      id: "history-christianity",
      name: t('history_christianity'),
      subtitle: "",
      image: historyIcon,
      icon: undefined,
      color: "bg-black",
      isPro: false,
      isSpecial: false,
      type: "storytelling" as const,
    },
    {
      id: "bible-translations",
      name: t('bible_translations'),
      subtitle: "",
      image: bibleIcon,
      icon: undefined,
      color: "bg-black",
      isPro: false,
      isSpecial: false,
      type: "storytelling" as const,
    },
  ];

  const curriculumTracks = [
    {
      id: "foundations",
      name: t('foundations_logos'),
      subtitle: t('foundations_logos_desc'),
      image: lightbulbIcon,
      icon: BookOpen,
      color: "bg-blue-500",
      isPro: false,
      isSpecial: false,
      type: "track" as const,
    },
    {
      id: "fallacies",
      name: t('fallacies_shadows'),
      subtitle: t('fallacies_shadows_desc'),
      image: shieldIcon,
      icon: undefined,
      color: "bg-orange-500",
      isPro: false,
      isSpecial: false,
      type: "track" as const,
    },
    {
      id: "apologetics",
      name: t('apologetics_logic'),
      subtitle: t('apologetics_logic_desc'),
      image: scrollIcon,
      icon: undefined,
      color: "bg-teal-500",
      isPro: true,
      isSpecial: false,
      type: "track" as const,
    },
    {
      id: "witnessing",
      name: t('witnessing_wisdom'),
      subtitle: t('witnessing_wisdom_desc'),
      image: megaphoneIcon,
      icon: undefined,
      color: "bg-blue-500",
      isPro: false,
      isSpecial: false,
      type: "track" as const,
    },
    {
      id: "scripture",
      name: t('logic_scripture'),
      subtitle: t('logic_scripture_desc'),
      image: scrollIcon,
      icon: undefined,
      color: "bg-teal-500",
      isPro: true,
      isSpecial: false,
      type: "track" as const,
    },
    {
      id: "emotional",
      name: t('emotional_logic'),
      subtitle: t('emotional_logic_desc'),
      image: undefined,
      icon: Heart,
      color: "bg-rose-500",
      isPro: false,
      isSpecial: false,
      type: "track" as const,
    },
  ];

  const teachingPaths = [
    {
      id: "apologetics-path",
      name: t('apologetics_path'),
      subtitle: t('apologetics_path_desc'),
      image: shieldIcon,
      icon: undefined,
      color: "bg-blue-500",
      isPro: false,
      isSpecial: false,
      type: "path" as const,
    },
    {
      id: "witnessing-path",
      name: t('witnessing_path'),
      subtitle: t('witnessing_path_desc'),
      image: megaphoneIcon,
      icon: undefined,
      color: "bg-blue-500",
      isPro: false,
      isSpecial: false,
      type: "path" as const,
    },
    {
      id: "logic-path",
      name: t('logic_path'),
      subtitle: t('logic_path_desc'),
      image: brainIcon,
      icon: undefined,
      color: "bg-orange-500",
      isPro: false,
      isSpecial: false,
      type: "path" as const,
    },
    {
      id: "scriptural-path",
      name: t('scriptural_path'),
      subtitle: t('scriptural_path_desc'),
      image: scrollIcon,
      icon: undefined,
      color: "bg-teal-500",
      isPro: false,
      isSpecial: false,
      type: "path" as const,
    },
    {
      id: "ceremonial-path",
      name: t('ceremonial_path'),
      subtitle: t('ceremonial_path_desc'),
      image: undefined,
      icon: Heart,
      color: "bg-rose-500",
      isPro: true,
      isSpecial: false,
      type: "path" as const,
    },
  ];

  const hagionUniversity = [
    {
      id: "daily-wisdom",
      name: t('daily_wisdom'),
      subtitle: "",
      image: dailyWisdomIcon,
      icon: undefined,
      color: "bg-black",
      isPro: false,
      isSpecial: false,
      type: "wisdom" as const,
    },
    ...storytelling,
    {
      id: "curriculum-tracks",
      name: "Logic & Reasoning",
      subtitle: "Structured Learning Paths",
      image: logicReasoningIcon,
      icon: BookOpen,
      color: "bg-black",
      isPro: false,
      isSpecial: false,
      type: "group" as const,
    },
    {
      id: "teaching-paths",
      name: "Apologetics & Witness",
      subtitle: "Specialized Training",
      image: apologeticsIcon,
      icon: undefined,
      color: "bg-black",
      isPro: false,
      isSpecial: false,
      type: "group" as const,
    },
    {
      id: "public-speaking",
      name: "Sermon Lab",
      subtitle: "Sermon Writing & Analysis",
      image: sermonIcon,
      icon: undefined,
      color: "bg-black",
      isPro: false,
      isSpecial: false,
      type: "speaking" as const,
    },
  ];

  const assistants = [
    {
      id: "apologetics-debate",
      name: t('debate_arena'),
      subtitle: t('trial_by_truth'),
      description: t('debate_arena_desc'),
      image: atheistDebateImage,
      isPro: false,
      isSpecial: true,
    },
    {
      id: "discern",
      name: t('discernment'),
      subtitle: t('discernment_subtitle'),
      description: t('discernment_description'),
      image: discernmentFlameImage,
      isPro: false,
      isSpecial: false,
    },
    {
      id: "apologetics",
      name: "Miranda-Ortiz",
      subtitle: t('biblical_apologetics'),
      description: t('apologetics_desc'),
      image: mirandaImage,
      isPro: false,
    },
    {
      id: "science",
      name: "Sophia",
      subtitle: t('science_evidence'),
      description: t('science_desc'),
      image: sophiaImage,
      isPro: true,
    },
    {
      id: "medical",
      name: "Asher",
      subtitle: t('medical_evidence'),
      description: t('medical_desc'),
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop",
      isPro: false,
    },
    {
      id: "forensic",
      name: "Kenan",
      subtitle: t('forensic_evidence'),
      description: t('forensic_desc'),
      image: kenanImage,
      isPro: true,
    },
    {
      id: "philosophical",
      name: "Thaddeus",
      subtitle: t('philosophical_evidence'),
      description: t('philosophical_desc'),
      image: thaddeuSImage,
      isPro: false,
    },
    {
      id: "psychology",
      name: "Caleb",
      subtitle: t('psychological_evidence'),
      description: t('psychological_desc'),
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
      isPro: true,
    },
    {
      id: "historical",
      name: "Brooke",
      subtitle: t('historical_evidence'),
      description: t('historical_desc'),
      image: brookeImage,
      isPro: false,
    },
    {
      id: "artistic",
      name: "J.R. Miranda",
      subtitle: t('artistic_evidence'),
      description: t('artistic_desc'),
      image: raphaelImage,
      isPro: true,
    },
    {
      id: "linguistic",
      name: "Elias",
      subtitle: t('linguistic_evidence'),
      description: t('linguistic_desc'),
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop",
      isPro: false,
    },
    {
      id: "cultural",
      name: "Naomi",
      subtitle: t('cultural_evidence'),
      description: t('cultural_desc'),
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
      isPro: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 border-b">
        <img 
          src={hagionLogo} 
          alt="Hagion AI" 
          className="w-10 h-10 object-contain"
        />
        <h1 className="text-2xl font-bold">Hagion AI</h1>
        <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
          <Settings className="w-6 h-6" />
        </Button>
      </header>

      {/* Tabs */}
      <div className="px-4 pt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-muted/30 h-auto">
            <TabsTrigger value="assistants" className="text-sm py-2">{t('assistants')}</TabsTrigger>
            <TabsTrigger value="divine" className="text-sm py-2">{t('divine_guidance')}</TabsTrigger>
            <TabsTrigger value="hagion-university" className="text-sm py-2 whitespace-normal leading-tight">
              Hagion University Lite
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Grid of Assistants */}
      <div className="flex-1 overflow-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
          {activeTab === "divine" && (
            <>
              {divineGuidance.map((guide) => (
                <div
                  key={guide.id}
                  className="flex flex-col items-center gap-3 cursor-pointer group"
                  onClick={() => {
                    if ((guide as any).externalLink) {
                      window.open((guide as any).externalLink, '_blank');
                    } else if (guide.isPro) {
                      navigate('/premium');
                    } else {
                      navigate(`/divine/${guide.id}`);
                    }
                  }}
                >
                  <div className="relative">
                    <div className="w-20 h-20 rounded-3xl bg-black flex items-center justify-center overflow-hidden">
                      <img
                        src={guide.image}
                        alt={guide.name}
                        className="w-18 h-18 object-contain"
                      />
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          aria-label={`About ${guide.name}`}
                          className="absolute -top-1 -right-1 bg-slate-500 text-white rounded-full p-1 shadow-lg hover:scale-110 transition-transform z-10"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Info className="w-3 h-3" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="max-w-xs" align="end" sideOffset={6} onClick={(e) => e.stopPropagation()}>
                        <p className="text-sm">
                          {guide.id === 'elohim' && t('elohim_info')}
                          {guide.id === 'christ' && t('christ_info')}
                          {guide.id === 'holy-spirit' && t('holy_spirit_info')}
                          {guide.id === 'trinity' && t('trinity_info')}
                          {guide.id === 'faithful-friend' && 'Your personal AI spiritual companion available 24/7. Access deep theological conversations and personalized guidance.'}
                        </p>
                      </PopoverContent>
                    </Popover>
                    {guide.isPro && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span>★</span> PRO
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium leading-tight">{guide.name}</p>
                  </div>
                </div>
              ))}

              {/* Prayer & Testimony Wall Button */}
              <div className="col-span-3 mt-4 mb-2 flex justify-center">
                <Card 
                  className="relative overflow-hidden border-4 border-black blue-sky-gradient hover:opacity-90 transition-all cursor-pointer w-full max-w-md"
                  onClick={() => navigate("/prayer-wall")}
                >
                  <div className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-secondary">Prayer & Testimony Wall</h3>
                      <p className="text-xs text-secondary/80">Share prayers and testimonies with the community</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Plan of Salvation Box */}
              <div className="col-span-3 mt-4 flex justify-center">
                <Card className="relative overflow-hidden border-4 border-black blue-sky-gradient w-full max-w-md">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-black"></div>
                  
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                        <Heart className="w-5 h-5 text-white fill-white" />
                      </div>
                      <h3 className="text-lg font-bold text-secondary">{t('plan_of_salvation')}</h3>
                    </div>

                    <ScrollArea className="h-[200px] pr-2">
                      <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
                        <p className="font-semibold text-secondary">{t('salvation_intro')}</p>
                        <p>{t('salvation_p1')}</p>

                        <p className="font-semibold text-secondary">{t('salvation_changed')}</p>
                        <p>{t('salvation_p2')}</p>

                        <p className="font-semibold text-secondary">{t('salvation_purpose')}</p>
                        <p>{t('salvation_p3')}</p>

                        <p className="font-semibold text-secondary">{t('salvation_mercy')}</p>
                        <p>{t('salvation_p4')}</p>

                        <p className="font-semibold text-secondary">{t('salvation_relationship')}</p>
                        <p>{t('salvation_p5')}</p>

                        <p className="font-semibold text-secondary">{t('salvation_done')}</p>
                        <p>{t('salvation_choice')}</p>

                        <div className="border-l-4 border-black pl-3 my-4 bg-muted py-3 rounded-r">
                          <p className="font-bold text-secondary mb-2">{t('prayer_header')}</p>
                          <p className="italic">{t('salvation_prayer')}</p>
                        </div>

                        <p className="font-semibold text-secondary">{t('welcome_family')}</p>
                        <p>{t('salvation_welcome')}</p>

                        <p>{t('salvation_grow')}</p>

                        <p>{t('salvation_test')}</p>
                      </div>
                    </ScrollArea>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t">
                      <Button
                        onClick={handleAccept}
                        disabled={isAccepting}
                        className="w-full sm:w-auto bg-black hover:bg-black/90 text-white px-6 font-semibold"
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        {isAccepting ? t('accepting') : t('accept')}
                      </Button>
                      
                      <div className="text-center sm:text-right">
                        <p className="text-xs text-muted-foreground">{t('acceptances_year')}</p>
                        <p className="text-xl font-bold text-white">{yearlyCount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </>
          )}


          {/* Assistant Cards */}
          {activeTab === "assistants" && assistants.map((assistant) => (
            <div
              key={assistant.id}
              className="flex flex-col items-center gap-3 cursor-pointer group"
              onClick={() => navigate(`/${assistant.id}`)}
            >
              <div className="relative">
                <div
                  className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#3BB4F2] shadow-lg shadow-[#3BB4F2]/20 group-hover:border-[#0052D4] transition-all"
                >
                  <img
                    src={assistant.image}
                    alt={assistant.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      aria-label={`About ${assistant.name}`}
                      className="absolute -top-1 -right-1 bg-slate-500 text-white rounded-full p-1 shadow-lg hover:scale-110 transition-transform z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Info className="w-3 h-3" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="max-w-xs" align="end" sideOffset={6} onClick={(e) => e.stopPropagation()}>
                    <p className="text-sm">{assistant.description}</p>
                  </PopoverContent>
                </Popover>
                {assistant.isPro && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span>★</span> PRO
                  </div>
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-medium flex items-center justify-center gap-1">
                  {assistant.isSpecial && <Swords className="w-3 h-3 text-primary" />}
                  {assistant.name}
                </p>
                {assistant.subtitle && (
                  <p className="text-xs text-muted-foreground">{assistant.subtitle}</p>
                )}
              </div>
            </div>
          ))}

          {/* Expanded Group View */}
          {activeTab === "hagion-university" && expandedGroup === "curriculum-tracks" && (
            <>
              <div className="col-span-3 mb-4">
                <Button
                  variant="outline"
                  onClick={() => setExpandedGroup(null)}
                  className="w-full"
                >
                  ← Back to Hagion University
                </Button>
              </div>
              {curriculumTracks.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col items-center gap-3 cursor-pointer group"
                  onClick={() => navigate(`/logos-circle/track/${item.id}`)}
                >
                  <div className="relative">
                    <div
                      className={`w-20 h-20 rounded-3xl overflow-hidden flex items-center justify-center ${item.color}`}
                    >
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-12 h-12 object-contain" />
                      ) : item.icon && (
                        <item.icon className="w-10 h-10 text-white" />
                      )}
                    </div>
                    {item.isPro && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span>★</span> PRO
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium leading-tight">{item.name}</p>
                  </div>
                </div>
              ))}
            </>
          )}

          {activeTab === "hagion-university" && expandedGroup === "teaching-paths" && (
            <>
              <div className="col-span-3 mb-4">
                <Button
                  variant="outline"
                  onClick={() => setExpandedGroup(null)}
                  className="w-full"
                >
                  ← Back to Hagion University
                </Button>
              </div>
              {teachingPaths.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col items-center gap-3 cursor-pointer group"
                  onClick={() => navigate(`/logos-circle/path/${item.id}`)}
                >
                  <div className="relative">
                    <div
                      className={`w-20 h-20 rounded-3xl overflow-hidden flex items-center justify-center ${item.color}`}
                    >
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-12 h-12 object-contain" />
                      ) : item.icon && (
                        <item.icon className="w-10 h-10 text-white" />
                      )}
                    </div>
                    {item.isPro && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span>★</span> PRO
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium leading-tight">{item.name}</p>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Hagion University Cards */}
          {activeTab === "hagion-university" && !expandedGroup && (
            <>
              {hagionUniversity.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className="flex flex-col items-center gap-3 cursor-pointer group"
                    onClick={() => {
                      if (item.type === 'storytelling') {
                        if (item.id === 'bible-translations') {
                          navigate('/bible-translations');
                        } else {
                          navigate(`/storytelling/${item.id}`);
                        }
                      } else if (item.type === 'group') {
                        setExpandedGroup(item.id);
                      } else if (item.type === 'speaking') {
                        navigate('/public-speaking');
                      } else if (item.type === 'wisdom') {
                        navigate('/daily-wisdom');
                      }
                    }}
                  >
                    <div className="relative">
                      {item.type === 'storytelling' ? (
                        <div className={`w-20 h-20 rounded-3xl ${item.color ? '' : `border-4 ${(item as any).borderColor || 'border-[#3BB4F2]'}`} ${item.color || ''} shadow-lg ${item.color ? '' : 'shadow-[#3BB4F2]/20 group-hover:border-[#0052D4]'} group-hover:shadow-xl transition-all group-hover:scale-105 flex items-center justify-center overflow-hidden`}>
                          {Icon ? (
                            <div className={`w-full h-full ${item.color ? item.color : 'bg-gradient-to-br from-[#3BB4F2] to-[#0052D4]'} flex items-center justify-center`}>
                              <Icon className="w-10 h-10 text-white" />
                            </div>
                          ) : (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                      ) : (
                        <div className={`w-20 h-20 rounded-3xl ${item.color} shadow-lg group-hover:shadow-xl flex items-center justify-center transition-all group-hover:scale-105 overflow-hidden`}>
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : Icon ? (
                            <Icon className="w-10 h-10 text-white" />
                          ) : null}
                        </div>
                      )}
                      {(item.type === 'storytelling' || item.type === 'wisdom' || item.type === 'group' || item.type === 'speaking') && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              aria-label={`About ${item.name}`}
                              className="absolute -top-1 -right-1 bg-slate-500 text-white rounded-full p-1 shadow-lg hover:scale-110 transition-transform z-10"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Info className="w-3 h-3" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="max-w-xs" align="end" sideOffset={6} onClick={(e) => e.stopPropagation()}>
                            <p className="text-sm">
                              {item.id === 'biblical-stories' && t('biblical_stories_info')}
                              {item.id === 'martyrs' && t('martyrs_faith_info')}
                              {item.id === 'history-christianity' && t('history_christianity_info')}
                              {item.id === 'bible-translations' && t('bible_translations_info')}
                              {item.id === 'daily-wisdom' && t('daily_wisdom_info')}
                              {item.id === 'curriculum-tracks' && t('logic_reasoning_info')}
                              {item.id === 'teaching-paths' && t('apologetics_witness_info')}
                              {item.id === 'public-speaking' && t('sermon_lab_info')}
                            </p>
                          </PopoverContent>
                        </Popover>
                      )}
                      {item.isPro && (
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span>★</span> PRO
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{item.name}</p>
                      {item.subtitle && <p className="text-xs text-muted-foreground">{item.subtitle}</p>}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="flex items-center justify-around px-4 py-3 border-t bg-background">
        <button 
          className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => navigate('/chat')}
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-xs">{t('chat')}</span>
        </button>
        <button 
          className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => navigate('/saved')}
        >
          <FileText className="w-6 h-6" />
          <span className="text-xs">{t('saved')}</span>
        </button>
        <button 
          className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => navigate('/history')}
        >
          <Clock className="w-6 h-6" />
          <span className="text-xs">{t('history')}</span>
        </button>
      </nav>
    </div>
  );
};

export default MainMenu;

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings, MessageCircle, FileText, Clock, Swords, BookOpen, Shield, Scroll, Brain, Heart, Info, Search, Mic, Sparkles, Menu, ArrowLeft } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { PremiumNav } from "@/components/PremiumNav";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import dailyWisdomIcon from "@/assets/daily-wisdom-icon.png";
import planOfSalvation from "@/assets/plan-of-salvation.png";
import prayerWallIcon from "@/assets/prayer-wall-icon.png";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePremium } from "@/contexts/PremiumContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import elohimSymbol from "@/assets/elohim-symbol.png";
import christCross from "@/assets/christ-cross.png";
import holySpirItFire from "@/assets/holy-spirit-fire.png";
import triuneGod from "@/assets/triune-god.png";
import faithfulFriendIcon from "@/assets/faithful-friend-icon.png";
import hagionLogo from "@/assets/hagion-logo.png";
import hagionAiTitle from "@/assets/hagion-ai-title.png";
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
  const { isPremiumPlus } = usePremium();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || "assistants");
  const [yearlyCount, setYearlyCount] = useState<number>(0);
  const [isAccepting, setIsAccepting] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [salvationOpen, setSalvationOpen] = useState(false);

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

  // Intercept hardware/browser back button while Plan of Salvation dialog is open
  useEffect(() => {
    if (!salvationOpen) return;
    window.history.pushState({ salvationOpen: true }, "");
    const handlePopState = () => {
      setSalvationOpen(false);
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [salvationOpen]);

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
      isPro: false,
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
      isPro: false,
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
      isPro: false,
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
      isPro: false,
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
      isSpecial: true,
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
      isPro: false,
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
      isPro: false,
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
      isPro: false,
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
      isPro: false,
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
      isPro: false,
    },
  ];

  return (
    <SidebarProvider>
      <div className="h-screen flex w-full overflow-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header */}
          <header className="flex items-center justify-between px-4 py-4 border-b">
            <SidebarTrigger>
              <Menu className="w-6 h-6" />
            </SidebarTrigger>
            <img src={hagionAiTitle} alt="Hagion AI" className="h-8 sm:h-10 w-auto object-contain drop-shadow-[0_0_12px_hsl(var(--primary)/0.4)]" />
            <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
              <Settings className="w-6 h-6" />
            </Button>
          </header>

      {/* Tabs */}
      <div className="px-4 pt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList
            className={cn(
              "relative w-full grid grid-cols-3 h-auto p-0 gap-2 rounded-none bg-transparent border-0 shadow-none"
            )}
          >

            {[
              { value: "assistants", label: t('assistants') },
              { value: "divine", label: t('divine_guidance') },
              { value: "hagion-university", label: "Hagion University Lite" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  "group relative text-xs sm:text-sm py-2.5 px-2 rounded-xl whitespace-normal leading-tight font-medium",
                  "transition-all duration-300 ease-out active:scale-95",
                  "text-white/70 hover:text-white",
                  "data-[state=active]:text-white data-[state=active]:font-semibold",
                  "data-[state=active]:bg-gradient-to-b data-[state=active]:from-primary/30 data-[state=active]:to-primary/10",
                  "data-[state=active]:shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_4px_16px_-4px_hsl(var(--primary)/0.5)]",
                  "data-[state=active]:drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                )}
              >
                {/* Press-light ripple */}
                <span
                  className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-active:opacity-100 transition-opacity duration-150"
                  style={{
                    background:
                      "radial-gradient(circle at center, hsl(var(--primary) / 0.35), transparent 70%)",
                  }}
                />
                <span className="relative">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Grid of Assistants — fits viewport, no scroll on Assistants/Divine */}
      <div className={cn(
        "flex-1 px-2 sm:px-4 min-h-0",
        activeTab === "hagion-university" ? "overflow-auto pt-8 sm:pt-10 pb-4" :
        activeTab === "divine" ? "overflow-auto pt-8 sm:pt-10 pb-4" :
        "overflow-hidden flex items-center justify-center py-2"
      )}>
        <div className={cn(
          "grid grid-cols-3 max-w-2xl mx-auto w-full",
          activeTab === "hagion-university" || activeTab === "divine"
            ? "gap-x-4 gap-y-6 sm:gap-x-6 sm:gap-y-8"
            : "gap-x-2 gap-y-2 sm:gap-x-4 sm:gap-y-3 h-full content-evenly"
        )}>
          {activeTab === "divine" && (
            <>
              {divineGuidance.map((guide) => (
                <div
                  key={guide.id}
                  className="flex flex-col items-center gap-1.5 cursor-pointer group"
                  onClick={() => {
                    if ((guide as any).externalLink) {
                      // Faithful Friend requires Premium Plus
                      if (isPremiumPlus) {
                        window.open((guide as any).externalLink, '_blank');
                      } else {
                        navigate('/premium');
                      }
                    } else if (guide.isPro) {
                      navigate('/premium');
                    } else {
                      navigate(`/divine/${guide.id}`);
                    }
                  }}
                >
                  <div className="relative">
                    {guide.id === 'faithful-friend' && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-lg z-20 whitespace-nowrap">
                        Bonus App
                      </div>
                    )}
                    <div className="relative w-[clamp(56px,18vw,84px)] h-[clamp(56px,18vw,84px)] rounded-full p-[2px] bg-gradient-to-br from-white/40 via-primary/30 to-accent/40 shadow-[0_10px_30px_-8px_hsl(var(--primary)/0.55),0_0_0_1px_rgba(255,255,255,0.08)] transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_14px_40px_-10px_hsl(var(--primary)/0.75)]">
                      <div className="relative w-full h-full rounded-full bg-black/70 backdrop-blur-xl flex items-center justify-center overflow-hidden ring-1 ring-white/20">
                        {/* Inner top highlight for glass feel */}
                        <span className="pointer-events-none absolute inset-x-2 top-1 h-1/3 rounded-full bg-gradient-to-b from-white/25 to-transparent blur-sm" />
                        <img
                          src={guide.image}
                          alt={guide.name}
                          className="relative w-[88%] h-[88%] object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
                        />
                      </div>
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
                    {guide.isPro && !isPremiumPlus && (
                      <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${guide.id === 'faithful-friend' ? 'bg-sky-500' : 'bg-orange-500'}`}>
                        <span>★</span> PRO
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium leading-tight">{guide.name}</p>
                  </div>
                </div>
              ))}

              {/* Plan of Salvation Circle — placed next to Faithful Friend */}
              <button
                type="button"
                onClick={() => setSalvationOpen(true)}
                className="group flex flex-col items-center gap-1.5 focus:outline-none"
                aria-label={t('plan_of_salvation')}
              >
                <div className="w-[clamp(56px,18vw,84px)] h-[clamp(56px,18vw,84px)] rounded-full p-[2px] bg-gradient-to-br from-[#7DD3FC] via-[#3BB4F2] to-[#0052D4] shadow-[0_8px_22px_-8px_hsl(var(--primary)/0.55)] transition-transform duration-300 group-hover:scale-105 group-active:scale-95 group-hover:shadow-[0_12px_30px_-10px_hsl(var(--primary)/0.75)]">
                  <div className="relative w-full h-full rounded-full overflow-hidden ring-1 ring-white/25 bg-black/40 backdrop-blur-xl">
                    <span className="pointer-events-none absolute inset-x-2 top-1 h-1/3 rounded-full bg-gradient-to-b from-white/30 to-transparent blur-sm z-10" />
                    <img
                      src={planOfSalvation}
                      alt={t('plan_of_salvation')}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
                <p className="text-xs font-medium leading-tight text-center max-w-[110px]">
                  {t('plan_of_salvation')}
                </p>
              </button>

              {/* Prayer & Testimony Wall Circle — placed under Triune God */}
              <button
                type="button"
                onClick={() => navigate("/prayer-wall")}
                className="group flex flex-col items-center gap-1.5 focus:outline-none"
                aria-label="Prayer & Testimony Wall"
              >
                <div className="w-[clamp(56px,18vw,84px)] h-[clamp(56px,18vw,84px)] rounded-full p-[2px] bg-gradient-to-br from-[#7DD3FC] via-[#3BB4F2] to-[#0052D4] shadow-[0_8px_22px_-8px_hsl(var(--primary)/0.55)] transition-transform duration-300 group-hover:scale-105 group-active:scale-95 group-hover:shadow-[0_12px_30px_-10px_hsl(var(--primary)/0.75)]">
                  <div className="relative w-full h-full rounded-full overflow-hidden ring-1 ring-white/25 bg-black/40 backdrop-blur-xl">
                    <span className="pointer-events-none absolute inset-x-2 top-1 h-1/3 rounded-full bg-gradient-to-b from-white/30 to-transparent blur-sm z-10" />
                    <img
                      src={prayerWallIcon}
                      alt="Prayer & Testimony Wall"
                      className="w-full h-full object-cover"
                      loading="lazy"
                      width={1024}
                      height={1024}
                    />
                  </div>
                </div>
                <p className="text-xs font-medium leading-tight text-center max-w-[110px]">
                  Prayer Wall
                </p>
              </button>

              <Dialog open={salvationOpen} onOpenChange={setSalvationOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-background via-card to-primary/5">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary z-10"></div>

                  <DialogHeader className="px-6 pt-6 pb-2">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSalvationOpen(false)}
                        aria-label={t('back') || 'Back'}
                        className="shrink-0 -ml-2"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </Button>
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
            </>
          )}


          {/* Assistant Cards */}
          {activeTab === "assistants" && assistants.map((assistant) => (
            <div
              key={assistant.id}
              className="flex flex-col items-center gap-1.5 cursor-pointer group"
              onClick={() => navigate(`/${assistant.id}`)}
            >
              <div className="relative">
                <div
                  className={cn(
                    "relative rounded-full p-[2px] transition-all duration-300 group-hover:scale-105",
                    "w-[clamp(56px,18vw,84px)] h-[clamp(56px,18vw,84px)]",
                    assistant.id === 'discern'
                      ? "bg-gradient-to-br from-amber-300 via-amber-500 to-orange-600 shadow-[0_8px_22px_-8px_rgba(251,191,36,0.55)] group-hover:shadow-[0_12px_30px_-10px_rgba(251,191,36,0.75)]"
                      : assistant.id === 'apologetics-debate'
                      ? "bg-gradient-to-br from-rose-400 via-red-500 to-red-700 shadow-[0_8px_22px_-8px_rgba(239,68,68,0.55)] group-hover:shadow-[0_12px_30px_-10px_rgba(239,68,68,0.75)]"
                      : "bg-gradient-to-br from-[#7DD3FC] via-[#3BB4F2] to-[#0052D4] shadow-[0_8px_22px_-8px_hsl(var(--primary)/0.55)] group-hover:shadow-[0_12px_30px_-10px_hsl(var(--primary)/0.75)]"
                  )}
                >
                  <div className="relative w-full h-full rounded-full overflow-hidden ring-1 ring-white/25 bg-black/40 backdrop-blur-xl">
                    <span className="pointer-events-none absolute inset-x-2 top-1 h-1/3 rounded-full bg-gradient-to-b from-white/30 to-transparent blur-sm z-10" />
                    <img
                      src={assistant.image}
                      alt={assistant.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_-12px_24px_-8px_rgba(0,0,0,0.55),inset_0_2px_6px_rgba(255,255,255,0.15)]" />
                  </div>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      aria-label={`About ${assistant.name}`}
                      className="absolute -top-1 -right-1 bg-slate-500 text-white rounded-full p-0.5 shadow-lg hover:scale-110 transition-transform z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Info className="w-2.5 h-2.5" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="max-w-xs" align="end" sideOffset={6} onClick={(e) => e.stopPropagation()}>
                    <p className="text-sm">{assistant.description}</p>
                  </PopoverContent>
                </Popover>
                {assistant.isPro && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <span>★</span> PRO
                  </div>
                )}
                {assistant.isSpecial && (
                  <div className={`absolute -top-1.5 left-1/2 -translate-x-1/2 ${
                    assistant.id === 'discern' ? 'bg-amber-500' : 'bg-red-500'
                  } text-white text-[8px] font-semibold px-1.5 py-0.5 rounded-full shadow-lg z-20 whitespace-nowrap`}>
                    {assistant.id === 'discern' ? '🔥 SPECIAL' : '⚔️ SPECIAL'}
                  </div>
                )}
              </div>
              <div className="text-center px-0.5">
                <p className="text-[11px] sm:text-xs font-semibold leading-tight flex items-center justify-center gap-1">
                  {assistant.isSpecial && <Swords className="w-2.5 h-2.5 text-primary" />}
                  {assistant.name}
                </p>
                {assistant.subtitle && (
                  <p className="text-[10px] sm:text-[11px] text-white/70 leading-tight">{assistant.subtitle}</p>
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
                    className="flex flex-col items-center gap-1.5 cursor-pointer group"
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
                      <div
                        className={cn(
                          "relative rounded-full p-[2px] transition-all duration-300 group-hover:scale-105",
                          "w-[clamp(56px,18vw,84px)] h-[clamp(56px,18vw,84px)]",
                          "bg-gradient-to-br from-[#7DD3FC] via-[#3BB4F2] to-[#0052D4]",
                          "shadow-[0_8px_22px_-8px_hsl(var(--primary)/0.55)] group-hover:shadow-[0_12px_30px_-10px_hsl(var(--primary)/0.75)]"
                        )}
                      >
                        <div className="relative w-full h-full rounded-full overflow-hidden ring-1 ring-white/25 bg-black/40 backdrop-blur-xl">
                          <span className="pointer-events-none absolute inset-x-2 top-1 h-1/3 rounded-full bg-gradient-to-b from-white/30 to-transparent blur-sm z-10" />
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : Icon ? (
                            <div className="w-full h-full flex items-center justify-center">
                              <Icon className="w-8 h-8 text-white" />
                            </div>
                          ) : null}
                          <span className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_-12px_24px_-8px_rgba(0,0,0,0.55),inset_0_2px_6px_rgba(255,255,255,0.15)]" />
                        </div>
                      </div>
                      {(item.type === 'storytelling' || item.type === 'wisdom' || item.type === 'group' || item.type === 'speaking') && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              aria-label={`About ${item.name}`}
                              className="absolute -top-1 -right-1 bg-slate-500 text-white rounded-full p-0.5 shadow-lg hover:scale-110 transition-transform z-10"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Info className="w-2.5 h-2.5" />
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
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                          <span>★</span> PRO
                        </div>
                      )}
                    </div>
                    <div className="text-center px-0.5">
                      <p className="text-[11px] sm:text-xs font-semibold leading-tight">{item.name}</p>
                      {item.subtitle && <p className="text-[10px] sm:text-[11px] text-white/70 leading-tight">{item.subtitle}</p>}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      <PremiumNav />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainMenu;

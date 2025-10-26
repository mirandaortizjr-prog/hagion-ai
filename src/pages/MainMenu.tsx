import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings, Plus, MessageCircle, FileText, Clock, Swords, BookOpen, Shield, Scroll, Brain, Heart, Info, ChevronDown, Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import elohimImage from "@/assets/elohim-crown.jpg";
import christImage from "@/assets/christ-thorns.jpg";
import holySpiritImage from "@/assets/holy-spirit-dove.jpg";
import trinityImage from "@/assets/trinity-symbol.jpg";
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

const MainMenu = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || "assistants");
  const [inputValue, setInputValue] = useState("");
  const [openSections, setOpenSections] = useState({
    storytelling: true,
    tracks: true,
    paths: true,
  });
  const [yearlyCount, setYearlyCount] = useState<number>(0);
  const [isAccepting, setIsAccepting] = useState(false);

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
        title: "Welcome to the Family! 🙏",
        description: "Your decision has been recorded. May God bless your journey.",
      });

      await fetchYearlyCount();
    } catch (error) {
      console.error('Error recording acceptance:', error);
      toast({
        title: "Error",
        description: "Could not record your acceptance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAccepting(false);
    }
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const divineGuidance = [
    {
      id: "elohim",
      name: t('elohim'),
      image: elohimImage,
      isPro: false,
    },
    {
      id: "christ",
      name: t('christ'),
      image: christImage,
      isPro: false,
    },
    {
      id: "holy-spirit",
      name: t('holy_spirit'),
      image: holySpiritImage,
      isPro: false,
    },
    {
      id: "trinity",
      name: t('trinity'),
      image: trinityImage,
      isPro: false,
    },
  ];


  const storytelling = [
    {
      id: "biblical-stories",
      name: t('biblical_stories'),
      subtitle: "",
      image: biblicalScrollImage,
      icon: undefined,
      isPro: false,
      isSpecial: false,
      type: "storytelling" as const,
    },
    {
      id: "martyrs",
      name: t('martyrs_faith'),
      subtitle: "",
      image: martyrsImage,
      icon: undefined,
      isPro: true,
      isSpecial: false,
      type: "storytelling" as const,
    },
    {
      id: "history-christianity",
      name: t('history_christianity'),
      subtitle: "",
      image: historyChristianityImage,
      icon: undefined,
      isPro: false,
      isSpecial: false,
      type: "storytelling" as const,
    },
  ];

  const hagionUniversity = [
    ...storytelling,
    // Curriculum Tracks
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
    // Teaching Paths
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

  const assistants = [
    {
      id: "apologetics-debate",
      name: t('debate_arena'),
      subtitle: t('trial_by_truth'),
      description: "Engage in rigorous apologetics debates, defend your faith with logic and scripture against challenging arguments.",
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
      description: "Expert in defending Christian faith through biblical evidence, theological arguments, and scriptural interpretation.",
      image: mirandaImage,
      isPro: false,
    },
    {
      id: "science",
      name: "Sophia",
      subtitle: t('science_evidence'),
      description: "Bridges faith and science, exploring scientific evidence that supports Christian beliefs and biblical truths.",
      image: sophiaImage,
      isPro: true,
    },
    {
      id: "medical",
      name: "Asher",
      subtitle: t('medical_evidence'),
      description: "Analyzes medical miracles, healing testimonies, and health-related biblical principles with scientific rigor.",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop",
      isPro: false,
    },
    {
      id: "forensic",
      name: "Kenan",
      subtitle: t('forensic_evidence'),
      description: "Investigates biblical events and Christian claims through forensic analysis and historical evidence.",
      image: kenanImage,
      isPro: true,
    },
    {
      id: "philosophical",
      name: "Thaddeus",
      subtitle: t('philosophical_evidence'),
      description: "Explores deep philosophical questions about God, existence, morality, and truth through classical and modern philosophy.",
      image: thaddeuSImage,
      isPro: false,
    },
    {
      id: "psychology",
      name: "Caleb",
      subtitle: t('psychological_evidence'),
      description: "Studies the psychological aspects of faith, spiritual development, and the impact of Christianity on mental health.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
      isPro: true,
    },
    {
      id: "historical",
      name: "Brooke",
      subtitle: t('historical_evidence'),
      description: "Chronicles historical evidence for Christianity, examining archaeological findings and ancient documentation.",
      image: brookeImage,
      isPro: false,
    },
    {
      id: "artistic",
      name: "J.R. Miranda",
      subtitle: t('artistic_evidence'),
      description: "Explores how art, beauty, and creativity reflect divine truth and Christian heritage throughout history.",
      image: raphaelImage,
      isPro: true,
    },
    {
      id: "linguistic",
      name: "Elias",
      subtitle: t('linguistic_evidence'),
      description: "Analyzes biblical languages, translation accuracy, and linguistic patterns that reveal deeper scriptural meanings.",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop",
      isPro: false,
    },
    {
      id: "cultural",
      name: "Naomi",
      subtitle: t('cultural_evidence'),
      description: "Studies how Christianity has shaped cultures worldwide and examines cultural contexts of biblical teachings.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
      isPro: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
          <Settings className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold">Hagion AI</h1>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full gap-1"
          onClick={() => navigate("/premium")}
        >
          <span className="text-orange-500">★</span> {t('pro')}
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
                  onClick={() => navigate(`/divine/${guide.id}`)}
                >
                  <div className="relative">
                    <div
                      className={`w-24 h-24 rounded-full overflow-hidden border-4 transition-all ${
                        guide.isPro
                          ? "border-[#3BB4F2] shadow-lg shadow-[#3BB4F2]/20"
                          : "border-yellow-500 shadow-lg shadow-yellow-500/20 group-hover:border-yellow-600"
                      }`}
                    >
                      <img
                        src={guide.image}
                        alt={guide.name}
                        className="w-full h-full object-cover"
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
                        <p className="text-sm">{t('divine_guidance_info')}</p>
                      </PopoverContent>
                    </Popover>
                    {guide.isPro && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span>★</span> PRO
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">{guide.name}</p>
                  </div>
                </div>
              ))}

              {/* Plan of Salvation Box */}
              <div className="col-span-3 mt-4 flex justify-center">
                <Card className="relative overflow-hidden border-4 border-yellow-500 bg-gradient-to-br from-yellow-50 via-white to-yellow-50 w-full max-w-md">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-500"></div>
                  
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center flex-shrink-0">
                        <Heart className="w-5 h-5 text-white fill-white" />
                      </div>
                      <h3 className="text-lg font-bold text-secondary">The Plan of Salvation</h3>
                    </div>

                    <ScrollArea className="h-[400px] pr-2">
                      <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
                        <p className="font-semibold text-secondary">Did you know God created us to be in relationship with Him?</p>
                        <p>He gave us a name and a place in Him. He blessed us with eternal life in a beautiful garden and entrusted us with dominion over all creation on earth. We were designed to walk with Him, know Him intimately, and live in His presence forever.</p>

                        <p className="font-semibold text-secondary">But everything changed with the disobedience of mankind.</p>
                        <p>It wasn't just a bite of fruit or a simple act of rebellion—it was a spiritual exchange. When man gave in to Satan's deception, he didn't merely disobey God; he rejected Him and accepted Satan as king. In doing so, man renounced God's nature and took on the nature of the enemy. Satan, now lord over man, claimed ownership of all that God had given—including man's soul.</p>

                        <p className="font-semibold text-secondary">For thousands of years, God's purpose has remained: to restore that broken relationship.</p>
                        <p>Yet something stood in the way—sin. Sin didn't just separate us from God; it made us His enemies. Not because God turned against us, but because we turned against Him. Sin enslaved us—not just in what we do, but in who we are. We became transgressors by nature, not just by action.</p>

                        <p className="font-semibold text-secondary">But God, in His mercy, gave us Christ.</p>
                        <p>Jesus, the perfect and sinless Son of God, came to pay the price for the sins of the world. His sacrifice didn't just wash away our guilt—it settled our debt and rebuilt the bridge to the Father. Through Christ, anyone can come back into relationship with God.</p>

                        <p className="font-semibold text-secondary">Being a Christian isn't about rituals or religion—it's about relationship.</p>
                        <p>Just as we expect loyalty, love, and care in our relationships, God offers all of that first. He is faithful, loving, and always working for our good. And He invites us to respond—not out of obligation, but out of love. He doesn't demand our devotion; He desires it freely given.</p>

                        <p className="font-semibold text-secondary">God has done everything to rekindle the relationship.</p>
                        <p>Now the choice is yours. Will you receive Him today?</p>

                        <div className="border-l-4 border-yellow-500 pl-3 my-4 bg-yellow-50 py-3 rounded-r">
                          <p className="font-bold text-secondary mb-2">Prayer to Receive Christ</p>
                          <p className="italic">"Lord Jesus, I come to You today because I recognize my need for You. I believe You are the Son of God, that You died for my sins, and that You rose again to give me new life. I confess that I have lived apart from You, and I ask for Your forgiveness. Wash me clean. Restore me. I surrender my heart to You. Be my Savior, my Lord, and my King. Fill me with Your Spirit and teach me to walk with You every day. Thank You for loving me first. Today, I choose You. Amen."</p>
                        </div>

                        <p className="font-semibold text-secondary">Welcome to the Family</p>
                        <p>If you've made this decision and prayed this prayer, we rejoice with you and welcome you into Christ's family—and into our humble Hagion family. You are not alone. You've stepped into a journey of restoration, truth, and love.</p>

                        <p>To help you grow, we encourage you to go to the Discernment icon in the Hagion app. Under "Churches," type in your hometown and state and search for churches with sound doctrine. Join one of our Christian families near you.</p>

                        <p>At Hagion, we lovingly encourage you to test the spirit—not with suspicion, but with wisdom. We provide tools, information, and guidance to help you discern each church's vision and ensure it aligns with the heart of Christ. This is your journey, and we're honored to walk it with you.</p>
                      </div>
                    </ScrollArea>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t">
                      <Button
                        onClick={handleAccept}
                        disabled={isAccepting}
                        className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-6 font-semibold"
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        {isAccepting ? "Recording..." : "Accept"}
                      </Button>
                      
                      <div className="text-center sm:text-right">
                        <p className="text-xs text-muted-foreground">joined as of today</p>
                        <p className="text-xl font-bold text-yellow-600">{yearlyCount.toLocaleString()}</p>
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

          {/* Hagion University Cards */}
          {activeTab === "hagion-university" && (
            <div className="col-span-3 space-y-6">
              {/* Storytelling Section */}
              <Collapsible open={openSections.storytelling} onOpenChange={() => toggleSection("storytelling")}>
                <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-2 bg-muted/50 rounded-lg hover:bg-muted transition-colors group">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Scroll className="w-5 h-5 text-teal-500" />
                    {t('storytelling')}
                  </h3>
                  <ChevronDown className={`w-5 h-5 transition-transform ${openSections.storytelling ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4">
                  <div className="grid grid-cols-3 gap-6">
                    {hagionUniversity.filter(item => item.type === "storytelling").map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.id}
                          className="flex flex-col items-center gap-3 cursor-pointer group"
                          onClick={() => navigate(`/storytelling/${item.id}`)}
                        >
                          <div className="relative">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#3BB4F2] shadow-lg shadow-[#3BB4F2]/20 group-hover:border-[#0052D4] transition-all">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
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
                                </p>
                              </PopoverContent>
                            </Popover>
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
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Curriculum Tracks Section */}
              <Collapsible open={openSections.tracks} onOpenChange={() => toggleSection("tracks")}>
                <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-2 bg-muted/50 rounded-lg hover:bg-muted transition-colors group">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#3BB4F2]" />
                    {t('curriculum_tracks')}
                  </h3>
                  <ChevronDown className={`w-5 h-5 transition-transform ${openSections.tracks ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4">
                  <div className="grid grid-cols-3 gap-6">
                    {hagionUniversity.filter(item => item.type === "track").map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.id}
                          className="flex flex-col items-center gap-3 cursor-pointer group"
                          onClick={() => navigate(`/logos-circle/track/${item.id}`)}
                        >
                          <div className="relative">
                            <div className={`w-20 h-20 rounded-3xl ${item.color} shadow-lg group-hover:shadow-xl flex items-center justify-center transition-all group-hover:scale-105`}>
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="w-12 h-12 object-contain" />
                              ) : Icon ? (
                                <Icon className="w-10 h-10 text-white" />
                              ) : null}
                            </div>
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
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Teaching Paths Section */}
              <Collapsible open={openSections.paths} onOpenChange={() => toggleSection("paths")}>
                <CollapsibleTrigger className="w-full flex items-center justify-between px-4 py-2 bg-muted/50 rounded-lg hover:bg-muted transition-colors group">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Brain className="w-5 h-5 text-[#3BB4F2]" />
                    {t('teaching_paths')}
                  </h3>
                  <ChevronDown className={`w-5 h-5 transition-transform ${openSections.paths ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4">
                  <div className="grid grid-cols-3 gap-6">
                    {hagionUniversity.filter(item => item.type === "path").map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.id}
                          className="flex flex-col items-center gap-3 cursor-pointer group"
                          onClick={() => navigate(`/logos-circle/path/${item.id}`)}
                        >
                          <div className="relative">
                            <div className={`w-20 h-20 rounded-3xl ${item.color} shadow-lg group-hover:shadow-xl flex items-center justify-center transition-all group-hover:scale-105`}>
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="w-12 h-12 object-contain" />
                              ) : Icon ? (
                                <Icon className="w-10 h-10 text-white" />
                              ) : null}
                            </div>
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
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Input */}
      <div className="px-4 py-4 border-t bg-muted/30">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 bg-background rounded-full px-4 py-3 shadow-sm">
            <input
              type="text"
              placeholder={t('ask_question')}
              className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && inputValue.trim()) {
                  navigate('/chat', { state: { question: inputValue } });
                }
              }}
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full h-8 w-8"
              onClick={() => {
                if (inputValue.trim()) {
                  navigate('/chat', { state: { question: inputValue } });
                }
              }}
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
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

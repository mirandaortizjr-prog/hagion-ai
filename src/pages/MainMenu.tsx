import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings, Plus, MessageCircle, FileText, Clock, Swords } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import elohimImage from "@/assets/elohim-crown.jpg";
import christImage from "@/assets/christ-thorns.jpg";
import holySpiritImage from "@/assets/holy-spirit-dove.jpg";
import trinityImage from "@/assets/trinity-symbol.jpg";
import martyrsImage from "@/assets/martyrs-symbol.jpg";
import sophiaImage from "@/assets/sophia-avatar.jpg";
import brookeImage from "@/assets/brooke-avatar.jpg";
import mirandaImage from "@/assets/miranda-avatar.jpg";
import thaddeuSImage from "@/assets/thaddeus-avatar.jpg";
import biblicalScrollImage from "@/assets/biblical-scroll.jpg";

const MainMenu = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("assistants");
  const [inputValue, setInputValue] = useState("");

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
      image: biblicalScrollImage,
      isPro: false,
    },
    {
      id: "martyrs",
      name: t('martyrs_faith'),
      image: martyrsImage,
      isPro: true,
    },
  ];

  const assistants = [
    {
      id: "apologetics-debate",
      name: t('debate_arena'),
      subtitle: t('trial_by_truth'),
      image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=200&h=200&fit=crop",
      isPro: false,
      isSpecial: true,
    },
    {
      id: "apologetics",
      name: "Miranda-Ortiz",
      subtitle: t('biblical_apologetics'),
      image: mirandaImage,
      isPro: false,
    },
    {
      id: "science",
      name: "Sophia",
      subtitle: t('science_evidence'),
      image: sophiaImage,
      isPro: true,
    },
    {
      id: "medical",
      name: "Asher",
      subtitle: t('medical_evidence'),
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop",
      isPro: false,
    },
    {
      id: "forensic",
      name: "Kenan",
      subtitle: t('forensic_evidence'),
      image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=200&h=200&fit=crop",
      isPro: true,
    },
    {
      id: "philosophical",
      name: "Thaddeus",
      subtitle: t('philosophical_evidence'),
      image: thaddeuSImage,
      isPro: false,
    },
    {
      id: "psychology",
      name: "Caleb",
      subtitle: t('psychological_evidence'),
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
      isPro: true,
    },
    {
      id: "historical",
      name: "Brooke",
      subtitle: t('historical_evidence'),
      image: brookeImage,
      isPro: false,
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
          <TabsList className="w-full grid grid-cols-3 bg-muted/30">
            <TabsTrigger value="assistants">{t('assistants')}</TabsTrigger>
            <TabsTrigger value="divine">{t('divine_guidance')}</TabsTrigger>
            <TabsTrigger value="storytelling">{t('storytelling')}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Grid of Assistants */}
      <div className="flex-1 overflow-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
          {/* Divine Guidance Cards */}
          {activeTab === "divine" && divineGuidance.map((guide) => (
            <div
              key={guide.id}
              className="flex flex-col items-center gap-3 cursor-pointer group"
              onClick={() => navigate(`/divine/${guide.id}`)}
            >
              <div className="relative">
                <div
                  className={`w-24 h-24 rounded-full overflow-hidden border-4 transition-all ${
                    guide.isPro
                      ? "border-orange-500 shadow-lg shadow-orange-500/20"
                      : "border-muted group-hover:border-primary"
                  }`}
                >
                  <img
                    src={guide.image}
                    alt={guide.name}
                    className="w-full h-full object-cover"
                  />
                </div>
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

          {/* Assistant Cards */}
          {activeTab === "assistants" && assistants.map((assistant) => (
            <div
              key={assistant.id}
              className="flex flex-col items-center gap-3 cursor-pointer group"
              onClick={() => navigate(`/${assistant.id}`)}
            >
              <div className="relative">
                <div
                  className={`w-24 h-24 rounded-full overflow-hidden border-4 transition-all ${
                    assistant.isPro
                      ? "border-orange-500 shadow-lg shadow-orange-500/20"
                      : assistant.isSpecial
                      ? "border-primary shadow-lg shadow-primary/20 group-hover:shadow-primary/40"
                      : "border-muted group-hover:border-primary"
                  }`}
                >
                  <img
                    src={assistant.image}
                    alt={assistant.name}
                    className="w-full h-full object-cover"
                  />
                </div>
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

          {/* Storytelling Cards */}
          {activeTab === "storytelling" && storytelling.map((story) => (
            <div
              key={story.id}
              className="flex flex-col items-center gap-3 cursor-pointer group"
              onClick={() => navigate(`/storytelling/${story.id}`)}
            >
              <div className="relative">
                <div
                  className={`w-24 h-24 rounded-full overflow-hidden border-4 transition-all ${
                    story.isPro
                      ? "border-orange-500 shadow-lg shadow-orange-500/20"
                      : "border-muted group-hover:border-primary"
                  }`}
                >
                  <img
                    src={story.image}
                    alt={story.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {story.isPro && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span>★</span> PRO
                  </div>
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">{story.name}</p>
              </div>
            </div>
          ))}
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

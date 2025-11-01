import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Shield, MessageSquare, Scroll, Brain, Heart, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import sophiaAvatar from "@/assets/sophia-avatar.jpg";
import raphaelAvatar from "@/assets/raphael-avatar.jpg";
import thaddeuAvatar from "@/assets/thaddeus-avatar.jpg";
import brookeAvatar from "@/assets/brooke-avatar.jpg";
import kenanAvatar from "@/assets/kenan-avatar.jpg";
import mirandaAvatar from "@/assets/miranda-avatar.jpg";

const LogosCircle = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const curriculumTracks = [
    {
      id: "foundations",
      name: t('foundations_logos'),
      description: t('foundations_logos_desc'),
      icon: BookOpen,
      avatar: mirandaAvatar,
      tone: t('tone_grounding'),
      isPro: false,
    },
    {
      id: "fallacies",
      name: t('fallacies_shadows'),
      description: t('fallacies_shadows_desc'),
      icon: Shield,
      avatar: mirandaAvatar,
      tone: t('tone_protective'),
      isPro: false,
    },
    {
      id: "apologetics",
      name: t('apologetics_logic'),
      description: t('apologetics_logic_desc'),
      icon: Scroll,
      avatar: mirandaAvatar,
      tone: t('tone_bold'),
      isPro: true,
    },
    {
      id: "witnessing",
      name: t('witnessing_wisdom'),
      description: t('witnessing_wisdom_desc'),
      icon: MessageSquare,
      avatar: mirandaAvatar,
      tone: t('tone_gentle'),
      isPro: false,
    },
    {
      id: "scripture",
      name: t('logic_scripture'),
      description: t('logic_scripture_desc'),
      icon: Scroll,
      avatar: mirandaAvatar,
      tone: t('tone_mystical'),
      isPro: true,
    },
    {
      id: "emotional",
      name: t('emotional_logic'),
      description: t('emotional_logic_desc'),
      icon: Heart,
      avatar: mirandaAvatar,
      tone: t('tone_reflective'),
      isPro: false,
    },
  ];

  const teachingPaths = [
    {
      id: "apologetics-path",
      name: t('apologetics_path'),
      description: t('apologetics_path_desc'),
      color: "from-[#3BB4F2] to-[#0052D4]",
      icon: Shield,
    },
    {
      id: "witnessing-path",
      name: t('witnessing_path'),
      description: t('witnessing_path_desc'),
      color: "from-blue-500 to-cyan-600",
      icon: MessageSquare,
    },
    {
      id: "logic-path",
      name: t('logic_path'),
      description: t('logic_path_desc'),
      color: "from-amber-500 to-orange-600",
      icon: Brain,
    },
    {
      id: "scriptural-path",
      name: t('scriptural_path'),
      description: t('scriptural_path_desc'),
      color: "from-emerald-500 to-teal-600",
      icon: Scroll,
    },
    {
      id: "ceremonial-path",
      name: t('ceremonial_path'),
      description: t('ceremonial_path_desc'),
      color: "from-rose-500 to-pink-600",
      icon: Heart,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col blue-sky-gradient">
      {/* Header */}
      <header className="flex items-center gap-4 px-4 py-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => navigate("/main-menu?tab=hagion-university")}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{t('hagion_university')}</h1>
          <p className="text-sm text-muted-foreground">{t('logic_sacred_structure')}</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto px-4 py-6">
        <Tabs defaultValue="tracks" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="tracks">{t('curriculum_tracks')}</TabsTrigger>
            <TabsTrigger value="paths">{t('teaching_paths')}</TabsTrigger>
          </TabsList>

          {/* Curriculum Tracks */}
          <TabsContent value="tracks" className="space-y-4">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">{t('curriculum_tracks')}</h2>
              <p className="text-muted-foreground">
                {t('curriculum_tracks_subtitle')}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {curriculumTracks.map((track) => {
                const Icon = track.icon;
                return (
                  <Card
                    key={track.id}
                    className="cursor-pointer hover:shadow-lg transition-all hover:border-[#3BB4F2]/50"
                    onClick={() => navigate(`/logos-circle/track/${track.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative group">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-b from-white/80 to-white/60 dark:from-gray-800/80 dark:to-gray-800/60 border-4 border-[#3BB4F2] flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:border-[#0052D4]">
                              <Icon className="w-10 h-10 text-[#3BB4F2]" />
                            </div>
                          </div>
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              {track.name}
                              {track.isPro && (
                                <span className="text-xs bg-gradient-to-r from-orange-500 to-amber-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                                  ★ PRO
                                </span>
                              )}
                            </CardTitle>
                          </div>
                        </div>
                      </div>
                      <CardDescription className="mt-2">{track.description}</CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Teaching Paths */}
          <TabsContent value="paths" className="space-y-4">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">{t('sanctuary_teaching')}</h2>
              <p className="text-muted-foreground">
                {t('sanctuary_teaching_subtitle')}
              </p>
            </div>

            <div className="grid gap-4">
              {teachingPaths.map((path) => {
                const Icon = path.icon;
                return (
                  <Card
                    key={path.id}
                    className="cursor-pointer hover:shadow-lg transition-all overflow-hidden group"
                    onClick={() => navigate(`/logos-circle/path/${path.id}`)}
                  >
                    <div className={`h-2 bg-gradient-to-r ${path.color}`} />
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-lg bg-gradient-to-br ${path.color} shadow-lg`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl group-hover:text-[#3BB4F2] transition-colors">
                            {path.name}
                          </CardTitle>
                          <CardDescription className="mt-1">{path.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{t('path_includes')}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Path Features */}
            <div className="mt-8 p-6 bg-muted/30 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">{t('what_path_includes')}</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#3BB4F2]/10 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-[#3BB4F2]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{t('structured_lessons')}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => toast.info("Structured lessons provide step-by-step learning paths with organized content, biblical references, and progressive difficulty levels to help you master each topic thoroughly.")}
                      >
                        <Info className="w-4 h-4 text-[#3BB4F2]" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t('structured_lessons_desc')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#3BB4F2]/10 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-[#3BB4F2]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{t('ai_guided_practice')}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => toast.info("AI-guided practice sessions adapt to your learning pace, provide instant feedback, simulate real conversations, and help you develop confidence in applying biblical principles.")}
                      >
                        <Info className="w-4 h-4 text-[#3BB4F2]" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t('ai_guided_practice_desc')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#3BB4F2]/10 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-[#3BB4F2]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{t('emotional_debriefs')}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => toast.info("Emotional debriefs help you process challenging conversations, manage spiritual warfare, maintain healthy boundaries, and grow in compassion while staying grounded in truth.")}
                      >
                        <Info className="w-4 h-4 text-[#3BB4F2]" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t('emotional_debriefs_desc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LogosCircle;

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Shield, MessageSquare, Scroll, Brain, Heart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import sophiaAvatar from "@/assets/sophia-avatar.jpg";
import raphaelAvatar from "@/assets/raphael-avatar.jpg";
import thaddeuAvatar from "@/assets/thaddeus-avatar.jpg";
import brookeAvatar from "@/assets/brooke-avatar.jpg";
import kenanAvatar from "@/assets/kenan-avatar.jpg";
import mirandaAvatar from "@/assets/miranda-avatar.jpg";

const LogosCircle = () => {
  const navigate = useNavigate();

  const curriculumTracks = [
    {
      id: "foundations",
      name: "Foundations of Logos",
      description: "Basic logic principles, deductive/inductive reasoning",
      icon: BookOpen,
      avatar: sophiaAvatar,
      tone: "Grounding, clear",
      isPro: false,
    },
    {
      id: "fallacies",
      name: "Fallacies & Shadows",
      description: "Identifying and ritualizing logical fallacies",
      icon: Shield,
      avatar: raphaelAvatar,
      tone: "Protective, revealing",
      isPro: false,
    },
    {
      id: "apologetics",
      name: "Apologetics Logic",
      description: "Structuring theological arguments",
      icon: Scroll,
      avatar: thaddeuAvatar,
      tone: "Bold, reverent",
      isPro: true,
    },
    {
      id: "witnessing",
      name: "Witnessing with Wisdom",
      description: "Emotional logic, conversational discernment",
      icon: MessageSquare,
      avatar: brookeAvatar,
      tone: "Gentle, strategic",
      isPro: false,
    },
    {
      id: "scripture",
      name: "Logic in Scripture",
      description: "How biblical texts use logic and structure",
      icon: Scroll,
      avatar: kenanAvatar,
      tone: "Mystical, analytical",
      isPro: true,
    },
    {
      id: "emotional",
      name: "Emotional Logic",
      description: "How feelings and truth interact",
      icon: Heart,
      avatar: mirandaAvatar,
      tone: "Reflective, intimate",
      isPro: false,
    },
  ];

  const teachingPaths = [
    {
      id: "apologetics-path",
      name: "Apologetics Path",
      description: "Defend the faith with layered reasoning",
      color: "from-purple-500 to-indigo-600",
      icon: Shield,
    },
    {
      id: "witnessing-path",
      name: "Witnessing Path",
      description: "Learn emotional discernment and conversational clarity",
      color: "from-blue-500 to-cyan-600",
      icon: MessageSquare,
    },
    {
      id: "logic-path",
      name: "Logic Path",
      description: "Build the scaffolding of truth",
      color: "from-amber-500 to-orange-600",
      icon: Brain,
    },
    {
      id: "scriptural-path",
      name: "Scriptural Path",
      description: "Study the structure and rhetoric of biblical texts",
      color: "from-emerald-500 to-teal-600",
      icon: Scroll,
    },
    {
      id: "ceremonial-path",
      name: "Ceremonial Path",
      description: "Learn to ritualize truth through prayer, poetry, and proclamation",
      color: "from-rose-500 to-pink-600",
      icon: Heart,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-4 px-4 py-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => navigate("/main-menu")}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Hagion University</h1>
          <p className="text-sm text-muted-foreground">Logic as Sacred Structure</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto px-4 py-6">
        <Tabs defaultValue="tracks" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="tracks">Curriculum Tracks</TabsTrigger>
            <TabsTrigger value="paths">Teaching Paths</TabsTrigger>
          </TabsList>

          {/* Curriculum Tracks */}
          <TabsContent value="tracks" className="space-y-4">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Curriculum Tracks</h2>
              <p className="text-muted-foreground">
                Learn logic principles, fallacy identification, argument construction, and spiritual reasoning
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {curriculumTracks.map((track) => {
                const Icon = track.icon;
                return (
                  <Card
                    key={track.id}
                    className="cursor-pointer hover:shadow-lg transition-all hover:border-violet-500/50"
                    onClick={() => navigate(`/logos-circle/track/${track.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
                            <Avatar className="relative h-16 w-16 border-2 border-violet-500/20 ring-2 ring-violet-500/10 transition-all duration-300 group-hover:scale-110 group-hover:border-violet-500/40">
                              <AvatarImage src={track.avatar} alt={track.name} className="object-cover" />
                              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600">
                                <Icon className="w-8 h-8 text-white" />
                              </AvatarFallback>
                            </Avatar>
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
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-medium">Tone:</span>
                        <span className="italic">{track.tone}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Interactive Features Section */}
            <div className="mt-8 p-6 bg-muted/30 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Interactive Features</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-violet-500 mt-2" />
                  <div>
                    <p className="font-medium">Logic Toolkits</p>
                    <p className="text-sm text-muted-foreground">
                      Visual breakdowns of argument structures
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-violet-500 mt-2" />
                  <div>
                    <p className="font-medium">Fallacy Ritualizer</p>
                    <p className="text-sm text-muted-foreground">
                      AI detects fallacies and offers poetic corrections
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-violet-500 mt-2" />
                  <div>
                    <p className="font-medium">Debate Builder</p>
                    <p className="text-sm text-muted-foreground">
                      Construct and test arguments against personas
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-violet-500 mt-2" />
                  <div>
                    <p className="font-medium">Trinity Commentary</p>
                    <p className="text-sm text-muted-foreground">
                      Three perspectives on logical reasoning
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-violet-500 mt-2" />
                  <div>
                    <p className="font-medium">Legacy Scrolls</p>
                    <p className="text-sm text-muted-foreground">
                      Save completed lessons as scrolls of reason
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Teaching Paths */}
          <TabsContent value="paths" className="space-y-4">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Sanctuary of Teaching</h2>
              <p className="text-muted-foreground">
                Choose your path through self-guided sanctuaries of learning
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
                          <CardTitle className="text-xl group-hover:text-violet-500 transition-colors">
                            {path.name}
                          </CardTitle>
                          <CardDescription className="mt-1">{path.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Includes: Lessons • Quizzes • AI Practice • Emotional Debriefs</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Path Features */}
            <div className="mt-8 p-6 bg-muted/30 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">What Each Path Includes</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-violet-500" />
                  </div>
                  <div>
                    <p className="font-medium">Structured Lessons</p>
                    <p className="text-sm text-muted-foreground">
                      Progressive curriculum with clear learning objectives
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-violet-500" />
                  </div>
                  <div>
                    <p className="font-medium">AI-Guided Practice</p>
                    <p className="text-sm text-muted-foreground">
                      Interactive exercises with intelligent feedback
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-violet-500" />
                  </div>
                  <div>
                    <p className="font-medium">Emotional Debriefs</p>
                    <p className="text-sm text-muted-foreground">
                      Reflect on how logic connects with your spiritual journey
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

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings, Plus, MessageCircle, FileText, Clock } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MainMenu = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("assistants");

  const assistants = [
    {
      id: "divine",
      name: "Divine Guidance",
      image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=200&h=200&fit=crop",
      isPro: true,
    },
    {
      id: "apologetics",
      name: "Miranda-Ortiz",
      subtitle: "Biblical Apologetics",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
      isPro: false,
    },
    {
      id: "science",
      name: "Sophia",
      subtitle: "Science Evidence",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop",
      isPro: true,
    },
    {
      id: "medical",
      name: "Asher",
      subtitle: "Medical Evidence",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop",
      isPro: false,
    },
    {
      id: "psychology",
      name: "Caleb",
      subtitle: "Psychology",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
      isPro: true,
    },
    {
      id: "historical",
      name: "Brooke",
      subtitle: "Historical Evidence",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
      isPro: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 border-b">
        <Button variant="ghost" size="icon">
          <Settings className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold">Discover</h1>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full gap-1"
          onClick={() => navigate("/premium")}
        >
          <span className="text-orange-500">★</span> PRO
        </Button>
      </header>

      {/* Tabs */}
      <div className="px-4 pt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-4 bg-muted/30">
            <TabsTrigger value="bots">My bots</TabsTrigger>
            <TabsTrigger value="assistants">Assistants</TabsTrigger>
            <TabsTrigger value="prompts">Hot Prompts</TabsTrigger>
            <TabsTrigger value="storytelling">Storytelling</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Grid of Assistants */}
      <div className="flex-1 overflow-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
          {/* Create Assistant Card */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center hover:border-primary transition-colors cursor-pointer">
                <Plus className="w-8 h-8 text-muted-foreground" />
              </div>
            </div>
            <p className="text-center text-sm font-medium">Create your assistant</p>
          </div>

          {/* Assistant Cards */}
          {assistants.map((assistant) => (
            <div
              key={assistant.id}
              className="flex flex-col items-center gap-3 cursor-pointer group"
              onClick={() =>
                assistant.id === "divine"
                  ? navigate("/divine")
                  : navigate(`/${assistant.id}`)
              }
            >
              <div className="relative">
                <div
                  className={`w-24 h-24 rounded-full overflow-hidden border-4 transition-all ${
                    assistant.isPro
                      ? "border-orange-500 shadow-lg shadow-orange-500/20"
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
                <p className="text-sm font-medium">{assistant.name}</p>
                {assistant.subtitle && (
                  <p className="text-xs text-muted-foreground">{assistant.subtitle}</p>
                )}
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
              placeholder="Ask your question"
              className="flex-1 bg-transparent outline-none text-sm"
            />
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="flex items-center justify-around px-4 py-3 border-t bg-background">
        <button className="flex flex-col items-center gap-1">
          <div className="w-6 h-6 rounded-full bg-foreground" />
          <span className="text-xs font-medium">Discover</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-muted-foreground">
          <MessageCircle className="w-6 h-6" />
          <span className="text-xs">Chat</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-muted-foreground">
          <FileText className="w-6 h-6" />
          <span className="text-xs">Prompts</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-muted-foreground">
          <Clock className="w-6 h-6" />
          <span className="text-xs">History</span>
        </button>
      </nav>
    </div>
  );
};

export default MainMenu;

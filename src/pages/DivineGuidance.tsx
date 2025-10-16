import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Sparkles, Cross, Wind, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [selectedContext, setSelectedContext] = useState<string>("");

  const voices: Voice[] = [
    {
      id: "elohim",
      name: "Elohim",
      persona: "The Voice of God",
      description: "Authority, wisdom, sovereignty, and timeless love from the Father's perspective.",
      icon: Sparkles,
      color: "from-blue-600 to-indigo-700",
    },
    {
      id: "emmanuel",
      name: "Emmanuel",
      persona: "The Voice of Christ",
      description: "Compassionate guidance rooted in Jesus' teachings, grace, and mercy.",
      icon: Cross,
      color: "from-rose-500 to-red-600",
    },
    {
      id: "ruach",
      name: "Ruach",
      persona: "The Voice of the Spirit",
      description: "Gentle direction and conviction, inspiring understanding and transformation.",
      icon: Wind,
      color: "from-cyan-500 to-teal-600",
    },
    {
      id: "trinity",
      name: "The Trinity",
      persona: "All Three as One",
      description: "Unified expression of the Father, Son, and Holy Spirit's love and wisdom.",
      icon: Flame,
      color: "from-primary to-accent",
    },
  ];

  const contexts = [
    {
      id: "throne",
      name: "Before the Throne",
      description: "Encounters emphasizing God's sovereignty and majesty",
    },
    {
      id: "cross",
      name: "At the Cross",
      description: "Moments centered on grace, redemption, and sacrifice",
    },
    {
      id: "spirit",
      name: "Led by the Spirit",
      description: "Guidance for ongoing discipleship and transformation",
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
          <h1 className="text-2xl font-bold text-secondary">Divine Guidance</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl font-bold text-secondary mb-3">
            Choose Your Conversation Voice
          </h2>
          <p className="text-muted-foreground">
            Select who you'd like to hear from and the spiritual context for your conversation
          </p>
        </div>

        <div className="space-y-12">
          <section className="animate-slide-up">
            <h3 className="text-xl font-semibold text-secondary mb-6">Divine Voice</h3>
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
                      <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center flex-shrink-0">
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
                            <Badge className="bg-primary">Selected</Badge>
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
              Spiritual Context
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
              Start Conversation
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DivineGuidance;

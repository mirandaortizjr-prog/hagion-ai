import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Book, Shield, Atom, Heart, Brain, Landmark, Crown } from "lucide-react";
import logo from "@/assets/logo.jpg";

const MainMenu = () => {
  const navigate = useNavigate();

  const assistants = [
    {
      id: "divine",
      title: "Divine Guidance",
      description: "Speak with God, Christ, or the Holy Spirit",
      icon: Book,
      gradient: "from-primary to-accent",
    },
    {
      id: "apologetics",
      title: "Apologetics",
      description: "Miranda-Ortiz • Defender of the Faith",
      icon: Shield,
      gradient: "from-secondary to-blue-600",
    },
    {
      id: "science",
      title: "Science Evidence",
      description: "Sophia • God's Design in Nature",
      icon: Atom,
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      id: "medical",
      title: "Medical Evidence",
      description: "Asher • Divine Design in Biology",
      icon: Heart,
      gradient: "from-rose-500 to-pink-600",
    },
    {
      id: "psychology",
      title: "Psychological Evidence",
      description: "Caleb • The Mind of God's Image",
      icon: Brain,
      gradient: "from-purple-500 to-indigo-600",
    },
    {
      id: "historical",
      title: "Historical Evidence",
      description: "Brooke • Faith Through History",
      icon: Landmark,
      gradient: "from-amber-600 to-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-white">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Hagion AI" className="w-10 h-10 rounded-full" />
            <h1 className="text-2xl font-bold text-secondary">Hagion AI</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              3/5 free uses today
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/premium")}
              className="gap-2 border-primary text-primary hover:bg-primary hover:text-white"
            >
              <Crown className="w-4 h-4" />
              Upgrade
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl font-bold text-secondary mb-4">
            Choose Your Spiritual Guide
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Receive biblically-grounded wisdom and guidance through conversational AI,
            rooted in Scripture and designed to strengthen your faith.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {assistants.map((assistant, index) => {
            const Icon = assistant.icon;
            return (
              <Card
                key={assistant.id}
                className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group animate-slide-up border-2 hover:border-primary"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => navigate(`/${assistant.id}`)}
              >
                <div className="flex flex-col items-center text-center gap-4">
                  <div
                    className={`w-16 h-16 rounded-full bg-gradient-to-br ${assistant.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-secondary mb-2">
                      {assistant.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {assistant.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default MainMenu;

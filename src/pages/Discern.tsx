import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Church, Search, BookOpen } from "lucide-react";

const Discern = () => {
  const navigate = useNavigate();

  const discernOptions = [
    {
      id: "churches",
      name: "Churches",
      icon: Church,
      description: "Evaluate individual churches for alignment with the true Christian faith.",
      color: "text-amber-500",
    },
    {
      id: "belief-systems",
      name: "Belief Systems",
      icon: Search,
      description: "Evaluate belief systems, denominations, or religions for theological soundness.",
      color: "text-purple-500",
    },
    {
      id: "texts",
      name: "Religious Texts",
      icon: BookOpen,
      description: "Evaluate sacred or spiritual texts for theological integrity and resonance.",
      color: "text-blue-500",
    },
  ];

  const handleCircleClick = (categoryId: string) => {
    navigate(`/chat?discern=${categoryId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/main-menu")}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-secondary">Discern</h1>
            <p className="text-muted-foreground">Three Circles of Evaluation</p>
          </div>
        </div>

        {/* Description */}
        <Card className="mb-12 border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl">Three Circles of Evaluation</CardTitle>
            <CardDescription>
              Select a category to begin your theological evaluation with our specialized AI assistants.
              Each circle represents a distinct area of discernment.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Three Circles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12 max-w-5xl mx-auto">
          {discernOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleCircleClick(option.id)}
                className="group flex flex-col items-center gap-6 focus:outline-none"
              >
                <div className="relative">
                  {/* Outer ring */}
                  <div className="absolute inset-0 rounded-full border-4 border-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-110" />
                  
                  {/* Main circle */}
                  <div className="w-40 h-40 rounded-full bg-gradient-to-br from-background to-card border-4 border-primary flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                    <Icon className={`w-16 h-16 ${option.color}`} />
                  </div>
                </div>
                
                <div className="text-center">
                  <h3 className="text-xl font-bold text-secondary mb-2">{option.name}</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    {option.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Discern;

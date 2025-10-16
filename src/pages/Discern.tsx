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
      detailedInfo: "Assess specific congregations, ministries, or church organizations against biblical standards. Examine their doctrine, teaching, worship practices, leadership structure, and spiritual fruit. Determine whether they hold to essential Christian truths, practice biblical authority, and demonstrate genuine spiritual transformation.",
      criteria: ["Doctrinal orthodoxy", "Biblical teaching", "Spiritual fruit", "Leadership accountability", "Worship practices"],
      color: "text-amber-500",
    },
    {
      id: "belief-systems",
      name: "Belief Systems",
      icon: Search,
      description: "Evaluate belief systems, denominations, or religions for theological soundness.",
      detailedInfo: "Analyze entire theological frameworks, denominational distinctives, religious movements, or world religions. Compare their core beliefs about God, salvation, Scripture, and humanity against orthodox Christian theology. Identify points of convergence and divergence from biblical truth.",
      criteria: ["View of God & Trinity", "Doctrine of salvation", "Biblical authority", "Christ's deity & work", "Theological consistency"],
      color: "text-purple-500",
    },
    {
      id: "texts",
      name: "Religious Texts",
      icon: BookOpen,
      description: "Evaluate sacred or spiritual texts for theological integrity and resonance.",
      detailedInfo: "Examine religious writings, spiritual books, modern revelations, or extrabiblical texts claiming spiritual authority. Test their claims against Scripture, assess their theological coherence, identify contradictions with biblical revelation, and determine whether they promote truth or deception.",
      criteria: ["Scriptural alignment", "Theological coherence", "Historical accuracy", "Spiritual authority claims", "Internal consistency"],
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
        <Card className="mb-12 border-primary/20 bg-gradient-to-br from-card to-background">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Search className="w-6 h-6 text-primary" />
              Three Circles of Discernment
            </CardTitle>
            <CardDescription className="text-base leading-relaxed mt-3">
              <strong className="text-foreground">Spiritual discernment</strong> is the God-given ability to distinguish truth from deception, 
              light from darkness, and sound doctrine from false teaching. As the Apostle John warned, 
              <em className="text-muted-foreground"> "Beloved, do not believe every spirit, but test the spirits to see whether they are from God" (1 John 4:1)</em>.
            </CardDescription>
            <CardDescription className="text-base leading-relaxed mt-4">
              These three circles represent distinct areas of theological evaluation, each designed to help you 
              examine specific aspects of religious practice, doctrine, and teaching through the lens of biblical truth. 
              Select a category below to begin your in-depth analysis with our specialized AI assistant trained in 
              Christian apologetics, systematic theology, and scriptural interpretation.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Three Circles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-6xl mx-auto">
          {discernOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Card 
                key={option.id}
                className="group flex flex-col overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl cursor-pointer"
                onClick={() => handleCircleClick(option.id)}
              >
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      {/* Outer ring */}
                      <div className="absolute inset-0 rounded-full border-4 border-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-110" />
                      
                      {/* Main circle */}
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-background to-card border-4 border-primary flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                        <Icon className={`w-12 h-12 ${option.color}`} />
                      </div>
                    </div>
                  </div>
                  
                  <CardTitle className="text-xl mb-2">{option.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {option.description}
                  </CardDescription>
                </CardHeader>

                <div className="px-6 pb-6 space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">In-Depth Analysis</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {option.detailedInfo}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Evaluation Criteria</h4>
                    <ul className="space-y-1">
                      {option.criteria.map((criterion, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>{criterion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    onClick={() => handleCircleClick(option.id)}
                  >
                    Begin Evaluation
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Discern;

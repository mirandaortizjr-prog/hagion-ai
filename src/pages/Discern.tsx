import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Church, Search, BookOpen, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Discern = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [subjectName, setSubjectName] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");

  const discernOptions = [
    {
      id: "churches",
      name: "Churches",
      icon: Church,
      description: "Evaluate individual churches for alignment with the true Christian faith.",
      color: "text-blue-500",
      tests: [
        "Creedal and doctrinal alignment",
        "Salvation clarity (grace vs. works)",
        "Emotional atmosphere and fruit",
        "Witness and mission integrity",
        "Leadership humility and restoration culture",
      ],
    },
    {
      id: "belief-systems",
      name: "Belief Systems & Religions",
      icon: Search,
      description: "Evaluate belief systems, denominations, or religions for theological soundness.",
      color: "text-purple-500",
      tests: [
        "Christology (Who is Jesus?)",
        "Trinitarian theology",
        "Path to salvation",
        "Scriptural authority and additions",
        "Cultural fruit and emotional impact",
      ],
    },
    {
      id: "texts",
      name: "Religious Texts & Books",
      icon: BookOpen,
      description: "Evaluate sacred or spiritual texts for theological integrity and resonance.",
      color: "text-amber-500",
      tests: [
        "Alignment with Scripture",
        "Christ-centeredness",
        "Doctrinal clarity or distortion",
        "Emotional and spiritual impact",
        "Historical and canonical context",
      ],
    },
  ];

  const handleStartEvaluation = () => {
    if (selectedCategory && subjectName.trim()) {
      const category = discernOptions.find(opt => opt.id === selectedCategory);
      navigate(`/chat?discern=${selectedCategory}&subject=${encodeURIComponent(subjectName)}&discernContext=${encodeURIComponent(additionalContext)}&categoryName=${encodeURIComponent(category?.name || '')}`);
    }
  };

  const canStartEvaluation = selectedCategory && subjectName.trim().length > 0;

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
        <Card className="mb-8 border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl">How Discernment Works</CardTitle>
            <CardDescription>
              Select a category below to evaluate churches, belief systems, or religious texts
              using biblical and theological criteria. Each evaluation uses a specific framework
              designed to assess spiritual authenticity and doctrinal soundness.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Category Cards */}
        <div className="grid gap-6 mb-8">
          {discernOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedCategory === option.id;
            
            return (
              <Card
                key={option.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  isSelected ? "border-primary border-2 shadow-lg" : "border-border"
                }`}
                onClick={() => setSelectedCategory(option.id)}
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-6 h-6 ${option.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl">{option.name}</CardTitle>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-primary" />}
                      </div>
                      <CardDescription className="mt-1">{option.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <h4 className="text-sm font-semibold text-secondary mb-2">Evaluation Criteria:</h4>
                  <ul className="space-y-2">
                    {option.tests.map((test, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary mt-1">•</span>
                        <span>{test}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Input Form - Only show after category is selected */}
        {selectedCategory && (
          <Card className="mb-8 border-primary/20 animate-fade-in">
            <CardHeader>
              <CardTitle>What would you like to evaluate?</CardTitle>
              <CardDescription>
                Provide the name and any additional context for evaluation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-secondary mb-2 block">
                  Name / Title *
                </label>
                <Input
                  placeholder={
                    selectedCategory === "churches" 
                      ? "e.g., First Baptist Church of Springfield"
                      : selectedCategory === "belief-systems"
                      ? "e.g., Mormonism, Jehovah's Witnesses, Eastern Orthodox"
                      : "e.g., Book of Mormon, Quran, Bhagavad Gita"
                  }
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="text-base"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-secondary mb-2 block">
                  Additional Context (Optional)
                </label>
                <Textarea
                  placeholder="Provide any additional information that might help with the evaluation..."
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  className="min-h-[100px] text-base"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleStartEvaluation}
            disabled={!canStartEvaluation}
            className="px-8"
          >
            Start Evaluation
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Discern;

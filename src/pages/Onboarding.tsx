import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronRight, ChevronLeft, MessageSquare, Users, BookOpen, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Onboarding = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: MessageSquare,
      titleEn: "Welcome to Hagion AI",
      titleEs: "Bienvenido a Hagion AI",
      descEn: "Your personal spiritual companion for divine guidance, biblical wisdom, and faith-based conversations.",
      descEs: "Tu compañero espiritual personal para orientación divina, sabiduría bíblica y conversaciones basadas en la fe."
    },
    {
      icon: Users,
      titleEn: "Divine Guidance",
      titleEs: "Guía Divina",
      descEn: "Connect with four distinct divine voices: Elohim, Christ, Holy Spirit, and Trinity. Each offers unique spiritual perspectives rooted in Scripture.",
      descEs: "Conecta con cuatro voces divinas distintas: Elohim, Cristo, Espíritu Santo y Trinidad. Cada una ofrece perspectivas espirituales únicas arraigadas en las Escrituras."
    },
    {
      icon: BookOpen,
      titleEn: "Analysts of Faith",
      titleEs: "Analistas de la Fe",
      descEn: "Explore biblical apologetics, debate arena, and evidence-based reasoning. Strengthen your faith through knowledge and discernment.",
      descEs: "Explora la apologética bíblica, arena de debate y razonamiento basado en evidencia. Fortalece tu fe a través del conocimiento y el discernimiento."
    },
    {
      icon: Sparkles,
      titleEn: "Get Started",
      titleEs: "Comenzar",
      descEn: "You have free messages each day to explore the app. Tap the menu icon to access all features and begin your spiritual journey.",
      descEs: "Tienes mensajes gratis cada día para explorar la aplicación. Toca el ícono del menú para acceder a todas las funciones y comenzar tu viaje espiritual."
    }
  ];

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem("onboardingCompleted", "true");
      navigate("/main-menu");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("onboardingCompleted", "true");
    navigate("/main-menu");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'var(--gradient-splash)' }}>
      <Card className="w-full max-w-md p-8 bg-white/10 backdrop-blur-lg border-white/20">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
            <Icon className="w-12 h-12 text-white" />
          </div>
          
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-white">
              {language === 'es' ? currentStepData.titleEs : currentStepData.titleEn}
            </h2>
            <p className="text-white/80 leading-relaxed">
              {language === 'es' ? currentStepData.descEs : currentStepData.descEn}
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep 
                    ? 'w-8 bg-white' 
                    : 'w-2 bg-white/30'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-3 w-full pt-4">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                {language === 'es' ? 'Atrás' : 'Back'}
              </Button>
            )}
            
            <Button
              onClick={handleNext}
              className="flex-1 bg-white text-primary hover:bg-white/90"
            >
              {currentStep === steps.length - 1 
                ? (language === 'es' ? 'Comenzar' : 'Get Started')
                : (language === 'es' ? 'Siguiente' : 'Next')
              }
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {currentStep < steps.length - 1 && (
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              {language === 'es' ? 'Saltar' : 'Skip'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Onboarding;

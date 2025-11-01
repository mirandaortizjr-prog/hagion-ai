import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@/assets/faithful-friend-logo.png";

const Splash = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/auth");
    }, 3500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#000000]">
      <div className="text-center animate-fade-in px-4">
        <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 mx-auto">
          <div className="absolute inset-0 animate-glow-pulse" />
          <img
            src={logo}
            alt="Hagion AI"
            className="w-full h-full object-contain animate-scale-in"
          />
        </div>
        <h1 className="mt-6 sm:mt-8 text-3xl sm:text-4xl font-bold text-secondary animate-slide-up">
          Hagion AI
        </h1>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground animate-slide-up">
          {t('divine_wisdom')}
        </p>
      </div>
    </div>
  );
};

export default Splash;

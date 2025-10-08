import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.jpg";

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/menu");
    }, 3500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-white">
      <div className="text-center animate-fade-in">
        <div className="relative">
          <div className="absolute inset-0 animate-glow-pulse rounded-full" />
          <img
            src={logo}
            alt="Hagion AI"
            className="w-48 h-48 mx-auto rounded-full animate-scale-in shadow-2xl"
          />
        </div>
        <h1 className="mt-8 text-4xl font-bold text-secondary animate-slide-up">
          Hagion AI
        </h1>
        <p className="mt-2 text-muted-foreground animate-slide-up">
          Divine Wisdom • Biblical Truth
        </p>
      </div>
    </div>
  );
};

export default Splash;

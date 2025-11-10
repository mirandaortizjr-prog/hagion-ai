import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const useOnboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onboardingCompleted = localStorage.getItem("onboardingCompleted");
    const exemptRoutes = ["/", "/splash", "/onboarding", "/auth"];
    
    // If onboarding not completed and user is not on exempt routes, redirect to onboarding
    if (!onboardingCompleted && !exemptRoutes.includes(location.pathname)) {
      navigate("/onboarding", { replace: true });
    }
  }, [navigate, location]);

  const resetOnboarding = () => {
    localStorage.removeItem("onboardingCompleted");
    navigate("/onboarding");
  };

  return { resetOnboarding };
};

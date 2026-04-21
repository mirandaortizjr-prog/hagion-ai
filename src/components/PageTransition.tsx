import { useLocation } from "react-router-dom";
import { ReactNode } from "react";

/**
 * Wraps route content with a fluid fade + lift + blur transition.
 * Re-keyed on pathname so each navigation re-triggers the animation.
 */
export const PageTransition = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  return (
    <div key={location.pathname} className="page-transition">
      {children}
    </div>
  );
};

export default PageTransition;

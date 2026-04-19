import { useLocation, useNavigate } from "react-router-dom";
import { Home, Globe, Flame, BookOpen, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface NavItem {
  id: string;
  labelEn: string;
  labelEs: string;
  icon: typeof Home;
  path: string;
}

const items: NavItem[] = [
  { id: "home", labelEn: "Home", labelEs: "Inicio", icon: Home, path: "/home" },
  { id: "community", labelEn: "Community", labelEs: "Comunidad", icon: Globe, path: "/community" },
  { id: "discernment", labelEn: "Discernment", labelEs: "Discernimiento", icon: Flame, path: "/discernment" },
  { id: "learning", labelEn: "Learning", labelEs: "Aprendizaje", icon: BookOpen, path: "/learning" },
  { id: "profile", labelEn: "Profile", labelEs: "Perfil", icon: User, path: "/profile" },
];

export const PremiumNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();

  return (
    <>
      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50",
          "border-t border-white/10",
          "bg-black/30 backdrop-blur-2xl backdrop-saturate-150",
          "shadow-[0_-8px_32px_-8px_rgba(0,0,0,0.6)]",
          "overflow-hidden"
        )}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* Animated shimmer sweep */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div
            className="absolute top-0 -left-1/2 h-full w-1/2 nav-shimmer"
            style={{
              background:
                "linear-gradient(110deg, transparent 0%, transparent 30%, rgba(255,255,255,0.10) 45%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0.10) 55%, transparent 70%, transparent 100%)",
            }}
          />
        </div>

        {/* Top highlight line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        <ul className="relative flex items-stretch justify-around px-2 sm:px-4 py-2 max-w-2xl mx-auto">
          {items.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            const label = language === "es" ? item.labelEs : item.labelEn;
            return (
              <li key={item.id} className="flex-1">
                <button
                  type="button"
                  onClick={() => navigate(item.path)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative w-full flex flex-col items-center justify-center gap-1",
                    "py-1.5 px-1 rounded-2xl",
                    "transition-all duration-300 ease-out active:scale-95",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
                    active ? "text-white" : "text-white/55 hover:text-white/90"
                  )}
                >
                  <span
                    className={cn(
                      "relative flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300",
                      active
                        ? "bg-gradient-to-br from-white/30 via-white/10 to-white/5 ring-1 ring-white/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_6px_20px_-4px_rgba(255,255,255,0.25)]"
                        : "bg-white/[0.04] ring-1 ring-white/10 group-hover:bg-white/10"
                    )}
                  >
                    <Icon
                      strokeWidth={active ? 2.4 : 1.9}
                      className={cn(
                        "w-[18px] h-[18px] transition-all duration-300",
                        active && "drop-shadow-[0_0_6px_rgba(255,255,255,0.55)] scale-110"
                      )}
                    />
                  </span>
                  <span
                    className={cn(
                      "text-[10px] sm:text-[11px] leading-none tracking-[0.04em] font-playfair transition-all",
                      active ? "font-semibold" : "font-medium"
                    )}
                  >
                    {label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Spacer */}
      <div
        aria-hidden
        className="w-full"
        style={{ height: "calc(64px + env(safe-area-inset-top))" }}
      />
    </>
  );
};

export default PremiumNav;

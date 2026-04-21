import { useLocation, useNavigate } from "react-router-dom";
import { Home as HomeIcon, MessageCircle, Bookmark, History as HistoryIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useHaptics } from "@/hooks/useNativeFeatures";
import { cn } from "@/lib/utils";

interface BottomNavItem {
  id: string;
  labelKey: string;
  icon: typeof MessageCircle;
  path: string;
}

const items: BottomNavItem[] = [
  { id: "home", labelKey: "home", icon: HomeIcon, path: "/home" },
  { id: "chat", labelKey: "chat", icon: MessageCircle, path: "/chat" },
  { id: "saved", labelKey: "saved", icon: Bookmark, path: "/saved" },
  { id: "history", labelKey: "history", icon: HistoryIcon, path: "/history" },
];

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { impact } = useHaptics();

  return (
    <>
      {/* Spacer so content above isn't covered by the fixed bar */}
      <div
        aria-hidden
        className="w-full"
        style={{ height: "calc(56px + env(safe-area-inset-bottom))" }}
      />

      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50",
          "border-t border-white/15",
          "bg-black/40 backdrop-blur-2xl backdrop-saturate-150",
          "shadow-[0_-10px_40px_-12px_rgba(0,0,0,0.6)]"
        )}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* Top highlight line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

        <ul className="flex items-stretch justify-around px-3 pt-1.5 pb-1.5 max-w-md mx-auto">
          {items.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <li key={item.id} className="flex-1">
                <button
                  type="button"
                  onClick={() => {
                    impact("light");
                    navigate(item.path);
                  }}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "tap-scale group relative w-full flex flex-col items-center justify-center gap-0.5",
                    "py-1 px-2 rounded-xl",
                    "transition-all duration-300 ease-out",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                    active ? "text-white" : "text-white/60 hover:text-white/90"
                  )}
                >
                  {/* Premium icon chip */}
                  <span
                    className={cn(
                      "relative flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300",
                      active
                        ? "bg-gradient-to-br from-primary/40 via-primary/20 to-accent/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_6px_20px_-4px_hsl(var(--primary)/0.6)] ring-1 ring-white/30"
                        : "bg-white/5 ring-1 ring-white/10 group-hover:bg-white/10"
                    )}
                  >
                    {/* Press-light ripple */}
                    <span
                      className="absolute inset-0 rounded-full pointer-events-none opacity-0 group-active:opacity-100 transition-opacity duration-150"
                      style={{
                        background:
                          "radial-gradient(circle at center, hsl(var(--primary) / 0.5), transparent 70%)",
                      }}
                    />
                    <Icon
                      strokeWidth={active ? 2.4 : 2}
                      className={cn(
                        "relative w-[18px] h-[18px] transition-all duration-300",
                        active &&
                          "drop-shadow-[0_0_6px_hsl(var(--primary)/0.8)] scale-110"
                      )}
                    />
                  </span>

                  <span
                    className={cn(
                      "relative text-[10px] leading-none tracking-wide transition-all",
                      active ? "font-semibold" : "font-medium"
                    )}
                  >
                    {t(item.labelKey)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
};

export default BottomNav;

import { useLocation, useNavigate } from "react-router-dom";
import { MessageCircle, FileText, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface BottomNavItem {
  id: string;
  labelKey: string;
  icon: typeof MessageCircle;
  path: string;
}

const items: BottomNavItem[] = [
  { id: "chat", labelKey: "chat", icon: MessageCircle, path: "/chat" },
  { id: "saved", labelKey: "saved", icon: FileText, path: "/saved" },
  { id: "history", labelKey: "history", icon: Clock, path: "/history" },
];

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  return (
    <>
      {/* Spacer so content above isn't covered by the fixed bar */}
      <div
        aria-hidden
        className="w-full"
        style={{ height: "calc(76px + env(safe-area-inset-bottom))" }}
      />

      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50",
          "border-t border-white/30",
          "bg-white/60 backdrop-blur-xl backdrop-saturate-150",
          "shadow-[0_-8px_30px_-12px_rgba(0,0,0,0.18)]",
          "supports-[backdrop-filter]:bg-white/50"
        )}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* Subtle top highlight line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <ul className="flex items-stretch justify-around px-2 pt-2 pb-2 max-w-md mx-auto">
          {items.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <li key={item.id} className="flex-1">
                <button
                  type="button"
                  onClick={() => navigate(item.path)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative w-full flex flex-col items-center justify-center gap-1",
                    "py-2 px-3 rounded-2xl",
                    "transition-all duration-300 ease-out",
                    "active:scale-95",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {/* Active glow background */}
                  <span
                    className={cn(
                      "absolute inset-1 rounded-2xl transition-all duration-300",
                      active
                        ? "bg-gradient-to-b from-primary/15 to-primary/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_4px_16px_-4px_hsl(var(--primary)/0.4)]"
                        : "opacity-0 group-hover:opacity-100 group-hover:bg-primary/5"
                    )}
                  />

                  {/* Press-light ripple on tap */}
                  <span
                    className={cn(
                      "absolute inset-1 rounded-2xl pointer-events-none",
                      "opacity-0 group-active:opacity-100",
                      "bg-gradient-radial from-primary/30 via-primary/10 to-transparent",
                      "transition-opacity duration-150"
                    )}
                    style={{
                      background:
                        "radial-gradient(circle at center, hsl(var(--primary) / 0.35), transparent 70%)",
                    }}
                  />

                  <Icon
                    className={cn(
                      "relative w-6 h-6 transition-all duration-300",
                      active &&
                        "drop-shadow-[0_0_8px_hsl(var(--primary)/0.6)] scale-110"
                    )}
                  />
                  <span
                    className={cn(
                      "relative text-[11px] font-medium tracking-wide transition-all",
                      active && "font-semibold"
                    )}
                  >
                    {t(item.labelKey)}
                  </span>

                  {/* Active dot indicator */}
                  <span
                    className={cn(
                      "absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary transition-all duration-300",
                      active
                        ? "opacity-100 shadow-[0_0_8px_hsl(var(--primary))]"
                        : "opacity-0"
                    )}
                  />
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

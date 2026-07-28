import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { UserPlus, LogOut, Trash2, Check } from "lucide-react";

type SavedAccount = { email: string; name?: string; avatar?: string; ts: number };

const KEY = "hagion_recent_accounts";

export const AccountSwitcher = ({
  open,
  onOpenChange,
  currentEmail,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  currentEmail?: string | null;
}) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (en: string, es: string) => (language === "es" ? es : en);
  const [accounts, setAccounts] = useState<SavedAccount[]>([]);

  useEffect(() => {
    if (!open) return;
    try {
      const raw = localStorage.getItem(KEY);
      setAccounts(raw ? JSON.parse(raw) : []);
    } catch {
      setAccounts([]);
    }
  }, [open]);

  const switchTo = async (email: string) => {
    await supabase.auth.signOut();
    onOpenChange(false);
    navigate(`/auth?email=${encodeURIComponent(email)}&redirect=/community`);
  };

  const addAccount = async () => {
    await supabase.auth.signOut();
    onOpenChange(false);
    navigate(`/auth?redirect=/community`);
  };

  const signOutOnly = async () => {
    await supabase.auth.signOut();
    onOpenChange(false);
    navigate("/auth");
  };

  const forget = (email: string) => {
    const next = accounts.filter((a) => a.email.toLowerCase() !== email.toLowerCase());
    setAccounts(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="bg-[#0a0d16] border-white/10 text-white rounded-t-2xl">
        <SheetHeader className="text-left">
          <SheetTitle className="text-white font-playfair">
            {t("Switch account", "Cambiar de cuenta")}
          </SheetTitle>
          <SheetDescription className="text-white/60">
            {t(
              "Tap an account to sign in. You'll need to enter your password.",
              "Toca una cuenta para entrar. Deberás introducir tu contraseña."
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-2 max-h-[50vh] overflow-y-auto pr-1">
          {accounts.length === 0 && (
            <div className="text-sm text-white/50 px-2 py-4">
              {t("No saved accounts yet.", "Aún no hay cuentas guardadas.")}
            </div>
          )}
          {accounts.map((a) => {
            const isCurrent = currentEmail && a.email.toLowerCase() === currentEmail.toLowerCase();
            return (
              <div
                key={a.email}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5"
              >
                <button
                  onClick={() => !isCurrent && switchTo(a.email)}
                  className="flex-1 flex items-center gap-3 text-left active:scale-[0.99] transition"
                  disabled={!!isCurrent}
                >
                  <Avatar className="h-10 w-10">
                    {a.avatar && <AvatarImage src={a.avatar} alt={a.email} />}
                    <AvatarFallback className="bg-white/10 text-white/80 text-sm">
                      {(a.name?.[0] || a.email[0] || "U").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="text-sm text-white truncate">{a.name || a.email.split("@")[0]}</div>
                    <div className="text-[11px] text-white/50 truncate">{a.email}</div>
                  </div>
                  {isCurrent && <Check className="w-4 h-4 text-primary shrink-0" />}
                </button>
                {!isCurrent && (
                  <button
                    onClick={() => forget(a.email)}
                    aria-label={t("Forget account", "Olvidar cuenta")}
                    className="p-2 rounded-full hover:bg-white/[0.08] text-white/50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 grid gap-2">
          <Button
            onClick={addAccount}
            variant="outline"
            className="w-full border-white/15 bg-white/[0.04] hover:bg-white/[0.08] text-white"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {t("Add another account", "Añadir otra cuenta")}
          </Button>
          <Button
            onClick={signOutOnly}
            variant="ghost"
            className="w-full text-white/70 hover:text-white hover:bg-white/[0.06]"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t("Sign out", "Cerrar sesión")}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

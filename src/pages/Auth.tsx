import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import logo from "@/assets/logo.png";
import heroDiscernment from "@/assets/hero-discernment.jpg";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate(redirectUrl || "/", { replace: true });
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate(redirectUrl || "/", { replace: true });
    });

    return () => subscription.unsubscribe();
  }, [navigate, redirectUrl]);

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const validatePassword = (p: string) =>
    p.length >= 8 && /[A-Z]/.test(p) && /[a-z]/.test(p) && (/\d/.test(p) || /[!@#$%^&*(),.?":{}|<>]/.test(p));

  const DEMO_EMAIL = "demo.hagionai@gmail.com";
  const DEMO_PASSWORD = "DemoReview2024!";

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      // Native (Capacitor) and web both supported via Lovable managed OAuth
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: Capacitor.isNativePlatform()
          ? "app.lovable.491c2e4bf4f4493f88e1648be5cecac3://auth"
          : window.location.origin + (redirectUrl || "/"),
        extraParams: { prompt: "select_account" },
      });

      if (result.error) {
        toast({
          title: language === "es" ? "Error de Google" : "Google sign-in failed",
          description: result.error.message || (language === "es" ? "Inténtalo de nuevo" : "Please try again"),
          variant: "destructive",
        });
        return;
      }
      // If redirected, browser leaves the page; otherwise auth state listener handles redirect
    } catch (e: any) {
      toast({
        title: t("error"),
        description: e?.message || t("unexpected_error"),
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isDemo = email.toLowerCase() === DEMO_EMAIL.toLowerCase();

    if (!validateEmail(email)) {
      toast({ title: t("invalid_email"), description: t("invalid_email_desc"), variant: "destructive" });
      return;
    }
    if (!isDemo && !validatePassword(password)) {
      toast({ title: t("invalid_password"), description: t("password_requirements"), variant: "destructive" });
      return;
    }
    if (!isLogin && password !== confirmPassword) {
      toast({ title: t("passwords_no_match"), description: t("passwords_no_match_desc"), variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        if (isDemo && password === DEMO_PASSWORD) {
          const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (signInError) {
            await supabase.auth.signUp({
              email,
              password,
              options: { emailRedirectTo: `${window.location.origin}/` },
            });
            await supabase.auth.signInWithPassword({ email, password });
          }
        } else {
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) {
            toast({ title: t("login_failed"), description: t("check_credentials"), variant: "destructive" });
            return;
          }
        }
        toast({ title: t("welcome_back"), description: t("login_success") });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) {
          toast({ title: t("error"), description: t("account_creation_failed"), variant: "destructive" });
          return;
        }
        toast({ title: t("account_created"), description: t("welcome_hagion") });
      }
    } catch (err: any) {
      toast({ title: t("error"), description: err?.message || t("unexpected_error"), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const tt = (en: string, es: string) => (language === "es" ? es : en);

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#05070d] text-white">
      {/* Ambient backsplash matching Discernment page */}
      <img
        src={heroDiscernment}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40"
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/90" />
      {/* Aurora glow accents */}
      <div
        aria-hidden
        className="absolute -top-40 -left-32 h-[420px] w-[420px] rounded-full blur-[120px] opacity-50"
        style={{ background: "radial-gradient(circle, rgba(96,165,250,0.55), transparent 60%)" }}
      />
      <div
        aria-hidden
        className="absolute -bottom-40 -right-32 h-[460px] w-[460px] rounded-full blur-[120px] opacity-40"
        style={{ background: "radial-gradient(circle, rgba(168,85,247,0.5), transparent 60%)" }}
      />

      {/* Safe-area aware container */}
      <div
        className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-5 py-8"
        style={{
          paddingTop: "max(env(safe-area-inset-top), 1.5rem)",
          paddingBottom: "max(env(safe-area-inset-bottom), 1.5rem)",
        }}
      >
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-[max(env(safe-area-inset-top),1rem)] flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-md transition-all hover:bg-white/10 active:scale-95"
          aria-label={tt("Back", "Atrás")}
        >
          <ArrowLeft className="h-5 w-5 text-white/80" />
        </button>

        {/* Logo + brand */}
        <div className="mb-7 flex flex-col items-center text-center animate-fade-in">
          <div className="relative mb-3">
            <div className="absolute inset-0 rounded-full blur-2xl bg-blue-400/40" />
            <img
              src={logo}
              alt="Hagion AI"
              className="relative h-16 w-16 rounded-full ring-1 ring-white/15 shadow-[0_10px_30px_-5px_rgba(96,165,250,0.5)]"
            />
          </div>
          <h1 className="font-playfair text-3xl tracking-tight">Hagion AI</h1>
          <p className="mt-1.5 text-[12px] italic text-white/70 font-playfair max-w-[280px]">
            {tt(
              "“Test the spirits to see whether they are from God.” — 1 John 4:1",
              "“Probad los espíritus si son de Dios.” — 1 Juan 4:1"
            )}
          </p>
        </div>

        {/* Glass card */}
        <div
          className="w-full max-w-md rounded-3xl border border-white/15 p-6 backdrop-blur-xl animate-fade-in"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 50%, rgba(255,255,255,0.06) 100%)",
            boxShadow:
              "0 0 0 1px rgba(96,165,250,0.35), 0 20px 60px -20px rgba(0,0,0,0.8), 0 0 30px -10px rgba(96,165,250,0.25)",
          }}
        >
          <Tabs
            value={isLogin ? "signin" : "signup"}
            onValueChange={(v) => {
              setIsLogin(v === "signin");
              setEmail("");
              setPassword("");
              setConfirmPassword("");
            }}
          >
            <TabsList className="mb-5 grid w-full grid-cols-2 rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur">
              <TabsTrigger
                value="signin"
                disabled={isLoading || googleLoading}
                className="rounded-full text-[13px] data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-md"
              >
                {t("sign_in")}
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                disabled={isLoading || googleLoading}
                className="rounded-full text-[13px] data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-md"
              >
                {t("sign_up")}
              </TabsTrigger>
            </TabsList>

            {/* Google button (shared) */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading || isLoading}
              className="group mb-4 flex w-full items-center justify-center gap-3 rounded-full border border-white/15 bg-white px-5 py-3 text-[14px] font-medium text-black transition-all hover:bg-white/95 active:scale-[0.98] disabled:opacity-60"
            >
              {googleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" aria-hidden>
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
                  />
                </svg>
              )}
              <span>
                {googleLoading
                  ? tt("Connecting…", "Conectando…")
                  : isLogin
                  ? tt("Continue with Google", "Continuar con Google")
                  : tt("Sign up with Google", "Registrarse con Google")}
              </span>
            </button>

            {/* Divider */}
            <div className="my-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                {tt("or", "o")}
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            </div>

            <TabsContent value="signin" className="mt-0">
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <FieldEmail value={email} onChange={setEmail} disabled={isLoading || googleLoading} t={tt} />
                <FieldPassword
                  id="password"
                  label={t("password")}
                  value={password}
                  onChange={setPassword}
                  show={showPwd}
                  setShow={setShowPwd}
                  disabled={isLoading || googleLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading || googleLoading}
                  className="mt-2 h-11 w-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium shadow-[0_10px_30px_-10px_rgba(96,165,250,0.8)] transition-all hover:shadow-[0_10px_40px_-5px_rgba(96,165,250,1)] hover:brightness-110 active:scale-[0.98]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("signing_in")}
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      {t("sign_in")}
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-0">
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <FieldEmail value={email} onChange={setEmail} disabled={isLoading || googleLoading} t={tt} />
                <FieldPassword
                  id="signup-password"
                  label={t("password")}
                  value={password}
                  onChange={setPassword}
                  show={showPwd}
                  setShow={setShowPwd}
                  disabled={isLoading || googleLoading}
                />
                <FieldPassword
                  id="confirmPassword"
                  label={t("confirm_password")}
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  show={showPwd}
                  setShow={setShowPwd}
                  disabled={isLoading || googleLoading}
                />
                <p className="flex items-start gap-1.5 text-[11px] text-white/55">
                  <ShieldCheck className="mt-[1px] h-3 w-3 flex-shrink-0 text-blue-300" />
                  <span>
                    {tt(
                      "8+ characters, mix of upper/lowercase and a number or symbol.",
                      "8+ caracteres, mayúsculas y minúsculas y un número o símbolo."
                    )}
                  </span>
                </p>
                <Button
                  type="submit"
                  disabled={isLoading || googleLoading}
                  className="mt-2 h-11 w-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium shadow-[0_10px_30px_-10px_rgba(96,165,250,0.8)] transition-all hover:shadow-[0_10px_40px_-5px_rgba(96,165,250,1)] hover:brightness-110 active:scale-[0.98]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("creating_account")}
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      {t("create_account")}
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Footer fine print */}
          <p className="mt-5 text-center text-[10.5px] leading-relaxed text-white/45">
            {tt(
              "By continuing, you agree to our Terms & acknowledge our Privacy Policy.",
              "Al continuar, aceptas nuestros Términos y reconoces nuestra Política de Privacidad."
            )}
          </p>
        </div>

        <p className="mt-6 text-center text-[11px] tracking-[0.18em] uppercase text-white/40">
          {tt("Faith • Truth • Discernment", "Fe • Verdad • Discernimiento")}
        </p>
      </div>
    </div>
  );
};

/* ---------- Premium field components ---------- */

const FieldEmail = ({
  value,
  onChange,
  disabled,
  t,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  t: (en: string, es: string) => string;
}) => (
  <div className="space-y-1.5">
    <Label htmlFor="email" className="text-[12px] text-white/70">
      {t("Email", "Correo")}
    </Label>
    <div className="relative">
      <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
      <Input
        id="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder="your@email.com"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        disabled={disabled}
        className="h-11 rounded-xl border-white/10 bg-white/5 pl-10 text-white placeholder:text-white/35 backdrop-blur focus-visible:border-blue-400/60 focus-visible:ring-blue-400/30"
      />
    </div>
  </div>
);

const FieldPassword = ({
  id,
  label,
  value,
  onChange,
  show,
  setShow,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  setShow: (v: boolean) => void;
  disabled: boolean;
}) => (
  <div className="space-y-1.5">
    <Label htmlFor={id} className="text-[12px] text-white/70">
      {label}
    </Label>
    <div className="relative">
      <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
      <Input
        id={id}
        type={show ? "text" : "password"}
        autoComplete={id === "password" ? "current-password" : "new-password"}
        placeholder="••••••••"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        disabled={disabled}
        minLength={8}
        className="h-11 rounded-xl border-white/10 bg-white/5 pl-10 pr-11 text-white placeholder:text-white/35 backdrop-blur focus-visible:border-blue-400/60 focus-visible:ring-blue-400/30"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-white/50 transition-colors hover:text-white/90"
        tabIndex={-1}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  </div>
);

export default Auth;

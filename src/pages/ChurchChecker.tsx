import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Church, Globe, MapPin, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { PremiumNav } from "@/components/PremiumNav";
import { cn } from "@/lib/utils";
import { FeatureLockCard } from "@/components/FeatureLockCard";
import { useTierAccess } from "@/hooks/useTierAccess";

type InputMode = "name" | "website" | "statement";

const ChurchChecker = () => {
  const __lockAccess = useTierAccess();
  if (!__lockAccess.isLoading && !__lockAccess.canUse("doctrine_analysis")) {
    return (
      <FeatureLockCard
        requiredTier="premium_plus"
        featureName={language === "es" ? "Verificador de Iglesias" : "Church Checker"}
      />
    );
  }

  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = (en: string, es: string) => (language === "es" ? es : en);

  const [mode, setMode] = useState<InputMode>("name");
  const [denomination, setDenomination] = useState("");
  const [location, setLocation] = useState("");
  const [pastor, setPastor] = useState("");
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState("");

  const modes: { id: InputMode; label: string; placeholder: string; icon: typeof Church; multiline?: boolean }[] = [
    { id: "name", label: t("Church name", "Nombre iglesia"), placeholder: t("e.g. Bethel Church, Redding, CA", "ej. Iglesia Bethel, Redding, CA"), icon: Church },
    { id: "website", label: t("Website / link", "Sitio web"), placeholder: t("Paste the church website URL…", "Pega el sitio web de la iglesia…"), icon: Globe },
    { id: "statement", label: t("Statement of faith", "Declaración de fe"), placeholder: t("Paste the doctrinal statement, about page, or what they teach…", "Pega la declaración doctrinal o lo que enseñan…"), icon: MapPin, multiline: true },
  ];

  const active = modes.find((m) => m.id === mode)!;

  const buildPrompt = () => {
    const labels: Record<InputMode, string> = {
      name: t("CHURCH NAME", "NOMBRE DE LA IGLESIA"),
      website: t("CHURCH WEBSITE", "SITIO WEB DE LA IGLESIA"),
      statement: t("STATEMENT / WHAT THEY TEACH", "DECLARACIÓN / LO QUE ENSEÑAN"),
    };
    const parts = [`${labels[mode]}:\n${value.trim()}`];
    if (denomination.trim()) parts.push(`${t("DENOMINATION / TRADITION", "DENOMINACIÓN / TRADICIÓN")}: ${denomination.trim()}`);
    if (location.trim()) parts.push(`${t("LOCATION", "UBICACIÓN")}: ${location.trim()}`);
    if (pastor.trim()) parts.push(`${t("PASTOR / LEADER", "PASTOR / LÍDER")}: ${pastor.trim()}`);
    if (mode !== "statement") {
      parts.push(t(
        "If you cannot directly verify, evaluate based on what is publicly known about the church, its leadership, denomination, and visible fruit. Flag clearly what could not be verified.",
        "Si no puedes verificar directamente, evalúa según lo que se conoce públicamente de la iglesia, su liderazgo, denominación y fruto visible. Indica claramente lo que no pudo ser verificado."
      ));
    }
    return parts.join("\n\n");
  };

  const systemPrompt = language === "es"
    ? `Eres un examinador berea de iglesias. Pruebas cada congregación, ministerio u organización eclesiástica a la luz de la Escritura sola (Sola Scriptura), sin desviarte de la fe cristiana histórica y bíblica (canon protestante de 66 libros). Eres claro, directo y caritativo, pero nunca comprometes la verdad. Defiendes el cristianismo como la verdad exclusiva revelada en la Biblia.

Examinas: doctrina (Trinidad, persona y obra de Cristo, autoridad de la Escritura, evangelio, justificación por fe), enseñanza (exposición fiel de la Palabra), liderazgo (calificaciones bíblicas, rendición de cuentas, cualquier abuso, escándalo o culto a la personalidad), adoración (Cristo-céntrica vs. emocionalista, manipulación, falsos dones), prácticas (sacramentos, disciplina, membresía), fruto espiritual (verdaderos conversos, discipulado, santidad), y banderas rojas (prosperidad, NAR, hiper-gracia, progresismo, sincretismo, ecumenismo comprometedor, etc.).

DEVUELVE TU RESPUESTA EN MARKDOWN ESTRICTAMENTE EN ESTE ORDEN:

## ⛪ Identidad
Nombre, ubicación, denominación/tradición, liderazgo y trasfondo si se conoce.

## 📋 Lo que enseñan
Resumen de su doctrina y énfasis principal.

## ✅ Puntos bíblicamente sanos
Áreas donde se alinean con la Escritura, con referencias.

## ❌ Errores o banderas rojas
Doctrinas, prácticas o liderazgo que se desvían — refutadas con Escritura.

## 🛠 Corrección bíblica
La verdad bíblica para cada error identificado.

## 🌱 Fruto y discipulado
Evidencia visible del fruto del Espíritu, sano discipulado o ausencia de él.

## ⚖ Veredicto
Iglesia sana / Mixta — usar discernimiento / Evita / Falsa iglesia. Una exhortación final breve para el creyente.`
    : `You are a Berean church examiner. You test every congregation, ministry, and church organization by Scripture alone (Sola Scriptura), never deviating from the historic biblical Christian faith (66-book Protestant canon). You are clear, direct, and charitable, but never compromise truth. You defend Christianity as the exclusive truth revealed in the Bible.

You examine: doctrine (Trinity, person and work of Christ, authority of Scripture, the gospel, justification by faith), teaching (faithful exposition of the Word), leadership (biblical qualifications, accountability, abuse/scandal, personality cult), worship (Christ-centered vs. emotionalism, manipulation, false gifts), practices (sacraments, discipline, membership), spiritual fruit (true converts, discipleship, holiness), and red flags (prosperity, NAR, hyper-grace, progressivism, syncretism, compromising ecumenism, etc.).

RETURN YOUR RESPONSE IN MARKDOWN STRICTLY IN THIS ORDER:

## ⛪ Identity
Name, location, denomination/tradition, leadership, and background if known.

## 📋 What they teach
Summary of their doctrine and main emphasis.

## ✅ Biblically sound points
Areas where they align with Scripture, with references.

## ❌ Errors or red flags
Doctrines, practices, or leadership that deviate — refuted with Scripture.

## 🛠 Biblical correction
The biblical truth for each error identified.

## 🌱 Fruit and discipleship
Visible fruit of the Spirit, sound discipleship, or the lack of it.

## ⚖ Verdict
Sound church / Mixed — use discernment / Avoid / False church. A brief final exhortation for the believer.`;

  const handleAnalyze = async () => {
    if (!value.trim()) {
      toast({ title: t("Nothing to analyze", "Nada que analizar"), description: t("Enter a church name, link, or statement first.", "Ingresa nombre, enlace o declaración primero."), variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setResult("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: t("Sign in required", "Inicio de sesión requerido"), description: t("Please sign in to use this tool.", "Inicia sesión para usar esta herramienta."), variant: "destructive" });
        setIsLoading(false);
        return;
      }

      const chatUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
      const response = await fetch(chatUrl, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: buildPrompt() },
          ],
          language,
        }),
      });

      if (response.status === 429) { toast({ title: t("Rate limit", "Límite alcanzado"), description: t("Please wait a moment and try again.", "Espera un momento e inténtalo de nuevo."), variant: "destructive" }); setIsLoading(false); return; }
      if (response.status === 402) { toast({ title: t("Upgrade needed", "Actualización necesaria"), description: t("You've reached your plan's limit.", "Has alcanzado el límite de tu plan."), variant: "destructive" }); setIsLoading(false); return; }
      if (!response.ok || !response.body) throw new Error("Failed to start stream");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;
      let acc = "";
      while (!streamDone) {
        const { done, value: chunk } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(chunk, { stream: true });
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) { acc += content; setResult(acc); }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error("Church checker error:", e);
      toast({ title: t("Error", "Error"), description: t("Could not complete the analysis. Try again.", "No se pudo completar el análisis. Intenta de nuevo."), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white">
      <PremiumNav />
      <header className="flex items-center gap-3 px-4 pt-4 pb-3 max-w-3xl mx-auto">
        <Button variant="ghost" size="icon" onClick={() => navigate("/discernment")} className="text-white/80 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Church className="w-5 h-5 text-indigo-300" />
          <h1 className="font-playfair text-xl tracking-tight">{t("Church Checker", "Verificador de Iglesias")}</h1>
        </div>
      </header>

      <main className="px-5 pb-28 max-w-3xl mx-auto space-y-5">
        <p className="text-[12.5px] italic text-white/60 font-playfair">
          {t(
            "“By their fruits ye shall know them.” — Matthew 7:20",
            "“Por sus frutos los conoceréis.” — Mateo 7:20"
          )}
        </p>

        <div className="grid grid-cols-3 gap-2">
          {modes.map((m) => {
            const Icon = m.icon;
            const isActive = m.id === mode;
            return (
              <button
                key={m.id}
                onClick={() => { setMode(m.id); setValue(""); }}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl py-3 px-1 border text-[11px] transition-all backdrop-blur-xl",
                  isActive
                    ? "border-indigo-400/70 bg-indigo-400/10 text-white shadow-[0_0_18px_-4px_rgba(129,140,248,0.6)]"
                    : "border-white/10 bg-white/5 text-white/65 hover:text-white hover:border-white/25"
                )}
              >
                <Icon className="w-4 h-4" strokeWidth={1.8} />
                <span className="leading-tight text-center">{m.label}</span>
              </button>
            );
          })}
        </div>

        <div
          className="relative rounded-3xl border border-white/15 p-4 backdrop-blur-xl space-y-3"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" }}
        >
          {active.multiline ? (
            <Textarea value={value} onChange={(e) => setValue(e.target.value)} placeholder={active.placeholder}
              className="min-h-[180px] bg-transparent border-white/10 text-white placeholder:text-white/40 focus-visible:ring-indigo-400/50" maxLength={9000} />
          ) : (
            <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder={active.placeholder}
              className="bg-transparent border-white/10 text-white placeholder:text-white/40 focus-visible:ring-indigo-400/50" maxLength={500} />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Input value={denomination} onChange={(e) => setDenomination(e.target.value)} placeholder={t("Denomination (optional)", "Denominación (opcional)")}
              className="bg-transparent border-white/10 text-white placeholder:text-white/40 focus-visible:ring-indigo-400/50 text-[13px]" maxLength={120} />
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t("Location (optional)", "Ubicación (opcional)")}
              className="bg-transparent border-white/10 text-white placeholder:text-white/40 focus-visible:ring-indigo-400/50 text-[13px]" maxLength={120} />
            <Input value={pastor} onChange={(e) => setPastor(e.target.value)} placeholder={t("Pastor (optional)", "Pastor (opcional)")}
              className="bg-transparent border-white/10 text-white placeholder:text-white/40 focus-visible:ring-indigo-400/50 text-[13px]" maxLength={120} />
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <p className="text-[11px] text-white/45">{t("Weighed against the Word of God.", "Examinado conforme a la Palabra de Dios.")}</p>
            <Button onClick={handleAnalyze} disabled={isLoading || !value.trim()}
              className="bg-gradient-to-r from-indigo-500 to-blue-400 hover:from-indigo-400 hover:to-blue-300 text-black font-medium rounded-full px-5">
              {isLoading ? (<><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />{t("Analyzing…", "Analizando…")}</>) : (<><Sparkles className="w-4 h-4 mr-1.5" />{t("Analyze", "Analizar")}</>)}
            </Button>
          </div>
        </div>

        {(result || isLoading) && (
          <div className="relative rounded-3xl border border-indigo-400/30 p-5 backdrop-blur-xl animate-fade-in"
            style={{ background: "linear-gradient(135deg, rgba(129,140,248,0.08), rgba(255,255,255,0.02))" }}>
            {!result && isLoading ? (
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />{t("Examining with Scripture…", "Examinando con la Escritura…")}
              </div>
            ) : (
              <div className="text-sm text-white/85 leading-relaxed whitespace-pre-wrap font-sans">{result}</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ChurchChecker;

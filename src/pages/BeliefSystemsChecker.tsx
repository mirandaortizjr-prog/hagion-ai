import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Users, BookOpen, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { PremiumNav } from "@/components/PremiumNav";
import { cn } from "@/lib/utils";

type InputMode = "denomination" | "movement" | "doctrine";

const BeliefSystemsChecker = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = (en: string, es: string) => (language === "es" ? es : en);

  const [mode, setMode] = useState<InputMode>("denomination");
  const [founder, setFounder] = useState("");
  const [era, setEra] = useState("");
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState("");

  const modes: { id: InputMode; label: string; placeholder: string; icon: typeof Search; multiline?: boolean }[] = [
    { id: "denomination", label: t("Denomination", "Denominación"), placeholder: t("e.g. Roman Catholicism, Reformed, Pentecostal…", "ej. Catolicismo, Reformado, Pentecostal…"), icon: Users },
    { id: "movement", label: t("Movement", "Movimiento"), placeholder: t("e.g. NAR, Word of Faith, Progressive Christianity…", "ej. NAR, Palabra de Fe, Cristianismo Progresivo…"), icon: Search },
    { id: "doctrine", label: t("Doctrine / claim", "Doctrina"), placeholder: t("Paste the teaching, claim, or doctrinal statement to test…", "Pega la enseñanza, afirmación o declaración doctrinal a evaluar…"), icon: BookOpen, multiline: true },
  ];

  const active = modes.find((m) => m.id === mode)!;

  const buildPrompt = () => {
    const labels: Record<InputMode, string> = {
      denomination: t("DENOMINATION / TRADITION", "DENOMINACIÓN / TRADICIÓN"),
      movement: t("MOVEMENT", "MOVIMIENTO"),
      doctrine: t("DOCTRINE / CLAIM", "DOCTRINA / AFIRMACIÓN"),
    };
    const parts = [`${labels[mode]}:\n${value.trim()}`];
    if (founder.trim()) parts.push(`${t("FOUNDER / KEY FIGURE", "FUNDADOR / FIGURA CLAVE")}: ${founder.trim()}`);
    if (era.trim()) parts.push(`${t("ERA / ORIGIN", "ÉPOCA / ORIGEN")}: ${era.trim()}`);
    return parts.join("\n\n");
  };

  const systemPrompt = language === "es"
    ? `Eres un examinador berea de sistemas de creencias, denominaciones y movimientos religiosos. Pruebas cada marco teológico a la luz de la Escritura sola (Sola Scriptura), sin desviarte de la fe cristiana histórica y bíblica (canon protestante de 66 libros). Eres claro, directo y caritativo, pero nunca comprometes la verdad. Defiendes el cristianismo bíblico como la verdad exclusiva revelada en la Biblia.

Examinas las doctrinas esenciales: visión de Dios y la Trinidad, deidad y obra de Cristo, autoridad y suficiencia de la Escritura, doctrina de la salvación (sola gracia, sola fe), pecado y naturaleza humana, escatología, eclesiología y prácticas distintivas.

DEVUELVE TU RESPUESTA EN MARKDOWN ESTRICTAMENTE EN ESTE ORDEN:

## 🧭 Identidad
Nombre, fundador, época, ramas principales y textos clave si se conocen.

## 📋 Creencias centrales
Resumen de sus enseñanzas sobre Dios, Cristo, salvación, Escritura y la persona.

## ✅ Puntos de contacto
Donde coinciden con la Escritura, con referencias.

## ❌ Errores y desviaciones
Doctrinas que contradicen la Escritura — refutadas con la Palabra.

## 🛠 La verdad bíblica
La doctrina correcta para cada error identificado.

## ✝️ El evangelio para sus seguidores
Cómo presentar a Cristo a quienes están en este sistema.

## ⚖ Veredicto
Cristianismo bíblico / Mixto — usar discernimiento / Sectario / Falsa religión. Una exhortación final breve.`
    : `You are a Berean examiner of belief systems, denominations, and religious movements. You test every theological framework by Scripture alone (Sola Scriptura), never deviating from the historic biblical Christian faith (66-book Protestant canon). You are clear, direct, and charitable, but never compromise truth. You defend biblical Christianity as the exclusive truth revealed in the Bible.

You examine essential doctrines: view of God and the Trinity, deity and work of Christ, authority and sufficiency of Scripture, doctrine of salvation (sola gratia, sola fide), sin and human nature, eschatology, ecclesiology, and distinctive practices.

RETURN YOUR RESPONSE IN MARKDOWN STRICTLY IN THIS ORDER:

## 🧭 Identity
Name, founder, era, main branches, and key texts if known.

## 📋 Core beliefs
Summary of their teachings on God, Christ, salvation, Scripture, and the person.

## ✅ Points of contact
Where they align with Scripture, with references.

## ❌ Errors and deviations
Doctrines that contradict Scripture — refuted with the Word.

## 🛠 The biblical truth
The correct doctrine for each error identified.

## ✝️ The gospel for its followers
How to present Christ to those in this system.

## ⚖ Verdict
Biblical Christianity / Mixed — use discernment / Sect / False religion. A brief final exhortation.`;

  const handleAnalyze = async () => {
    if (!value.trim()) {
      toast({ title: t("Nothing to analyze", "Nada que analizar"), description: t("Enter a denomination, movement, or doctrine first.", "Ingresa denominación, movimiento o doctrina primero."), variant: "destructive" });
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
          } catch { textBuffer = line + "\n" + textBuffer; break; }
        }
      }
    } catch (e) {
      console.error("Belief systems checker error:", e);
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
          <Search className="w-5 h-5 text-sky-300" />
          <h1 className="font-playfair text-xl tracking-tight">{t("Belief Systems", "Sistemas de Creencias")}</h1>
        </div>
      </header>

      <main className="px-5 pb-28 max-w-3xl mx-auto space-y-5">
        <p className="text-[12.5px] italic text-white/60 font-playfair">
          {t(
            "“Examine yourselves, whether ye be in the faith.” — 2 Corinthians 13:5",
            "“Examinaos a vosotros mismos si estáis en la fe.” — 2 Corintios 13:5"
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
                    ? "border-sky-400/70 bg-sky-400/10 text-white shadow-[0_0_18px_-4px_rgba(56,189,248,0.6)]"
                    : "border-white/10 bg-white/5 text-white/65 hover:text-white hover:border-white/25"
                )}
              >
                <Icon className="w-4 h-4" strokeWidth={1.8} />
                <span className="leading-tight text-center">{m.label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative rounded-3xl border border-white/15 p-4 backdrop-blur-xl space-y-3"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" }}>
          {active.multiline ? (
            <Textarea value={value} onChange={(e) => setValue(e.target.value)} placeholder={active.placeholder}
              className="min-h-[180px] bg-transparent border-white/10 text-white placeholder:text-white/40 focus-visible:ring-sky-400/50" maxLength={9000} />
          ) : (
            <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder={active.placeholder}
              className="bg-transparent border-white/10 text-white placeholder:text-white/40 focus-visible:ring-sky-400/50" maxLength={500} />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input value={founder} onChange={(e) => setFounder(e.target.value)} placeholder={t("Founder / key figure (optional)", "Fundador / figura clave (opcional)")}
              className="bg-transparent border-white/10 text-white placeholder:text-white/40 focus-visible:ring-sky-400/50 text-[13px]" maxLength={120} />
            <Input value={era} onChange={(e) => setEra(e.target.value)} placeholder={t("Era / origin (optional)", "Época / origen (opcional)")}
              className="bg-transparent border-white/10 text-white placeholder:text-white/40 focus-visible:ring-sky-400/50 text-[13px]" maxLength={120} />
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <p className="text-[11px] text-white/45">{t("Weighed against the Word of God.", "Examinado conforme a la Palabra de Dios.")}</p>
            <Button onClick={handleAnalyze} disabled={isLoading || !value.trim()}
              className="bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-black font-medium rounded-full px-5">
              {isLoading ? (<><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />{t("Analyzing…", "Analizando…")}</>) : (<><Sparkles className="w-4 h-4 mr-1.5" />{t("Analyze", "Analizar")}</>)}
            </Button>
          </div>
        </div>

        {(result || isLoading) && (
          <div className="relative rounded-3xl border border-sky-400/30 p-5 backdrop-blur-xl animate-fade-in"
            style={{ background: "linear-gradient(135deg, rgba(56,189,248,0.08), rgba(255,255,255,0.02))" }}>
            {!result && isLoading ? (
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />{t("Testing with Scripture…", "Probando con la Escritura…")}
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

export default BeliefSystemsChecker;

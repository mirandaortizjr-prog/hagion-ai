import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ScrollText, User, Calendar, Loader2, Sparkles } from "lucide-react";
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

type InputMode = "prophet" | "prophecy" | "movement";

const ProphecyChecker = () => {
  const __lockAccess = useTierAccess();
  if (!__lockAccess.isLoading && !__lockAccess.canUse("doctrine_analysis")) {
    return (
      <FeatureLockCard
        requiredTier="premium_plus"
        featureName={language === "es" ? "Verificador de Profecías" : "Prophecy Checker"}
      />
    );
  }

  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = (en: string, es: string) => (language === "es" ? es : en);

  const [mode, setMode] = useState<InputMode>("prophecy");
  const [prophet, setProphet] = useState("");
  const [date, setDate] = useState("");
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState("");

  const modes: { id: InputMode; label: string; placeholder: string; icon: typeof ScrollText; multiline?: boolean }[] = [
    { id: "prophecy", label: t("Prophecy / word", "Profecía / palabra"), placeholder: t("Paste the prophetic word, dream, or vision to test…", "Pega la palabra profética, sueño o visión a evaluar…"), icon: ScrollText, multiline: true },
    { id: "prophet", label: t("Prophet / person", "Profeta / persona"), placeholder: t("e.g. Joseph Smith, Ellen White, a modern prophet…", "ej. Joseph Smith, Ellen White, un profeta moderno…"), icon: User },
    { id: "movement", label: t("Prophetic movement", "Movimiento profético"), placeholder: t("e.g. NAR, Bethel, prophetic ministry…", "ej. NAR, Bethel, ministerio profético…"), icon: Calendar },
  ];

  const active = modes.find((m) => m.id === mode)!;

  const buildPrompt = () => {
    const labels: Record<InputMode, string> = {
      prophecy: t("PROPHECY / WORD", "PROFECÍA / PALABRA"),
      prophet: t("PROPHET / PERSON", "PROFETA / PERSONA"),
      movement: t("PROPHETIC MOVEMENT", "MOVIMIENTO PROFÉTICO"),
    };
    const parts = [`${labels[mode]}:\n${value.trim()}`];
    if (prophet.trim() && mode !== "prophet") parts.push(`${t("PROPHET / SOURCE", "PROFETA / FUENTE")}: ${prophet.trim()}`);
    if (date.trim()) parts.push(`${t("DATE GIVEN / SUPPOSED FULFILLMENT", "FECHA / CUMPLIMIENTO ESPERADO")}: ${date.trim()}`);
    return parts.join("\n\n");
  };

  const systemPrompt = language === "es"
    ? `Eres un examinador berea de profecías y profetas modernos. Pruebas toda palabra profética, profeta y movimiento a la luz de la Escritura sola (Sola Scriptura), sin desviarte de la fe cristiana histórica y bíblica (canon protestante de 66 libros). El canon está cerrado (Apocalipsis 22:18-19); ninguna profecía moderna tiene autoridad sobre la Biblia. Eres claro, directo y caritativo, pero nunca comprometes la verdad. Defiendes el cristianismo bíblico como la verdad exclusiva revelada en la Biblia.

Aplicas las pruebas bíblicas para profetas:
1. Deuteronomio 18:20-22 — Si una sola profecía falla, el profeta es falso. Cero tolerancia.
2. Deuteronomio 13:1-5 — Aunque una señal se cumpla, si lleva a otros dioses o doctrina, es falso.
3. 1 Juan 4:1-3 — ¿Confiesa la encarnación y deidad bíblica de Jesucristo?
4. Mateo 7:15-20 — ¿Cuál es el fruto del profeta y su ministerio?
5. Gálatas 1:8-9 — ¿Predica el mismo evangelio de Pablo, o uno diferente?
6. 2 Pedro 1:19-21 — La Escritura profética escrita es más segura que cualquier experiencia.

DEVUELVE TU RESPUESTA EN MARKDOWN ESTRICTAMENTE EN ESTE ORDEN:

## 📜 Lo que se afirma
Resumen claro de la profecía, profeta o movimiento.

## 🔍 Pruebas bíblicas para profetas
Aplica las pruebas de Deuteronomio 13 y 18, 1 Juan 4 y Mateo 7 una por una.

## 📅 Cumplimiento o fracaso
Profecías específicas y si se cumplieron exactamente, fallaron, o son aún no verificables.

## ✅ Cualquier verdad presente
Si algo se alinea con la Escritura, indícalo con referencias.

## ❌ Errores y banderas rojas
Doctrina falsa, profecías fallidas, mal fruto, escándalos — refutados con la Palabra.

## 🛠 Lo que dice realmente la Escritura
La verdad bíblica frente a cada error.

## ⚖ Veredicto
Profeta verdadero (raro hoy) / Hablante mixto — usar discernimiento extremo / Falso profeta / Engaño espiritual. Una exhortación final breve y la advertencia bíblica apropiada.`
    : `You are a Berean examiner of modern prophecies and prophets. You test every prophetic word, prophet, and movement by Scripture alone (Sola Scriptura), never deviating from the historic biblical Christian faith (66-book Protestant canon). The canon is closed (Revelation 22:18-19); no modern prophecy carries authority over the Bible. You are clear, direct, and charitable, but never compromise truth. You defend biblical Christianity as the exclusive truth revealed in the Bible.

You apply the biblical tests for prophets:
1. Deuteronomy 18:20-22 — If a single prophecy fails, the prophet is false. Zero tolerance.
2. Deuteronomy 13:1-5 — Even if a sign comes to pass, if it leads to other gods or doctrine, it is false.
3. 1 John 4:1-3 — Does it confess the biblical incarnation and deity of Jesus Christ?
4. Matthew 7:15-20 — What is the fruit of the prophet and ministry?
5. Galatians 1:8-9 — Does it preach the same gospel as Paul, or another?
6. 2 Peter 1:19-21 — The written prophetic Scripture is more sure than any experience.

RETURN YOUR RESPONSE IN MARKDOWN STRICTLY IN THIS ORDER:

## 📜 What is being claimed
Clear summary of the prophecy, prophet, or movement.

## 🔍 Biblical tests for prophets
Apply the tests of Deuteronomy 13 and 18, 1 John 4, and Matthew 7 one by one.

## 📅 Fulfillment or failure
Specific prophecies and whether they came to pass exactly, failed, or are not yet verifiable.

## ✅ Any truth present
If anything aligns with Scripture, note it with references.

## ❌ Errors and red flags
False doctrine, failed prophecies, bad fruit, scandals — refuted with the Word.

## 🛠 What Scripture actually says
The biblical truth against each error.

## ⚖ Verdict
True prophet (rare today) / Mixed speaker — use extreme discernment / False prophet / Spiritual deception. A brief final exhortation and the appropriate biblical warning.`;

  const handleAnalyze = async () => {
    if (!value.trim()) {
      toast({ title: t("Nothing to analyze", "Nada que analizar"), description: t("Enter a prophecy, prophet, or movement first.", "Ingresa profecía, profeta o movimiento primero."), variant: "destructive" });
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
      console.error("Prophecy checker error:", e);
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
          <ScrollText className="w-5 h-5 text-amber-300" />
          <h1 className="font-playfair text-xl tracking-tight">{t("Prophecy Checker", "Verificador de Profecía")}</h1>
        </div>
      </header>

      <main className="px-5 pb-28 max-w-3xl mx-auto space-y-5">
        <p className="text-[12.5px] italic text-white/60 font-playfair">
          {t(
            "“If the thing follow not, nor come to pass… the prophet hath spoken it presumptuously.” — Deuteronomy 18:22",
            "“Si no se cumple lo que el profeta dijo… con presunción la habló el tal profeta.” — Deuteronomio 18:22"
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
                    ? "border-amber-400/70 bg-amber-400/10 text-white shadow-[0_0_18px_-4px_rgba(252,211,77,0.6)]"
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
              className="min-h-[180px] bg-transparent border-white/10 text-white placeholder:text-white/40 focus-visible:ring-amber-400/50" maxLength={9000} />
          ) : (
            <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder={active.placeholder}
              className="bg-transparent border-white/10 text-white placeholder:text-white/40 focus-visible:ring-amber-400/50" maxLength={500} />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input value={prophet} onChange={(e) => setProphet(e.target.value)} placeholder={t("Prophet / source (optional)", "Profeta / fuente (opcional)")}
              className="bg-transparent border-white/10 text-white placeholder:text-white/40 focus-visible:ring-amber-400/50 text-[13px]" maxLength={120} />
            <Input value={date} onChange={(e) => setDate(e.target.value)} placeholder={t("Date / fulfillment (optional)", "Fecha / cumplimiento (opcional)")}
              className="bg-transparent border-white/10 text-white placeholder:text-white/40 focus-visible:ring-amber-400/50 text-[13px]" maxLength={120} />
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <p className="text-[11px] text-white/45">{t("Weighed against the Word of God.", "Examinado conforme a la Palabra de Dios.")}</p>
            <Button onClick={handleAnalyze} disabled={isLoading || !value.trim()}
              className="bg-gradient-to-r from-amber-500 to-orange-400 hover:from-amber-400 hover:to-orange-300 text-black font-medium rounded-full px-5">
              {isLoading ? (<><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />{t("Testing…", "Probando…")}</>) : (<><Sparkles className="w-4 h-4 mr-1.5" />{t("Test", "Probar")}</>)}
            </Button>
          </div>
        </div>

        {(result || isLoading) && (
          <div className="relative rounded-3xl border border-amber-400/30 p-5 backdrop-blur-xl animate-fade-in"
            style={{ background: "linear-gradient(135deg, rgba(252,211,77,0.08), rgba(255,255,255,0.02))" }}>
            {!result && isLoading ? (
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />{t("Testing the spirits…", "Probando los espíritus…")}
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

export default ProphecyChecker;

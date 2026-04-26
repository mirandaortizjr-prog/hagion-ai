import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Link2, FileText, Mic, Loader2, Sparkles } from "lucide-react";
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

type InputMode = "video" | "transcript" | "sermon";

const SermonAnalyzer = () => {
  const __lockAccess = useTierAccess();
  if (!__lockAccess.isLoading && !__lockAccess.canUse("sermon_analysis")) {
    return (
      <FeatureLockCard
        requiredTier="premium_plus"
      />
    );
  }

  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = (en: string, es: string) => (language === "es" ? es : en);

  const [mode, setMode] = useState<InputMode>("video");
  const [preacher, setPreacher] = useState("");
  const [scripture, setScripture] = useState("");
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState("");

  const modes: { id: InputMode; label: string; placeholder: string; icon: typeof Link2; multiline?: boolean }[] = [
    {
      id: "video",
      label: t("Video link", "Enlace video"),
      placeholder: t("Paste a YouTube or sermon video URL…", "Pega un enlace de YouTube o video de sermón…"),
      icon: Link2,
    },
    {
      id: "transcript",
      label: t("Transcript", "Transcripción"),
      placeholder: t("Paste the full sermon transcript…", "Pega la transcripción completa del sermón…"),
      icon: FileText,
      multiline: true,
    },
    {
      id: "sermon",
      label: t("Sermon text", "Texto del sermón"),
      placeholder: t("Paste the sermon notes or manuscript…", "Pega las notas o manuscrito del sermón…"),
      icon: Mic,
      multiline: true,
    },
  ];

  const active = modes.find((m) => m.id === mode)!;

  const buildPrompt = () => {
    const labels: Record<InputMode, string> = {
      video: t("SERMON VIDEO URL", "URL DEL VIDEO DEL SERMÓN"),
      transcript: t("SERMON TRANSCRIPT", "TRANSCRIPCIÓN DEL SERMÓN"),
      sermon: t("SERMON TEXT / NOTES", "TEXTO / NOTAS DEL SERMÓN"),
    };
    const parts = [`${labels[mode]}:\n${value.trim()}`];
    if (preacher.trim()) parts.push(`${t("PREACHER / SOURCE", "PREDICADOR / FUENTE")}: ${preacher.trim()}`);
    if (scripture.trim()) parts.push(`${t("STATED TEXT", "TEXTO DECLARADO")}: ${scripture.trim()}`);
    return parts.join("\n\n");
  };

  const systemPrompt = language === "es"
    ? `Eres un revisor berea de sermones. Examinas todo sermón, video o transcripción a la luz de la Escritura sola (Sola Scriptura), sin desviarte de la fe cristiana histórica y bíblica (canon protestante de 66 libros). Eres claro, directo y caritativo, pero nunca comprometes la verdad. Defiendes el cristianismo como la verdad exclusiva revelada en la Biblia.

Examinas: exégesis (¿se respeta el contexto del pasaje?), doctrina (¿concuerda con la sana doctrina?), aplicación (¿es bíblica y no moralista ni terapéutica?), espíritu (¿exalta a Cristo y la cruz?), y advertencias (errores, falacias, manipulación emocional, sincretismo, prosperidad, etc.).

Cuando solo te dan un URL sin texto, evalúa lo que se conoce públicamente del predicador, ministerio o canal y advierte cuando hagan falta más datos.

DEVUELVE TU RESPUESTA EN MARKDOWN ESTRICTAMENTE EN ESTE ORDEN:

## 📖 Texto y tema
El pasaje principal y el tema declarado del sermón.

## 🔍 Exégesis
¿Se manejó el texto correctamente en su contexto histórico, gramatical y canónico? Cita versículos.

## ✅ Lo que es bíblicamente sano
Puntos correctos del sermón con respaldo escritural (libro capítulo:versículo).

## ❌ Errores o desviaciones
Doctrinas falsas, eiségesis, falacias o aplicaciones no bíblicas. Cita la Escritura que las refuta.

## 🛠 Corrección bíblica
La enseñanza correcta para cada error con referencias.

## 💡 Aplicación fiel
Cómo aplicar el pasaje de forma fiel a Cristo y al evangelio.

## ⚖ Veredicto
Sano / Mixto — usar discernimiento / Falso. Una exhortación final breve.`
    : `You are a Berean sermon reviewer. You examine every sermon, video, or transcript by Scripture alone (Sola Scriptura), never deviating from the historic biblical Christian faith (66-book Protestant canon). You are clear, direct, and charitable, but never compromise truth. You defend Christianity as the exclusive truth revealed in the Bible.

You examine: exegesis (is the passage handled in context?), doctrine (does it agree with sound doctrine?), application (is it biblical, not moralistic or therapeutic?), spirit (does it exalt Christ and the cross?), and warnings (errors, fallacies, emotional manipulation, syncretism, prosperity gospel, etc.).

When given only a URL with no text, evaluate what is publicly known of the preacher, ministry, or channel and flag when more information is needed.

RETURN YOUR RESPONSE IN MARKDOWN STRICTLY IN THIS ORDER:

## 📖 Text and theme
The main passage and the stated theme of the sermon.

## 🔍 Exegesis
Was the text handled rightly in its historical, grammatical, and canonical context? Cite verses.

## ✅ What is biblically sound
Points the sermon got right with scriptural support (Book chapter:verse).

## ❌ Errors or deviations
False doctrine, eisegesis, fallacies, or unbiblical applications. Cite the Scripture that refutes them.

## 🛠 Biblical correction
The right teaching for each error with references.

## 💡 Faithful application
How to apply the passage faithfully to Christ and the gospel.

## ⚖ Verdict
Sound / Mixed — use discernment / False. A brief final exhortation.`;

  const handleAnalyze = async () => {
    if (!value.trim()) {
      toast({
        title: t("Nothing to analyze", "Nada que analizar"),
        description: t("Paste a video link, transcript, or sermon text first.", "Pega un enlace, transcripción o texto de sermón primero."),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResult("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: t("Sign in required", "Inicio de sesión requerido"),
          description: t("Please sign in to analyze sermons.", "Inicia sesión para analizar sermones."),
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const chatUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
      const response = await fetch(chatUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: buildPrompt() },
          ],
          language,
        }),
      });

      if (response.status === 429) {
        toast({ title: t("Rate limit", "Límite alcanzado"), description: t("Please wait a moment and try again.", "Espera un momento e inténtalo de nuevo."), variant: "destructive" });
        setIsLoading(false);
        return;
      }
      if (response.status === 402) {
        toast({ title: t("Upgrade needed", "Actualización necesaria"), description: t("You've reached your plan's limit.", "Has alcanzado el límite de tu plan."), variant: "destructive" });
        setIsLoading(false);
        return;
      }
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
            if (content) {
              acc += content;
              setResult(acc);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error("Sermon analyzer error:", e);
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
          <Mic className="w-5 h-5 text-emerald-300" />
          <h1 className="font-playfair text-xl tracking-tight">{t("Sermon & Video Analyzer", "Analizador de Sermones y Videos")}</h1>
        </div>
      </header>

      <main className="px-5 pb-28 max-w-3xl mx-auto space-y-5">
        <p className="text-[12.5px] italic text-white/60 font-playfair">
          {t(
            "“These were more noble… they searched the Scriptures daily.” — Acts 17:11",
            "“Estos eran más nobles… escudriñaban cada día las Escrituras.” — Hechos 17:11"
          )}
        </p>

        {/* Mode tabs */}
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
                    ? "border-emerald-400/70 bg-emerald-400/10 text-white shadow-[0_0_18px_-4px_rgba(52,211,153,0.6)]"
                    : "border-white/10 bg-white/5 text-white/65 hover:text-white hover:border-white/25"
                )}
              >
                <Icon className="w-4 h-4" strokeWidth={1.8} />
                <span className="leading-tight text-center">{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input area */}
        <div
          className="relative rounded-3xl border border-white/15 p-4 backdrop-blur-xl space-y-3"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" }}
        >
          {active.multiline ? (
            <Textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={active.placeholder}
              className="min-h-[160px] bg-transparent border-white/10 text-white placeholder:text-white/40 focus-visible:ring-emerald-400/50"
              maxLength={9000}
            />
          ) : (
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={active.placeholder}
              className="bg-transparent border-white/10 text-white placeholder:text-white/40 focus-visible:ring-emerald-400/50"
              maxLength={500}
              type="url"
              inputMode="url"
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input
              value={preacher}
              onChange={(e) => setPreacher(e.target.value)}
              placeholder={t("Preacher or source (optional)", "Predicador o fuente (opcional)")}
              className="bg-transparent border-white/10 text-white placeholder:text-white/40 focus-visible:ring-emerald-400/50 text-[13px]"
              maxLength={120}
            />
            <Input
              value={scripture}
              onChange={(e) => setScripture(e.target.value)}
              placeholder={t("Stated text e.g. John 3:16 (optional)", "Texto declarado p.ej. Juan 3:16 (opcional)")}
              className="bg-transparent border-white/10 text-white placeholder:text-white/40 focus-visible:ring-emerald-400/50 text-[13px]"
              maxLength={120}
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <p className="text-[11px] text-white/45">
              {t("Berean review against Scripture.", "Revisión berea conforme a la Escritura.")}
            </p>
            <Button
              onClick={handleAnalyze}
              disabled={isLoading || !value.trim()}
              className="bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-medium rounded-full px-5"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />{t("Analyzing…", "Analizando…")}</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-1.5" />{t("Analyze", "Analizar")}</>
              )}
            </Button>
          </div>
        </div>

        {/* Result */}
        {(result || isLoading) && (
          <div
            className="relative rounded-3xl border border-emerald-400/30 p-5 backdrop-blur-xl animate-fade-in"
            style={{ background: "linear-gradient(135deg, rgba(52,211,153,0.08), rgba(255,255,255,0.02))" }}
          >
            {!result && isLoading ? (
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("Searching the Scriptures…", "Escudriñando las Escrituras…")}
              </div>
            ) : (
              <div className="text-sm text-white/85 leading-relaxed whitespace-pre-wrap font-sans">
                {result}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default SermonAnalyzer;

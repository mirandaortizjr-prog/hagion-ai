import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Link2, Quote, Users, FileText, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { PremiumNav } from "@/components/PremiumNav";
import { cn } from "@/lib/utils";

type InputMode = "url" | "claim" | "movement" | "text";

const TestSpirits = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = (en: string, es: string) => (language === "es" ? es : en);

  const [mode, setMode] = useState<InputMode>("claim");
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState("");

  const modes: { id: InputMode; label: string; placeholder: string; icon: typeof Link2; multiline?: boolean }[] = [
    {
      id: "url",
      label: t("Video / URL", "Video / URL"),
      placeholder: t("Paste a YouTube or video link…", "Pega un enlace de YouTube o video…"),
      icon: Link2,
    },
    {
      id: "claim",
      label: t("Claim", "Afirmación"),
      placeholder: t("State the claim or teaching to test…", "Escribe la afirmación o enseñanza a probar…"),
      icon: Quote,
      multiline: true,
    },
    {
      id: "movement",
      label: t("Movement", "Movimiento"),
      placeholder: t("Name a movement, ministry, or figure…", "Nombra un movimiento, ministerio o figura…"),
      icon: Users,
    },
    {
      id: "text",
      label: t("Paste text", "Pegar texto"),
      placeholder: t("Paste a sermon, transcript, or excerpt…", "Pega un sermón, transcripción o extracto…"),
      icon: FileText,
      multiline: true,
    },
  ];

  const active = modes.find((m) => m.id === mode)!;

  const buildPrompt = () => {
    const labels: Record<InputMode, string> = {
      url: t("VIDEO/URL TO TEST", "VIDEO/URL A PROBAR"),
      claim: t("CLAIM TO TEST", "AFIRMACIÓN A PROBAR"),
      movement: t("MOVEMENT/FIGURE TO TEST", "MOVIMIENTO/FIGURA A PROBAR"),
      text: t("TEXT TO TEST", "TEXTO A PROBAR"),
    };
    return `${labels[mode]}:\n${value.trim()}`;
  };

  const systemPrompt = language === "es"
    ? `Eres un examinador berea. Pruebas todo enseñanza, afirmación, movimiento o video por la Escritura sola (Sola Scriptura), sin desviarte de la fe cristiana histórica y bíblica. Eres claro, directo y caritativo, pero nunca comprometes la verdad. Defiendes el cristianismo como la verdad exclusiva revelada en la Biblia (66 libros del canon protestante).

DEVUELVE TU RESPUESTA EN MARKDOWN ESTRICTAMENTE EN ESTE ORDEN Y FORMATO:

## Resumen
Una o dos oraciones: ¿es bíblicamente sano, mixto o falso?

## ✅ Lo que es verdadero
Lista de los puntos principales que SÍ se alinean con la Escritura. Cita versículos exactos (libro capítulo:versículo).

## ❌ Lo que es falso o engañoso
Lista de los errores doctrinales, falacias lógicas o desviaciones. Cita la Escritura que los refuta.

## 🛠 Corrección bíblica
Para cada error, da la enseñanza bíblica correcta con referencias.

## ⚖ Veredicto
Una conclusión clara: Sano / Mixto con precaución / Falso. Una exhortación final breve.

Si te dan solo una URL sin contexto, evalúa lo que es públicamente conocido del recurso, autor o canal y advierte cuando hagan falta más datos.`
    : `You are a Berean examiner. You test every teaching, claim, movement, or video by Scripture alone (Sola Scriptura), never deviating from the historic biblical Christian faith. You are clear, direct, and charitable, but never compromise truth. You defend Christianity as the exclusive truth revealed in the Bible (66-book Protestant canon).

RETURN YOUR RESPONSE IN MARKDOWN STRICTLY IN THIS ORDER AND FORMAT:

## Summary
One or two sentences: is this biblically sound, mixed, or false?

## ✅ What is true
List the main points that DO align with Scripture. Cite exact verses (Book chapter:verse).

## ❌ What is false or misleading
List the doctrinal errors, logical fallacies, or deviations. Cite the Scripture that refutes them.

## 🛠 Biblical correction
For each error, give the correct biblical teaching with references.

## ⚖ Verdict
A clear conclusion: Sound / Mixed — use caution / False. A brief final exhortation.

If given only a URL with no context, evaluate what is publicly known about the resource, author, or channel and flag when more information is needed.`;

  const handleTest = async () => {
    if (!value.trim()) {
      toast({
        title: t("Nothing to test", "Nada que probar"),
        description: t("Add a URL, claim, movement, or text first.", "Añade un URL, afirmación, movimiento o texto primero."),
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
          description: t("Please sign in to use Test the Spirits.", "Inicia sesión para usar Probad los Espíritus."),
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
      console.error("Test the Spirits error:", e);
      toast({ title: t("Error", "Error"), description: t("Could not complete the test. Try again.", "No se pudo completar la prueba. Intenta de nuevo."), variant: "destructive" });
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
          <ShieldCheck className="w-5 h-5 text-sky-300" />
          <h1 className="font-playfair text-xl tracking-tight">{t("Test the Spirits", "Probad los Espíritus")}</h1>
        </div>
      </header>

      <main className="px-5 pb-28 max-w-3xl mx-auto space-y-5">
        <p className="text-[12.5px] italic text-white/60 font-playfair">
          {t(
            "“Test the spirits to see whether they are from God.” — 1 John 4:1",
            "“Probad los espíritus si son de Dios.” — 1 Juan 4:1"
          )}
        </p>

        {/* Mode tabs */}
        <div className="grid grid-cols-4 gap-2">
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

        {/* Input area */}
        <div
          className="relative rounded-3xl border border-white/15 p-4 backdrop-blur-xl"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))" }}
        >
          {active.multiline ? (
            <Textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={active.placeholder}
              className="min-h-[140px] bg-transparent border-white/10 text-white placeholder:text-white/40 focus-visible:ring-sky-400/50"
              maxLength={6000}
            />
          ) : (
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={active.placeholder}
              className="bg-transparent border-white/10 text-white placeholder:text-white/40 focus-visible:ring-sky-400/50"
              maxLength={500}
              type={mode === "url" ? "url" : "text"}
              inputMode={mode === "url" ? "url" : "text"}
            />
          )}

          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-[11px] text-white/45">
              {t("Weighed strictly against Scripture.", "Examinado estrictamente con la Escritura.")}
            </p>
            <Button
              onClick={handleTest}
              disabled={isLoading || !value.trim()}
              className="bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-black font-medium rounded-full px-5"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />{t("Testing…", "Probando…")}</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-1.5" />{t("Test it", "Probarlo")}</>
              )}
            </Button>
          </div>
        </div>

        {/* Result */}
        {(result || isLoading) && (
          <div
            className="relative rounded-3xl border border-sky-400/30 p-5 backdrop-blur-xl animate-fade-in"
            style={{ background: "linear-gradient(135deg, rgba(56,189,248,0.08), rgba(255,255,255,0.02))" }}
          >
            {!result && isLoading ? (
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("Examining against Scripture…", "Examinando con la Escritura…")}
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

export default TestSpirits;

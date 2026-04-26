import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, ScrollText, FileText, Loader2, Sparkles } from "lucide-react";
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

type InputMode = "title" | "passage" | "claim";

const ReligiousTextsChecker = () => {
  const __lockAccess = useTierAccess();
  if (!__lockAccess.isLoading && !__lockAccess.canUse("doctrine_analysis")) {
    return (
      <FeatureLockCard
        requiredTier="premium_plus"
        featureName={language === "es" ? "Verificador de Textos" : "Religious Texts Checker"}
      />
    );
  }

  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = (en: string, es: string) => (language === "es" ? es : en);

  const [mode, setMode] = useState<InputMode>("title");
  const [author, setAuthor] = useState("");
  const [tradition, setTradition] = useState("");
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState("");

  const modes: { id: InputMode; label: string; placeholder: string; icon: typeof BookOpen; multiline?: boolean }[] = [
    { id: "title", label: t("Title / book", "Título / libro"), placeholder: t("e.g. Book of Mormon, Quran, A Course in Miracles…", "ej. Libro de Mormón, Corán, Un Curso de Milagros…"), icon: BookOpen },
    { id: "passage", label: t("Passage", "Pasaje"), placeholder: t("Paste the passage or excerpt to evaluate…", "Pega el pasaje o extracto a evaluar…"), icon: FileText, multiline: true },
    { id: "claim", label: t("Claim / revelation", "Afirmación"), placeholder: t("Paste the claim, prophecy, or modern revelation…", "Pega la afirmación, profecía o revelación moderna…"), icon: ScrollText, multiline: true },
  ];

  const active = modes.find((m) => m.id === mode)!;

  const buildPrompt = () => {
    const labels: Record<InputMode, string> = {
      title: t("TITLE / BOOK", "TÍTULO / LIBRO"),
      passage: t("PASSAGE", "PASAJE"),
      claim: t("CLAIM / REVELATION", "AFIRMACIÓN / REVELACIÓN"),
    };
    const parts = [`${labels[mode]}:\n${value.trim()}`];
    if (author.trim()) parts.push(`${t("AUTHOR / SOURCE", "AUTOR / FUENTE")}: ${author.trim()}`);
    if (tradition.trim()) parts.push(`${t("TRADITION / RELIGION", "TRADICIÓN / RELIGIÓN")}: ${tradition.trim()}`);
    return parts.join("\n\n");
  };

  const systemPrompt = language === "es"
    ? `Eres un examinador berea de textos religiosos. Pruebas todo escrito sagrado, libro espiritual, revelación moderna o texto extrabíblico a la luz de la Escritura sola (Sola Scriptura), sin desviarte de la fe cristiana histórica y bíblica (canon protestante de 66 libros). El canon de 66 libros está cerrado (Apocalipsis 22:18-19); ninguna revelación posterior tiene autoridad sobre la Biblia. Eres claro, directo y caritativo, pero nunca comprometes la verdad. Defiendes el cristianismo bíblico como la verdad exclusiva revelada en la Biblia.

Examinas: alineación escritural (¿contradice la Escritura?), coherencia teológica (Dios, Cristo, evangelio, salvación), reclamos de autoridad (¿quién lo escribió y por qué autoridad?), precisión histórica, profecía cumplida o fallida, consistencia interna, fruto espiritual de los seguidores y origen probable (humano, demoníaco o divino).

DEVUELVE TU RESPUESTA EN MARKDOWN ESTRICTAMENTE EN ESTE ORDEN:

## 📜 Identidad del texto
Título, autor, fecha, tradición y estatus de autoridad reclamado.

## 📋 Contenido principal
Resumen de lo que enseña.

## ✅ Donde se alinea con la Escritura
Puntos coincidentes, con referencias bíblicas.

## ❌ Donde contradice la Escritura
Errores doctrinales, históricos o profecías fallidas — refutados con la Palabra.

## 🛠 La verdad bíblica
La doctrina correcta para cada desviación.

## 🚫 Reclamos de autoridad
Evaluación de su pretendida inspiración o revelación a la luz del canon cerrado.

## ⚖ Veredicto
Bíblico / Mixto — leer con extremo discernimiento / Falso / Engaño espiritual. Una exhortación final breve.`
    : `You are a Berean examiner of religious texts. You test every sacred writing, spiritual book, modern revelation, or extrabiblical text by Scripture alone (Sola Scriptura), never deviating from the historic biblical Christian faith (66-book Protestant canon). The 66-book canon is closed (Revelation 22:18-19); no later revelation has authority over the Bible. You are clear, direct, and charitable, but never compromise truth. You defend biblical Christianity as the exclusive truth revealed in the Bible.

You examine: scriptural alignment (does it contradict Scripture?), theological coherence (God, Christ, gospel, salvation), authority claims (who wrote it and by what authority?), historical accuracy, fulfilled or failed prophecy, internal consistency, spiritual fruit of the followers, and likely origin (human, demonic, or divine).

RETURN YOUR RESPONSE IN MARKDOWN STRICTLY IN THIS ORDER:

## 📜 Text identity
Title, author, date, tradition, and claimed authority status.

## 📋 Core content
Summary of what it teaches.

## ✅ Where it aligns with Scripture
Points of agreement, with biblical references.

## ❌ Where it contradicts Scripture
Doctrinal errors, historical errors, or failed prophecies — refuted with the Word.

## 🛠 The biblical truth
The correct doctrine for each deviation.

## 🚫 Authority claims
Assessment of its claimed inspiration or revelation in light of the closed canon.

## ⚖ Verdict
Biblical / Mixed — read with extreme discernment / False / Spiritual deception. A brief final exhortation.`;

  const handleAnalyze = async () => {
    if (!value.trim()) {
      toast({ title: t("Nothing to analyze", "Nada que analizar"), description: t("Enter a title, passage, or claim first.", "Ingresa título, pasaje o afirmación primero."), variant: "destructive" });
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
      console.error("Religious texts checker error:", e);
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
          <BookOpen className="w-5 h-5 text-blue-300" />
          <h1 className="font-playfair text-xl tracking-tight">{t("Religious Texts", "Textos Religiosos")}</h1>
        </div>
      </header>

      <main className="px-5 pb-28 max-w-3xl mx-auto space-y-5">
        <p className="text-[12.5px] italic text-white/60 font-playfair">
          {t(
            "“To the law and to the testimony! If they speak not according to this word, it is because there is no light in them.” — Isaiah 8:20",
            "“¡A la ley y al testimonio! Si no dijeren conforme a esto, es porque no les ha amanecido.” — Isaías 8:20"
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
                    ? "border-blue-400/70 bg-blue-400/10 text-white shadow-[0_0_18px_-4px_rgba(96,165,250,0.6)]"
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
              className="min-h-[180px] bg-transparent border-white/10 text-white placeholder:text-white/40 focus-visible:ring-blue-400/50" maxLength={9000} />
          ) : (
            <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder={active.placeholder}
              className="bg-transparent border-white/10 text-white placeholder:text-white/40 focus-visible:ring-blue-400/50" maxLength={500} />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder={t("Author / source (optional)", "Autor / fuente (opcional)")}
              className="bg-transparent border-white/10 text-white placeholder:text-white/40 focus-visible:ring-blue-400/50 text-[13px]" maxLength={120} />
            <Input value={tradition} onChange={(e) => setTradition(e.target.value)} placeholder={t("Tradition / religion (optional)", "Tradición / religión (opcional)")}
              className="bg-transparent border-white/10 text-white placeholder:text-white/40 focus-visible:ring-blue-400/50 text-[13px]" maxLength={120} />
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <p className="text-[11px] text-white/45">{t("Weighed against the Word of God.", "Examinado conforme a la Palabra de Dios.")}</p>
            <Button onClick={handleAnalyze} disabled={isLoading || !value.trim()}
              className="bg-gradient-to-r from-blue-500 to-indigo-400 hover:from-blue-400 hover:to-indigo-300 text-black font-medium rounded-full px-5">
              {isLoading ? (<><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />{t("Analyzing…", "Analizando…")}</>) : (<><Sparkles className="w-4 h-4 mr-1.5" />{t("Analyze", "Analizar")}</>)}
            </Button>
          </div>
        </div>

        {(result || isLoading) && (
          <div className="relative rounded-3xl border border-blue-400/30 p-5 backdrop-blur-xl animate-fade-in"
            style={{ background: "linear-gradient(135deg, rgba(96,165,250,0.08), rgba(255,255,255,0.02))" }}>
            {!result && isLoading ? (
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />{t("Searching the Scriptures…", "Escudriñando las Escrituras…")}
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

export default ReligiousTextsChecker;

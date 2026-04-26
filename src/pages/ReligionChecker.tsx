import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Globe, BookOpen, Loader2, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { PremiumNav } from "@/components/PremiumNav";
import { cn } from "@/lib/utils";

type InputMode = "religion" | "denomination" | "claim";

const ReligionChecker = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = (en: string, es: string) => (language === "es" ? es : en);

  const [mode, setMode] = useState<InputMode>("religion");
  const [focus, setFocus] = useState("");
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState("");

  const modes: { id: InputMode; label: string; placeholder: string; icon: typeof Globe; multiline?: boolean }[] = [
    {
      id: "religion",
      label: t("World religion", "Religión"),
      placeholder: t(
        "Name a religion to examine — e.g. Islam, Buddhism, Hinduism, Mormonism, Jehovah's Witnesses…",
        "Nombra una religión a examinar — p.ej. islam, budismo, hinduismo, mormonismo, testigos de Jehová…"
      ),
      icon: Globe,
    },
    {
      id: "denomination",
      label: t("Denomination", "Denominación"),
      placeholder: t(
        "Name a denomination or movement — e.g. Roman Catholicism, Eastern Orthodoxy, Pentecostalism, NAR…",
        "Nombra una denominación o movimiento — p.ej. catolicismo romano, ortodoxia oriental, pentecostalismo, NAR…"
      ),
      icon: Users,
    },
    {
      id: "claim",
      label: t("Specific belief", "Creencia específica"),
      placeholder: t(
        "Paste a specific doctrine, teaching, or claim from the religion or group…",
        "Pega una doctrina, enseñanza o afirmación específica de la religión o grupo…"
      ),
      icon: BookOpen,
      multiline: true,
    },
  ];

  const active = modes.find((m) => m.id === mode)!;

  const buildPrompt = () => {
    const labels: Record<InputMode, string> = {
      religion: t("RELIGION", "RELIGIÓN"),
      denomination: t("DENOMINATION / MOVEMENT", "DENOMINACIÓN / MOVIMIENTO"),
      claim: t("BELIEF / CLAIM", "CREENCIA / AFIRMACIÓN"),
    };
    const parts = [`${labels[mode]}:\n${value.trim()}`];
    if (focus.trim()) {
      parts.push(`${t("AREA OF FOCUS", "ÁREA DE ENFOQUE")}: ${focus.trim()}`);
    }
    return parts.join("\n\n");
  };

  const systemPrompt = language === "es"
    ? `Eres un examinador berea de religiones y sistemas de creencias. Examinas cada religión, denominación, secta o doctrina a la luz de la Escritura sola (Sola Scriptura), sin desviarte de la fe cristiana histórica y bíblica (canon protestante de 66 libros). Defiendes el cristianismo bíblico como la verdad exclusiva revelada por Dios en Cristo (Juan 14:6; Hechos 4:12). Eres claro, directo, caritativo y firme — nunca comprometes la verdad ni adoptas pluralismo religioso.

Comparas su visión de: Dios y la Trinidad, la persona y obra de Cristo, las Escrituras y su autoridad, el pecado y la condición humana, la salvación (gracia, fe, obras), la iglesia, la escatología, y prácticas distintivas. Identificas claramente herejías, sincretismo, idolatría, falsa cristología, falso evangelio, y desviaciones del canon.

DEVUELVE TU RESPUESTA EN MARKDOWN ESTRICTAMENTE EN ESTE ORDEN:

## 🌐 Identidad
Nombre, origen histórico, fundador y textos sagrados (si aplica).

## 📋 Creencias centrales
Resumen de sus enseñanzas principales sobre Dios, Cristo, salvación y autoridad.

## ✅ Puntos de contacto con la Escritura
Donde existan, áreas que reflejan verdad común o puntos de partida apologéticos. Cita Escritura.

## ❌ Errores y desviaciones
Doctrinas que contradicen la Escritura — falsa visión de Dios, falso Cristo, falso evangelio, autoridad humana sobre la Biblia, etc. Refuta cada una con texto bíblico claro.

## 🛠 La verdad bíblica
La enseñanza correcta de la Biblia para cada error principal, con referencias.

## ✝️ El evangelio para sus seguidores
Cómo presentar a Cristo de manera fiel a alguien dentro de este sistema, con compasión y verdad.

## ⚖ Veredicto
Cristianismo bíblico / Cristianismo desviado / Religión no cristiana / Secta / Falsa religión. Una exhortación pastoral final breve.`
    : `You are a Berean examiner of religions and belief systems. You evaluate every religion, denomination, sect, or doctrine by Scripture alone (Sola Scriptura), never deviating from the historic biblical Christian faith (66-book Protestant canon). You defend biblical Christianity as the exclusive truth revealed by God in Christ (John 14:6; Acts 4:12). You are clear, direct, charitable and firm — you never compromise truth or adopt religious pluralism.

You compare each system's view of: God and the Trinity, the person and work of Christ, Scripture and its authority, sin and the human condition, salvation (grace, faith, works), the church, eschatology, and distinctive practices. You clearly identify heresy, syncretism, idolatry, false Christology, false gospel, and any departure from the canon.

RETURN YOUR RESPONSE IN MARKDOWN STRICTLY IN THIS ORDER:

## 🌐 Identity
Name, historical origin, founder, and sacred texts (if applicable).

## 📋 Core beliefs
Summary of its main teachings about God, Christ, salvation, and authority.

## ✅ Points of contact with Scripture
Where they exist, areas of common truth or apologetic starting points. Cite Scripture.

## ❌ Errors and deviations
Doctrines that contradict Scripture — false view of God, false Christ, false gospel, human authority over the Bible, etc. Refute each with clear biblical text.

## 🛠 The biblical truth
The correct biblical teaching for each major error, with references.

## ✝️ The gospel for its followers
How to faithfully present Christ to someone inside this system, with compassion and truth.

## ⚖ Verdict
Biblical Christianity / Deviant Christianity / Non-Christian religion / Cult / False religion. A brief final pastoral exhortation.`;

  const handleAnalyze = async () => {
    if (!value.trim()) {
      toast({
        title: t("Nothing to examine", "Nada que examinar"),
        description: t("Name a religion, denomination, or belief first.", "Nombra una religión, denominación o creencia primero."),
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
          description: t("Please sign in to use the Religion Checker.", "Inicia sesión para usar el Verificador de Religiones."),
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
      console.error("Religion checker error:", e);
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
          <Globe className="w-5 h-5 text-rose-300" />
          <h1 className="font-playfair text-xl tracking-tight">{t("Religion Checker", "Verificador de Religiones")}</h1>
        </div>
      </header>

      <main className="px-5 pb-28 max-w-3xl mx-auto space-y-5">
        <p className="text-[12.5px] italic text-white/60 font-playfair">
          {t(
            "“I am the way, and the truth, and the life. No one comes to the Father except through me.” — John 14:6",
            "“Yo soy el camino, la verdad y la vida; nadie viene al Padre sino por mí.” — Juan 14:6"
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
                    ? "border-rose-400/70 bg-rose-400/10 text-white shadow-[0_0_18px_-4px_rgba(251,113,133,0.6)]"
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
              className="min-h-[160px] bg-transparent border-white/10 text-white placeholder:text-white/40 focus-visible:ring-rose-400/50"
              maxLength={6000}
            />
          ) : (
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={active.placeholder}
              className="bg-transparent border-white/10 text-white placeholder:text-white/40 focus-visible:ring-rose-400/50"
              maxLength={200}
            />
          )}

          <Input
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            placeholder={t(
              "Area of focus (optional) — e.g. salvation, view of Jesus, authority of Scripture",
              "Área de enfoque (opcional) — p.ej. salvación, visión de Jesús, autoridad de la Escritura"
            )}
            className="bg-transparent border-white/10 text-white placeholder:text-white/40 focus-visible:ring-rose-400/50 text-[13px]"
            maxLength={160}
          />

          <div className="flex items-center justify-between gap-3 pt-1">
            <p className="text-[11px] text-white/45">
              {t("Weighed against the Word of God.", "Examinado conforme a la Palabra de Dios.")}
            </p>
            <Button
              onClick={handleAnalyze}
              disabled={isLoading || !value.trim()}
              className="bg-gradient-to-r from-rose-500 to-pink-400 hover:from-rose-400 hover:to-pink-300 text-black font-medium rounded-full px-5"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />{t("Examining…", "Examinando…")}</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-1.5" />{t("Examine", "Examinar")}</>
              )}
            </Button>
          </div>
        </div>

        {/* Result */}
        {(result || isLoading) && (
          <div
            className="relative rounded-3xl border border-rose-400/30 p-5 backdrop-blur-xl animate-fade-in"
            style={{ background: "linear-gradient(135deg, rgba(251,113,133,0.08), rgba(255,255,255,0.02))" }}
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

export default ReligionChecker;

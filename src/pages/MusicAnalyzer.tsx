import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Link2, Music, Loader2, Sparkles } from "lucide-react";
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

type InputMode = "url" | "lyrics";

const MusicAnalyzer = () => {
  const __lockAccess = useTierAccess();
  if (!__lockAccess.isLoading && !__lockAccess.canUse("lyric_analysis")) {
    return (
      <FeatureLockCard
        requiredTier="premium_plus"
        featureName={language === "es" ? "Analizador de Música" : "Music & Lyric Analyzer"}
      />
    );
  }

  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = (en: string, es: string) => (language === "es" ? es : en);

  const [mode, setMode] = useState<InputMode>("url");
  const [songTitle, setSongTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState("");

  const modes: { id: InputMode; label: string; placeholder: string; icon: typeof Link2; multiline?: boolean }[] = [
    {
      id: "url",
      label: t("Song URL", "URL canción"),
      placeholder: t("Paste a YouTube, Spotify, Apple Music, or SoundCloud link…", "Pega un enlace de YouTube, Spotify, Apple Music o SoundCloud…"),
      icon: Link2,
    },
    {
      id: "lyrics",
      label: t("Lyrics", "Letra"),
      placeholder: t("Paste the full lyrics here…", "Pega la letra completa aquí…"),
      icon: Music,
      multiline: true,
    },
  ];

  const active = modes.find((m) => m.id === mode)!;

  const buildPrompt = () => {
    const labels: Record<InputMode, string> = {
      url: t("SONG URL", "URL DE LA CANCIÓN"),
      lyrics: t("LYRICS", "LETRA"),
    };
    const parts = [`${labels[mode]}:\n${value.trim()}`];
    if (songTitle.trim()) parts.push(`${t("SONG TITLE", "TÍTULO DE LA CANCIÓN")}: ${songTitle.trim()}`);
    if (artist.trim()) parts.push(`${t("ARTIST", "ARTISTA")}: ${artist.trim()}`);
    if (mode === "url") {
      parts.push(t(
        "If you cannot fetch the lyrics from the URL, evaluate based on what is publicly known about the song, artist, and album. Flag clearly if the lyrics could not be verified.",
        "Si no puedes obtener la letra desde el URL, evalúa según lo que se conoce públicamente de la canción, artista y álbum. Indica claramente si la letra no pudo ser verificada."
      ));
    }
    return parts.join("\n\n");
  };

  const systemPrompt = language === "es"
    ? `Eres un examinador berea de música. Pruebas la letra y el espíritu de cada canción a la luz de la Escritura sola (Sola Scriptura), sin desviarte de la fe cristiana histórica y bíblica (canon protestante de 66 libros). Eres claro, directo y caritativo, pero nunca comprometes la verdad. Defiendes el cristianismo como la verdad exclusiva revelada en la Biblia.

Examinas: teología (¿qué dice de Dios, Cristo, el evangelio, el pecado, la salvación?), espíritu (¿exalta a Cristo o al yo, la carne, el ocultismo, el mundo?), tono y propósito, y advertencias (sincretismo, prosperidad, pop-cristianismo vacío, ocultismo, sexualidad, rebeldía, idolatría, etc.).

DEVUELVE TU RESPUESTA EN MARKDOWN ESTRICTAMENTE EN ESTE ORDEN:

## 🎵 Canción y artista
Título, artista y género si se conocen.

## 📝 Mensaje principal
En 1–2 oraciones, ¿qué comunica la letra?

## 🧭 Análisis teológico
¿Qué dice (o implica) sobre Dios, Cristo, el evangelio y la persona? Cita Escritura.

## ✅ Lo que es bíblicamente sano
Líneas o ideas que se alinean con la Escritura, con referencias.

## ❌ Lo que es problemático o falso
Líneas o ideas que se desvían — doctrina falsa, sincretismo, ocultismo, idolatría, etc. — refutadas con Escritura.

## 🛠 Corrección bíblica
La verdad bíblica para cada error.

## ⚖ Veredicto
Sano para escuchar / Mixto — usar discernimiento / Evitar. Una exhortación final breve.`
    : `You are a Berean music examiner. You test the lyrics and spirit of every song by Scripture alone (Sola Scriptura), never deviating from the historic biblical Christian faith (66-book Protestant canon). You are clear, direct, and charitable, but never compromise truth. You defend Christianity as the exclusive truth revealed in the Bible.

You examine: theology (what does it say about God, Christ, the gospel, sin, salvation?), spirit (does it exalt Christ or self, the flesh, the occult, the world?), tone and purpose, and warnings (syncretism, prosperity, empty Christian pop, occult themes, sexuality, rebellion, idolatry, etc.).

RETURN YOUR RESPONSE IN MARKDOWN STRICTLY IN THIS ORDER:

## 🎵 Song and artist
Title, artist, and genre if known.

## 📝 Core message
In 1–2 sentences, what does the lyric communicate?

## 🧭 Theological analysis
What does it say (or imply) about God, Christ, the gospel, and the person? Cite Scripture.

## ✅ What is biblically sound
Lines or ideas that align with Scripture, with references.

## ❌ What is problematic or false
Lines or ideas that deviate — false doctrine, syncretism, occult, idolatry, etc. — refuted with Scripture.

## 🛠 Biblical correction
The biblical truth for each error.

## ⚖ Verdict
Safe to listen / Mixed — use discernment / Avoid. A brief final exhortation.`;

  const handleAnalyze = async () => {
    if (!value.trim()) {
      toast({
        title: t("Nothing to analyze", "Nada que analizar"),
        description: t("Paste a song URL or lyrics first.", "Pega un URL o letra primero."),
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
          description: t("Please sign in to analyze music.", "Inicia sesión para analizar música."),
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
      console.error("Music analyzer error:", e);
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
          <Music className="w-5 h-5 text-fuchsia-300" />
          <h1 className="font-playfair text-xl tracking-tight">{t("Music Analyzer", "Analizador Musical")}</h1>
        </div>
      </header>

      <main className="px-5 pb-28 max-w-3xl mx-auto space-y-5">
        <p className="text-[12.5px] italic text-white/60 font-playfair">
          {t(
            "“Whatever is true, whatever is pure… think on these things.” — Philippians 4:8",
            "“Todo lo que es verdadero, todo lo puro… en esto pensad.” — Filipenses 4:8"
          )}
        </p>

        {/* Mode tabs */}
        <div className="grid grid-cols-2 gap-2">
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
                    ? "border-fuchsia-400/70 bg-fuchsia-400/10 text-white shadow-[0_0_18px_-4px_rgba(192,132,252,0.6)]"
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
              className="min-h-[180px] bg-transparent border-white/10 text-white placeholder:text-white/40 focus-visible:ring-fuchsia-400/50"
              maxLength={9000}
            />
          ) : (
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={active.placeholder}
              className="bg-transparent border-white/10 text-white placeholder:text-white/40 focus-visible:ring-fuchsia-400/50"
              maxLength={500}
              type="url"
              inputMode="url"
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input
              value={songTitle}
              onChange={(e) => setSongTitle(e.target.value)}
              placeholder={t("Song title (optional)", "Título de la canción (opcional)")}
              className="bg-transparent border-white/10 text-white placeholder:text-white/40 focus-visible:ring-fuchsia-400/50 text-[13px]"
              maxLength={120}
            />
            <Input
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder={t("Artist (optional)", "Artista (opcional)")}
              className="bg-transparent border-white/10 text-white placeholder:text-white/40 focus-visible:ring-fuchsia-400/50 text-[13px]"
              maxLength={120}
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <p className="text-[11px] text-white/45">
              {t("Weighed against the Word of God.", "Examinado conforme a la Palabra de Dios.")}
            </p>
            <Button
              onClick={handleAnalyze}
              disabled={isLoading || !value.trim()}
              className="bg-gradient-to-r from-fuchsia-500 to-purple-400 hover:from-fuchsia-400 hover:to-purple-300 text-black font-medium rounded-full px-5"
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
            className="relative rounded-3xl border border-fuchsia-400/30 p-5 backdrop-blur-xl animate-fade-in"
            style={{ background: "linear-gradient(135deg, rgba(192,132,252,0.08), rgba(255,255,255,0.02))" }}
          >
            {!result && isLoading ? (
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("Listening with Scripture…", "Escuchando con la Escritura…")}
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

export default MusicAnalyzer;

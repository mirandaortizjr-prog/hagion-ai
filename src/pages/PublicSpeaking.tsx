import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Loader2, BookOpen, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PremiumNav } from "@/components/PremiumNav";

const PublicSpeaking = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sermonText, setSermonText] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<string>("");

  const handleCheckSermon = async () => {
    if (!sermonText.trim()) {
      toast({
        title: "No sermon text",
        description: "Please enter sermon text to check",
        variant: "destructive"
      });
      return;
    }

    setIsChecking(true);
    setCheckResult("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to use this feature",
          variant: "destructive"
        });
        return;
      }

      const chatUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
      const response = await fetch(chatUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `As a biblical scholar, please analyze this sermon for theological accuracy, biblical soundness, and logical fallacies. Check if the content aligns with scripture and identify any doctrinal errors or misinterpretations:\n\n${sermonText}`
            }
          ]
        })
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to start stream');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;
      let result = "";

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              result += content;
              setCheckResult(result);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error checking sermon:', error);
      toast({
        title: "Error",
        description: "Failed to check sermon. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };

  const steps = [
    { title: "Prayer & Scripture", desc: "Begin with prayer and select a biblical passage." },
    { title: "Study the Text", desc: "Research historical context, original language, and theological meaning." },
    { title: "Identify the Main Point", desc: "Determine the central message God wants to communicate." },
    { title: "Structure the Sermon", desc: "Outline introduction, main points, and conclusion." },
    { title: "Develop Applications", desc: "Show how the text applies to modern life." },
    { title: "Add Illustrations", desc: "Use stories and examples to make points memorable." },
    { title: "Write the Introduction", desc: "Hook the audience and introduce the topic." },
    { title: "Write the Body", desc: "Expand each point with scripture and explanation." },
    { title: "Write the Conclusion", desc: "Summarize and call the listener to action." },
    { title: "Review & Refine", desc: "Edit for clarity, timing, and theological accuracy." },
  ];

  const essentials = [
    "A clear biblical text or passage",
    "Prayer and spiritual preparation",
    "Study tools — commentaries, concordances, lexicons",
    "Understanding of your audience",
    "Clear main theme or message",
    "Logical structure and flow",
    "Relevant illustrations and examples",
    "Practical applications",
    "Call to action or response",
    "Theological soundness and biblical accuracy",
  ];

  return (
    <div className="min-h-screen flex flex-col page-transition">
      {/* Floating header */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-background/40 border-b border-white/5">
        <div className="flex items-center gap-3 px-4 py-3 max-w-3xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/main-menu?tab=hagion-university")}
            className="tap-scale rounded-full hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 text-center">
            <p className="text-[11px] uppercase tracking-[0.25em] text-foreground/60">
              Hagion University
            </p>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 overflow-auto px-5 sm:px-6 pt-8 pb-32">
        <div className="max-w-2xl mx-auto">
          {/* Title */}
          <h1 className="text-center text-3xl sm:text-4xl font-bold leading-tight tracking-tight text-white mb-3 px-2">
            Sermon Lab
          </h1>

          {/* Theme pill */}
          <div className="flex justify-center mb-10">
            <span className="text-[10px] uppercase tracking-[0.3em] text-accent/90 px-3 py-1 rounded-full border border-accent/20 bg-accent/5">
              Craft & Discern
            </span>
          </div>

          {/* Divider */}
          <div className="flex items-center justify-center mb-10">
            <span className="h-px w-10 bg-foreground/20" />
            <span className="mx-3 text-foreground/30 text-xs">✦</span>
            <span className="h-px w-10 bg-foreground/20" />
          </div>

          {/* How to write a sermon */}
          <section className="mb-12">
            <h2 className="text-[11px] uppercase tracking-[0.3em] text-accent mb-5 font-semibold flex items-center justify-center gap-2">
              <BookOpen className="w-3.5 h-3.5" />
              How to Write a Sermon
            </h2>
            <p className="text-center text-[14px] text-white/70 leading-relaxed mb-6">
              A faithful guide to preparing sermons rooted in Scripture and shaped by prayer.
            </p>

            <ol className="space-y-3">
              {steps.map((s, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 border border-white/10 rounded-2xl p-4 bg-white/[0.03] backdrop-blur-sm"
                >
                  <span className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium bg-white/10 text-white/85 ring-1 ring-white/15">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-white text-[14.5px] font-medium leading-snug">{s.title}</p>
                    <p className="text-[13px] text-white/60 mt-0.5 leading-relaxed">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Divider */}
          <div className="flex items-center justify-center mb-10">
            <span className="h-px w-10 bg-foreground/20" />
            <span className="mx-3 text-foreground/30 text-xs">✦</span>
            <span className="h-px w-10 bg-foreground/20" />
          </div>

          {/* Essentials */}
          <section className="mb-12">
            <h2 className="text-[11px] uppercase tracking-[0.3em] text-accent mb-5 font-semibold text-center">
              Essential Elements
            </h2>
            <ul className="space-y-2">
              {essentials.map((e, i) => (
                <li key={i} className="flex items-start gap-2 text-[14px] text-white/80">
                  <span className="text-accent font-bold leading-relaxed">•</span>
                  <span className="leading-relaxed">{e}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Divider */}
          <div className="flex items-center justify-center mb-10">
            <span className="h-px w-10 bg-foreground/20" />
            <span className="mx-3 text-foreground/30 text-xs">✦</span>
            <span className="h-px w-10 bg-foreground/20" />
          </div>

          {/* Sermon Checker */}
          <section>
            <h2 className="text-[11px] uppercase tracking-[0.3em] text-accent mb-5 font-semibold flex items-center justify-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              Sermon Checker
            </h2>
            <p className="text-center text-[14px] text-white/70 leading-relaxed mb-6">
              Paste your sermon below to test it for theological accuracy, biblical soundness, and logical clarity.
            </p>

            <div className="border border-white/10 rounded-2xl p-4 bg-white/[0.03] backdrop-blur-sm">
              <Textarea
                placeholder="Paste your sermon text here..."
                value={sermonText}
                onChange={(e) => setSermonText(e.target.value)}
                className="min-h-[200px] bg-transparent border-white/10 text-white placeholder:text-white/40 focus-visible:ring-accent/40 resize-none"
              />

              <Button
                onClick={handleCheckSermon}
                disabled={isChecking || !sermonText.trim()}
                className="w-full mt-4 bg-accent text-accent-foreground hover:bg-accent/90 rounded-full h-11"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Examining...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Check Sermon
                  </>
                )}
              </Button>
            </div>

            {checkResult && (
              <div className="mt-6 border border-white/10 rounded-2xl p-5 bg-white/[0.03] backdrop-blur-sm">
                <h3 className="text-[10px] uppercase tracking-[0.3em] text-accent font-semibold mb-3">
                  Analysis Results
                </h3>
                <div className="text-[14px] leading-[1.8] text-white/85 whitespace-pre-wrap">
                  {checkResult}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <PremiumNav />
    </div>
  );
};

export default PublicSpeaking;

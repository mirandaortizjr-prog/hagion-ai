import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Sparkles, Loader2, Copy, BookOpen, GitCompare, AlertCircle, Lightbulb, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PremiumNav } from "@/components/PremiumNav";
import { assembleSermon, type SermonDraft } from "@/lib/sermonSteps";
import jsPDF from "jspdf";

const downloadSermonPdf = (
  title: string,
  scripture: string | null,
  body: string,
  filenameSuffix: string,
) => {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 56;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const usableWidth = pageWidth - margin * 2;
  let y = margin;

  doc.setFont("times", "bold");
  doc.setFontSize(20);
  const titleLines = doc.splitTextToSize(title || "Untitled Sermon", usableWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 24;

  if (scripture) {
    doc.setFont("times", "italic");
    doc.setFontSize(12);
    const scrLines = doc.splitTextToSize(scripture, usableWidth);
    doc.text(scrLines, margin, y);
    y += scrLines.length * 16 + 6;
  }

  doc.setDrawColor(180);
  doc.line(margin, y, pageWidth - margin, y);
  y += 18;

  doc.setFont("times", "normal");
  doc.setFontSize(12);
  const lineHeight = 18;

  const paragraphs = body.split(/\n+/);
  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) {
      y += lineHeight / 2;
      continue;
    }
    // Treat markdown headings as bold
    const headingMatch = trimmed.match(/^#{1,6}\s+(.*)/);
    if (headingMatch) {
      doc.setFont("times", "bold");
      doc.setFontSize(14);
      const lines = doc.splitTextToSize(headingMatch[1], usableWidth);
      for (const line of lines) {
        if (y > pageHeight - margin) { doc.addPage(); y = margin; }
        doc.text(line, margin, y);
        y += 20;
      }
      doc.setFont("times", "normal");
      doc.setFontSize(12);
      y += 4;
      continue;
    }
    const lines = doc.splitTextToSize(trimmed, usableWidth);
    for (const line of lines) {
      if (y > pageHeight - margin) { doc.addPage(); y = margin; }
      doc.text(line, margin, y);
      y += lineHeight;
    }
    y += 6;
  }

  const safe = (title || "sermon").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
  doc.save(`${safe || "sermon"}-${filenameSuffix}.pdf`);
};

type Refinement = {
  theological_review: string;
  consistency_review: string;
  grammar_clarity: string;
  advice: string;
  polished_sermon: string;
};

const SermonRefine = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [draft, setDraft] = useState<SermonDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [refining, setRefining] = useState(false);
  const [result, setResult] = useState<Refinement | null>(null);
  const [tab, setTab] = useState<"feedback" | "rewrite" | "original">("feedback");

  useEffect(() => {
    (async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("sermon_drafts")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error || !data) {
        toast({ title: "Sermon not found", variant: "destructive" });
        navigate("/public-speaking");
        return;
      }
      const d = data as SermonDraft;
      setDraft(d);
      // Restore previous AI output
      if (d.ai_feedback && d.ai_rewrite) {
        try {
          const parsed = JSON.parse(d.ai_feedback);
          setResult({ ...parsed, polished_sermon: d.ai_rewrite });
        } catch {
          // ignore
        }
      }
      setLoading(false);
    })();
  }, [id]);

  const assembled = draft ? assembleSermon(draft) : "";

  const handleRefine = async () => {
    if (!draft) return;
    setRefining(true);
    setResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Sign in required", variant: "destructive" });
        return;
      }
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/refine-sermon`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sermon: assembled,
          scriptureRef: draft.scripture_ref,
          title: draft.title,
        }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        toast({
          title: resp.status === 429 ? "Rate limited" : resp.status === 402 ? "Credits exhausted" : "Refine failed",
          description: err?.error || `Status ${resp.status}`,
          variant: "destructive",
        });
        return;
      }
      const parsed: Refinement = await resp.json();
      setResult(parsed);

      // Save back to draft
      const { theological_review, consistency_review, grammar_clarity, advice, polished_sermon } = parsed;
      await supabase
        .from("sermon_drafts")
        .update({
          assembled_text: assembled,
          ai_feedback: JSON.stringify({ theological_review, consistency_review, grammar_clarity, advice }),
          ai_rewrite: polished_sermon,
        })
        .eq("id", draft.id);

      setTab("feedback");
    } catch (e) {
      console.error(e);
      toast({ title: "Network error", variant: "destructive" });
    } finally {
      setRefining(false);
    }
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copied` });
  };

  if (loading || !draft) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-white/50" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col page-transition">
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-background/40 border-b border-white/5">
        <div className="flex items-center gap-3 px-4 py-3 max-w-3xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/sermon-lab/${id}`)}
            className="tap-scale rounded-full hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 text-center">
            <p className="text-[11px] uppercase tracking-[0.25em] text-foreground/60">
              Refine Sermon
            </p>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 overflow-auto px-5 sm:px-6 pt-8 pb-32">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
              {draft.title}
            </h1>
            {draft.scripture_ref && (
              <p className="text-[13px] text-accent/90 italic">{draft.scripture_ref}</p>
            )}
          </div>

          <Button
            onClick={handleRefine}
            disabled={refining || assembled.trim().length < 50}
            className="w-full h-12 bg-accent text-accent-foreground hover:bg-accent/90 rounded-full text-[14px] font-semibold mb-8"
          >
            {refining ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Examining sermon…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {result ? "Refine Again" : "Refine with AI"}
              </>
            )}
          </Button>

          {/* Tabs */}
          {result && (
            <div className="flex gap-2 mb-6 overflow-x-auto">
              {([
                ["feedback", "Feedback"],
                ["rewrite", "Polished"],
                ["original", "Original"],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`px-4 py-1.5 rounded-full text-[12px] uppercase tracking-[0.2em] border transition-colors whitespace-nowrap ${
                    tab === key
                      ? "bg-accent/20 border-accent/40 text-accent"
                      : "bg-white/[0.03] border-white/10 text-white/60 hover:text-white/80"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {!result && (
            <div className="border border-white/10 rounded-2xl p-5 bg-white/[0.03] backdrop-blur-sm">
              <p className="text-[11px] uppercase tracking-[0.3em] text-accent font-semibold mb-3">
                Assembled Draft
              </p>
              <div className="text-[13.5px] leading-[1.8] text-white/85 whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
                {assembled || "Nothing written yet."}
              </div>
            </div>
          )}

          {result && tab === "feedback" && (
            <div className="space-y-4">
              <FeedbackCard icon={<BookOpen className="w-3.5 h-3.5" />} title="Theological Review" body={result.theological_review} />
              <FeedbackCard icon={<GitCompare className="w-3.5 h-3.5" />} title="Consistency" body={result.consistency_review} />
              <FeedbackCard icon={<AlertCircle className="w-3.5 h-3.5" />} title="Grammar & Clarity" body={result.grammar_clarity} />
              <FeedbackCard icon={<Lightbulb className="w-3.5 h-3.5" />} title="Advice" body={result.advice} />
            </div>
          )}

          {result && tab === "rewrite" && (
            <div className="border border-white/10 rounded-2xl p-5 bg-white/[0.03] backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                <p className="text-[11px] uppercase tracking-[0.3em] text-accent font-semibold">
                  Polished Sermon
                </p>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => copyText(result.polished_sermon, "Polished sermon")} className="rounded-full text-white/70 h-8">
                    <Copy className="w-3.5 h-3.5 mr-1" /> Copy
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => downloadSermonPdf(draft.title, draft.scripture_ref, result.polished_sermon, "polished")} className="rounded-full text-white/70 h-8">
                    <Download className="w-3.5 h-3.5 mr-1" /> PDF
                  </Button>
                </div>
              </div>
              <div className="text-[13.5px] leading-[1.8] text-white/90 whitespace-pre-wrap">
                {result.polished_sermon}
              </div>
            </div>
          )}

          {result && tab === "original" && (
            <div className="border border-white/10 rounded-2xl p-5 bg-white/[0.03] backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                <p className="text-[11px] uppercase tracking-[0.3em] text-accent font-semibold">
                  Your Draft
                </p>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => copyText(assembled, "Draft")} className="rounded-full text-white/70 h-8">
                    <Copy className="w-3.5 h-3.5 mr-1" /> Copy
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => downloadSermonPdf(draft.title, draft.scripture_ref, assembled, "draft")} className="rounded-full text-white/70 h-8">
                    <Download className="w-3.5 h-3.5 mr-1" /> PDF
                  </Button>
                </div>
              </div>
              <div className="text-[13.5px] leading-[1.8] text-white/85 whitespace-pre-wrap">
                {assembled}
              </div>
            </div>
          )}
        </div>
      </main>

      <PremiumNav />
    </div>
  );
};

const FeedbackCard = ({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) => (
  <div className="border border-white/10 rounded-2xl p-5 bg-white/[0.03] backdrop-blur-sm">
    <p className="text-[11px] uppercase tracking-[0.3em] text-accent font-semibold mb-3 flex items-center gap-2">
      {icon}
      {title}
    </p>
    <div className="text-[13.5px] leading-[1.8] text-white/85 whitespace-pre-wrap">
      {body}
    </div>
  </div>
);

export default SermonRefine;

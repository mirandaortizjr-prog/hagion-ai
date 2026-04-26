import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2, Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { PremiumNav } from "@/components/PremiumNav";

interface Story {
  id: string;
  title: string;
  content: string;
  theme: string;
  moral_takeaway: string | null;
  era: string | null;
  law_statement: string | null;
  law_transgression: string | null;
  law_observance: string | null;
  law_interpretation: string | null;
}

const DailyWisdom = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [story, setStory] = useState<Story | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadDailyStory();
  }, []);

  const loadDailyStory = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error(t('please_signin_view_wisdom'));
        navigate("/auth");
        return;
      }

      const { data: allViews, error: viewsError } = await supabase
        .from("user_story_views")
        .select("story_id, viewed_at")
        .eq("user_id", user.id)
        .order("viewed_at", { ascending: false });
      if (viewsError) throw viewsError;

      const latestView = allViews?.[0];
      const within24h = latestView
        ? Date.now() - new Date(latestView.viewed_at as string).getTime() < 24 * 60 * 60 * 1000
        : false;

      if (within24h && latestView?.story_id) {
        const { data: sameStory, error: sameErr } = await supabase
          .from("daily_wisdom_stories")
          .select("*")
          .eq("id", latestView.story_id)
          .maybeSingle();
        if (sameErr) throw sameErr;
        if (!sameStory) throw new Error("Last viewed story not found");
        setStory(sameStory as Story);
        const { data: savedData } = await supabase
          .from("saved_stories")
          .select("id")
          .eq("user_id", user.id)
          .eq("story_id", sameStory.id)
          .maybeSingle();
        setIsSaved(!!savedData);
        return;
      }

      const viewedIds = (allViews || []).map(v => v.story_id);
      let query = supabase
        .from("daily_wisdom_stories")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);
      if (viewedIds.length > 0) {
        query = query.not("id", "in", `(${viewedIds.join(",")})`);
      }
      const { data: stories, error } = await query;
      if (error) throw error;
      if (!stories || stories.length === 0) {
        toast.info(t('read_all_stories'));
        return;
      }

      const nextStory = stories[0] as Story;
      setStory(nextStory);
      await supabase
        .from("user_story_views")
        .insert({ user_id: user.id, story_id: nextStory.id });

      const { data: savedData } = await supabase
        .from("saved_stories")
        .select("id")
        .eq("user_id", user.id)
        .eq("story_id", nextStory.id)
        .maybeSingle();
      setIsSaved(!!savedData);
    } catch (error: any) {
      console.error("Error loading story:", error);
      toast.error(t('failed_load_wisdom'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!story) return;
    try {
      setIsSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error(t('please_signin_view_wisdom'));
        return;
      }
      if (isSaved) {
        await supabase.from("saved_stories").delete().eq("user_id", user.id).eq("story_id", story.id);
        setIsSaved(false);
        toast.success(t('story_removed_saved'));
      } else {
        await supabase.from("saved_stories").insert({ user_id: user.id, story_id: story.id });
        setIsSaved(true);
        toast.success(t('story_saved_reflection'));
      }
    } catch (error: any) {
      console.error("Error saving story:", error);
      toast.error(t('failed_save_story'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (!story) return;
    const parts = [
      story.title,
      story.era,
      "",
      story.law_statement,
      "",
      "— Hagion University",
    ].filter(Boolean);
    const shareText = parts.join("\n");
    if (navigator.share) {
      try {
        await navigator.share({ title: story.title, text: shareText });
        toast.success(t('story_shared_success'));
      } catch (error) {
        if ((error as Error).name !== "AbortError") toast.error(t('failed_share_story'));
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        toast.success(t('story_copied_clipboard'));
      } catch {
        toast.error(t('failed_copy_story'));
      }
    }
  };

  const renderParagraphs = (text: string | null | undefined) => {
    if (!text) return null;
    return text
      .replace(/\\n/g, "\n")
      .split(/\n{2,}|\n/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p, i) => (
        <p key={i} className="leading-[1.85] text-[15px] sm:text-base text-foreground mb-4">
          {p}
        </p>
      ));
  };

  return (
    <div className="min-h-screen flex flex-col page-transition">
      {/* Minimal floating header — no card, no box */}
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
              {t('daily_wisdom')}
            </p>
          </div>
          {story && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSave}
                disabled={isSaving}
                className="tap-scale rounded-full hover:bg-white/10"
                aria-label={isSaved ? "Unsave" : "Save"}
              >
                {isSaved ? (
                  <BookmarkCheck className="w-5 h-5 text-accent" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="tap-scale rounded-full hover:bg-white/10"
                aria-label="Share"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-auto px-5 sm:px-6 pt-8 pb-32">
        <div className="max-w-2xl mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="w-7 h-7 animate-spin text-accent" />
              <p className="text-xs uppercase tracking-[0.2em] text-foreground/50">
                Drawing from history…
              </p>
            </div>
          ) : story ? (
            <article className="animate-fade-in">
              {/* Title — bold, centered, top */}
              <h1 className="text-center text-3xl sm:text-4xl font-bold leading-tight tracking-tight text-foreground mb-3 px-2">
                {story.title}
              </h1>

              {/* Era line */}
              {story.era && (
                <p className="text-center text-[12px] uppercase tracking-[0.35em] text-foreground/50 mb-2">
                  {story.era}
                </p>
              )}

              {/* Theme pill */}
              <div className="flex justify-center mb-10">
                <span className="text-[10px] uppercase tracking-[0.3em] text-accent/90 px-3 py-1 rounded-full border border-accent/20 bg-accent/5">
                  {story.theme}
                </span>
              </div>

              {/* Decorative divider */}
              <div className="flex items-center justify-center mb-10">
                <span className="h-px w-10 bg-foreground/20" />
                <span className="mx-3 text-foreground/30 text-xs">✦</span>
                <span className="h-px w-10 bg-foreground/20" />
              </div>

              <Section
                label="The King's Command"
                body={story.law_statement || story.content}
                emphasized
              />

              <Section
                label="The Fall of the Fool"
                body={story.law_transgression}
              />

              <Section
                label="The Rise of the Faithful"
                body={story.law_observance}
              />

              <Section
                label="Wisdom"
                body={story.law_interpretation}
              />

              {/* Closing reflection */}
              {story.moral_takeaway && (
                <div className="mt-12 mb-2">
                  <div className="flex items-center justify-center mb-6">
                    <span className="h-px w-10 bg-foreground/20" />
                    <span className="mx-3 text-foreground/30 text-xs">✦</span>
                    <span className="h-px w-10 bg-foreground/20" />
                  </div>
                  <blockquote className="text-center italic text-lg sm:text-xl leading-relaxed text-foreground/80 px-4">
                    “{story.moral_takeaway}”
                  </blockquote>
                </div>
              )}

              <p className="mt-16 text-center text-[11px] uppercase tracking-[0.3em] text-foreground/40">
                Return tomorrow for new wisdom
              </p>
            </article>
          ) : (
            <div className="py-24 text-center text-foreground/60">
              <p>{t('no_story_available')}</p>
            </div>
          )}
        </div>
      </main>

      <PremiumNav />
    </div>
  );

  function Section({
    label,
    body,
    emphasized = false,
  }: { label: string; body: string | null | undefined; emphasized?: boolean }) {
    if (!body) return null;
    return (
      <section className="mb-10">
        <h2 className="text-[11px] uppercase tracking-[0.3em] text-accent/80 mb-4 font-semibold">
          {label}
        </h2>
        <div className={emphasized ? "text-lg sm:text-xl leading-[1.7] font-medium text-foreground" : ""}>
          {emphasized ? (
            <p className="leading-[1.7]">{body}</p>
          ) : (
            renderParagraphs(body)
          )}
        </div>
      </section>
    );
  }
};

export default DailyWisdom;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Share2, Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface Story {
  id: string;
  title: string;
  content: string;
  theme: string;
  moral_takeaway: string | null;
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
        toast.error("Please sign in to view Daily Wisdom");
        navigate("/auth");
        return;
      }

      // Fetch all previous views (latest first)
      const { data: allViews, error: viewsError } = await supabase
        .from("user_story_views")
        .select("story_id, viewed_at")
        .eq("user_id", user.id)
        .order("viewed_at", { ascending: false });

      if (viewsError) throw viewsError;

      const latestView = allViews?.[0];
      const now = Date.now();
      const within24h = latestView
        ? now - new Date(latestView.viewed_at as string).getTime() < 24 * 60 * 60 * 1000
        : false;

      // If within 24h, show the same story as last time
      if (within24h && latestView?.story_id) {
        const { data: sameStory, error: sameErr } = await supabase
          .from("daily_wisdom_stories")
          .select("*")
          .eq("id", latestView.story_id)
          .maybeSingle();
        if (sameErr) throw sameErr;
        if (!sameStory) throw new Error("Last viewed story not found");
        setStory(sameStory);

        // Check if saved
        const { data: savedData } = await supabase
          .from("saved_stories")
          .select("id")
          .eq("user_id", user.id)
          .eq("story_id", sameStory.id)
          .maybeSingle();
        setIsSaved(!!savedData);
        return;
      }

      // Otherwise, pick a new unseen story and mark it viewed once
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
        toast.info("You've read all available stories! Check back later for new wisdom.");
        return;
      }

      const nextStory = stories[0];
      setStory(nextStory);

      // Mark as viewed (only when delivering a new story)
      await supabase
        .from("user_story_views")
        .insert({ user_id: user.id, story_id: nextStory.id });

      // Check if saved
      const { data: savedData } = await supabase
        .from("saved_stories")
        .select("id")
        .eq("user_id", user.id)
        .eq("story_id", nextStory.id)
        .maybeSingle();

      setIsSaved(!!savedData);
    } catch (error: any) {
      console.error("Error loading story:", error);
      toast.error("Failed to load today's wisdom");
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
        toast.error("Please sign in to save stories");
        return;
      }

      if (isSaved) {
        // Unsave
        await supabase
          .from("saved_stories")
          .delete()
          .eq("user_id", user.id)
          .eq("story_id", story.id);
        
        setIsSaved(false);
        toast.success("Story removed from saved");
      } else {
        // Save
        await supabase
          .from("saved_stories")
          .insert({ user_id: user.id, story_id: story.id });
        
        setIsSaved(true);
        toast.success("Story saved for later reflection");
      }
    } catch (error: any) {
      console.error("Error saving story:", error);
      toast.error("Failed to save story");
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (!story) return;

    const shareText = `Daily Wisdom: ${story.title}\n\n${story.content}\n\n— From Hagion University`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: story.title,
          text: shareText,
        });
        toast.success("Story shared successfully");
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          toast.error("Failed to share story");
        }
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        toast.success("Story copied to clipboard");
      } catch (error) {
        toast.error("Failed to copy story");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col blue-sky-gradient">
      {/* Header */}
      <header className="flex items-center gap-4 px-4 py-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => navigate("/main-menu?tab=hagion-university")}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Daily Wisdom</h1>
          <p className="text-sm text-muted-foreground">A story to stir heart and mind</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#3BB4F2]" />
              </CardContent>
            </Card>
          ) : story ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{story.title}</CardTitle>
                    <CardDescription className="text-sm">
                      <span className="inline-block px-3 py-1 bg-[#3BB4F2]/10 text-[#3BB4F2] rounded-full">
                        {story.theme}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      {isSaved ? (
                        <BookmarkCheck className="w-5 h-5 text-[#3BB4F2]" />
                      ) : (
                        <Bookmark className="w-5 h-5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleShare}
                    >
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  {story.content.split("\n\n").map((paragraph, idx) => (
                    <p key={idx} className="leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
                
                {story.moral_takeaway && (
                  <div className="mt-8 p-6 bg-muted/30 rounded-lg border-l-4 border-[#3BB4F2]">
                    <h3 className="font-semibold text-lg mb-2">Reflection</h3>
                    <p className="text-muted-foreground italic">{story.moral_takeaway}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No story available at this time</p>
              </CardContent>
            </Card>
          )}

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Come back tomorrow for a new story of wisdom</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyWisdom;

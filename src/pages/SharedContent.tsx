import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SharedContent() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [content, setContent] = useState<string>("");
  const [context, setContext] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const token = searchParams.get("token");

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user && token) {
      loadSharedContent();
    }
  }, [user, token]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign up or log in to view shared content.",
        variant: "destructive",
      });
      navigate(`/auth?redirect=/shared?token=${token}`);
      return;
    }
    
    setUser(user);
  };

  const loadSharedContent = async () => {
    if (!token) {
      toast({
        title: "Invalid Link",
        description: "This shared content link is invalid.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("shared_content")
        .select("*")
        .eq("share_token", token)
        .single();

      if (error) throw error;

      if (!data) {
        toast({
          title: "Content Not Found",
          description: "This shared content no longer exists.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setContent(data.content);
      setContext(data.context || "");

      // Increment view count
      await supabase
        .from("shared_content")
        .update({ view_count: data.view_count + 1 })
        .eq("id", data.id);

    } catch (error: any) {
      console.error("Error loading shared content:", error);
      toast({
        title: "Error",
        description: "Failed to load shared content.",
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-4">
      <div className="max-w-3xl mx-auto pt-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Card className="border-primary/20">
          <CardContent className="p-6 space-y-4">
            {context && (
              <div className="text-sm text-muted-foreground border-l-2 border-primary pl-4">
                {context}
              </div>
            )}
            <div className="prose dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{content}</p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Shared via Hagion AI</p>
        </div>
      </div>
    </div>
  );
}

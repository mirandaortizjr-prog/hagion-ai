import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-4 px-4 py-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => navigate("/main-menu?tab=hagion-university")}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold">Sermon Lab</h1>
      </header>

      <ScrollArea className="h-[calc(100vh-73px)]">
        <div className="p-6 max-w-4xl mx-auto space-y-6">
          {/* How to Write a Sermon */}
          <Card>
            <CardHeader>
              <CardTitle>How to Write a Sermon</CardTitle>
              <CardDescription>A comprehensive guide to crafting biblical sermons</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Steps to Write a Sermon:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li><strong>Prayer and Scripture Selection</strong> - Begin with prayer and select a biblical passage</li>
                  <li><strong>Study the Text</strong> - Research the historical context, original language, and theological meaning</li>
                  <li><strong>Identify the Main Point</strong> - Determine the central message God wants to communicate</li>
                  <li><strong>Structure Your Sermon</strong> - Create an outline with introduction, main points, and conclusion</li>
                  <li><strong>Develop Applications</strong> - Show how the text applies to modern life</li>
                  <li><strong>Add Illustrations</strong> - Use stories and examples to make points memorable</li>
                  <li><strong>Write the Introduction</strong> - Hook your audience and introduce the topic</li>
                  <li><strong>Write the Body</strong> - Expand each main point with scripture and explanation</li>
                  <li><strong>Write the Conclusion</strong> - Summarize and call to action</li>
                  <li><strong>Review and Refine</strong> - Edit for clarity, timing, and theological accuracy</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Essential Elements Needed:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>A clear biblical text or passage</li>
                  <li>Prayer and spiritual preparation</li>
                  <li>Study tools (commentaries, concordances, lexicons)</li>
                  <li>Understanding of your audience</li>
                  <li>Clear main theme or message</li>
                  <li>Logical structure and flow</li>
                  <li>Relevant illustrations and examples</li>
                  <li>Practical applications</li>
                  <li>Call to action or response</li>
                  <li>Theological soundness and biblical accuracy</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Sermon Checker */}
          <Card>
            <CardHeader>
              <CardTitle>Sermon Checker</CardTitle>
              <CardDescription>
                Upload or paste your sermon to check for theological accuracy, biblical soundness, and logical fallacies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Textarea
                  placeholder="Paste your sermon text here..."
                  value={sermonText}
                  onChange={(e) => setSermonText(e.target.value)}
                  className="min-h-[200px]"
                />
              </div>

              <Button 
                onClick={handleCheckSermon}
                disabled={isChecking || !sermonText.trim()}
                className="w-full"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Check Sermon
                  </>
                )}
              </Button>

              {checkResult && (
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Analysis Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                      {checkResult}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};

export default PublicSpeaking;

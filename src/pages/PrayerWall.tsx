import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send, Heart, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { BottomNav } from "@/components/BottomNav";

interface Prayer {
  id: string;
  content: string;
  is_anonymous: boolean;
  author_name: string | null;
  created_at: string;
  user_id: string;
}

interface Testimony {
  id: string;
  content: string;
  is_anonymous: boolean;
  author_name: string | null;
  created_at: string;
  user_id: string;
}

export default function PrayerWall() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [newPrayer, setNewPrayer] = useState("");
  const [newTestimony, setNewTestimony] = useState("");
  const [isAnonymousPrayer, setIsAnonymousPrayer] = useState(false);
  const [isAnonymousTestimony, setIsAnonymousTestimony] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    checkUser();
    fetchPrayers();
    fetchTestimonies();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const fetchPrayers = async () => {
    const { data, error } = await supabase
      .from("prayers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching prayers:", error);
    } else {
      setPrayers(data || []);
    }
  };

  const fetchTestimonies = async () => {
    const { data, error } = await supabase
      .from("testimonies")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching testimonies:", error);
    } else {
      setTestimonies(data || []);
    }
  };

  const handleSubmitPrayer = async () => {
    if (!currentUser) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to post a prayer request",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!newPrayer.trim()) {
      toast({
        title: "Please enter your prayer",
        description: "Prayer content cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from("prayers").insert([
      {
        user_id: currentUser.id,
        content: newPrayer,
        is_anonymous: isAnonymousPrayer,
        author_name: isAnonymousPrayer ? null : authorName || "Anonymous",
      },
    ]);

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to post prayer. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Prayer posted",
        description: "Your prayer request has been shared with the community",
      });
      setNewPrayer("");
      setAuthorName("");
      fetchPrayers();
    }
  };

  const handleSubmitTestimony = async () => {
    if (!currentUser) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to post a testimony",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!newTestimony.trim()) {
      toast({
        title: "Please enter your testimony",
        description: "Testimony content cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from("testimonies").insert([
      {
        user_id: currentUser.id,
        content: newTestimony,
        is_anonymous: isAnonymousTestimony,
        author_name: isAnonymousTestimony ? null : authorName || "Anonymous",
      },
    ]);

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to post testimony. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Testimony posted",
        description: "Your testimony has been shared with the community",
      });
      setNewTestimony("");
      setAuthorName("");
      fetchTestimonies();
    }
  };

  const handleDeletePrayer = async (id: string) => {
    const { error } = await supabase.from("prayers").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete prayer",
        variant: "destructive",
      });
    } else {
      toast({ title: "Prayer deleted" });
      fetchPrayers();
    }
  };

  const handleDeleteTestimony = async (id: string) => {
    const { error } = await supabase.from("testimonies").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete testimony",
        variant: "destructive",
      });
    } else {
      toast({ title: "Testimony deleted" });
      fetchTestimonies();
    }
  };

  return (
    <div className="min-h-screen text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6 gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/main-menu")}
            className="text-foreground"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Prayer & Testimony Wall</h1>
            <p className="text-muted-foreground">Share your prayers and testimonies with the community</p>
          </div>
        </div>

        <Tabs defaultValue="prayers" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="prayers">Prayer Requests</TabsTrigger>
            <TabsTrigger value="testimonies">Testimonies</TabsTrigger>
          </TabsList>

          <TabsContent value="prayers" className="space-y-6">
            <Card className="p-6 bg-card/95 backdrop-blur">
              <h2 className="text-xl font-semibold mb-4 text-foreground">Share a Prayer Request</h2>
              <div className="space-y-4">
                <Textarea
                  placeholder="Enter your prayer request..."
                  value={newPrayer}
                  onChange={(e) => setNewPrayer(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <div className="flex items-center space-x-2">
                  <Switch
                    id="anonymous-prayer"
                    checked={isAnonymousPrayer}
                    onCheckedChange={setIsAnonymousPrayer}
                  />
                  <Label htmlFor="anonymous-prayer">Post anonymously</Label>
                </div>
                {!isAnonymousPrayer && (
                  <Input
                    placeholder="Your name (optional)"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                  />
                )}
                <Button
                  onClick={handleSubmitPrayer}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Posting..." : "Post Prayer"}
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-card/95 backdrop-blur">
              <h3 className="text-lg font-semibold text-foreground mb-4">Community Prayer Requests</h3>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {prayers.length === 0 ? (
                    <Card className="p-6 text-center text-muted-foreground">
                      No prayers yet. Be the first to share!
                    </Card>
                  ) : (
                    prayers.map((prayer) => (
                      <Card key={prayer.id} className="p-4 bg-background/50">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-blue-500" />
                            <span className="font-semibold text-foreground">
                              {prayer.is_anonymous ? "Anonymous" : prayer.author_name || "Anonymous"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {new Date(prayer.created_at).toLocaleDateString()}
                            </span>
                            {currentUser?.id === prayer.user_id && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeletePrayer(prayer.id)}
                                className="h-8 w-8"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <p className="text-foreground whitespace-pre-wrap">{prayer.content}</p>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="testimonies" className="space-y-6">
            <Card className="p-6 bg-card/95 backdrop-blur">
              <h2 className="text-xl font-semibold mb-4 text-foreground">Share a Testimony</h2>
              <div className="space-y-4">
                <Textarea
                  placeholder="Share how God has blessed you..."
                  value={newTestimony}
                  onChange={(e) => setNewTestimony(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <div className="flex items-center space-x-2">
                  <Switch
                    id="anonymous-testimony"
                    checked={isAnonymousTestimony}
                    onCheckedChange={setIsAnonymousTestimony}
                  />
                  <Label htmlFor="anonymous-testimony">Post anonymously</Label>
                </div>
                {!isAnonymousTestimony && (
                  <Input
                    placeholder="Your name (optional)"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                  />
                )}
                <Button
                  onClick={handleSubmitTestimony}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Posting..." : "Post Testimony"}
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-card/95 backdrop-blur">
              <h3 className="text-lg font-semibold text-foreground mb-4">Community Testimonies</h3>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {testimonies.length === 0 ? (
                    <Card className="p-6 text-center text-muted-foreground">
                      No testimonies yet. Be the first to share!
                    </Card>
                  ) : (
                    testimonies.map((testimony) => (
                      <Card key={testimony.id} className="p-4 bg-background/50">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-blue-500" />
                            <span className="font-semibold text-foreground">
                              {testimony.is_anonymous ? "Anonymous" : testimony.author_name || "Anonymous"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {new Date(testimony.created_at).toLocaleDateString()}
                            </span>
                            {currentUser?.id === testimony.user_id && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteTestimony(testimony.id)}
                                className="h-8 w-8"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <p className="text-foreground whitespace-pre-wrap">{testimony.content}</p>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav />
    </div>
  );
}

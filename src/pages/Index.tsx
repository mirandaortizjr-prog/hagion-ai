import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "@supabase/supabase-js";
import { Settings, MessageSquare, Users, BookOpen, Menu } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Set time-based greeting
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting(language === 'es' ? "Buenos días" : "Good morning");
    } else if (hour < 18) {
      setGreeting(language === 'es' ? "Buenas tardes" : "Good afternoon");
    } else {
      setGreeting(language === 'es' ? "Buenas noches" : "Good evening");
    }
  }, [language]);

  const getUserName = () => {
    if (!user) return language === 'es' ? "Amigo" : "Friend";
    return user.user_metadata?.first_name || user.email?.split('@')[0] || (language === 'es' ? "Amigo" : "Friend");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Top Navigation */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/main-menu")}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h2 className="text-lg font-semibold">Hagion AI</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/settings")}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {greeting}, {getUserName()}
            </h1>
            <p className="text-xl text-muted-foreground">
              {language === 'es' 
                ? "¿Cómo puedo asistirte hoy?" 
                : "How may I assist you today?"}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2 mb-8">
            <Card 
              className="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
              onClick={() => navigate("/chat")}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">
                      {language === 'es' ? "Iniciar Chat" : "Start a Chat"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {language === 'es' 
                        ? "Chatea directamente conmigo" 
                        : "Chat directly with me"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
              onClick={() => navigate("/main-menu")}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-secondary/10">
                    <Users className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">
                      {language === 'es' ? "Nuestros Analistas" : "Our Analysts"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {language === 'es' 
                        ? "Accede a expertos especializados" 
                        : "Access specialized experts"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
              onClick={() => navigate("/divine-guidance")}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-accent/10">
                    <BookOpen className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">
                      {language === 'es' ? "Guía Divina" : "Divine Guidance"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {language === 'es' 
                        ? "Busca consejo espiritual" 
                        : "Seek spiritual counsel"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
              onClick={() => navigate("/logos-circle")}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-muted">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">
                      {language === 'es' ? "Aprender" : "Learn"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {language === 'es' 
                        ? "Explora cursos y enseñanzas" 
                        : "Explore courses and teachings"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, MessageCircle, Book, ExternalLink } from "lucide-react";

const Support = () => {
  const navigate = useNavigate();

  const supportOptions = [
    {
      icon: Book,
      title: "Documentation",
      description: "Browse our comprehensive guides and tutorials",
      action: () => window.open("https://docs.lovable.dev/", "_blank"),
    },
    {
      icon: MessageCircle,
      title: "Community",
      description: "Join our Discord community for help and discussions",
      action: () => window.open("https://discord.com/channels/1119885301872070706/1280461670979993613", "_blank"),
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Contact us directly for assistance",
      action: () => window.location.href = "mailto:support@hagionai.com",
    },
  ];

  const faqItems = [
    {
      question: "How do I start a conversation?",
      answer: "From the main menu, select any assistant, Divine Guidance voice, or Storytelling option to begin.",
    },
    {
      question: "Can I save my conversations?",
      answer: "Yes! All your conversations are automatically saved and can be accessed from the History tab.",
    },
    {
      question: "How do I change the language?",
      answer: "Go to Settings > Preferences and toggle between English and Spanish.",
    },
    {
      question: "What's the difference between assistants and Divine Guidance?",
      answer: "Assistants provide evidence-based insights on specific topics, while Divine Guidance offers spiritual wisdom in the voice of God, Christ, or the Holy Spirit.",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center gap-4 px-4 py-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold">Help & Support</h1>
      </header>

      <div className="flex-1 overflow-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Get Help</CardTitle>
              <CardDescription>Choose how you'd like to get assistance</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {supportOptions.map((option, idx) => (
                <button
                  key={idx}
                  onClick={option.action}
                  className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors text-left"
                >
                  <option.icon className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{option.title}</h3>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Quick answers to common questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqItems.map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <h3 className="font-semibold">{item.question}</h3>
                  <p className="text-sm text-muted-foreground">{item.answer}</p>
                  {idx < faqItems.length - 1 && <div className="border-t pt-4" />}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Can't find what you're looking for?
              </p>
              <Button
                variant="link"
                className="mt-2"
                onClick={() => window.location.href = "mailto:support@hagionai.com"}
              >
                Contact us directly
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Support;

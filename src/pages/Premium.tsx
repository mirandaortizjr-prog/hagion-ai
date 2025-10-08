import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Crown, ArrowLeft, X } from "lucide-react";
import logo from "@/assets/logo.jpg";

const Premium = () => {
  const navigate = useNavigate();

  const features = {
    free: [
      "5 conversations per day",
      "Access to all assistants",
      "Basic Scripture references",
    ],
    premium: [
      "Unlimited conversations",
      "Priority response times",
      "Saved conversation history",
      "Advanced Scripture insights",
      "Offline access to past chats",
      "Early access to new features",
      "Ad-free experience",
      "Support development",
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-white">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/menu")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-secondary">Upgrade to Premium</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent mb-6">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-secondary mb-4">
            Unlimited Spiritual Guidance
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Deepen your faith journey with unlimited access to biblically-grounded wisdom
            and all our spiritual assistants.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          <Card className="p-8 border-2 animate-slide-up">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-secondary mb-2">Free</h3>
              <div className="text-4xl font-bold text-primary">$0</div>
              <p className="text-muted-foreground">Forever</p>
            </div>
            <ul className="space-y-3">
              {features.free.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-8 border-4 border-primary relative overflow-hidden animate-slide-up shadow-xl" style={{ animationDelay: "100ms" }}>
            <div className="absolute top-0 right-0 bg-gradient-to-br from-primary to-accent text-white px-4 py-1 text-sm font-semibold">
              MOST POPULAR
            </div>
            <div className="text-center mb-6 mt-6">
              <h3 className="text-2xl font-bold text-secondary mb-2">Premium</h3>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-4xl font-bold text-primary">$9.99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">or $99/year (save 17%)</p>
            </div>
            <ul className="space-y-3 mb-8">
              {features.premium.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-secondary font-medium">{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-primary to-accent text-white font-semibold text-lg shadow-lg hover:shadow-xl"
            >
              Upgrade Now
            </Button>
          </Card>
        </div>

        <div className="text-center text-sm text-muted-foreground animate-fade-in">
          <p>Cancel anytime • Secure payment • 7-day money-back guarantee</p>
        </div>
      </main>
    </div>
  );
};

export default Premium;

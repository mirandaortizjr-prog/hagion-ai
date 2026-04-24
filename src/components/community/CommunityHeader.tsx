import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSafeBackNavigation } from "@/hooks/useSafeBackNavigation";

export const CommunityHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => {
  const handleBack = useSafeBackNavigation("/community");
  return (
    <header className="pt-6 pb-6 animate-fade-in">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleBack}
        className="text-white/80 hover:text-white hover:bg-white/10 -ml-2 mb-2"
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>
      <h1 className="font-playfair text-3xl sm:text-4xl leading-[1.05] tracking-tight text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        {title}
      </h1>
      <div className="mt-3 h-px w-24 bg-gradient-to-r from-white/60 via-white/20 to-transparent" />
      {subtitle && <p className="mt-3 text-white/65 text-[15px] leading-relaxed max-w-md">{subtitle}</p>}
    </header>
  );
};

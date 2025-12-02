import { Volume2, VolumeX, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useHaptics } from "@/hooks/useNativeFeatures";
import { useLanguage } from "@/contexts/LanguageContext";

interface TextToSpeechButtonProps {
  text: string;
  className?: string;
  variant?: "default" | "ghost" | "outline" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

export const TextToSpeechButton = ({
  text,
  className,
  variant = "ghost",
  size = "icon",
}: TextToSpeechButtonProps) => {
  const { speak, stop, pause, resume, isSpeaking, isPaused } = useTextToSpeech();
  const { impact } = useHaptics();
  const { language } = useLanguage();

  const handlePress = async () => {
    await impact('light');
    
    if (isSpeaking && !isPaused) {
      // Currently speaking - pause or stop
      pause();
    } else if (isPaused) {
      // Currently paused - resume
      resume();
    } else {
      // Not speaking - start
      await speak({
        text,
        lang: language === 'es' ? 'es-ES' : 'en-US',
        rate: 0.9,
        pitch: 1.0,
      });
    }
  };

  const handleStop = async () => {
    await impact('light');
    stop();
  };

  const getIcon = () => {
    if (isSpeaking && !isPaused) {
      return <Pause className="w-4 h-4" />;
    }
    if (isPaused) {
      return <Play className="w-4 h-4" />;
    }
    return <Volume2 className="w-4 h-4" />;
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handlePress}
        aria-label={isSpeaking ? "Pause" : "Read aloud"}
      >
        {getIcon()}
      </Button>
      {isSpeaking && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleStop}
          aria-label="Stop"
        >
          <VolumeX className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShare, useHaptics } from "@/hooks/useNativeFeatures";
import { toast } from "@/hooks/use-toast";

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
  className?: string;
  variant?: "default" | "ghost" | "outline" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

export const ShareButton = ({
  title,
  text,
  url,
  className,
  variant = "ghost",
  size = "icon",
}: ShareButtonProps) => {
  const { share } = useShare();
  const { impact } = useHaptics();

  const handleShare = async () => {
    try {
      await impact('light');
      await share({
        title,
        text,
        url: url || window.location.href,
        dialogTitle: `Share: ${title}`,
      });
    } catch (error) {
      // User cancelled or share failed
      if ((error as Error).message !== 'Share was cancelled') {
        toast({
          title: "Copied to clipboard",
          description: "Content has been copied to your clipboard",
        });
      }
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleShare}
      aria-label="Share"
    >
      <Share2 className="w-4 h-4" />
    </Button>
  );
};

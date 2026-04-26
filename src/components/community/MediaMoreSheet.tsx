import { Flag, Link2, EyeOff, X, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onClose: () => void;
  onCopyLink?: () => void;
  shareUrl?: string;
  videoUrl?: string | null;
}

export default function MediaMoreSheet({ open, onClose, onCopyLink, shareUrl, videoUrl }: Props) {
  const { toast } = useToast();
  if (!open) return null;

  const items = [
    {
      icon: Link2,
      label: "Copy link",
      onClick: async () => {
        try {
          if (shareUrl) await navigator.clipboard.writeText(shareUrl);
          onCopyLink?.();
          toast({ title: "Link copied" });
        } catch {
          toast({ title: "Could not copy link" });
        }
        onClose();
      },
    },
    {
      icon: Download,
      label: "Open video",
      onClick: () => {
        if (videoUrl) window.open(videoUrl, "_blank");
        onClose();
      },
    },
    {
      icon: EyeOff,
      label: "Not interested",
      onClick: () => {
        toast({ title: "We'll show fewer like this" });
        onClose();
      },
    },
    {
      icon: Flag,
      label: "Report",
      onClick: () => {
        toast({ title: "Reported", description: "Thank you. Our team will review." });
        onClose();
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 animate-fade-in" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full bg-neutral-900 text-white rounded-t-3xl border-t border-white/10"
        style={{
          animation: "slideUp 240ms cubic-bezier(0.2,0.9,0.3,1.05) both",
          paddingBottom: "max(env(safe-area-inset-bottom), 14px)",
        }}
      >
        <div className="pt-2 flex items-center justify-center">
          <div className="w-10 h-1 rounded-full bg-white/25" />
        </div>
        <div className="px-5 pt-3 pb-1 flex items-center justify-between">
          <h3 className="font-playfair text-lg">More</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-2 py-2">
          {items.map((it) => (
            <button
              key={it.label}
              onClick={it.onClick}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/5 active:bg-white/10 transition text-left"
            >
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                <it.icon className="w-4 h-4" />
              </div>
              <span className="text-[15px]">{it.label}</span>
            </button>
          ))}
        </div>
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
}

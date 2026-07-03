import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Copy, MessageCircle, Mail, Share2, Check, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  inviteUrl: string | null;
  inviterName?: string | null;
}

export function InviteSheet({ open, onOpenChange, inviteUrl, inviterName }: Props) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const url = inviteUrl || "";
  const shareText = `${inviterName ? inviterName + " invited you to " : "Join me on "}Hagion AI — biblical wisdom, prayer & community.`;
  const fullMessage = `${shareText} ${url}`;

  const copy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast({ title: "Your invite link", description: url });
    }
  };

  const openHref = (href: string) => {
    window.location.href = href;
  };

  const nativeShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: "Join me on Hagion AI", text: shareText, url });
      } else {
        copy();
      }
    } catch {}
  };

  const options = [
    {
      label: "WhatsApp",
      icon: MessageCircle,
      color: "from-emerald-500/30 to-emerald-500/10 border-emerald-400/40 text-emerald-100",
      onClick: () => openHref(`https://wa.me/?text=${encodeURIComponent(fullMessage)}`),
    },
    {
      label: "Messages",
      icon: MessageSquare,
      color: "from-sky-500/30 to-sky-500/10 border-sky-400/40 text-sky-100",
      onClick: () => openHref(`sms:?&body=${encodeURIComponent(fullMessage)}`),
    },
    {
      label: "Email",
      icon: Mail,
      color: "from-amber-500/30 to-amber-500/10 border-amber-400/40 text-amber-100",
      onClick: () =>
        openHref(
          `mailto:?subject=${encodeURIComponent("Join me on Hagion AI")}&body=${encodeURIComponent(fullMessage)}`,
        ),
    },
    {
      label: "More",
      icon: Share2,
      color: "from-white/15 to-white/5 border-white/25 text-white",
      onClick: nativeShare,
    },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="bg-zinc-950/95 backdrop-blur-2xl border-t border-white/10 text-white rounded-t-3xl pb-8"
      >
        <SheetHeader className="text-left">
          <SheetTitle className="text-white font-playfair text-xl">Invite friends</SheetTitle>
          <p className="text-sm text-white/60">
            Share your invite link — anyone who joins becomes a friend automatically.
          </p>
        </SheetHeader>

        <div className="mt-5 flex items-stretch gap-2">
          <div className="flex-1 min-w-0 rounded-2xl bg-white/[0.06] border border-white/15 px-4 py-3">
            <div className="text-[10px] uppercase tracking-[0.16em] text-white/45 mb-0.5">
              Your invite link
            </div>
            <div className="text-sm text-white/90 truncate">{url || "Generating…"}</div>
          </div>
          <button
            onClick={copy}
            disabled={!url}
            className="shrink-0 px-4 rounded-2xl bg-gradient-to-b from-primary/40 to-primary/15 border border-primary/50 text-white text-sm font-semibold flex items-center gap-1.5 hover:from-primary/50 disabled:opacity-40"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-2">
          {options.map((o) => (
            <button
              key={o.label}
              onClick={o.onClick}
              disabled={!url}
              className={`flex flex-col items-center gap-2 py-4 rounded-2xl bg-gradient-to-b ${o.color} border backdrop-blur-xl active:scale-95 transition disabled:opacity-40`}
            >
              <o.icon className="w-5 h-5" />
              <span className="text-[11px] font-medium">{o.label}</span>
            </button>
          ))}
        </div>

        <p className="mt-5 text-center text-[11px] text-white/40">
          Tip: Friends who tap your link connect with you instantly — no request needed.
        </p>
      </SheetContent>
    </Sheet>
  );
}

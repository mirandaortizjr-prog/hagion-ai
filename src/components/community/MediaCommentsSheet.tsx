import { useEffect, useRef, useState } from "react";
import { X, Send, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Comment {
  id: string;
  author: string;
  text: string;
  created_at: number;
}

interface Props {
  open: boolean;
  mediaId: string | null;
  title?: string;
  onClose: () => void;
}

const storageKey = (id: string) => `media_comments_${id}`;

export default function MediaCommentsSheet({ open, mediaId, title, onClose }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!mediaId) return;
    try {
      const raw = localStorage.getItem(storageKey(mediaId));
      setComments(raw ? JSON.parse(raw) : []);
    } catch {
      setComments([]);
    }
  }, [mediaId, open]);

  const submit = () => {
    if (!text.trim() || !mediaId) return;
    const next: Comment = {
      id: Math.random().toString(36).slice(2),
      author: "You",
      text: text.trim(),
      created_at: Date.now(),
    };
    const updated = [next, ...comments];
    setComments(updated);
    localStorage.setItem(storageKey(mediaId), JSON.stringify(updated));
    setText("");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 animate-fade-in" />
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative w-full max-h-[78dvh] min-h-[50dvh] bg-neutral-900 text-white",
          "rounded-t-3xl border-t border-white/10 flex flex-col animate-slide-in-right",
        )}
        style={{ animation: "slideUp 260ms cubic-bezier(0.2,0.9,0.3,1.05) both" }}
      >
        <div className="pt-2 flex items-center justify-center">
          <div className="w-10 h-1 rounded-full bg-white/25" />
        </div>
        <div className="px-5 pt-3 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-white/70" />
            <h3 className="font-playfair text-lg">
              Comments <span className="text-white/45 text-sm">({comments.length})</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {title && (
          <div className="px-5 pb-2 text-[12px] text-white/50 line-clamp-1">{title}</div>
        )}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
          {comments.length === 0 ? (
            <div className="text-center text-white/45 text-sm py-12">
              Be the first to comment
            </div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-white/30 to-white/5 ring-1 ring-white/20 flex items-center justify-center text-sm font-medium">
                  {c.author.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px]">
                    <span className="font-medium">{c.author}</span>
                    <span className="ml-2 text-white/40 text-[11px]">
                      {new Date(c.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[14px] text-white/85 mt-0.5 break-words">
                    {c.text}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div
          className="px-4 py-3 border-t border-white/10 flex items-center gap-2"
          style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)" }}
        >
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            placeholder="Add a comment…"
            className="flex-1 h-10 rounded-full bg-white/10 border border-white/15 px-4 text-sm placeholder:text-white/40 focus:outline-none focus:border-white/30"
          />
          <button
            onClick={submit}
            disabled={!text.trim()}
            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center disabled:opacity-40 active:scale-95 transition"
            aria-label="Send"
          >
            <Send className="w-4 h-4" />
          </button>
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

import { useEffect, useMemo, useRef, useState } from "react";
import { X, Search as SearchIcon, Play } from "lucide-react";

export interface SearchableItem {
  id: string;
  title: string;
  description?: string | null;
  author_name?: string | null;
  thumbnail_url?: string | null;
}

interface Props {
  open: boolean;
  items: SearchableItem[];
  placeholder?: string;
  onClose: () => void;
  onSelect: (item: SearchableItem) => void;
}

export default function MediaSearchSheet({
  open,
  items,
  placeholder = "Search title, author, description…",
  onClose,
  onSelect,
}: Props) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQ("");
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items.slice(0, 30);
    return items
      .filter((it) => {
        const hay = [it.title, it.description || "", it.author_name || ""]
          .join(" ")
          .toLowerCase();
        return hay.includes(s);
      })
      .slice(0, 50);
  }, [q, items]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 animate-fade-in" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full h-[85dvh] bg-neutral-900 text-white rounded-t-3xl border-t border-white/10 flex flex-col"
        style={{ animation: "slideUp 240ms cubic-bezier(0.2,0.9,0.3,1.05) both" }}
      >
        <div className="pt-2 flex items-center justify-center">
          <div className="w-10 h-1 rounded-full bg-white/25" />
        </div>
        <div className="px-4 pt-3 pb-2 flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 h-11 rounded-full bg-white/10 border border-white/15 px-4">
            <SearchIcon className="w-4 h-4 text-white/55" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={placeholder}
              className="flex-1 bg-transparent text-sm placeholder:text-white/40 focus:outline-none"
            />
            {q && (
              <button
                onClick={() => setQ("")}
                className="text-white/50 text-xs px-1"
                aria-label="Clear"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-6">
          {filtered.length === 0 ? (
            <div className="text-center text-white/45 text-sm py-16">
              No results
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {filtered.map((it) => (
                <li key={it.id}>
                  <button
                    onClick={() => {
                      onSelect(it);
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-white/5 active:bg-white/10 transition text-left"
                  >
                    <div className="w-14 h-14 rounded-xl bg-white/10 ring-1 ring-white/10 flex items-center justify-center overflow-hidden shrink-0">
                      {it.thumbnail_url ? (
                        <img
                          src={it.thumbnail_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Play className="w-5 h-5 text-white/60 fill-white/60" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-medium truncate">
                        {it.title}
                      </div>
                      {it.author_name && (
                        <div className="text-[11px] text-white/55 mt-0.5">
                          @{it.author_name}
                        </div>
                      )}
                      {it.description && (
                        <div className="text-[11px] text-white/45 truncate mt-0.5">
                          {it.description}
                        </div>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
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

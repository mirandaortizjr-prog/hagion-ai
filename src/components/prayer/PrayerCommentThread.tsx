import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Reply, Loader2, Send, Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Comment = {
  id: string;
  prayer_id: string;
  parent_id: string | null;
  user_id: string;
  author_name: string | null;
  author_avatar: string | null;
  content: string;
  created_at: string;
};

interface Props {
  prayerId: string;
  userId: string | null;
  onCountChange?: (count: number) => void;
}

export const PrayerCommentThread = ({ prayerId, userId, onCountChange }: Props) => {
  const { language } = useLanguage();
  const t = (en: string, es: string) => (language === "es" ? es : en);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("prayer_comments")
      .select("*")
      .eq("prayer_id", prayerId)
      .order("created_at", { ascending: true });
    const list = (data as Comment[]) || [];
    setComments(list);
    onCountChange?.(list.length);
    setLoading(false);
  }, [prayerId, onCountChange]);

  useEffect(() => {
    load();
    const ch = supabase
      .channel(`prayer-comments-${prayerId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "prayer_comments", filter: `prayer_id=eq.${prayerId}` },
        () => load()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [prayerId, load]);

  const post = async (content: string, parent_id: string | null = null) => {
    if (!userId) {
      toast.error(t("Please sign in to comment.", "Inicia sesión para comentar."));
      return false;
    }
    if (!content.trim()) return false;
    setPosting(true);
    const { data: profile } = await supabase
      .from("profiles")
      .select("name,username,avatar_url")
      .eq("user_id", userId)
      .maybeSingle();
    const { error } = await supabase.from("prayer_comments").insert({
      prayer_id: prayerId,
      parent_id,
      user_id: userId,
      content: content.trim(),
      author_name: profile?.name || profile?.username || t("Believer", "Creyente"),
      author_avatar: profile?.avatar_url ?? null,
    });
    setPosting(false);
    if (error) {
      toast.error(error.message);
      return false;
    }
    return true;
  };

  // Build tree
  const byParent = new Map<string | null, Comment[]>();
  comments.forEach((c) => {
    const arr = byParent.get(c.parent_id) || [];
    arr.push(c);
    byParent.set(c.parent_id, arr);
  });
  byParent.forEach((arr) =>
    arr.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  );
  const roots = byParent.get(null) || [];

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-white/40" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Composer */}
      <div className="rounded-2xl border border-sky-300/15 bg-white/[0.04] p-3 backdrop-blur-xl">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={2}
          placeholder={t(
            "Write a word of encouragement or scripture…",
            "Escribe una palabra de aliento o escritura…"
          )}
          maxLength={1000}
          className="w-full bg-transparent text-[14px] text-white placeholder:text-white/40 resize-none outline-none font-inter"
        />
        <div className="flex justify-end mt-2">
          <button
            disabled={posting || !draft.trim()}
            onClick={async () => {
              const ok = await post(draft);
              if (ok) setDraft("");
            }}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 text-white px-4 py-1.5 text-[12px] font-medium disabled:opacity-40 hover:brightness-110 transition shadow-[0_4px_18px_-4px_rgba(56,135,255,0.55)]"
          >
            {posting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            {t("Comment", "Comentar")}
          </button>
        </div>
      </div>

      {roots.length === 0 ? (
        <p className="text-center text-white/45 text-sm py-4 font-inter italic">
          {t("Be the first to encourage.", "Sé el primero en alentar.")}
        </p>
      ) : (
        <div className="space-y-2.5">
          {roots.map((c) => (
            <CommentNode
              key={c.id}
              comment={c}
              byParent={byParent}
              depth={0}
              userId={userId}
              onReply={(content, parentId) => post(content, parentId)}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface NodeProps {
  comment: Comment;
  byParent: Map<string | null, Comment[]>;
  depth: number;
  userId: string | null;
  onReply: (content: string, parentId: string) => Promise<boolean>;
  t: (en: string, es: string) => string;
}

const CommentNode = ({ comment, byParent, depth, userId, onReply, t }: NodeProps) => {
  const [replying, setReplying] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const children = byParent.get(comment.id) || [];
  const maxDepth = 3;

  const initial = (comment.author_name || "?").trim().charAt(0).toUpperCase();

  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3",
        depth > 0 && "ml-3 border-l-2 border-l-sky-400/30 rounded-l-md"
      )}
    >
      <div className="flex items-start gap-2.5">
        {comment.author_avatar ? (
          <img
            src={comment.author_avatar}
            alt=""
            className="w-7 h-7 rounded-full object-cover border border-white/15 shrink-0"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-400/40 to-blue-600/40 border border-white/15 flex items-center justify-center text-[11px] font-medium text-white/90 shrink-0">
            {initial}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-[11px] text-white/55 font-inter">
            <span className="font-medium text-white/85">
              {comment.author_name || t("Believer", "Creyente")}
            </span>
            <span>·</span>
            <span>{timeAgo(comment.created_at, t)}</span>
          </div>
          <p className="mt-1 text-[13.5px] leading-relaxed text-white/90 whitespace-pre-wrap break-words font-inter">
            {comment.content}
          </p>
          {depth < maxDepth && userId && (
            <button
              onClick={() => setReplying((r) => !r)}
              className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-white/45 hover:text-sky-300 transition"
            >
              <Reply className="h-3 w-3" />
              {t("Reply", "Responder")}
            </button>
          )}

          {replying && (
            <div className="mt-2 rounded-xl border border-white/10 bg-white/[0.04] p-2.5">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={2}
                maxLength={1000}
                placeholder={t("A gentle reply…", "Una respuesta gentil…")}
                className="w-full bg-transparent text-[13px] text-white placeholder:text-white/40 resize-none outline-none font-inter"
              />
              <div className="flex justify-end gap-2 mt-1">
                <button
                  onClick={() => {
                    setReplying(false);
                    setDraft("");
                  }}
                  className="text-[11px] text-white/50 hover:text-white/80 px-2 py-1"
                >
                  {t("Cancel", "Cancelar")}
                </button>
                <button
                  disabled={busy || !draft.trim()}
                  onClick={async () => {
                    setBusy(true);
                    const ok = await onReply(draft, comment.id);
                    setBusy(false);
                    if (ok) {
                      setDraft("");
                      setReplying(false);
                    }
                  }}
                  className="text-[11px] bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-full px-3 py-1 disabled:opacity-40 hover:brightness-110 transition inline-flex items-center gap-1"
                >
                  {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                  {t("Send", "Enviar")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {children.length > 0 && (
        <div className="mt-2.5 space-y-2">
          {children.map((child) => (
            <CommentNode
              key={child.id}
              comment={child}
              byParent={byParent}
              depth={depth + 1}
              userId={userId}
              onReply={onReply}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
};

function timeAgo(iso: string, t: (en: string, es: string) => string) {
  const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 60) return t("just now", "ahora");
  const m = Math.floor(sec / 60);
  if (m < 60) return `${m}${t("m", "m")}`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}${t("h", "h")}`;
  const d = Math.floor(h / 24);
  return `${d}${t("d", "d")}`;
}

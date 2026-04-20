import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowBigUp, ArrowBigDown, Reply, Flag, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Comment = {
  id: string;
  devotional_id: string;
  parent_id: string | null;
  user_id: string;
  author_name: string | null;
  author_avatar: string | null;
  content: string;
  score: number;
  created_at: string;
};

type SortMode = "top" | "new";

interface Props {
  devotionalId: string;
}

export const CommentThread = ({ devotionalId }: Props) => {
  const { language } = useLanguage();
  const t = (en: string, es: string) => (language === "es" ? es : en);
  const [comments, setComments] = useState<Comment[]>([]);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortMode>("top");
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    const { data: c } = await supabase
      .from("devotional_comments")
      .select("*")
      .eq("devotional_id", devotionalId)
      .order("created_at", { ascending: true });
    setComments((c as Comment[]) || []);
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id ?? null);
    if (user) {
      const { data: v } = await supabase
        .from("devotional_comment_votes")
        .select("comment_id,vote")
        .eq("user_id", user.id);
      const map: Record<string, number> = {};
      (v || []).forEach((row: any) => (map[row.comment_id] = row.vote));
      setVotes(map);
    }
    setLoading(false);
  }, [devotionalId]);

  useEffect(() => {
    load();
  }, [load]);

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
    const { error } = await supabase.from("devotional_comments").insert({
      devotional_id: devotionalId,
      parent_id,
      user_id: userId,
      content: content.trim(),
      author_name: profile?.name || profile?.username || t("Friend", "Amigo"),
      author_avatar: profile?.avatar_url ?? null,
    });
    setPosting(false);
    if (error) {
      toast.error(error.message);
      return false;
    }
    await load();
    return true;
  };

  const vote = async (commentId: string, value: 1 | -1) => {
    if (!userId) {
      toast.error(t("Please sign in to vote.", "Inicia sesión para votar."));
      return;
    }
    const current = votes[commentId];
    if (current === value) {
      // toggle off
      await supabase
        .from("devotional_comment_votes")
        .delete()
        .eq("user_id", userId)
        .eq("comment_id", commentId);
      setVotes({ ...votes, [commentId]: 0 });
      setComments((cs) =>
        cs.map((c) => (c.id === commentId ? { ...c, score: c.score - value } : c))
      );
    } else {
      const delta = value - (current || 0);
      await supabase
        .from("devotional_comment_votes")
        .upsert(
          { user_id: userId, comment_id: commentId, vote: value },
          { onConflict: "user_id,comment_id" }
        );
      setVotes({ ...votes, [commentId]: value });
      setComments((cs) =>
        cs.map((c) => (c.id === commentId ? { ...c, score: c.score + delta } : c))
      );
    }
  };

  const report = async (commentId: string) => {
    if (!userId) {
      toast.error(t("Please sign in to report.", "Inicia sesión para reportar."));
      return;
    }
    const { error } = await supabase
      .from("devotional_comment_reports")
      .insert({ comment_id: commentId, reporter_id: userId });
    if (error) toast.error(error.message);
    else toast.success(t("Reported. Thank you.", "Reportado. Gracias."));
  };

  // Build tree
  const byParent = new Map<string | null, Comment[]>();
  comments.forEach((c) => {
    const arr = byParent.get(c.parent_id) || [];
    arr.push(c);
    byParent.set(c.parent_id, arr);
  });
  const sortFn = (a: Comment, b: Comment) =>
    sort === "top" ? b.score - a.score : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  byParent.forEach((arr) => arr.sort(sortFn));

  const roots = byParent.get(null) || [];

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-white/40" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Composer */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-xl">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          placeholder={t(
            "Share your reflection in love and truth…",
            "Comparte tu reflexión en amor y verdad…"
          )}
          className="w-full bg-transparent text-[14px] text-white placeholder:text-white/40 resize-none outline-none font-inter"
        />
        <div className="flex justify-end mt-2">
          <button
            disabled={posting || !draft.trim()}
            onClick={async () => {
              const ok = await post(draft);
              if (ok) setDraft("");
            }}
            className="inline-flex items-center gap-2 rounded-full bg-white text-black px-4 py-1.5 text-[13px] font-medium disabled:opacity-40 hover:bg-white/90 transition"
          >
            {posting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            {t("Post", "Publicar")}
          </button>
        </div>
      </div>

      {/* Sort */}
      {roots.length > 0 && (
        <div className="flex gap-1 text-[11px]">
          {(["top", "new"] as SortMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setSort(m)}
              className={cn(
                "px-3 py-1 rounded-full uppercase tracking-[0.18em] font-inter transition",
                sort === m ? "bg-white/15 text-white" : "text-white/50 hover:text-white/80"
              )}
            >
              {m === "top" ? t("Top", "Top") : t("New", "Nuevo")}
            </button>
          ))}
        </div>
      )}

      {/* Comments */}
      {roots.length === 0 ? (
        <p className="text-center text-white/45 text-sm py-6 font-inter">
          {t("Be the first to share.", "Sé el primero en compartir.")}
        </p>
      ) : (
        <div className="space-y-3">
          {roots.map((c) => (
            <CommentNode
              key={c.id}
              comment={c}
              byParent={byParent}
              depth={0}
              userVote={votes[c.id] || 0}
              userId={userId}
              onVote={vote}
              onReply={(content, parentId) => post(content, parentId)}
              onReport={report}
              votes={votes}
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
  userVote: number;
  userId: string | null;
  votes: Record<string, number>;
  onVote: (id: string, v: 1 | -1) => void;
  onReply: (content: string, parentId: string) => Promise<boolean>;
  onReport: (id: string) => void;
  t: (en: string, es: string) => string;
}

const CommentNode = ({
  comment,
  byParent,
  depth,
  userVote,
  userId,
  votes,
  onVote,
  onReply,
  onReport,
  t,
}: NodeProps) => {
  const [replying, setReplying] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const children = byParent.get(comment.id) || [];
  const maxDepth = 6;

  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3.5",
        depth > 0 && "ml-3 border-l-2 border-l-white/10 rounded-l-md"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center gap-0.5 pt-0.5">
          <button
            onClick={() => onVote(comment.id, 1)}
            className={cn(
              "p-0.5 rounded hover:bg-white/10 transition",
              userVote === 1 ? "text-amber-400" : "text-white/40"
            )}
            aria-label="Upvote"
          >
            <ArrowBigUp className="h-5 w-5" strokeWidth={1.8} />
          </button>
          <span
            className={cn(
              "text-[11px] font-medium tabular-nums",
              userVote === 1 ? "text-amber-400" : userVote === -1 ? "text-violet-400" : "text-white/60"
            )}
          >
            {comment.score}
          </span>
          <button
            onClick={() => onVote(comment.id, -1)}
            className={cn(
              "p-0.5 rounded hover:bg-white/10 transition",
              userVote === -1 ? "text-violet-400" : "text-white/40"
            )}
            aria-label="Downvote"
          >
            <ArrowBigDown className="h-5 w-5" strokeWidth={1.8} />
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-[11px] text-white/55 font-inter">
            <span className="font-medium text-white/80">
              {comment.author_name || t("Friend", "Amigo")}
            </span>
            <span>·</span>
            <span>{timeAgo(comment.created_at, t)}</span>
          </div>
          <p className="mt-1 text-[14px] leading-relaxed text-white/90 whitespace-pre-wrap break-words font-inter">
            {comment.content}
          </p>
          <div className="flex items-center gap-3 mt-2 text-[11px] text-white/45">
            {depth < maxDepth && (
              <button
                onClick={() => setReplying((r) => !r)}
                className="inline-flex items-center gap-1 hover:text-white/80 transition"
              >
                <Reply className="h-3 w-3" />
                {t("Reply", "Responder")}
              </button>
            )}
            <button
              onClick={() => onReport(comment.id)}
              className="inline-flex items-center gap-1 hover:text-rose-400 transition"
            >
              <Flag className="h-3 w-3" />
              {t("Report", "Reportar")}
            </button>
          </div>

          {replying && (
            <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] p-2.5">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={2}
                placeholder={t("Write a thoughtful reply…", "Escribe una respuesta reflexiva…")}
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
                  className="text-[11px] bg-white text-black rounded-full px-3 py-1 disabled:opacity-40 hover:bg-white/90 transition inline-flex items-center gap-1"
                >
                  {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                  {t("Reply", "Responder")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {children.length > 0 && (
        <div className="mt-3 space-y-2">
          {children.map((child) => (
            <CommentNode
              key={child.id}
              comment={child}
              byParent={byParent}
              depth={depth + 1}
              userVote={votes[child.id] || 0}
              userId={userId}
              votes={votes}
              onVote={onVote}
              onReply={onReply}
              onReport={onReport}
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

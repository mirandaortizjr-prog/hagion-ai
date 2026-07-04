import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Send, Trash2, HandHeart, Heart, Lightbulb, Flag } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ReportDialog } from "@/components/ReportDialog";

type Comment = {
  id: string;
  devotional_id: string;
  author_id: string;
  parent_id: string | null;
  body: string;
  amen_count: number;
  encouraged_count: number;
  insight_count: number;
  created_at: string;
  author_name?: string;
  author_avatar?: string | null;
};

const REACTIONS = [
  { key: "amen" as const, Icon: HandHeart, label: "Amen", color: "text-amber-300" },
  { key: "encouraged" as const, Icon: Heart, label: "Encouraged", color: "text-rose-300" },
  { key: "insight" as const, Icon: Lightbulb, label: "Insight", color: "text-sky-300" },
];

export function UserDevotionalCommentThread({ devotionalId }: { devotionalId: string }) {
  const { language } = useLanguage();
  const t = (en: string, es: string) => (language === "es" ? es : en);

  const [uid, setUid] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [myReactions, setMyReactions] = useState<Record<string, Set<string>>>({});
  const [reportTargetId, setReportTargetId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUid(data.user?.id ?? null));
  }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("user_devotional_comments")
      .select("*")
      .eq("devotional_id", devotionalId)
      .order("created_at", { ascending: true });

    const list = (data || []) as any[];
    const authorIds = Array.from(new Set(list.map((c) => c.author_id)));
    let profileMap: Record<string, { name: string; avatar: string | null }> = {};
    if (authorIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, name, username, avatar_url")
        .in("user_id", authorIds);
      (profs || []).forEach((p: any) => {
        profileMap[p.user_id] = { name: p.name || p.username || "Friend", avatar: p.avatar_url };
      });
    }
    const enriched = list.map((c) => ({
      ...c,
      author_name: profileMap[c.author_id]?.name || "Friend",
      author_avatar: profileMap[c.author_id]?.avatar || null,
    }));
    setComments(enriched);

    if (uid && list.length) {
      const { data: rx } = await supabase
        .from("user_devotional_comment_reactions")
        .select("comment_id, reaction")
        .eq("user_id", uid)
        .in("comment_id", list.map((c) => c.id));
      const map: Record<string, Set<string>> = {};
      (rx || []).forEach((r: any) => {
        if (!map[r.comment_id]) map[r.comment_id] = new Set();
        map[r.comment_id].add(r.reaction);
      });
      setMyReactions(map);
    }
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [devotionalId, uid]);

  const submit = async () => {
    if (!uid) { toast.error(t("Sign in to comment", "Inicia sesión para comentar")); return; }
    const text = body.trim();
    if (!text) return;
    if (text.length > 2000) { toast.error(t("Comment too long", "Comentario muy largo")); return; }
    setPosting(true);
    const { error } = await supabase.from("user_devotional_comments").insert({
      devotional_id: devotionalId,
      author_id: uid,
      parent_id: replyTo,
      body: text,
    });
    setPosting(false);
    if (error) { toast.error(error.message); return; }
    setBody("");
    setReplyTo(null);
    load();
  };

  const del = async (id: string) => {
    await supabase.from("user_devotional_comments").delete().eq("id", id);
    load();
  };

  const toggleReaction = async (commentId: string, reaction: "amen"|"encouraged"|"insight") => {
    if (!uid) { toast.error(t("Sign in", "Inicia sesión")); return; }
    const has = myReactions[commentId]?.has(reaction);
    if (has) {
      await supabase.from("user_devotional_comment_reactions").delete()
        .eq("comment_id", commentId).eq("user_id", uid).eq("reaction", reaction);
    } else {
      await supabase.from("user_devotional_comment_reactions").insert({
        comment_id: commentId, user_id: uid, reaction,
      });
    }
    load();
  };

  const roots = comments.filter((c) => !c.parent_id);
  const childrenOf = (id: string) => comments.filter((c) => c.parent_id === id);

  const CommentCard = ({ c, depth = 0 }: { c: Comment; depth?: number }) => (
    <div className={cn("rounded-2xl border border-white/10 bg-white/[0.03] p-3.5", depth > 0 && "ml-6 mt-2")}>
      <div className="flex items-start gap-2.5">
        <div className="h-8 w-8 rounded-full bg-white/10 overflow-hidden shrink-0">
          {c.author_avatar ? (
            <img src={c.author_avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-xs font-inter text-white/70">
              {c.author_name?.[0]?.toUpperCase() || "?"}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-[11px] text-white/50">
            <span className="text-white/85 font-inter font-medium">{c.author_name}</span>
            <span>·</span>
            <span>{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</span>
          </div>
          <p className="mt-1 text-[14px] leading-relaxed text-white/90 whitespace-pre-wrap font-inter">{c.body}</p>

          <div className="mt-2 flex items-center gap-3">
            {REACTIONS.map(({ key, Icon, color }) => {
              const active = myReactions[c.id]?.has(key);
              const count = c[`${key}_count` as const];
              return (
                <button
                  key={key}
                  onClick={() => toggleReaction(c.id, key)}
                  className={cn(
                    "flex items-center gap-1 text-[11px] rounded-full px-2 py-0.5 transition-colors",
                    active ? `${color} bg-white/10` : "text-white/50 hover:text-white/80 hover:bg-white/5"
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {count > 0 && <span>{count}</span>}
                </button>
              );
            })}
            {depth === 0 && (
              <button
                onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}
                className="text-[11px] text-white/50 hover:text-white/80"
              >
                {replyTo === c.id ? t("Cancel", "Cancelar") : t("Reply", "Responder")}
              </button>
            )}
            {uid && uid !== c.author_id && (
              <button
                onClick={() => setReportTargetId(c.id)}
                className="text-[11px] text-white/40 hover:text-amber-300 ml-auto"
                aria-label={t("Report", "Reportar")}
              >
                <Flag className="h-3 w-3" />
              </button>
            )}
            {uid === c.author_id && (
              <button onClick={() => del(c.id)} className="text-[11px] text-white/40 hover:text-rose-300 ml-auto">
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>

          {replyTo === c.id && (
            <div className="mt-3 flex gap-2">
              <input
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={t("Write a reply…", "Escribe una respuesta…")}
                className="flex-1 rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-[13px] text-white placeholder:text-white/40 focus:outline-none focus:border-white/25"
              />
              <button
                onClick={submit}
                disabled={posting || !body.trim()}
                className="rounded-full bg-white/10 px-3 py-1.5 text-[12px] hover:bg-white/20 disabled:opacity-40"
              >
                {posting ? <Loader2 className="h-3 w-3 animate-spin" /> : t("Send", "Enviar")}
              </button>
            </div>
          )}

          {childrenOf(c.id).map((child) => (
            <CommentCard key={child.id} c={child} depth={depth + 1} />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      {!replyTo && (
        <div className="flex gap-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={2}
            placeholder={t("Share your reflection… iron sharpens iron.", "Comparte tu reflexión… hierro con hierro se aguza.")}
            className="flex-1 rounded-2xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-[14px] text-white placeholder:text-white/40 focus:outline-none focus:border-white/25 resize-none"
          />
          <button
            onClick={submit}
            disabled={posting || !body.trim() || !uid}
            className="self-end rounded-full bg-white/10 p-2.5 hover:bg-white/20 disabled:opacity-40"
            aria-label={t("Send", "Enviar")}
          >
            {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-white/40" /></div>
      ) : roots.length === 0 ? (
        <p className="text-center py-8 text-[13px] text-white/50 font-inter italic">
          {t("Be the first to share.", "Sé el primero en compartir.")}
        </p>
      ) : (
        roots.map((c) => <CommentCard key={c.id} c={c} />)
      )}
    </div>
  );
}

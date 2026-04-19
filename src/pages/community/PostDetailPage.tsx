import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CommunityHeader } from "@/components/community/CommunityHeader";
import { PremiumNav } from "@/components/PremiumNav";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Heart, HandHeart, Sparkles, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function PostDetailPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [text, setText] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    load();
  }, [id]);

  const load = async () => {
    if (!id) return;
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from("posts").select("*").eq("id", id).maybeSingle(),
      supabase.from("post_comments").select("*").eq("post_id", id).order("created_at", { ascending: true }),
    ]);
    setPost(p);
    setComments(c || []);
  };

  const submit = async () => {
    if (!user) {
      toast({ title: "Please sign in" });
      return;
    }
    if (!text.trim() || !id) return;
    const { error } = await supabase.from("post_comments").insert({
      post_id: id,
      user_id: user.id,
      author_name: user.user_metadata?.name || user.email?.split("@")[0] || "Believer",
      content: text.trim(),
    });
    if (error) toast({ title: "Could not comment", variant: "destructive" });
    else {
      setText("");
      load();
    }
  };

  if (!post) {
    return (
      <div className="min-h-screen text-white px-5 max-w-3xl mx-auto">
        <CommunityHeader title="Post" />
        <PremiumNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      <main className="px-5 sm:px-8 pb-32 max-w-3xl mx-auto">
        <CommunityHeader title="Post" />

        <article className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] p-5 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-11 w-11 ring-1 ring-white/20">
              <AvatarFallback className="bg-gradient-to-br from-white/20 to-white/5 text-white font-playfair">
                {(post.is_anonymous ? "A" : post.author_name?.[0] || "B").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-semibold">
                {post.is_anonymous ? "Anonymous" : post.author_name || "Believer"}
              </div>
              <div className="text-[11px] text-white/50">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </div>
            </div>
          </div>
          <p className="text-white/85 text-[15px] leading-relaxed whitespace-pre-wrap">{post.content}</p>
          <div className="flex gap-4 mt-4 pt-3 border-t border-white/10 text-[12px] text-white/60">
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" /> {post.like_count}
            </span>
            <span className="flex items-center gap-1">
              <HandHeart className="w-4 h-4" /> {post.pray_count}
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-4 h-4" /> {post.encourage_count}
            </span>
          </div>
        </article>

        <h2 className="font-playfair text-xl mb-3 px-1">Comments</h2>
        <div className="space-y-3 mb-6">
          {comments.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 text-center text-white/60">
              No comments yet. Be the first to encourage.
            </div>
          ) : (
            comments.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-4"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Avatar className="h-7 w-7 ring-1 ring-white/15">
                    <AvatarFallback className="bg-white/10 text-white text-[11px]">
                      {c.author_name?.[0]?.toUpperCase() || "B"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-xs font-semibold">{c.author_name || "Believer"}</div>
                  <div className="text-[10px] text-white/40">
                    {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                  </div>
                </div>
                <p className="text-sm text-white/80 whitespace-pre-wrap">{c.content}</p>
              </div>
            ))
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment..."
            rows={2}
            className="resize-none bg-black/30 border-white/10 text-white placeholder:text-white/40 rounded-xl"
          />
          <div className="flex justify-end mt-3">
            <Button
              onClick={submit}
              disabled={!text.trim()}
              className="rounded-full bg-gradient-to-r from-white/95 to-white/80 text-black"
            >
              <Send className="w-4 h-4 mr-1" /> Post
            </Button>
          </div>
        </div>
      </main>
      <PremiumNav />
    </div>
  );
}

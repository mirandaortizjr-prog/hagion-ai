import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CommunityHeader } from "@/components/community/CommunityHeader";
import { PremiumNav } from "@/components/PremiumNav";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function MessengerPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) loadConversations(data.user.id);
    });
  }, []);

  useEffect(() => {
    if (!activeId) return;
    loadMessages(activeId);
    const channel = supabase
      .channel(`messages-${activeId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${activeId}` },
        (payload) => setMessages((m) => [...m, payload.new])
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const loadConversations = async (uid: string) => {
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .or(`user_id.eq.${uid},participant_id.eq.${uid}`)
      .order("last_message_at", { ascending: false, nullsFirst: false });
    setConversations(data || []);
    if (data && data[0]) setActiveId(data[0].id);
  };

  const loadMessages = async (cid: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", cid)
      .order("created_at", { ascending: true });
    setMessages(data || []);
  };

  const send = async () => {
    if (!user || !activeId || !text.trim()) return;
    const { error } = await supabase
      .from("messages")
      .insert({ conversation_id: activeId, sender_id: user.id, content: text.trim() });
    if (error) toast({ title: "Could not send", variant: "destructive" });
    else setText("");
  };

  if (!user) {
    return (
      <div className="min-h-screen text-white">
        <main className="px-5 max-w-3xl mx-auto">
          <CommunityHeader title="Messenger" subtitle="Sign in to message other believers." />
        </main>
        <PremiumNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      <main className="px-5 sm:px-8 pb-32 max-w-3xl mx-auto">
        <CommunityHeader title="Messenger" />

        {conversations.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-10 text-center">
            <MessageSquare className="w-10 h-10 text-white/40 mx-auto mb-3" />
            <div className="text-white/70">No conversations yet</div>
            <div className="text-[12px] text-white/50 mt-1">
              Start chatting from any group or post.
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-[220px_1fr] gap-4">
            <div className="space-y-2">
              {conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={`w-full text-left rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-3 flex items-center gap-3 hover:bg-white/[0.07] transition ${
                    activeId === c.id ? "ring-1 ring-white/30" : ""
                  }`}
                >
                  <Avatar className="h-9 w-9 ring-1 ring-white/15">
                    <AvatarFallback className="bg-white/10 text-white text-xs">
                      {(c.title || "C")[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{c.title || "Conversation"}</div>
                    <div className="text-[10px] text-white/50">
                      {c.last_message_at &&
                        formatDistanceToNow(new Date(c.last_message_at), { addSuffix: true })}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] flex flex-col h-[60vh]">
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.map((m) => {
                  const mine = m.sender_id === user.id;
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                          mine
                            ? "bg-gradient-to-br from-white/95 to-white/80 text-black"
                            : "bg-white/[0.08] border border-white/10 text-white"
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-white/10 p-3 flex gap-2">
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={1}
                  placeholder="Message..."
                  className="resize-none bg-black/30 border-white/10 text-white placeholder:text-white/40 rounded-xl min-h-[40px]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                />
                <Button
                  onClick={send}
                  disabled={!text.trim()}
                  className="rounded-full bg-gradient-to-r from-white/95 to-white/80 text-black"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
      <PremiumNav />
    </div>
  );
}

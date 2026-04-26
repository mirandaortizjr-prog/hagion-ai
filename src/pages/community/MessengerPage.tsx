import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CommunityHeader } from "@/components/community/CommunityHeader";
import { PremiumNav } from "@/components/PremiumNav";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, MessageSquare, ImagePlus, Mic, X, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useHaptics } from "@/hooks/useNativeFeatures";
import { useCamera } from "@/hooks/useCamera";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";

type MediaPayload = {
  url: string;
  type: "image" | "audio";
  durationMs?: number;
};

const formatRecTime = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export default function MessengerPage() {
  const { toast } = useToast();
  const { impact, notification } = useHaptics();
  const camera = useCamera();
  const recorder = useVoiceRecorder();

  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [pendingImage, setPendingImage] = useState<{ dataUrl: string; blob: Blob } | null>(null);
  const [sending, setSending] = useState(false);
  const [recordCancelled, setRecordCancelled] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const recordStartYRef = useRef<number>(0);

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
        (payload) => {
          setMessages((m) => [...m, payload.new]);
          if (payload.new.sender_id !== user?.id) impact("light");
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeId, user?.id, impact]);

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

  // ---------- Attachments ----------
  const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
    const res = await fetch(dataUrl);
    return res.blob();
  };

  const pickImage = async () => {
    impact("light");
    const photo = await camera.takePhoto({ source: "prompt", quality: 80 });
    if (!photo?.dataUrl) return;
    const blob = await dataUrlToBlob(photo.dataUrl);
    setPendingImage({ dataUrl: photo.dataUrl, blob });
  };

  const uploadAttachment = async (
    blob: Blob,
    ext: string,
  ): Promise<string | null> => {
    if (!activeId) return null;
    const path = `${activeId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage
      .from("message-attachments")
      .upload(path, blob, { contentType: blob.type, upsert: false });
    if (error) {
      console.error(error);
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return null;
    }
    const { data } = supabase.storage.from("message-attachments").getPublicUrl(path);
    // Bucket is private — use signed URL instead
    const { data: signed } = await supabase.storage
      .from("message-attachments")
      .createSignedUrl(path, 60 * 60 * 24 * 365); // 1 year
    return signed?.signedUrl || data.publicUrl;
  };

  const sendMessage = async (extraMedia?: MediaPayload) => {
    if (!user || !activeId) return;
    if (!text.trim() && !extraMedia && !pendingImage) return;

    setSending(true);
    impact("medium");

    let media: MediaPayload | null = extraMedia ?? null;
    if (!media && pendingImage) {
      const url = await uploadAttachment(pendingImage.blob, "jpg");
      if (!url) {
        setSending(false);
        return;
      }
      media = { url, type: "image" };
    }

    const { error } = await supabase.from("messages").insert({
      conversation_id: activeId,
      sender_id: user.id,
      content: text.trim() || null,
      media_url: media?.url ?? null,
      media_type: media?.type ?? null,
      media_duration_ms: media?.durationMs ?? null,
    });

    if (error) {
      notification("error");
      toast({ title: "Could not send", variant: "destructive" });
    } else {
      setText("");
      setPendingImage(null);
    }
    setSending(false);
  };

  // ---------- Voice notes (hold-to-record) ----------
  const beginRecording = async (e: React.PointerEvent) => {
    if (recorder.isRecording || sending) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    recordStartYRef.current = e.clientY;
    setRecordCancelled(false);
    impact("medium");
    const ok = await recorder.start();
    if (!ok) notification("error");
  };

  const moveRecording = (e: React.PointerEvent) => {
    if (!recorder.isRecording) return;
    const dy = recordStartYRef.current - e.clientY;
    setRecordCancelled(dy > 80); // slide up to cancel
  };

  const endRecording = async (e: React.PointerEvent) => {
    if (!recorder.isRecording) return;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    const cancelled = recordCancelled;
    const result = await recorder.stop();
    setRecordCancelled(false);

    if (cancelled || !result) {
      impact("light");
      return;
    }
    if (result.durationMs < 500) {
      toast({ title: "Hold to record", description: "Press and hold the mic." });
      return;
    }

    let blob: Blob;
    let ext = "webm";
    if (result.blob) {
      blob = result.blob;
      ext = blob.type.includes("mp4") ? "mp4" : "webm";
    } else if (result.base64Sound) {
      const bin = atob(result.base64Sound);
      const arr = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      blob = new Blob([arr], { type: result.mimeType });
      ext = result.mimeType.includes("aac") ? "aac" : "m4a";
    } else {
      return;
    }

    const url = await uploadAttachment(blob, ext);
    if (!url) return;
    await sendMessage({ url, type: "audio", durationMs: result.durationMs });
    notification("success");
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
                  onClick={() => {
                    impact("light");
                    setActiveId(c.id);
                  }}
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
                        className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm space-y-2 ${
                          mine
                            ? "bg-gradient-to-br from-white/95 to-white/80 text-black"
                            : "bg-white/[0.08] border border-white/10 text-white"
                        }`}
                      >
                        {m.media_type === "image" && m.media_url && (
                          <img
                            src={m.media_url}
                            alt="attachment"
                            className="rounded-xl max-h-64 w-auto object-cover"
                          />
                        )}
                        {m.media_type === "audio" && m.media_url && (
                          <audio
                            controls
                            src={m.media_url}
                            className="w-56 max-w-full"
                          />
                        )}
                        {m.content && <div>{m.content}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pending image preview */}
              {pendingImage && (
                <div className="px-3 pt-2 flex items-center gap-2">
                  <div className="relative">
                    <img
                      src={pendingImage.dataUrl}
                      alt="pending"
                      className="h-16 w-16 rounded-lg object-cover ring-1 ring-white/15"
                    />
                    <button
                      onClick={() => setPendingImage(null)}
                      className="absolute -top-2 -right-2 bg-black/70 rounded-full p-1"
                      aria-label="Remove image"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                  <div className="text-xs text-white/60">Photo ready to send</div>
                </div>
              )}

              {/* Recording overlay */}
              {recorder.isRecording && (
                <div className="px-3 pt-2 flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="font-mono">{formatRecTime(recorder.durationMs)}</span>
                  </div>
                  <div
                    className={`text-xs flex items-center gap-1 ${
                      recordCancelled ? "text-red-400" : "text-white/60"
                    }`}
                  >
                    {recordCancelled ? (
                      <>
                        <Trash2 className="w-3 h-3" /> Release to cancel
                      </>
                    ) : (
                      <>↑ Slide up to cancel</>
                    )}
                  </div>
                </div>
              )}

              <div className="border-t border-white/10 p-3 flex gap-2 items-end">
                <Button
                  type="button"
                  onClick={pickImage}
                  size="icon"
                  variant="ghost"
                  disabled={sending || recorder.isRecording}
                  className="rounded-full text-white/70 hover:text-white hover:bg-white/10 shrink-0"
                  aria-label="Add photo"
                >
                  <ImagePlus className="w-5 h-5" />
                </Button>

                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={1}
                  placeholder={recorder.isRecording ? "Recording..." : "Message..."}
                  disabled={recorder.isRecording}
                  className="resize-none bg-black/30 border-white/10 text-white placeholder:text-white/40 rounded-xl min-h-[40px]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />

                {text.trim() || pendingImage ? (
                  <Button
                    onClick={() => sendMessage()}
                    disabled={sending}
                    className="rounded-full bg-gradient-to-r from-white/95 to-white/80 text-black shrink-0"
                    aria-label="Send"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="icon"
                    onPointerDown={beginRecording}
                    onPointerMove={moveRecording}
                    onPointerUp={endRecording}
                    onPointerCancel={endRecording}
                    className={`rounded-full shrink-0 select-none touch-none ${
                      recorder.isRecording
                        ? recordCancelled
                          ? "bg-red-500 text-white scale-110"
                          : "bg-red-500 text-white scale-110"
                        : "bg-white/90 text-black"
                    } transition-transform`}
                    aria-label="Hold to record voice note"
                  >
                    <Mic className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      <PremiumNav />
    </div>
  );
}

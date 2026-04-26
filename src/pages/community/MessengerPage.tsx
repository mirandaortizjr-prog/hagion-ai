import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PremiumNav } from "@/components/PremiumNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Send,
  ImagePlus,
  Mic,
  X,
  Trash2,
  ArrowLeft,
  Search,
  PenSquare,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useHaptics } from "@/hooks/useNativeFeatures";
import { useCamera } from "@/hooks/useCamera";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { useSafeBackNavigation } from "@/hooks/useSafeBackNavigation";

type MediaPayload = { url: string; type: "image" | "audio"; durationMs?: number };
type Profile = { user_id: string; name: string | null; username: string | null; avatar_url: string | null };

const formatRecTime = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

const initialOf = (p?: Profile | null) =>
  ((p?.name || p?.username || "?").trim()[0] || "?").toUpperCase();
const displayName = (p?: Profile | null) => p?.name || p?.username || "Friend";

export default function MessengerPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const handleBack = useSafeBackNavigation("/community");
  const { impact, notification } = useHaptics();
  const camera = useCamera();
  const recorder = useVoiceRecorder();

  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [profilesMap, setProfilesMap] = useState<Record<string, Profile>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [pendingImage, setPendingImage] = useState<{ dataUrl: string; blob: Blob } | null>(null);
  const [sending, setSending] = useState(false);
  const [recordCancelled, setRecordCancelled] = useState(false);

  // New chat composer
  const [composerOpen, setComposerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);

  // List search
  const [listFilter, setListFilter] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const recordStartYRef = useRef<number>(0);

  // ---------- Auth ----------
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) loadConversations(data.user.id);
    });
  }, []);

  // ---------- Deep-link: ?to=<userId> opens or creates a conversation ----------
  useEffect(() => {
    const to = searchParams.get("to");
    if (!to || !user) return;
    (async () => {
      const conv = await ensureConversationWith(to);
      if (conv) setActiveId(conv.id);
      // strip param so refreshes don't re-trigger
      searchParams.delete("to");
      setSearchParams(searchParams, { replace: true });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, searchParams.get("to")]);

  // ---------- Realtime messages for active ----------
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

  // ---------- Realtime conversations list refresh ----------
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`convs-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => {
        loadConversations(user.id);
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => {
        loadConversations(user.id);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, activeId]);

  // ---------- Loaders ----------
  const loadConversations = async (uid: string) => {
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .or(`user_id.eq.${uid},participant_id.eq.${uid}`)
      .order("last_message_at", { ascending: false, nullsFirst: false });
    const convs = data || [];
    setConversations(convs);

    // Hydrate other-party profiles
    const otherIds = Array.from(
      new Set(
        convs
          .map((c) => (c.user_id === uid ? c.participant_id : c.user_id))
          .filter(Boolean) as string[]
      )
    );
    if (otherIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, name, username, avatar_url")
        .in("user_id", otherIds);
      const map: Record<string, Profile> = {};
      (profs || []).forEach((p: any) => {
        map[p.user_id] = p;
      });
      setProfilesMap((prev) => ({ ...prev, ...map }));
    }
  };

  const loadMessages = async (cid: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", cid)
      .order("created_at", { ascending: true });
    setMessages(data || []);
  };

  // ---------- Start / find conversation with a user ----------
  const ensureConversationWith = async (otherUserId: string) => {
    if (!user || otherUserId === user.id) return null;

    // Try find existing in either direction
    const { data: existing } = await supabase
      .from("conversations")
      .select("*")
      .or(
        `and(user_id.eq.${user.id},participant_id.eq.${otherUserId}),and(user_id.eq.${otherUserId},participant_id.eq.${user.id})`
      )
      .limit(1)
      .maybeSingle();

    if (existing) return existing;

    // Create new
    const { data: created, error } = await supabase
      .from("conversations")
      .insert({ user_id: user.id, participant_id: otherUserId })
      .select()
      .single();

    if (error) {
      toast({ title: "Could not start conversation", description: error.message, variant: "destructive" });
      return null;
    }

    // Hydrate profile for that user
    const { data: prof } = await supabase
      .from("profiles")
      .select("user_id, name, username, avatar_url")
      .eq("user_id", otherUserId)
      .maybeSingle();
    if (prof) setProfilesMap((m) => ({ ...m, [prof.user_id]: prof as Profile }));

    await loadConversations(user.id);
    return created;
  };

  // ---------- People search ----------
  useEffect(() => {
    if (!composerOpen) return;
    const q = searchQuery.trim();
    setSearching(true);
    const t = setTimeout(async () => {
      let query = supabase
        .from("profiles")
        .select("user_id, name, username, avatar_url")
        .neq("user_id", user?.id || "")
        .limit(25);
      if (q) {
        query = query.or(`name.ilike.%${q}%,username.ilike.%${q}%`);
      } else {
        query = query.order("updated_at", { ascending: false });
      }
      const { data } = await query;
      setSearchResults((data || []) as Profile[]);
      setSearching(false);
    }, 200);
    return () => clearTimeout(t);
  }, [searchQuery, composerOpen, user?.id]);

  // ---------- Attachments ----------
  const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => (await fetch(dataUrl)).blob();

  const pickImage = async () => {
    impact("light");
    const photo = await camera.takePhoto({ source: "prompt", quality: 80 });
    if (!photo?.dataUrl) return;
    const blob = await dataUrlToBlob(photo.dataUrl);
    setPendingImage({ dataUrl: photo.dataUrl, blob });
  };

  const uploadAttachment = async (blob: Blob, ext: string): Promise<string | null> => {
    if (!activeId) return null;
    const path = `${activeId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage
      .from("message-attachments")
      .upload(path, blob, { contentType: blob.type, upsert: false });
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return null;
    }
    const { data: signed } = await supabase.storage
      .from("message-attachments")
      .createSignedUrl(path, 60 * 60 * 24 * 365);
    const { data: pub } = supabase.storage.from("message-attachments").getPublicUrl(path);
    return signed?.signedUrl || pub.publicUrl;
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

  // ---------- Voice notes ----------
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
    setRecordCancelled(dy > 80);
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

  // ---------- Helpers ----------
  const otherPartyOf = (c: any): Profile | null => {
    const otherId = c.user_id === user?.id ? c.participant_id : c.user_id;
    return otherId ? profilesMap[otherId] || null : null;
  };

  const filteredConvs = useMemo(() => {
    const q = listFilter.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => {
      const p = otherPartyOf(c);
      return (
        (p?.name || "").toLowerCase().includes(q) ||
        (p?.username || "").toLowerCase().includes(q) ||
        (c.title || "").toLowerCase().includes(q)
      );
    });
  }, [conversations, listFilter, profilesMap, user?.id]);

  const activeConv = conversations.find((c) => c.id === activeId);
  const activeOther = activeConv ? otherPartyOf(activeConv) : null;

  // ---------- Signed-out ----------
  if (!user) {
    return (
      <div className="min-h-screen text-white">
        <main className="px-5 max-w-3xl mx-auto pt-16 text-center">
          <h1 className="font-playfair text-3xl mb-2">Messages</h1>
          <p className="text-white/60 text-sm">Sign in to message other believers.</p>
        </main>
        <PremiumNav />
      </div>
    );
  }

  // ---------- Render ----------
  // Two states on mobile: list view (no activeId) OR chat view (activeId)
  const showChat = !!activeId;

  return (
    <div className="min-h-screen text-white">
      <main className="max-w-3xl mx-auto pb-28">
        {/* ============== CHAT VIEW ============== */}
        {showChat ? (
          <div className="flex flex-col h-[100dvh] sm:h-auto sm:min-h-[80vh]">
            {/* iOS-style chat header */}
            <header className="sticky top-0 z-30 bg-black/50 backdrop-blur-2xl border-b border-white/10">
              <div className="flex items-center gap-2 px-2 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))]">
                <button
                  onClick={() => setActiveId(null)}
                  className="flex items-center gap-0.5 text-[#0A84FF] active:opacity-60 px-1 py-1 -ml-1"
                  aria-label="Back to messages"
                >
                  <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
                  <span className="text-[15px] font-medium">Messages</span>
                </button>
                <div className="flex-1 flex flex-col items-center -ml-12">
                  <Avatar className="h-7 w-7 ring-1 ring-white/15">
                    {activeOther?.avatar_url && <AvatarImage src={activeOther.avatar_url} />}
                    <AvatarFallback className="bg-white/10 text-white text-[10px]">
                      {initialOf(activeOther)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-[11px] text-white/60 mt-0.5 truncate max-w-[160px]">
                    {displayName(activeOther)}
                  </div>
                </div>
                <div className="w-16" />
              </div>
            </header>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
              {messages.length === 0 && (
                <div className="text-center text-white/40 text-sm pt-12">
                  Say hi to {displayName(activeOther)} 👋
                </div>
              )}
              {messages.map((m, i) => {
                const mine = m.sender_id === user.id;
                const prev = messages[i - 1];
                const next = messages[i + 1];
                const sameAsPrev = prev && prev.sender_id === m.sender_id;
                const sameAsNext = next && next.sender_id === m.sender_id;
                // iOS-style "tail" only on last in cluster
                const isTail = !sameAsNext;
                return (
                  <div
                    key={m.id}
                    className={`flex ${mine ? "justify-end" : "justify-start"} ${
                      sameAsPrev ? "mt-0.5" : "mt-2"
                    }`}
                  >
                    <div
                      className={[
                        "max-w-[78%] px-3.5 py-2 text-[15px] leading-snug space-y-2 break-words shadow-sm",
                        mine
                          ? "bg-gradient-to-b from-[#0A84FF] to-[#0066D6] text-white"
                          : "bg-[#262629] text-white",
                        // iOS bubble corners
                        "rounded-[20px]",
                        mine && isTail ? "rounded-br-[6px]" : "",
                        !mine && isTail ? "rounded-bl-[6px]" : "",
                      ].join(" ")}
                    >
                      {m.media_type === "image" && m.media_url && (
                        <img
                          src={m.media_url}
                          alt="attachment"
                          className="rounded-2xl max-h-72 w-auto object-cover"
                        />
                      )}
                      {m.media_type === "audio" && m.media_url && (
                        <audio controls src={m.media_url} className="w-60 max-w-full" />
                      )}
                      {m.content && <div className="whitespace-pre-wrap">{m.content}</div>}
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
                    className="h-16 w-16 rounded-xl object-cover ring-1 ring-white/15"
                  />
                  <button
                    onClick={() => setPendingImage(null)}
                    className="absolute -top-2 -right-2 bg-black/80 rounded-full p-1"
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

            {/* iOS-style composer */}
            <div className="border-t border-white/10 bg-black/40 backdrop-blur-2xl px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex gap-2 items-end">
              <Button
                type="button"
                onClick={pickImage}
                size="icon"
                variant="ghost"
                disabled={sending || recorder.isRecording}
                className="rounded-full text-[#0A84FF] hover:text-[#0A84FF] hover:bg-white/10 shrink-0 h-9 w-9"
                aria-label="Add photo"
              >
                <ImagePlus className="w-5 h-5" />
              </Button>

              <div className="flex-1 flex items-end bg-[#1C1C1E] rounded-[20px] border border-white/10 px-3 py-1.5 min-h-[36px]">
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={1}
                  placeholder={recorder.isRecording ? "Recording..." : "iMessage"}
                  disabled={recorder.isRecording}
                  className="resize-none bg-transparent border-0 text-white placeholder:text-white/40 p-0 min-h-[24px] focus-visible:ring-0 text-[15px]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
              </div>

              {text.trim() || pendingImage ? (
                <Button
                  onClick={() => sendMessage()}
                  disabled={sending}
                  size="icon"
                  className="rounded-full bg-[#0A84FF] hover:bg-[#0A84FF]/90 text-white shrink-0 h-9 w-9"
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
                  className={`rounded-full shrink-0 select-none touch-none h-9 w-9 ${
                    recorder.isRecording
                      ? "bg-red-500 text-white scale-110"
                      : "bg-[#1C1C1E] text-[#0A84FF] border border-white/10"
                  } transition-transform`}
                  aria-label="Hold to record voice note"
                >
                  <Mic className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        ) : (
          /* ============== LIST VIEW ============== */
          <div>
            {/* Large iOS-style title header */}
            <header className="px-4 pt-[max(1.25rem,env(safe-area-inset-top))]">
              <div className="flex items-center justify-between py-2">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-0.5 text-[#0A84FF] active:opacity-60 -ml-1 px-1"
                  aria-label="Back"
                >
                  <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
                  <span className="text-[15px] font-medium">Back</span>
                </button>
                <button
                  onClick={() => {
                    impact("light");
                    setComposerOpen(true);
                    setSearchQuery("");
                  }}
                  className="text-[#0A84FF] active:opacity-60 p-1"
                  aria-label="New message"
                >
                  <PenSquare className="w-[22px] h-[22px]" />
                </button>
              </div>
              <h1 className="font-bold text-[34px] tracking-tight leading-tight pb-2">Messages</h1>

              {/* Search bar */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  value={listFilter}
                  onChange={(e) => setListFilter(e.target.value)}
                  placeholder="Search"
                  className="bg-white/[0.08] border-0 rounded-[10px] pl-9 h-9 text-[15px] text-white placeholder:text-white/40 focus-visible:ring-0"
                />
              </div>
            </header>

            {/* Conversations list */}
            {filteredConvs.length === 0 ? (
              <div className="px-4 mt-16 text-center">
                <div className="w-16 h-16 rounded-full bg-white/[0.06] mx-auto flex items-center justify-center mb-4">
                  <MessageSquare className="w-7 h-7 text-white/40" />
                </div>
                <div className="text-white text-lg font-semibold mb-1">No Messages</div>
                <div className="text-[13px] text-white/50 mb-6 max-w-[260px] mx-auto">
                  Tap the compose button to start a conversation with another believer.
                </div>
                <Button
                  onClick={() => {
                    impact("light");
                    setComposerOpen(true);
                    setSearchQuery("");
                  }}
                  className="rounded-full bg-[#0A84FF] hover:bg-[#0A84FF]/90 text-white"
                >
                  <PenSquare className="w-4 h-4 mr-2" /> New Message
                </Button>
              </div>
            ) : (
              <ul className="px-2">
                {filteredConvs.map((c) => {
                  const other = otherPartyOf(c);
                  return (
                    <li key={c.id}>
                      <button
                        onClick={() => {
                          impact("light");
                          setActiveId(c.id);
                        }}
                        className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl active:bg-white/[0.06] transition-colors text-left"
                      >
                        <Avatar className="h-12 w-12 ring-1 ring-white/10 shrink-0">
                          {other?.avatar_url && <AvatarImage src={other.avatar_url} />}
                          <AvatarFallback className="bg-gradient-to-br from-white/15 to-white/5 text-white text-sm">
                            {initialOf(other)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0 border-b border-white/[0.06] pb-2.5">
                          <div className="flex items-baseline justify-between gap-2">
                            <div className="text-[15px] font-semibold truncate">
                              {displayName(other) || c.title || "Conversation"}
                            </div>
                            <div className="text-[12px] text-white/40 shrink-0">
                              {c.last_message_at &&
                                formatDistanceToNow(new Date(c.last_message_at), {
                                  addSuffix: false,
                                })}
                            </div>
                          </div>
                          <div className="text-[13px] text-white/55 truncate mt-0.5">
                            {other?.username ? `@${other.username}` : "Tap to open"}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/25 shrink-0" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        {/* ============== NEW MESSAGE COMPOSER (overlay) ============== */}
        {composerOpen && (
          <div className="fixed inset-0 z-50 bg-[#0a0a0c]/95 backdrop-blur-2xl animate-fade-in flex flex-col">
            <header className="px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-2 border-b border-white/10">
              <div className="flex items-center justify-between py-1">
                <button
                  onClick={() => setComposerOpen(false)}
                  className="text-[#0A84FF] active:opacity-60 text-[15px] font-medium px-1"
                >
                  Cancel
                </button>
                <div className="text-[15px] font-semibold">New Message</div>
                <div className="w-14" />
              </div>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="To: name or @username"
                  className="bg-white/[0.08] border-0 rounded-[10px] pl-9 h-10 text-[15px] text-white placeholder:text-white/40 focus-visible:ring-0"
                />
              </div>
            </header>

            <div className="flex-1 overflow-y-auto">
              {searching && (
                <div className="text-center text-white/40 text-sm py-6">Searching…</div>
              )}
              {!searching && searchResults.length === 0 && (
                <div className="text-center text-white/40 text-sm py-12">
                  {searchQuery ? "No people found" : "Start typing to find someone"}
                </div>
              )}
              <ul className="px-2">
                {searchResults.map((p) => (
                  <li key={p.user_id}>
                    <button
                      onClick={async () => {
                        impact("light");
                        const conv = await ensureConversationWith(p.user_id);
                        if (conv) {
                          setActiveId(conv.id);
                          setComposerOpen(false);
                        }
                      }}
                      className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl active:bg-white/[0.06] text-left"
                    >
                      <Avatar className="h-11 w-11 ring-1 ring-white/10">
                        {p.avatar_url && <AvatarImage src={p.avatar_url} />}
                        <AvatarFallback className="bg-white/10 text-white text-sm">
                          {initialOf(p)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 border-b border-white/[0.06] pb-2.5">
                        <div className="text-[15px] font-semibold truncate">{displayName(p)}</div>
                        {p.username && (
                          <div className="text-[13px] text-white/50 truncate">@{p.username}</div>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>
      {!showChat && <PremiumNav />}
    </div>
  );
}

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
import { es as esLocale } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { useHaptics } from "@/hooks/useNativeFeatures";
import { useCamera } from "@/hooks/useCamera";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { useSafeBackNavigation } from "@/hooks/useSafeBackNavigation";
import { useLanguage } from "@/contexts/LanguageContext";

type MediaPayload = { url: string; type: "image" | "audio"; durationMs?: number };
type Profile = { user_id: string; name: string | null; username: string | null; avatar_url: string | null };

const formatRecTime = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

const initialOf = (p?: Profile | null) =>
  ((p?.name || p?.username || "?").trim()[0] || "?").toUpperCase();
const displayName = (p?: Profile | null, fallback = "Friend") => p?.name || p?.username || fallback;

export default function MessengerPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const handleBack = useSafeBackNavigation("/community");
  const { impact, notification } = useHaptics();
  const camera = useCamera();
  const recorder = useVoiceRecorder();
  const { language } = useLanguage();
  const t = (en: string, es: string) => (language === "es" ? es : en);
  const friend = t("Friend", "Amigo");

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
          setMessages((m) => (m.some((x) => x.id === payload.new.id) ? m : [...m, payload.new]));
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
      toast({ title: t("Could not start conversation", "No se pudo iniciar la conversación"), description: error.message, variant: "destructive" });
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
      toast({ title: t("Upload failed", "Error al subir"), description: error.message, variant: "destructive" });
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

    const { data: inserted, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: activeId,
        sender_id: user.id,
        content: text.trim() || null,
        media_url: media?.url ?? null,
        media_type: media?.type ?? null,
        media_duration_ms: media?.durationMs ?? null,
      })
      .select()
      .single();

    if (error) {
      notification("error");
      console.error("send message error", error);
      toast({ title: t("Could not send", "No se pudo enviar"), description: error.message, variant: "destructive" });
    } else {
      // Optimistically append (realtime will dedupe by id)
      if (inserted) {
        setMessages((m) => (m.some((x) => x.id === inserted.id) ? m : [...m, inserted]));
      }
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
      toast({ title: t("Hold to record", "Mantén presionado para grabar"), description: t("Press and hold the mic.", "Presiona y mantén el micrófono.") });
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
          <h1 className="font-playfair text-3xl mb-2">{t("Messages", "Mensajes")}</h1>
          <p className="text-white/60 text-sm">{t("Sign in to message other believers.", "Inicia sesión para enviar mensajes a otros creyentes.")}</p>
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
                  aria-label={t("Back to messages", "Volver a mensajes")}
                >
                  <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
                  <span className="text-[15px] font-medium">{t("Messages", "Mensajes")}</span>
                </button>
                <div className="flex-1 flex flex-col items-center -ml-12">
                  <Avatar className="h-7 w-7 ring-1 ring-white/15">
                    {activeOther?.avatar_url && <AvatarImage src={activeOther.avatar_url} />}
                    <AvatarFallback className="bg-white/10 text-white text-[10px]">
                      {initialOf(activeOther)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-[11px] text-white/60 mt-0.5 truncate max-w-[160px]">
                    {displayName(activeOther, friend)}
                  </div>
                </div>
                <div className="w-16" />
              </div>
            </header>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
              {messages.length === 0 && (
                <div className="text-center text-white/40 text-sm pt-12">
                  {t(`Say hi to ${displayName(activeOther, friend)} 👋`, `Saluda a ${displayName(activeOther, friend)} 👋`)}
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
                    aria-label={t("Remove image", "Quitar imagen")}
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
                <div className="text-xs text-white/60">{t("Photo ready to send", "Foto lista para enviar")}</div>
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
                      <Trash2 className="w-3 h-3" /> {t("Release to cancel", "Suelta para cancelar")}
                    </>
                  ) : (
                    <>{t("↑ Slide up to cancel", "↑ Desliza hacia arriba para cancelar")}</>
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
                aria-label={t("Add photo", "Añadir foto")}
              >
                <ImagePlus className="w-5 h-5" />
              </Button>

              <div className="flex-1 flex items-end bg-[#1C1C1E] rounded-[20px] border border-white/10 px-3 py-1.5 min-h-[36px]">
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={1}
                  placeholder={recorder.isRecording ? t("Recording...", "Grabando...") : t("iMessage", "Mensaje")}
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
                  aria-label={t("Send", "Enviar")}
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
                  aria-label={t("Hold to record voice note", "Mantén para grabar nota de voz")}
                >
                  <Mic className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        ) : (
          /* ============== LIST VIEW (iMessage-style) ============== */
          <div className="relative">
            {/* Ambient glow backdrop */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-[340px] opacity-70"
              style={{
                background:
                  "radial-gradient(120% 80% at 50% -10%, hsl(var(--primary)/0.18), transparent 60%), radial-gradient(80% 60% at 90% 10%, rgba(10,132,255,0.14), transparent 70%)",
              }}
            />

            {/* Sticky compact header */}
            <header className="sticky top-0 z-30 bg-black/55 backdrop-blur-2xl backdrop-saturate-150 border-b border-white/[0.08]">
              <div className="px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 flex items-center gap-2">
                <button
                  onClick={handleBack}
                  aria-label={t("Back", "Atrás")}
                  className="h-9 w-9 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/85 active:scale-95 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" strokeWidth={2.4} />
                </button>
                <h1 className="flex-1 text-center text-[17px] font-semibold tracking-tight">
                  {t("Messages", "Mensajes")}
                </h1>
                <button
                  onClick={() => {
                    impact("light");
                    setComposerOpen(true);
                    setSearchQuery("");
                  }}
                  aria-label={t("New message", "Nuevo mensaje")}
                  className="h-9 w-9 rounded-full bg-gradient-to-br from-[#0A84FF] to-[#0066D6] text-white flex items-center justify-center shadow-[0_6px_18px_-6px_rgba(10,132,255,0.7)] active:scale-95 transition-all"
                >
                  <PenSquare className="w-[18px] h-[18px]" strokeWidth={2.2} />
                </button>
              </div>

              {/* Search */}
              <div className="px-3 pb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/45" />
                  <Input
                    value={listFilter}
                    onChange={(e) => setListFilter(e.target.value)}
                    placeholder={t("Search messages", "Buscar mensajes")}
                    className="bg-white/[0.07] border border-white/[0.08] rounded-full pl-9 h-9 text-[14px] text-white placeholder:text-white/40 focus-visible:ring-1 focus-visible:ring-primary/40"
                  />
                </div>
              </div>
            </header>

            {/* Conversations */}
            {filteredConvs.length === 0 ? (
              <div className="relative px-4 mt-20 text-center">
                <div className="relative mx-auto mb-5 w-20 h-20">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#0A84FF]/30 to-purple-500/20 blur-2xl" />
                  <div className="relative w-20 h-20 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-xl flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-white/70" />
                  </div>
                </div>
                <div className="text-white text-[17px] font-semibold mb-1.5">{t("No Messages Yet", "Aún no hay mensajes")}</div>
                <div className="text-[13px] text-white/55 mb-6 max-w-[280px] mx-auto leading-relaxed">
                  {t("Start a private conversation with another believer in the community.", "Inicia una conversación privada con otro creyente de la comunidad.")}
                </div>
                <Button
                  onClick={() => {
                    impact("light");
                    setComposerOpen(true);
                    setSearchQuery("");
                  }}
                  className="rounded-full bg-gradient-to-r from-[#0A84FF] to-[#0066D6] hover:from-[#0A84FF] hover:to-[#0066D6] text-white h-10 px-5 shadow-[0_8px_24px_-8px_rgba(10,132,255,0.7)]"
                >
                  <PenSquare className="w-4 h-4 mr-2" /> {t("New Message", "Nuevo mensaje")}
                </Button>
              </div>
            ) : (
              <ul className="relative px-3 pt-3 space-y-1.5">
                {filteredConvs.map((c) => {
                  const other = otherPartyOf(c);
                  return (
                    <li key={c.id}>
                      <button
                        onClick={() => {
                          impact("light");
                          setActiveId(c.id);
                        }}
                        className="group w-full flex items-center gap-3 p-2.5 rounded-2xl bg-white/[0.035] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] active:scale-[0.99] transition-all text-left backdrop-blur-xl"
                      >
                        <Avatar className="h-12 w-12 ring-2 ring-white/10 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.5)] shrink-0">
                          {other?.avatar_url && <AvatarImage src={other.avatar_url} />}
                          <AvatarFallback className="bg-gradient-to-br from-[#0A84FF]/40 to-purple-500/30 text-white text-sm font-semibold">
                            {initialOf(other)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <div className="text-[15px] font-semibold text-white truncate">
                              {displayName(other, friend) || c.title || t("Conversation", "Conversación")}
                            </div>
                            <div className="text-[11px] text-white/45 shrink-0 font-medium">
                              {c.last_message_at &&
                                formatDistanceToNow(new Date(c.last_message_at), {
                                  addSuffix: false,
                                  locale: language === "es" ? esLocale : undefined,
                                })}
                            </div>
                          </div>
                          <div className="text-[13px] text-white/55 truncate mt-0.5">
                            {other?.username ? `@${other.username}` : t("Tap to open", "Toca para abrir")}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/30 shrink-0 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
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
                  {t("Cancel", "Cancelar")}
                </button>
                <div className="text-[15px] font-semibold">{t("New Message", "Nuevo mensaje")}</div>
                <div className="w-14" />
              </div>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("To: name or @username", "Para: nombre o @usuario")}
                  className="bg-white/[0.08] border-0 rounded-[10px] pl-9 h-10 text-[15px] text-white placeholder:text-white/40 focus-visible:ring-0"
                />
              </div>
            </header>

            <div className="flex-1 overflow-y-auto">
              {searching && (
                <div className="text-center text-white/40 text-sm py-6">{t("Searching…", "Buscando…")}</div>
              )}
              {!searching && searchResults.length === 0 && (
                <div className="text-center text-white/40 text-sm py-12">
                  {searchQuery ? t("No people found", "No se encontraron personas") : t("Start typing to find someone", "Empieza a escribir para encontrar a alguien")}
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
                        <div className="text-[15px] font-semibold truncate">{displayName(p, friend)}</div>
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

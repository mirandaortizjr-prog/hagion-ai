import { useLocation, useNavigate } from "react-router-dom";
import { Home, Globe, Users, UserPlus, Plus, Send, ImagePlus, Video, X, Loader2, Brain, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NavItem {
  id: string;
  labelEn: string;
  labelEs: string;
  icon: typeof Home;
  path?: string;
  action?: "post";
}

export const PremiumNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const { toast } = useToast();

  const inCommunity = location.pathname.startsWith("/community") || location.pathname === "/friends";

  const items: NavItem[] = inCommunity
    ? [
        { id: "hagion", labelEn: "Hagion AI", labelEs: "Hagion AI", icon: Brain, path: "/main-menu" },
        { id: "community", labelEn: "Community", labelEs: "Comunidad", icon: Globe, path: "/community" },
        { id: "post", labelEn: "Create", labelEs: "Crear", icon: Plus, action: "post" },
        { id: "groups", labelEn: "Groups", labelEs: "Grupos", icon: Users, path: "/community/groups" },
        { id: "friends", labelEn: "Friends", labelEs: "Amigos", icon: UserPlus, path: "/friends" },
      ]
    : [
        { id: "hagion", labelEn: "Hagion AI", labelEs: "Hagion AI", icon: Brain, path: "/main-menu" },
        { id: "community", labelEn: "Community", labelEs: "Comunidad", icon: Globe, path: "/community" },
        { id: "discipleship", labelEn: "Discipleship", labelEs: "Discipulado", icon: Home, path: "/home" },
        { id: "discernment", labelEn: "Discernment", labelEs: "Discernimiento", icon: Shield, path: "/discernment" },
      ];

  const [postOpen, setPostOpen] = useState(false);
  const [composerType, setComposerType] = useState<"post" | "prayer" | "testimony">("post");
  const [composer, setComposer] = useState("");
  const [posting, setPosting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaKind, setMediaKind] = useState<"image" | "video" | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, [postOpen]);

  const pickMedia = (kind: "image" | "video") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = kind === "image" ? "image/*" : "video/*";
    input.onchange = () => {
      const f = input.files?.[0];
      if (!f) return;
      const maxMb = kind === "image" ? 10 : 50;
      if (f.size > maxMb * 1024 * 1024) {
        toast({ title: `File too large`, description: `Max ${maxMb}MB`, variant: "destructive" });
        return;
      }
      setMediaFile(f);
      setMediaKind(kind);
      setMediaPreview(URL.createObjectURL(f));
    };
    input.click();
  };

  const clearMedia = () => {
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaFile(null);
    setMediaPreview(null);
    setMediaKind(null);
  };

  const handlePost = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!composer.trim() && !mediaFile) return;
    setPosting(true);

    let media_url: string | null = null;
    let media_type: "image" | "video" | null = null;

    if (mediaFile && mediaKind) {
      setUploading(true);
      const ext = mediaFile.name.split(".").pop() || (mediaKind === "image" ? "jpg" : "mp4");
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("community-media")
        .upload(path, mediaFile, { contentType: mediaFile.type, upsert: false });
      setUploading(false);
      if (upErr) {
        setPosting(false);
        toast({ title: "Upload failed", description: upErr.message, variant: "destructive" });
        return;
      }
      const { data: pub } = supabase.storage.from("community-media").getPublicUrl(path);
      media_url = pub.publicUrl;
      media_type = mediaKind;
    }

    const { error } = await supabase.from("posts").insert({
      user_id: user.id,
      author_name: user.user_metadata?.name || user.email?.split("@")[0] || "Believer",
      post_type: composerType,
      content: composer.trim(),
      media_url,
      media_type,
    });
    setPosting(false);
    if (error) {
      toast({ title: "Could not post", description: error.message, variant: "destructive" });
    } else {
      setComposer("");
      clearMedia();
      setPostOpen(false);
      toast({ title: "Shared with the community" });
      window.dispatchEvent(new CustomEvent("community:refresh"));
    }
  };

  return (
    <>
      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50",
          "border-t border-white/10",
          "bg-black/30 backdrop-blur-2xl backdrop-saturate-150",
          "shadow-[0_-8px_32px_-8px_rgba(0,0,0,0.6)]"
        )}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute top-0 -left-1/2 h-full w-1/2 nav-shimmer"
            style={{
              background:
                "linear-gradient(110deg, transparent 0%, transparent 30%, rgba(255,255,255,0.10) 45%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0.10) 55%, transparent 70%, transparent 100%)",
            }}
          />
        </div>

        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        <ul className="relative flex items-stretch justify-around px-2 sm:px-4 py-2 max-w-2xl mx-auto">
          {items.map((item) => {
            const Icon = item.icon;
            const itemBasePath = item.path?.split("?")[0];
            const active = itemBasePath ? location.pathname === itemBasePath : false;
            const label = language === "es" ? item.labelEs : item.labelEn;
            const isCreate = item.action === "post";
            return (
              <li key={item.id} className="flex-1">
                <button
                  type="button"
                  onClick={() => {
                    if (item.action === "post") setPostOpen(true);
                    else if (item.path) navigate(item.path);
                  }}
                  aria-current={active ? "page" : undefined}
                  aria-label={label}
                  className={cn(
                    "group relative w-full flex flex-col items-center justify-center gap-1",
                    "py-1.5 px-1 rounded-2xl",
                    "transition-all duration-300 ease-out active:scale-95",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
                    active ? "text-white" : "text-white/55 hover:text-white/90"
                  )}
                >
                  <span
                    className={cn(
                      "relative flex items-center justify-center rounded-full transition-all duration-300",
                      isCreate
                        ? "w-12 h-12 -mt-5 bg-gradient-to-br from-white via-white/95 to-white/80 text-black ring-2 ring-white/60 shadow-[0_10px_30px_-6px_rgba(255,255,255,0.55),inset_0_1px_0_rgba(255,255,255,0.9)]"
                        : active
                        ? "w-9 h-9 bg-gradient-to-br from-white/30 via-white/10 to-white/5 ring-1 ring-white/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_6px_20px_-4px_rgba(255,255,255,0.25)]"
                        : "w-9 h-9 bg-white/[0.04] ring-1 ring-white/10 group-hover:bg-white/10"
                    )}
                  >
                    <Icon
                      strokeWidth={isCreate ? 2.6 : active ? 2.4 : 1.9}
                      className={cn(
                        "transition-all duration-300",
                        isCreate ? "w-[22px] h-[22px]" : "w-[18px] h-[18px]",
                        !isCreate && active && "drop-shadow-[0_0_6px_rgba(255,255,255,0.55)] scale-110"
                      )}
                    />
                  </span>
                  {!isCreate && (
                    <span
                      className={cn(
                        "text-[10px] sm:text-[11px] leading-none tracking-[0.04em] font-playfair transition-all",
                        active ? "font-semibold" : "font-medium"
                      )}
                    >
                      {label}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div
        aria-hidden
        className="w-full"
        style={{ height: "calc(64px + env(safe-area-inset-bottom))" }}
      />

      <Sheet open={postOpen} onOpenChange={setPostOpen}>
        <SheetContent
          side="bottom"
          className="bg-black/80 backdrop-blur-2xl border-t border-white/10 text-white rounded-t-3xl"
        >
          <SheetHeader>
            <SheetTitle className="text-white font-playfair text-xl text-center">
              {language === "es" ? "Compartir con la comunidad" : "Share with the community"}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] p-4">
            <div className="flex gap-2 mb-3">
              {(["post", "prayer", "testimony"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setComposerType(t)}
                  className={cn(
                    "px-3 py-1 rounded-full text-[11px] tracking-[0.16em] uppercase transition",
                    composerType === t
                      ? "bg-white text-black shadow-[0_6px_20px_-4px_rgba(255,255,255,0.4)]"
                      : "bg-white/[0.06] border border-white/15 text-white/70 hover:text-white"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <Textarea
              value={composer}
              onChange={(e) => setComposer(e.target.value)}
              placeholder={
                composerType === "prayer"
                  ? "Share a prayer request..."
                  : composerType === "testimony"
                  ? "Share what God has done..."
                  : "Share with the community..."
              }
              rows={4}
              className="resize-none bg-black/30 border-white/10 text-white placeholder:text-white/40 rounded-xl"
            />

            {mediaPreview && (
              <div className="relative mt-3 rounded-xl overflow-hidden border border-white/10 bg-black/40">
                {mediaKind === "image" ? (
                  <img src={mediaPreview} alt="preview" className="w-full max-h-64 object-cover" />
                ) : (
                  <video src={mediaPreview} controls className="w-full max-h-64" />
                )}
                <button
                  type="button"
                  onClick={clearMedia}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md ring-1 ring-white/20 flex items-center justify-center text-white hover:bg-black/80"
                  aria-label="Remove media"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between mt-3 gap-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => pickMedia("image")}
                  disabled={posting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/15 text-white/80 hover:text-white hover:bg-white/10 transition text-xs"
                >
                  <ImagePlus className="w-4 h-4" />
                  {language === "es" ? "Foto" : "Photo"}
                </button>
                <button
                  type="button"
                  onClick={() => pickMedia("video")}
                  disabled={posting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/15 text-white/80 hover:text-white hover:bg-white/10 transition text-xs"
                >
                  <Video className="w-4 h-4" />
                  {language === "es" ? "Video" : "Video"}
                </button>
              </div>
              <Button
                onClick={handlePost}
                disabled={posting || (!composer.trim() && !mediaFile)}
                className="rounded-full bg-gradient-to-r from-white/95 to-white/80 text-black hover:from-white hover:to-white/90 shadow-[0_6px_20px_-4px_rgba(255,255,255,0.4)]"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-1" />
                )}
                {posting ? (uploading ? "Uploading..." : "Sharing...") : "Share"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default PremiumNav;

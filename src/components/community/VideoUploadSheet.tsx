import { useEffect, useRef, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Film, UploadCloud, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type UploadKind = "reel" | "teaching";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: UploadKind;
  lang?: "en" | "es";
  onUploaded?: () => void;
}

const COPY = {
  en: {
    reelTitle: "Share a Reel",
    teachingTitle: "Upload a Teaching",
    reelHint: "Vertical video. Up to 30 seconds, 100 MB.",
    teachingHint: "Long-form teaching. Up to 15 minutes, 500 MB.",
    title: "Title",
    description: "Description (optional)",
    pick: "Choose video",
    change: "Change video",
    upload: "Publish",
    uploading: "Uploading…",
    cancel: "Cancel",
    titleRequired: "Please enter a title",
    pickRequired: "Please choose a video file",
    signin: "Please sign in to upload",
    success: "Published",
    failure: "Upload failed",
    tooLargeReel: "Reel must be under 100 MB",
    tooLargeTeaching: "Teaching must be under 500 MB",
    tooLongReel: "Reel must be 30 seconds or less",
    tooLongTeaching: "Teaching must be 15 minutes or less",
    checking: "Checking video…",
  },
  es: {
    reelTitle: "Comparte un Reel",
    teachingTitle: "Sube una Enseñanza",
    reelHint: "Video vertical. Hasta 30 segundos, 100 MB.",
    teachingHint: "Enseñanza larga. Hasta 15 minutos, 500 MB.",
    title: "Título",
    description: "Descripción (opcional)",
    pick: "Elegir video",
    change: "Cambiar video",
    upload: "Publicar",
    uploading: "Subiendo…",
    cancel: "Cancelar",
    titleRequired: "Por favor ingresa un título",
    pickRequired: "Por favor elige un archivo de video",
    signin: "Inicia sesión para subir",
    success: "Publicado",
    failure: "Error al subir",
    tooLargeReel: "El Reel debe ser menor a 100 MB",
    tooLargeTeaching: "La Enseñanza debe ser menor a 500 MB",
    tooLongReel: "El Reel debe durar 30 segundos o menos",
    tooLongTeaching: "La Enseñanza debe durar 15 minutos o menos",
    checking: "Verificando video…",
  },
};

const REEL_MAX = 100 * 1024 * 1024;
const TEACHING_MAX = 500 * 1024 * 1024;
const REEL_MAX_SECONDS = 30;
const TEACHING_MAX_SECONDS = 15 * 60;

const probeDuration = (file: File): Promise<number> =>
  new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.src = url;
    const cleanup = () => URL.revokeObjectURL(url);
    video.onloadedmetadata = () => {
      const d = video.duration;
      cleanup();
      resolve(isFinite(d) ? d : 0);
    };
    video.onerror = () => {
      cleanup();
      resolve(0);
    };
  });

export default function VideoUploadSheet({ open, onOpenChange, kind, lang = "en", onUploaded }: Props) {
  const t = COPY[lang];
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open) {
      setFile(null);
      setTitle("");
      setDescription("");
      setProgress(0);
      setUploading(false);
    }
  }, [open]);

  const isReel = kind === "reel";
  const maxBytes = isReel ? REEL_MAX : TEACHING_MAX;

  const handlePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > maxBytes) {
      toast({ title: isReel ? t.tooLargeReel : t.tooLargeTeaching, variant: "destructive" });
      return;
    }
    toast({ title: t.checking });
    const duration = await probeDuration(f);
    const maxSec = isReel ? REEL_MAX_SECONDS : TEACHING_MAX_SECONDS;
    if (duration > 0 && duration > maxSec + 0.5) {
      toast({
        title: isReel ? t.tooLongReel : t.tooLongTeaching,
        description: `${Math.round(duration)}s`,
        variant: "destructive",
      });
      return;
    }
    setFile(f);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({ title: t.titleRequired, variant: "destructive" });
      return;
    }
    if (!file) {
      toast({ title: t.pickRequired, variant: "destructive" });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: t.signin, variant: "destructive" });
      return;
    }

    setUploading(true);
    setProgress(5);

    try {
      const bucket = isReel ? "reels-videos" : "teachings-videos";
      const ext = (file.name.split(".").pop() || "mp4").toLowerCase();
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || "video/mp4",
      });
      if (upErr) throw upErr;
      setProgress(75);

      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
      const videoUrl = pub.publicUrl;

      // Pull author display name from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, username")
        .eq("user_id", user.id)
        .maybeSingle();
      const authorName =
        profile?.name || profile?.username || user.email?.split("@")[0] || "anonymous";

      if (isReel) {
        const { error: insErr } = await supabase.from("reels").insert({
          user_id: user.id,
          author_name: authorName,
          title: title.trim(),
          description: description.trim() || null,
          video_url: videoUrl,
        });
        if (insErr) throw insErr;
      } else {
        const { error: insErr } = await supabase.from("teachings").insert({
          user_id: user.id,
          author_name: authorName,
          title: title.trim(),
          description: description.trim() || null,
          video_url: videoUrl,
        });
        if (insErr) throw insErr;
      }

      setProgress(100);
      toast({ title: t.success });
      onOpenChange(false);
      onUploaded?.();
    } catch (err: any) {
      console.error("Upload failed:", err);
      toast({ title: t.failure, description: err?.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="bg-zinc-950 border-t border-white/10 text-white rounded-t-3xl max-h-[90vh] overflow-y-auto"
      >
        <SheetHeader className="text-left">
          <SheetTitle className="text-white font-playfair text-xl">
            {isReel ? t.reelTitle : t.teachingTitle}
          </SheetTitle>
          <p className="text-xs text-white/55">{isReel ? t.reelHint : t.teachingHint}</p>
        </SheetHeader>

        <div className="space-y-4 py-5">
          {/* File picker */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              hidden
              onChange={handlePick}
              disabled={uploading}
            />
            {!file ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full h-36 rounded-2xl border-2 border-dashed border-white/20 hover:border-white/40 bg-white/5 flex flex-col items-center justify-center gap-2 transition active:scale-[0.99]"
              >
                <UploadCloud className="w-7 h-7 text-white/70" />
                <span className="text-sm text-white/80">{t.pick}</span>
              </button>
            ) : (
              <div className="rounded-2xl bg-white/5 border border-white/15 p-3 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Film className="w-5 h-5 text-white/80" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{file.name}</div>
                  <div className="text-[11px] text-white/50">
                    {(file.size / (1024 * 1024)).toFixed(1)} MB
                  </div>
                </div>
                <button
                  onClick={() => setFile(null)}
                  disabled={uploading}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center"
                  aria-label="Remove"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="vu-title" className="text-white/80 text-xs uppercase tracking-wider">
              {t.title}
            </Label>
            <Input
              id="vu-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              disabled={uploading}
              className="bg-white/5 border-white/15 text-white placeholder:text-white/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vu-desc" className="text-white/80 text-xs uppercase tracking-wider">
              {t.description}
            </Label>
            <Textarea
              id="vu-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
              disabled={uploading}
              className="bg-white/5 border-white/15 text-white placeholder:text-white/30 resize-none"
            />
          </div>

          {uploading && (
            <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-white to-white/80 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={uploading}
              className="flex-1 text-white/80 hover:bg-white/10 hover:text-white"
            >
              {t.cancel}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={uploading}
              className="flex-1 bg-white text-black hover:bg-white/90"
            >
              {uploading ? t.uploading : t.upload}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

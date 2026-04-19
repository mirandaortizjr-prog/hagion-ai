import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CommunityHeader } from "@/components/community/CommunityHeader";
import { PremiumNav } from "@/components/PremiumNav";
import { Play, Plus, Loader2, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function ReelsFeedPage() {
  const [reels, setReels] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const load = () =>
    supabase
      .from("reels")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setReels(data || []));

  useEffect(() => {
    load();
  }, []);

  const pickVideo = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/*";
    input.onchange = () => {
      const f = input.files?.[0];
      if (!f) return;
      if (f.size > 100 * 1024 * 1024) {
        toast({ title: "File too large", description: "Max 100MB", variant: "destructive" });
        return;
      }
      setFile(f);
      setPreview(URL.createObjectURL(f));
    };
    input.click();
  };

  const submit = async () => {
    if (!file || !title.trim()) {
      toast({ title: "Title and video required", variant: "destructive" });
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setSubmitting(true);
    const ext = file.name.split(".").pop() || "mp4";
    const path = `${user.id}/reel-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("community-media")
      .upload(path, file, { contentType: file.type });
    if (upErr) {
      setSubmitting(false);
      toast({ title: "Upload failed", description: upErr.message, variant: "destructive" });
      return;
    }
    const { data: pub } = supabase.storage.from("community-media").getPublicUrl(path);
    const { error: insErr } = await supabase.from("reels").insert({
      user_id: user.id,
      author_name: user.user_metadata?.name || user.email?.split("@")[0] || "Believer",
      title: title.trim(),
      description: description.trim() || null,
      video_url: pub.publicUrl,
    });
    setSubmitting(false);
    if (insErr) {
      toast({ title: "Could not publish", description: insErr.message, variant: "destructive" });
    } else {
      toast({ title: "Reel published" });
      setOpen(false);
      setTitle("");
      setDescription("");
      setFile(null);
      setPreview(null);
      load();
    }
  };

  return (
    <div className="min-h-screen text-white">
      <main className="px-5 sm:px-8 pb-32 max-w-3xl mx-auto">
        <CommunityHeader title="Reels" subtitle="Short messages of faith and encouragement." />

        <div className="flex justify-end mb-4">
          <Button
            onClick={() => setOpen(true)}
            className="rounded-full bg-gradient-to-r from-white/95 to-white/80 text-black hover:from-white hover:to-white/90 shadow-[0_6px_20px_-4px_rgba(255,255,255,0.4)]"
          >
            <Plus className="w-4 h-4 mr-1" />
            Upload Reel
          </Button>
        </div>

        {reels.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[9/16] rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] flex items-center justify-center"
              >
                <Play className="w-8 h-8 text-white/40" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {reels.map((r) => (
              <button
                key={r.id}
                onClick={() => window.open(r.video_url, "_blank")}
                className="relative aspect-[9/16] rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] group"
              >
                {r.thumbnail_url ? (
                  <img src={r.thumbnail_url} alt={r.title} className="w-full h-full object-cover" />
                ) : (
                  <video src={r.video_url} className="w-full h-full object-cover" muted playsInline />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md ring-1 ring-white/40 flex items-center justify-center group-hover:scale-110 transition">
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-2 left-2 right-2 text-left">
                  <div className="text-xs text-white font-semibold line-clamp-2">{r.title}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-black/85 backdrop-blur-2xl border border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="font-playfair">Upload a Reel</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="bg-black/30 border-white/10 text-white placeholder:text-white/40"
            />
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              rows={3}
              className="bg-black/30 border-white/10 text-white placeholder:text-white/40 resize-none"
            />
            {preview ? (
              <div className="relative rounded-xl overflow-hidden border border-white/10">
                <video src={preview} controls className="w-full max-h-64" />
                <button
                  type="button"
                  onClick={() => {
                    URL.revokeObjectURL(preview);
                    setPreview(null);
                    setFile(null);
                  }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 ring-1 ring-white/20 flex items-center justify-center"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={pickVideo}
                className="w-full py-8 rounded-xl border border-dashed border-white/20 bg-white/[0.04] text-white/70 hover:text-white hover:bg-white/[0.07] transition flex flex-col items-center gap-2"
              >
                <Plus className="w-6 h-6" />
                <span className="text-xs tracking-[0.18em] uppercase">Choose video</span>
              </button>
            )}
            <Button
              onClick={submit}
              disabled={submitting || !file || !title.trim()}
              className="w-full rounded-full bg-gradient-to-r from-white/95 to-white/80 text-black hover:from-white hover:to-white/90"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-1" />
              )}
              {submitting ? "Publishing..." : "Publish Reel"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <PremiumNav />
    </div>
  );
}

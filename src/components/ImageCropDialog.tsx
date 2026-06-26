import { useCallback, useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string | null;
  aspect?: number;
  cropShape?: "round" | "rect";
  title?: string;
  outputWidth?: number;
  onCropped: (file: File) => Promise<void> | void;
}

async function getCroppedBlob(src: string, area: Area, outW: number): Promise<Blob> {
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
  const scale = outW / area.width;
  const outH = Math.round(area.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, outW, outH);
  return await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), "image/jpeg", 0.92));
}

export const ImageCropDialog = ({
  open,
  onOpenChange,
  imageSrc,
  aspect = 1,
  cropShape = "round",
  title = "Adjust your photo",
  outputWidth = 800,
  onCropped,
}: Props) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const onComplete = useCallback((_: Area, pixels: Area) => setArea(pixels), []);

  const handleSave = async () => {
    if (!imageSrc || !area) return;
    setSaving(true);
    try {
      const blob = await getCroppedBlob(imageSrc, area, outputWidth);
      const file = new File([blob], `cropped-${Date.now()}.jpg`, { type: "image/jpeg" });
      await onCropped(file);
      onOpenChange(false);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-md p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5">
          <DialogTitle className="font-playfair text-lg">{title}</DialogTitle>
        </DialogHeader>
        <div className="relative w-full h-[360px] bg-black">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              cropShape={cropShape}
              showGrid={cropShape === "rect"}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onComplete}
            />
          )}
        </div>
        <div className="px-5 py-4 space-y-3">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-white/50 mb-2">Zoom</p>
            <Slider value={[zoom]} min={1} max={4} step={0.05} onValueChange={(v) => setZoom(v[0])} />
          </div>
          <p className="text-[11px] text-white/50">Drag to reposition · pinch or use slider to zoom</p>
        </div>
        <DialogFooter className="px-5 pb-5 gap-2">
          <Button variant="outline" className="border-white/15 bg-transparent text-white/80 hover:bg-white/5" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !area} className="bg-amber-300 text-black hover:bg-amber-200">
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

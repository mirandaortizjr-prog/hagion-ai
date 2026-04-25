import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera } from "lucide-react";
import { useHeroSlideshow, type HeroImage } from "@/hooks/useHeroSlideshow";
import { cn } from "@/lib/utils";

interface Props {
  fallbackSrc: string;
  className?: string;
  children?: React.ReactNode; // overlay content (greeting + verse)
}

const SLIDE_MS = 6000;

/**
 * Crossfading hero slideshow with attribution chip.
 * Falls back to provided image when no community submissions exist.
 */
export const HeroSlideshow = ({ fallbackSrc, className, children }: Props) => {
  const { images } = useHeroSlideshow();
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (images.length <= 1) return;
    timerRef.current = window.setInterval(() => {
      setIndex((cur) => {
        setPrevIndex(cur);
        return (cur + 1) % images.length;
      });
    }, SLIDE_MS);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [images.length]);

  const current: HeroImage | null = images[index] ?? null;
  const previous: HeroImage | null = prevIndex !== null ? images[prevIndex] ?? null : null;

  const displayName = (img: HeroImage) =>
    img.username ? `@${img.username}` : img.name || "anonymous";

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Fallback / base layer */}
      <img
        src={fallbackSrc}
        alt=""
        width={928}
        height={1152}
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover object-top scale-[1.08]"
      />

      {/* Previous (fading out) */}
      {previous && (
        <img
          key={`prev-${previous.id}`}
          src={previous.image_url}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center scale-[1.08] opacity-0 transition-opacity duration-[1200ms] ease-out"
        />
      )}

      {/* Current (fading in) */}
      {current && (
        <img
          key={`cur-${current.id}`}
          src={current.image_url}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center scale-[1.08] opacity-0 animate-fade-in"
          style={{ animationDuration: "1200ms", animationFillMode: "forwards" }}
          loading="eager"
        />
      )}

      {/* Gradients */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/5 to-black/85" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />

      {/* Attribution chip — tiny, refined, top-right */}
      {current && (
        <button
          onClick={() => navigate(`/profile/${current.user_id}`)}
          className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 rounded-full border border-white/15 bg-black/30 px-2 py-[3px] backdrop-blur-md transition-all hover:bg-black/50 hover:border-white/25"
          aria-label={`Image by ${displayName(current)}`}
        >
          <Camera className="h-2.5 w-2.5 text-white/70" strokeWidth={1.8} />
          <span className="font-inter text-[9px] tracking-[0.08em] text-white/80 italic">
            {displayName(current)}
          </span>
        </button>
      )}

      {/* Overlay content (verse, greeting) */}
      {children}
    </div>
  );
};

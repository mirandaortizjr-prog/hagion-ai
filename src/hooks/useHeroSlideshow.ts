import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface HeroImage {
  id: string;
  user_id: string;
  image_url: string;
  username: string | null;
  name: string | null;
}

const ROTATION_LIMIT = 12; // active set size
const REFRESH_MS = 5 * 60 * 1000; // re-fetch pool every 5 min

export const useHeroSlideshow = () => {
  const [images, setImages] = useState<HeroImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchPool = async () => {
      // Fair FIFO: oldest-approved-and-least-displayed first
      const { data: imgs } = await supabase
        .from("hero_images")
        .select("id, user_id, image_url, display_count, approved_at")
        .eq("status", "approved")
        .order("display_count", { ascending: true })
        .order("approved_at", { ascending: true })
        .limit(ROTATION_LIMIT);

      if (!mounted) return;

      if (!imgs || imgs.length === 0) {
        setImages([]);
        setLoading(false);
        return;
      }

      const userIds = Array.from(new Set(imgs.map((i) => i.user_id)));
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, username, name")
        .in("user_id", userIds);

      const profMap = new Map(profs?.map((p) => [p.user_id, p]) ?? []);
      setImages(
        imgs.map((i) => ({
          id: i.id,
          user_id: i.user_id,
          image_url: i.image_url,
          username: profMap.get(i.user_id)?.username ?? null,
          name: profMap.get(i.user_id)?.name ?? null,
        })),
      );
      setLoading(false);
    };

    fetchPool();
    const interval = setInterval(fetchPool, REFRESH_MS);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return { images, loading };
};

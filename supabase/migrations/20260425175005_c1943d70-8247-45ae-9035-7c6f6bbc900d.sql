
-- =========================================
-- hero_images table
-- =========================================
CREATE TABLE public.hero_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | approved | rejected | displayed
  rejection_reason TEXT,
  approved_at TIMESTAMPTZ,
  first_displayed_at TIMESTAMPTZ,
  last_displayed_at TIMESTAMPTZ,
  display_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT hero_images_status_check CHECK (status IN ('pending','approved','rejected','displayed'))
);

CREATE INDEX hero_images_active_idx ON public.hero_images (status, approved_at)
  WHERE status = 'approved';
CREATE INDEX hero_images_user_idx ON public.hero_images (user_id, status);

ALTER TABLE public.hero_images ENABLE ROW LEVEL SECURITY;

-- Anyone (incl. anon) can see approved images for the slideshow
CREATE POLICY "Anyone can view approved hero images"
  ON public.hero_images FOR SELECT
  USING (status = 'approved');

-- Users can see their own submissions in any status
CREATE POLICY "Users view own submissions"
  ON public.hero_images FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert ONLY if they have no active submission
-- Active = pending or approved (not rejected/displayed/retired)
CREATE POLICY "Users can submit one active hero image"
  ON public.hero_images FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.hero_images h
      WHERE h.user_id = auth.uid()
        AND h.status IN ('pending','approved')
    )
  );

-- Users can delete their own submissions
CREATE POLICY "Users delete own submissions"
  ON public.hero_images FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- updated_at trigger
CREATE TRIGGER hero_images_updated_at
  BEFORE UPDATE ON public.hero_images
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- Storage bucket for hero images
-- =========================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('hero-images', 'hero-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read
CREATE POLICY "Public can view hero images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'hero-images');

-- Authenticated users upload only to their own folder
CREATE POLICY "Users upload own hero images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'hero-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Authenticated users can delete their own files
CREATE POLICY "Users delete own hero images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'hero-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

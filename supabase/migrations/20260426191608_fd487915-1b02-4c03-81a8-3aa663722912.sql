
-- Create public buckets for video uploads
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('reels-videos', 'reels-videos', true),
  ('teachings-videos', 'teachings-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access
CREATE POLICY "Public read reels videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'reels-videos');

CREATE POLICY "Public read teachings videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'teachings-videos');

-- Authenticated users can upload to their own folder
CREATE POLICY "Users upload own reels videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'reels-videos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users upload own teachings videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'teachings-videos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users update own reels videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'reels-videos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users update own teachings videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'teachings-videos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users delete own reels videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'reels-videos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users delete own teachings videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'teachings-videos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

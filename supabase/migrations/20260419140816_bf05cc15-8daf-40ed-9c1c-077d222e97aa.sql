-- Create public storage bucket for community post media
INSERT INTO storage.buckets (id, name, public)
VALUES ('community-media', 'community-media', true)
ON CONFLICT (id) DO NOTHING;

-- Public read
CREATE POLICY "Community media is publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'community-media');

-- Authenticated users upload to their own folder
CREATE POLICY "Users upload own community media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'community-media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users update their own files
CREATE POLICY "Users update own community media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'community-media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users delete their own files
CREATE POLICY "Users delete own community media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'community-media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
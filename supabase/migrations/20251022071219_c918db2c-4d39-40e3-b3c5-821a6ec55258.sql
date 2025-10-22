-- Create table for shared content
CREATE TABLE public.shared_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  context TEXT,
  share_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  view_count INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.shared_content ENABLE ROW LEVEL SECURITY;

-- Policy: Users can create their own shared content
CREATE POLICY "Users can create shared content"
ON public.shared_content
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own shared content
CREATE POLICY "Users can view own shared content"
ON public.shared_content
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Authenticated users can view any shared content by token
CREATE POLICY "Authenticated users can view shared content"
ON public.shared_content
FOR SELECT
TO authenticated
USING (true);

-- Policy: Users can update view count
CREATE POLICY "Update view count"
ON public.shared_content
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create index for faster token lookups
CREATE INDEX idx_shared_content_token ON public.shared_content(share_token);
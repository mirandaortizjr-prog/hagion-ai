-- Create a simple conversations table to store chat history
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Public read policy (conversations are viewable by all)
CREATE POLICY "Conversations are viewable by everyone"
  ON public.conversations
  FOR SELECT
  USING (true);
-- Create table for tracking salvation acceptances
CREATE TABLE public.salvation_acceptances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  accepted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.salvation_acceptances ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (anonymous or authenticated)
CREATE POLICY "Anyone can accept salvation"
ON public.salvation_acceptances
FOR INSERT
WITH CHECK (true);

-- Allow anyone to view count
CREATE POLICY "Anyone can view acceptances"
ON public.salvation_acceptances
FOR SELECT
USING (true);

-- Create index for yearly counts
CREATE INDEX idx_salvation_acceptances_year ON public.salvation_acceptances(accepted_at);
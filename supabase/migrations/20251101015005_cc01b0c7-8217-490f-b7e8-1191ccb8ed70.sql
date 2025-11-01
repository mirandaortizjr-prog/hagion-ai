-- Create prayers table
CREATE TABLE public.prayers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  author_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create testimonies table
CREATE TABLE public.testimonies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  author_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prayers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for prayers
CREATE POLICY "Anyone can view prayers"
  ON public.prayers
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create prayers"
  ON public.prayers
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prayers"
  ON public.prayers
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prayers"
  ON public.prayers
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for testimonies
CREATE POLICY "Anyone can view testimonies"
  ON public.testimonies
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create testimonies"
  ON public.testimonies
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own testimonies"
  ON public.testimonies
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own testimonies"
  ON public.testimonies
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_prayers_updated_at
  BEFORE UPDATE ON public.prayers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_testimonies_updated_at
  BEFORE UPDATE ON public.testimonies
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
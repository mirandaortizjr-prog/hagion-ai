-- Create daily_wisdom_stories table
CREATE TABLE public.daily_wisdom_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  theme TEXT NOT NULL,
  moral_takeaway TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_story_views table to track which stories users have seen
CREATE TABLE public.user_story_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  story_id UUID NOT NULL REFERENCES public.daily_wisdom_stories(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, story_id)
);

-- Create saved_stories table for user bookmarks
CREATE TABLE public.saved_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  story_id UUID NOT NULL REFERENCES public.daily_wisdom_stories(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, story_id)
);

-- Enable RLS
ALTER TABLE public.daily_wisdom_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_stories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_wisdom_stories
CREATE POLICY "Anyone can view stories"
  ON public.daily_wisdom_stories
  FOR SELECT
  USING (true);

-- RLS Policies for user_story_views
CREATE POLICY "Users can view their own story history"
  ON public.user_story_views
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own story views"
  ON public.user_story_views
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for saved_stories
CREATE POLICY "Users can view their saved stories"
  ON public.saved_stories
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save stories"
  ON public.saved_stories
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their saved stories"
  ON public.saved_stories
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_user_story_views_user_id ON public.user_story_views(user_id);
CREATE INDEX idx_saved_stories_user_id ON public.saved_stories(user_id);

CREATE TABLE public.sermon_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Sermon',
  scripture_ref TEXT,
  step_1 TEXT DEFAULT '',
  step_2 TEXT DEFAULT '',
  step_3 TEXT DEFAULT '',
  step_4 TEXT DEFAULT '',
  step_5 TEXT DEFAULT '',
  step_6 TEXT DEFAULT '',
  step_7 TEXT DEFAULT '',
  step_8 TEXT DEFAULT '',
  step_9 TEXT DEFAULT '',
  step_10 TEXT DEFAULT '',
  assembled_text TEXT,
  ai_feedback TEXT,
  ai_rewrite TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sermon_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own sermon drafts"
  ON public.sermon_drafts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users create own sermon drafts"
  ON public.sermon_drafts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own sermon drafts"
  ON public.sermon_drafts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own sermon drafts"
  ON public.sermon_drafts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_sermon_drafts_user_updated
  ON public.sermon_drafts (user_id, updated_at DESC);

CREATE TRIGGER update_sermon_drafts_updated_at
  BEFORE UPDATE ON public.sermon_drafts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

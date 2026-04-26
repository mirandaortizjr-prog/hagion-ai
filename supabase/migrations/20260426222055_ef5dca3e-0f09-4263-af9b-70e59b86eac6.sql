-- 1. Extend messages table for attachments
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS media_url text,
  ADD COLUMN IF NOT EXISTS media_type text,
  ADD COLUMN IF NOT EXISTS media_duration_ms integer;

-- Allow content to be empty when there's media
ALTER TABLE public.messages ALTER COLUMN content DROP NOT NULL;

-- 2. Private storage bucket for message attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-attachments', 'message-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: path is `<conversation_id>/<filename>`
CREATE POLICY "Members read message attachments"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'message-attachments'
  AND EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id::text = (storage.foldername(name))[1]
      AND (c.user_id = auth.uid() OR c.participant_id = auth.uid())
  )
);

CREATE POLICY "Members upload message attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'message-attachments'
  AND EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id::text = (storage.foldername(name))[1]
      AND (c.user_id = auth.uid() OR c.participant_id = auth.uid())
  )
);

CREATE POLICY "Members delete own message attachments"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'message-attachments'
  AND owner = auth.uid()
);

-- 3. Trigger: notify push function on new message
CREATE OR REPLACE FUNCTION public.notify_new_message_push()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_url text;
  v_anon text;
BEGIN
  -- Read project URL + anon key from vault if available, otherwise hardcode fallback
  v_url := 'https://psxkgfwizwpozfeygyza.supabase.co/functions/v1/send-message-push';
  v_anon := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzeGtnZndpendwb3pmZXlneXphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NTY1NzUsImV4cCI6MjA3NTUzMjU3NX0.hUzxVgBUT5t10nZKDvRr4x9Y0Ew4iavxm-ucuw7N1wE';

  PERFORM net.http_post(
    url := v_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_anon
    ),
    body := jsonb_build_object('message_id', NEW.id)
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block the insert if push fails
  RETURN NEW;
END;
$$;

-- Use pg_net extension for async HTTP
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

DROP TRIGGER IF EXISTS on_new_message_push ON public.messages;
CREATE TRIGGER on_new_message_push
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_message_push();

-- Also ensure conversation last_message_at updates (trigger may already exist)
DROP TRIGGER IF EXISTS on_message_update_conv ON public.messages;
CREATE TRIGGER on_message_update_conv
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_last_message();
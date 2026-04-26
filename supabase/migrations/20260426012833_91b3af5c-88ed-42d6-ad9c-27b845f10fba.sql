
-- Live streams table
CREATE TABLE public.live_streams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  stream_url text,
  thumbnail_url text,
  author_name text NOT NULL,
  status text NOT NULL DEFAULT 'live',
  viewer_count integer NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view live streams"
  ON public.live_streams FOR SELECT
  USING (true);

CREATE POLICY "Users create own live streams"
  ON public.live_streams FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own live streams"
  ON public.live_streams FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own live streams"
  ON public.live_streams FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_live_streams_updated_at
  BEFORE UPDATE ON public.live_streams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_live_streams_status_started ON public.live_streams (status, started_at DESC);

-- Live chat messages
CREATE TABLE public.live_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id uuid NOT NULL REFERENCES public.live_streams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  author_name text,
  author_avatar text,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.live_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view live chat"
  ON public.live_chat_messages FOR SELECT
  USING (true);

CREATE POLICY "Auth users send live chat"
  ON public.live_chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own live chat"
  ON public.live_chat_messages FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_live_chat_stream_created ON public.live_chat_messages (stream_id, created_at DESC);

-- Notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  actor_id uuid,
  actor_name text,
  actor_avatar text,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  entity_id uuid,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own notifications"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Auth users create notifications for others"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = actor_id);

CREATE INDEX idx_notifications_user_created ON public.notifications (user_id, created_at DESC);
CREATE INDEX idx_notifications_user_unread ON public.notifications (user_id, is_read) WHERE is_read = false;

-- Trigger: emit notification when a follow is created
CREATE OR REPLACE FUNCTION public.notify_on_follow()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_name text;
  v_actor_avatar text;
BEGIN
  SELECT COALESCE(name, username, 'Someone'), avatar_url
    INTO v_actor_name, v_actor_avatar
    FROM public.profiles
    WHERE user_id = NEW.follower_id
    LIMIT 1;

  INSERT INTO public.notifications
    (user_id, actor_id, actor_name, actor_avatar, type, title, body, link, entity_id)
  VALUES
    (NEW.following_id, NEW.follower_id, v_actor_name, v_actor_avatar,
     'follow', COALESCE(v_actor_name, 'Someone') || ' followed you',
     NULL, '/u/' || NEW.follower_id::text, NEW.follower_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_on_follow
  AFTER INSERT ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_follow();

-- Trigger: notify followers when a user goes live
CREATE OR REPLACE FUNCTION public.notify_on_live_start()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'live' THEN
    INSERT INTO public.notifications
      (user_id, actor_id, actor_name, type, title, body, link, entity_id)
    SELECT
      f.follower_id,
      NEW.user_id,
      NEW.author_name,
      'live',
      NEW.author_name || ' is live now',
      NEW.title,
      '/community/live#' || NEW.id::text,
      NEW.id
    FROM public.follows f
    WHERE f.following_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_on_live_start
  AFTER INSERT ON public.live_streams
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_live_start();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_streams;

-- Friendships (mutual, requires acceptance)
CREATE TABLE public.friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  CONSTRAINT friendships_no_self CHECK (requester_id <> addressee_id),
  CONSTRAINT friendships_unique_pair UNIQUE (requester_id, addressee_id)
);

CREATE INDEX idx_friendships_requester ON public.friendships(requester_id, status);
CREATE INDEX idx_friendships_addressee ON public.friendships(addressee_id, status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.friendships TO authenticated;
GRANT ALL ON public.friendships TO service_role;

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Either party can view their own friendship rows
CREATE POLICY "View own friendships" ON public.friendships
  FOR SELECT TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Only requester can create a request, and only as themselves
CREATE POLICY "Send friend request" ON public.friendships
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = requester_id AND status = 'pending');

-- Addressee can update status (accept/decline); requester can update to cancel (handled by delete)
CREATE POLICY "Respond to friend request" ON public.friendships
  FOR UPDATE TO authenticated
  USING (auth.uid() = addressee_id)
  WITH CHECK (auth.uid() = addressee_id);

-- Either party can delete (cancel request, unfriend, remove declined)
CREATE POLICY "Delete own friendship" ON public.friendships
  FOR DELETE TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- updated_at trigger
CREATE TRIGGER friendships_updated_at
  BEFORE UPDATE ON public.friendships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Notify on new friend request and on acceptance
CREATE OR REPLACE FUNCTION public.notify_on_friend_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_name text;
  v_actor_avatar text;
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
    SELECT COALESCE(name, username, 'Someone'), avatar_url
      INTO v_actor_name, v_actor_avatar
      FROM public.profiles WHERE user_id = NEW.requester_id LIMIT 1;
    INSERT INTO public.notifications
      (user_id, actor_id, actor_name, actor_avatar, type, title, body, link, entity_id)
    VALUES
      (NEW.addressee_id, NEW.requester_id, v_actor_name, v_actor_avatar,
       'friend_request', COALESCE(v_actor_name,'Someone') || ' sent you a friend request',
       NULL, '/friends?tab=requests', NEW.id);
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    SELECT COALESCE(name, username, 'Someone'), avatar_url
      INTO v_actor_name, v_actor_avatar
      FROM public.profiles WHERE user_id = NEW.addressee_id LIMIT 1;
    INSERT INTO public.notifications
      (user_id, actor_id, actor_name, actor_avatar, type, title, body, link, entity_id)
    VALUES
      (NEW.requester_id, NEW.addressee_id, v_actor_name, v_actor_avatar,
       'friend_accept', COALESCE(v_actor_name,'Someone') || ' accepted your friend request',
       NULL, '/u/' || NEW.addressee_id::text, NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER friendships_notify_insert
  AFTER INSERT ON public.friendships
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_friend_request();

CREATE TRIGGER friendships_notify_update
  AFTER UPDATE ON public.friendships
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_friend_request();
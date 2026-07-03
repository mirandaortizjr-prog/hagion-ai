
-- Robust friend request/accept/decline RPCs

CREATE OR REPLACE FUNCTION public.send_friend_request(p_target uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_existing record;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;
  IF p_target = v_uid THEN
    RETURN jsonb_build_object('ok', false, 'error', 'self_request');
  END IF;

  -- Find any existing friendship in either direction
  SELECT * INTO v_existing
  FROM public.friendships
  WHERE (requester_id = v_uid AND addressee_id = p_target)
     OR (requester_id = p_target AND addressee_id = v_uid)
  LIMIT 1;

  IF v_existing.id IS NOT NULL THEN
    IF v_existing.status = 'accepted' THEN
      RETURN jsonb_build_object('ok', true, 'status', 'accepted', 'friendship_id', v_existing.id);
    ELSIF v_existing.status = 'pending' THEN
      -- If the OTHER party already sent us a pending request, auto-accept
      IF v_existing.addressee_id = v_uid THEN
        UPDATE public.friendships
          SET status = 'accepted', responded_at = now()
          WHERE id = v_existing.id;
        RETURN jsonb_build_object('ok', true, 'status', 'accepted', 'friendship_id', v_existing.id);
      END IF;
      RETURN jsonb_build_object('ok', true, 'status', 'pending', 'friendship_id', v_existing.id);
    ELSIF v_existing.status = 'declined' THEN
      -- Recycle: reopen as a fresh pending request from current user
      UPDATE public.friendships
        SET requester_id = v_uid,
            addressee_id = p_target,
            status = 'pending',
            responded_at = NULL,
            created_at = now()
        WHERE id = v_existing.id;
      RETURN jsonb_build_object('ok', true, 'status', 'pending', 'friendship_id', v_existing.id);
    END IF;
  END IF;

  INSERT INTO public.friendships (requester_id, addressee_id, status)
    VALUES (v_uid, p_target, 'pending')
    RETURNING id INTO v_existing.id;

  RETURN jsonb_build_object('ok', true, 'status', 'pending', 'friendship_id', v_existing.id);
END;
$$;

CREATE OR REPLACE FUNCTION public.respond_friend_request(p_friendship_id uuid, p_accept boolean)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_row record;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  SELECT * INTO v_row FROM public.friendships WHERE id = p_friendship_id;
  IF v_row.id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_found');
  END IF;
  IF v_row.addressee_id <> v_uid THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_addressee');
  END IF;
  IF v_row.status <> 'pending' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_pending');
  END IF;

  IF p_accept THEN
    UPDATE public.friendships
      SET status = 'accepted', responded_at = now()
      WHERE id = p_friendship_id;
    RETURN jsonb_build_object('ok', true, 'status', 'accepted');
  ELSE
    DELETE FROM public.friendships WHERE id = p_friendship_id;
    RETURN jsonb_build_object('ok', true, 'status', 'declined');
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.remove_friendship(p_target uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  DELETE FROM public.friendships
  WHERE (requester_id = v_uid AND addressee_id = p_target)
     OR (requester_id = p_target AND addressee_id = v_uid);

  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.send_friend_request(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.respond_friend_request(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_friendship(uuid) TO authenticated;

-- Enable realtime for friendships so both sides update instantly
ALTER TABLE public.friendships REPLICA IDENTITY FULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'friendships'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.friendships';
  END IF;
END $$;

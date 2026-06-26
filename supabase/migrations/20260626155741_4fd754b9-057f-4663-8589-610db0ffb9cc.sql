
-- Add invite_code to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS invite_code text UNIQUE;

-- Generator: 8-char base36-ish
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS text LANGUAGE plpgsql AS $$
DECLARE
  c text;
  tries int := 0;
BEGIN
  LOOP
    c := lower(substr(replace(encode(gen_random_bytes(8),'base64'),'/',''),1,8));
    c := regexp_replace(c, '[^a-z0-9]', '', 'g');
    IF length(c) >= 6 AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE invite_code = c) THEN
      RETURN c;
    END IF;
    tries := tries + 1;
    IF tries > 10 THEN
      RETURN lower(substr(md5(random()::text || clock_timestamp()::text),1,8));
    END IF;
  END LOOP;
END;
$$;

-- Backfill existing profiles
UPDATE public.profiles SET invite_code = public.generate_invite_code() WHERE invite_code IS NULL;

-- Default on insert via trigger
CREATE OR REPLACE FUNCTION public.set_invite_code()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.invite_code IS NULL THEN
    NEW.invite_code := public.generate_invite_code();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_set_invite_code ON public.profiles;
CREATE TRIGGER profiles_set_invite_code
BEFORE INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_invite_code();

-- Claim invite: auto-friend
CREATE OR REPLACE FUNCTION public.claim_invite(p_code text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_inviter uuid;
  v_existing uuid;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  SELECT user_id INTO v_inviter FROM public.profiles WHERE invite_code = lower(p_code) LIMIT 1;
  IF v_inviter IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_code');
  END IF;

  IF v_inviter = v_uid THEN
    RETURN jsonb_build_object('ok', false, 'error', 'self_invite');
  END IF;

  SELECT id INTO v_existing FROM public.friendships
    WHERE (requester_id = v_uid AND addressee_id = v_inviter)
       OR (requester_id = v_inviter AND addressee_id = v_uid)
    LIMIT 1;

  IF v_existing IS NOT NULL THEN
    UPDATE public.friendships
      SET status = 'accepted', responded_at = now()
      WHERE id = v_existing AND status <> 'accepted';
    RETURN jsonb_build_object('ok', true, 'inviter_id', v_inviter, 'already', true);
  END IF;

  INSERT INTO public.friendships (requester_id, addressee_id, status, responded_at)
    VALUES (v_inviter, v_uid, 'accepted', now());

  RETURN jsonb_build_object('ok', true, 'inviter_id', v_inviter);
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_invite(text) TO authenticated;

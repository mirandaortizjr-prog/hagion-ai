
-- =========================================================
-- One Church: Rooms, Churches, Featured Content, Admin Roles
-- =========================================================

-- 1) GROUPS → room_type
ALTER TABLE public.groups
  ADD COLUMN IF NOT EXISTS room_type text NOT NULL DEFAULT 'legacy';
UPDATE public.groups SET room_type = 'legacy' WHERE room_type IS NULL;

-- 2) POSTS → church_id, visibility
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS church_id uuid REFERENCES public.churches(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'public';
CREATE INDEX IF NOT EXISTS idx_posts_church_id ON public.posts(church_id);

-- =========================================================
-- 3) ADMIN ROLES (separate table — privilege-safe)
-- =========================================================
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin','moderator');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users read their own roles" ON public.user_roles;
CREATE POLICY "users read their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  ) OR public.is_staff_email(_user_id);
$$;

-- =========================================================
-- 4) CHURCHES — extend existing table
-- =========================================================
ALTER TABLE public.churches
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS pastor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS invite_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS member_count integer NOT NULL DEFAULT 0;

-- backfill invite codes
UPDATE public.churches
  SET invite_code = lower(substr(encode(extensions.gen_random_bytes(6),'hex'),1,12))
  WHERE invite_code IS NULL;

ALTER TABLE public.churches ALTER COLUMN invite_code SET NOT NULL;
ALTER TABLE public.churches
  ALTER COLUMN invite_code SET DEFAULT lower(substr(encode(extensions.gen_random_bytes(6),'hex'),1,12));

GRANT SELECT ON public.churches TO anon, authenticated;
GRANT INSERT, UPDATE ON public.churches TO authenticated;
GRANT ALL ON public.churches TO service_role;
ALTER TABLE public.churches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone can view churches" ON public.churches;
CREATE POLICY "anyone can view churches" ON public.churches FOR SELECT USING (true);

DROP POLICY IF EXISTS "authenticated can create churches" ON public.churches;
CREATE POLICY "authenticated can create churches" ON public.churches
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = pastor_id);

DROP POLICY IF EXISTS "pastor or admin updates church" ON public.churches;
CREATE POLICY "pastor or admin updates church" ON public.churches
  FOR UPDATE TO authenticated USING (auth.uid() = pastor_id OR public.has_role(auth.uid(),'admin'));

-- 5) CHURCH MEMBERS
CREATE TABLE IF NOT EXISTS public.church_members (
  church_id uuid NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (church_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.church_members TO authenticated;
GRANT ALL ON public.church_members TO service_role;
ALTER TABLE public.church_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "members of a church can see roster" ON public.church_members;
CREATE POLICY "members of a church can see roster" ON public.church_members
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.church_members m WHERE m.church_id = church_members.church_id AND m.user_id = auth.uid())
    OR public.has_role(auth.uid(),'admin')
  );

DROP POLICY IF EXISTS "user can join a church" ON public.church_members;
CREATE POLICY "user can join a church" ON public.church_members
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user can leave a church" ON public.church_members;
CREATE POLICY "user can leave a church" ON public.church_members
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- member count trigger
CREATE OR REPLACE FUNCTION public.update_church_member_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN UPDATE public.churches SET member_count = member_count + 1 WHERE id = NEW.church_id;
  ELSIF TG_OP = 'DELETE' THEN UPDATE public.churches SET member_count = GREATEST(member_count-1,0) WHERE id = OLD.church_id;
  END IF;
  RETURN NULL;
END $$;
DROP TRIGGER IF EXISTS trg_church_member_count ON public.church_members;
CREATE TRIGGER trg_church_member_count AFTER INSERT OR DELETE ON public.church_members
  FOR EACH ROW EXECUTE FUNCTION public.update_church_member_count();

-- join by code RPC
CREATE OR REPLACE FUNCTION public.join_church_by_code(p_code text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_church_id uuid;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('ok',false,'error','not_authenticated'); END IF;
  SELECT id INTO v_church_id FROM public.churches WHERE invite_code = lower(p_code) LIMIT 1;
  IF v_church_id IS NULL THEN RETURN jsonb_build_object('ok',false,'error','invalid_code'); END IF;
  INSERT INTO public.church_members (church_id, user_id) VALUES (v_church_id, v_uid)
    ON CONFLICT DO NOTHING;
  RETURN jsonb_build_object('ok',true,'church_id',v_church_id);
END $$;

-- =========================================================
-- 6) ROOM REQUESTS
-- =========================================================
CREATE TABLE IF NOT EXISTS public.room_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  rationale text,
  status text NOT NULL DEFAULT 'pending',
  approved_group_id uuid REFERENCES public.groups(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);
GRANT SELECT, INSERT ON public.room_requests TO authenticated;
GRANT ALL ON public.room_requests TO service_role;
ALTER TABLE public.room_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users see own requests; admins see all" ON public.room_requests;
CREATE POLICY "users see own requests; admins see all" ON public.room_requests
  FOR SELECT TO authenticated USING (requester_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "users create own room requests" ON public.room_requests;
CREATE POLICY "users create own room requests" ON public.room_requests
  FOR INSERT TO authenticated WITH CHECK (requester_id = auth.uid());

DROP POLICY IF EXISTS "admins update room requests" ON public.room_requests;
CREATE POLICY "admins update room requests" ON public.room_requests
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- =========================================================
-- 7) FEATURED CONTENT
-- =========================================================
CREATE TABLE IF NOT EXISTS public.featured_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  ref_id text,
  title text,
  subtitle text,
  link text,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.featured_content TO anon, authenticated;
GRANT ALL ON public.featured_content TO service_role;
ALTER TABLE public.featured_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone can view featured" ON public.featured_content;
CREATE POLICY "anyone can view featured" ON public.featured_content FOR SELECT USING (true);

DROP POLICY IF EXISTS "admins manage featured" ON public.featured_content;
CREATE POLICY "admins manage featured" ON public.featured_content
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- =========================================================
-- 8) SEED 12 STARTER ROOMS  (idempotent by name)
-- =========================================================
INSERT INTO public.groups (name, description, room_type)
SELECT v.name, v.description, 'room' FROM (VALUES
  ('Marriage & Family','Strengthening covenant marriages and Christ-centered homes.'),
  ('Battling Addiction','Freedom in Christ — accountability, prayer, and victory.'),
  ('New Believers','Just said yes to Jesus? Start here.'),
  ('Apologetics & Hard Questions','Defend the faith with reason and Scripture.'),
  ('Missions & The Persecuted Church','Pray for and serve the global Body.'),
  ('Worship & Music','Songs, leaders, and the heart of worship.'),
  ('Bible Study','Going deep, book by book.'),
  ('Prayer Warriors','Standing in the gap for one another.'),
  ('Singles in Christ','Walking holy, hopeful, and whole.'),
  ('Parenting in Faith','Raising the next generation for the Lord.'),
  ('Mental Health & Faith','Hope, healing, and biblical truth for the mind.'),
  ('Sala en Español','Comunidad cristiana en español — todos bienvenidos.')
) AS v(name, description)
WHERE NOT EXISTS (SELECT 1 FROM public.groups g WHERE g.name = v.name);

-- mark any pre-existing rooms with these names as 'room'
UPDATE public.groups SET room_type = 'room'
  WHERE name IN (
    'Marriage & Family','Battling Addiction','New Believers','Apologetics & Hard Questions',
    'Missions & The Persecuted Church','Worship & Music','Bible Study','Prayer Warriors',
    'Singles in Christ','Parenting in Faith','Mental Health & Faith','Sala en Español'
  );

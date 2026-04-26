CREATE OR REPLACE FUNCTION public.is_staff_email(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = p_user_id
      AND lower(email) IN ('fabyygarciia@gmail.com', 'miranda.ortiz.jr@gmail.com')
  );
$$;
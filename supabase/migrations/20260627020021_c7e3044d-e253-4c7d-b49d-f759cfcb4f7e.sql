CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS text
LANGUAGE plpgsql
SET search_path = public, extensions
AS $function$
DECLARE
  c text;
  tries int := 0;
BEGIN
  LOOP
    c := lower(substr(replace(encode(extensions.gen_random_bytes(8),'base64'),'/',''),1,8));
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
$function$;
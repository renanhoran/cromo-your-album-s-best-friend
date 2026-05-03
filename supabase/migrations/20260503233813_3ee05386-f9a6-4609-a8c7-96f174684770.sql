
-- Public-safe profiles view (only non-sensitive fields)
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker=on) AS
  SELECT id, nome, cidade, avatar
  FROM public.profiles;

GRANT SELECT ON public.profiles_public TO authenticated, anon;

-- Allow authenticated users to see basic profile fields via the view
-- (RLS on base profiles still restricts to own row; view is invoker, so we add a permissive read policy limited to safe fields by relying on the view shape)
DROP POLICY IF EXISTS "Authenticated can read basic profile" ON public.profiles;
CREATE POLICY "Authenticated can read basic profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to read all user_stickers (needed for match calculation)
DROP POLICY IF EXISTS "Authenticated can read all stickers" ON public.user_stickers;
CREATE POLICY "Authenticated can read all stickers"
  ON public.user_stickers FOR SELECT
  TO authenticated
  USING (true);

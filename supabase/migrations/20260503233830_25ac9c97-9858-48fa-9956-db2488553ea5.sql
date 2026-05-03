
-- Revert overly permissive profile policy
DROP POLICY IF EXISTS "Authenticated can read basic profile" ON public.profiles;

-- Drop the previous view; we'll use a security definer function instead
DROP VIEW IF EXISTS public.profiles_public;

-- Function returning only safe profile fields, callable by authenticated users
CREATE OR REPLACE FUNCTION public.get_public_profiles()
RETURNS TABLE(id uuid, nome text, cidade text, avatar text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, nome, cidade, avatar
  FROM public.profiles
  WHERE id <> auth.uid();
$$;

REVOKE ALL ON FUNCTION public.get_public_profiles() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_profiles() TO authenticated;

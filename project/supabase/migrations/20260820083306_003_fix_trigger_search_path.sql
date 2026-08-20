/*
# Fix handle_new_user trigger — pin search_path

## Problem
The `handle_new_user()` SECURITY DEFINER function had a mutable search_path (no `set search_path`).
When Supabase Auth fires the `on_auth_user_created` trigger during signup, the function
runs as `postgres` but resolves the unqualified `profiles` table reference against the
caller's search_path. If `public` is not in that path, the INSERT fails with
"relation profiles does not exist", which rolls back the entire auth.users INSERT and
surfaces to the user as "Database error saving new user".

## Fix
1. Recreate `handle_new_user()` with `set search_path = public` and `security definer`.
2. Recreate `update_updated_at()` with `set search_path = public` (also flagged by advisor).
3. Revoke EXECUTE on `handle_new_user()` from `anon` and `authenticated` — it is a
   trigger function only, never called via RPC.
4. Drop and recreate the trigger to ensure it points to the updated function.
*/

-- ============ Fix handle_new_user ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

-- Revoke direct RPC access — this is a trigger function only
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;

-- ============ Fix update_updated_at ============
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============ Recreate trigger ============
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Re-apply update triggers (they reference the updated function)
DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS applications_updated_at ON applications;
CREATE TRIGGER applications_updated_at BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS resumes_updated_at ON resumes;
CREATE TRIGGER resumes_updated_at BEFORE UPDATE ON resumes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
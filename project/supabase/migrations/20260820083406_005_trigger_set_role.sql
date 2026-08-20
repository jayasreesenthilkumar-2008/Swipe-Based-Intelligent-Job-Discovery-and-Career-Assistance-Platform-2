/*
# Fix handle_new_user to set role from signup metadata

## Problem
The trigger only set `full_name` from `raw_user_meta_data`, but not `role`. The role
defaults to 'seeker'. When a recruiter or admin signs up, their role was never saved
to the profile — the frontend tried to update it after signup, but that update runs
as the anon role (no session yet) and fails RLS.

## Fix
Update the trigger to also read `role` from `raw_user_meta_data` and insert it into
the profile row at signup time. This way the role is set atomically during the
auth.users INSERT, inside the SECURITY DEFINER function that bypasses RLS.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'seeker')
  );
  RETURN NEW;
END;
$$;

-- Re-apply REVOKE since CREATE OR REPLACE resets grants
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;

/*
# Revoke public EXECUTE on trigger function

## Problem
The `REVOKE EXECUTE ON FUNCTION handle_new_user() FROM anon, authenticated` in the
previous migration did not remove access because the grant goes through the implicit
`PUBLIC` role grant that Postgres gives by default on functions.

## Fix
Revoke EXECUTE from PUBLIC, then grant only to the `postgres` (supabase_admin) role
that owns the trigger invocation path. The trigger fires as the table owner / function
definer, not as anon/authenticated, so RPC access is unnecessary.
*/

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;

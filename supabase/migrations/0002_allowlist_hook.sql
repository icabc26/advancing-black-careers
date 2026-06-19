-- =====================================================================
-- Allowlist enforcement — "Before User Created" Auth Hook
-- =====================================================================
-- This is the HARD gate: it runs inside Supabase Auth before any new user
-- row is created, and rejects sign-ups whose email is not in
-- public.allowed_members. The friendly check in the login form is just UX;
-- THIS is the security boundary.
--
-- After running this migration, enable the hook in the dashboard:
--   Authentication → Hooks → "Before User Created"
--   → Postgres → schema `public`, function `before_user_created_allowlist`
-- =====================================================================

create or replace function public.before_user_created_allowlist(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  email_in text;
begin
  -- The hook payload nests the new user under `user`.
  email_in := lower(trim(event #>> '{user,email}'));

  if email_in is null then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 400,
        'message', 'An email address is required.'
      )
    );
  end if;

  if not exists (
    select 1 from public.allowed_members a where a.email = email_in
  ) then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 403,
        'message', 'This email is not on the ABC member list yet. Join the society or contact the committee to be added.'
      )
    );
  end if;

  -- Allowed: return the event unchanged.
  return event;
end;
$$;

-- The Auth service runs hooks as the `supabase_auth_admin` role.
grant execute on function public.before_user_created_allowlist(jsonb) to supabase_auth_admin;
revoke execute on function public.before_user_created_allowlist(jsonb) from authenticated, anon, public;

-- The hook (running as supabase_auth_admin) must be able to read the allowlist.
grant usage on schema public to supabase_auth_admin;
grant select on public.allowed_members to supabase_auth_admin;

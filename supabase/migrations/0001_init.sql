-- =====================================================================
-- ABC member area — initial schema
-- Run in the Supabase SQL editor (or `supabase db push`).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Member allowlist — only these emails may create an account.
--    Committee manages this table via the Supabase Table Editor.
-- ---------------------------------------------------------------------
create table if not exists public.allowed_members (
  email      text primary key,
  role       text not null default 'member'
             check (role in ('member', 'committee', 'admin')),
  added_by   text,
  created_at timestamptz not null default now()
);

-- Store/compare emails case-insensitively.
create or replace function public.normalize_allowed_email()
returns trigger language plpgsql as $$
begin
  new.email := lower(trim(new.email));
  return new;
end;
$$;

drop trigger if exists trg_normalize_allowed_email on public.allowed_members;
create trigger trg_normalize_allowed_email
  before insert or update on public.allowed_members
  for each row execute function public.normalize_allowed_email();

-- ---------------------------------------------------------------------
-- 2. Application status enum (drives pill colour + kanban column).
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'application_status') then
    create type public.application_status as enum (
      'Submitted',
      'OA completed',
      'HV completed',
      'Interview sent',
      'Successful',
      'Rejected'
    );
  end if;
end$$;

-- ---------------------------------------------------------------------
-- 3. Per-member application tracker rows.
-- ---------------------------------------------------------------------
create table if not exists public.applications (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  company      text not null,
  position     text not null default '',
  date_applied date,
  status       public.application_status not null default 'Submitted',
  deadline     date,
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists applications_user_id_idx on public.applications (user_id);

-- keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_applications_touch on public.applications;
create trigger trg_applications_touch
  before update on public.applications
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- 4. Curated "Live opportunities" — committee seeds these.
-- ---------------------------------------------------------------------
create table if not exists public.opportunities (
  id         uuid primary key default gen_random_uuid(),
  role_title text not null,
  employer   text not null,
  location   text,
  season     text check (season in ('Spring', 'Summer', 'Off-cycle', 'Graduate')),
  closes_on  date,
  link       text,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- Row-Level Security
-- =====================================================================

-- applications: a member sees/edits ONLY their own rows.
alter table public.applications enable row level security;

drop policy if exists "own applications - select" on public.applications;
create policy "own applications - select"
  on public.applications for select
  using (auth.uid() = user_id);

drop policy if exists "own applications - insert" on public.applications;
create policy "own applications - insert"
  on public.applications for insert
  with check (auth.uid() = user_id);

drop policy if exists "own applications - update" on public.applications;
create policy "own applications - update"
  on public.applications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "own applications - delete" on public.applications;
create policy "own applications - delete"
  on public.applications for delete
  using (auth.uid() = user_id);

-- opportunities: any signed-in member can read. Writes are done from the
-- dashboard / service role only (no public write policy = no public writes).
alter table public.opportunities enable row level security;

drop policy if exists "opportunities - read for authenticated" on public.opportunities;
create policy "opportunities - read for authenticated"
  on public.opportunities for select
  to authenticated
  using (true);

-- allowed_members: not readable by normal clients (the auth hook and the
-- service-role client read it). RLS on + no policy = locked to service role.
alter table public.allowed_members enable row level security;

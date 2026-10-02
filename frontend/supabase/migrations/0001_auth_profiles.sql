-- TripMate: profile table for Supabase Auth users.
--
-- Run this once in Supabase Studio -> SQL Editor, or with
--   supabase db push
--
-- The trigger copies the display name out of user_metadata, which the register
-- form sends as `data: { full_name }`. user_metadata itself cannot be read by
-- other users under row level security, so anything the app displays has to
-- live in a table with its own policy.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  terms_accepted_at timestamptz,
  terms_version text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Public profile data for each TripMate user, one row per auth.users entry.';

alter table public.profiles enable row level security;

-- Each user can read their own profile.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  using (auth.uid() = id);

-- Each user can update their own profile, but never change the id.
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- No insert or delete policy on purpose: rows are created by the trigger below
-- using the service role, which bypasses RLS. Letting clients insert rows would
-- allow one user to fabricate a profile for another id.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

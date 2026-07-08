create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  xp integer not null default 0 check (xp >= 0),
  focus_sessions integer not null default 0 check (focus_sessions >= 0),
  streak_record integer not null default 0 check (streak_record >= 0),
  theme text not null default 'dark' check (theme in ('dark', 'light')),
  plan text not null default 'free' check (plan in ('free', 'pro', 'teams')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists theme text not null default 'dark'
  check (theme in ('dark', 'light'));

alter table public.profiles
  add column if not exists plan text not null default 'free'
  check (plan in ('free', 'pro', 'teams'));

grant select, insert, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.profiles to service_role;

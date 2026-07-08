create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  enabled boolean not null default false,
  email text not null default '',
  delivery_time time not null default '07:00',
  timezone text not null default 'America/Manaus',
  include_completed boolean not null default false,
  last_sent_date date,
  updated_at timestamptz not null default now()
);

alter table public.notification_preferences
  add column if not exists include_completed boolean not null default false;

grant select, insert, update on table public.notification_preferences to authenticated;
grant select, insert, update, delete on table public.notification_preferences to service_role;

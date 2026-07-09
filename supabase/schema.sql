create extension if not exists "pgcrypto";

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

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  category text not null check (category in ('Pessoais', 'Faculdade', 'Trabalho', 'Treino')),
  due_date date not null,
  due_time time,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  notes text not null default '',
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create table if not exists public.billing_customers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  provider text not null check (provider in ('mercado_pago')),
  provider_customer_id text,
  email text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('mercado_pago')),
  provider_subscription_id text not null,
  provider_plan_id text,
  external_reference text not null unique,
  plan text not null default 'pro' check (plan in ('pro')),
  status text not null default 'pending',
  checkout_url text not null default '',
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_subscription_id)
);

create table if not exists public.billing_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('mercado_pago')),
  provider_event_id text not null,
  event_type text not null default '',
  resource_id text not null default '',
  processed_at timestamptz,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (provider, provider_event_id)
);

alter table public.notification_preferences
  add column if not exists include_completed boolean not null default false;

create table if not exists public.admin_emails (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table public.admin_emails enable row level security;
revoke all on table public.admin_emails from anon, authenticated;
grant select, insert, update, delete on table public.admin_emails to service_role;

create or replace function public.is_current_user_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_emails
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

create or replace function public.guard_profile_admin_fields()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.is_current_user_admin() then
    if new.xp >= 300000 then
      new.xp := least(coalesce(old.xp, 0), 299999);
    end if;
    new.plan := coalesce(old.plan, 'free');
  end if;
  return new;
end;
$$;

drop trigger if exists guard_profile_admin_fields on public.profiles;
create trigger guard_profile_admin_fields
  before update on public.profiles
  for each row execute procedure public.guard_profile_admin_fields();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    ),
    coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'picture'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create index if not exists tasks_user_due_date_idx
  on public.tasks (user_id, due_date);

create index if not exists subscriptions_user_status_idx
  on public.subscriptions (user_id, status, created_at desc);

create index if not exists billing_events_resource_idx
  on public.billing_events (provider, resource_id);

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.billing_customers enable row level security;
alter table public.subscriptions enable row level security;
alter table public.billing_events enable row level security;

grant select, insert, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.tasks to authenticated;
grant select, insert, update on table public.notification_preferences to authenticated;
grant select on table public.billing_customers to authenticated;
grant select on table public.subscriptions to authenticated;
grant select, insert, update, delete on table public.profiles to service_role;
grant select, insert, update, delete on table public.tasks to service_role;
grant select, insert, update, delete on table public.notification_preferences to service_role;
grant select, insert, update, delete on table public.billing_customers to service_role;
grant select, insert, update, delete on table public.subscriptions to service_role;
grant select, insert, update, delete on table public.billing_events to service_role;

drop policy if exists "Users can read their profile" on public.profiles;
drop policy if exists "Users can create their profile" on public.profiles;
drop policy if exists "Users can update their profile" on public.profiles;
drop policy if exists "Users can read their tasks" on public.tasks;
drop policy if exists "Users can create their tasks" on public.tasks;
drop policy if exists "Users can update their tasks" on public.tasks;
drop policy if exists "Users can delete their tasks" on public.tasks;
drop policy if exists "Users can read their notification preferences" on public.notification_preferences;
drop policy if exists "Users can create their notification preferences" on public.notification_preferences;
drop policy if exists "Users can update their notification preferences" on public.notification_preferences;
drop policy if exists "Users can read their billing customer" on public.billing_customers;
drop policy if exists "Users can read their subscriptions" on public.subscriptions;

create policy "Users can read their profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can create their profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can read their tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Users can create their tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update their tasks"
  on public.tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

create policy "Users can read their notification preferences"
  on public.notification_preferences for select
  using (auth.uid() = user_id);

create policy "Users can create their notification preferences"
  on public.notification_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update their notification preferences"
  on public.notification_preferences for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can read their billing customer"
  on public.billing_customers for select
  using (auth.uid() = user_id);

create policy "Users can read their subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

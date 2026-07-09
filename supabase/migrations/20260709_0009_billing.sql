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

create index if not exists subscriptions_user_status_idx
  on public.subscriptions (user_id, status, created_at desc);

create index if not exists billing_events_resource_idx
  on public.billing_events (provider, resource_id);

alter table public.billing_customers enable row level security;
alter table public.subscriptions enable row level security;
alter table public.billing_events enable row level security;

grant select on table public.billing_customers to authenticated;
grant select on table public.subscriptions to authenticated;
grant select, insert, update, delete on table public.billing_customers to service_role;
grant select, insert, update, delete on table public.subscriptions to service_role;
grant select, insert, update, delete on table public.billing_events to service_role;

drop policy if exists "Users can read their billing customer" on public.billing_customers;
drop policy if exists "Users can read their subscriptions" on public.subscriptions;

create policy "Users can read their billing customer"
  on public.billing_customers for select
  using (auth.uid() = user_id);

create policy "Users can read their subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

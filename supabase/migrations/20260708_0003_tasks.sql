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

create index if not exists tasks_user_due_date_idx
  on public.tasks (user_id, due_date);

grant select, insert, update, delete on table public.tasks to authenticated;
grant select, insert, update, delete on table public.tasks to service_role;

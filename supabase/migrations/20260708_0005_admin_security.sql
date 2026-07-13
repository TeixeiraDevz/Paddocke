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
  end if;
  return new;
end;
$$;

drop trigger if exists guard_profile_admin_fields on public.profiles;
create trigger guard_profile_admin_fields
  before update on public.profiles
  for each row execute procedure public.guard_profile_admin_fields();

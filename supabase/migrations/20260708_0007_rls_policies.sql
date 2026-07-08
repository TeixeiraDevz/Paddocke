alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.notification_preferences enable row level security;

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

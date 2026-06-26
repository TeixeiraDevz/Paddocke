-- Paddocke daily task e-mail cron.
-- Run this in Supabase SQL Editor after deploying the Edge Function.
--
-- Before running:
-- 1. Replace the two vault.create_secret placeholder values below.
-- 2. Keep the same CRON_SECRET value in the Edge Function secret and in Vault.

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;
create extension if not exists supabase_vault with schema vault;

select vault.create_secret(
  'https://egdltobtsldomxzlzhnt.supabase.co',
  'paddocke_project_url',
  'Base project URL used by the Paddocke e-mail cron'
);

select vault.create_secret(
  'REPLACE_WITH_THE_SAME_CRON_SECRET_USED_IN_EDGE_FUNCTION',
  'paddocke_cron_secret',
  'Shared secret used to invoke the Paddocke daily task e-mail function'
);

do $$
begin
  if exists (select 1 from cron.job where jobname = 'paddocke-daily-task-email') then
    perform cron.unschedule('paddocke-daily-task-email');
  end if;
end $$;

select cron.schedule(
  'paddocke-daily-task-email',
  '* * * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'paddocke_project_url') || '/functions/v1/daily-task-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'paddocke_cron_secret')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 10000
  );
  $$
);

-- Corrige usuários criados antes do ajuste que receberam XP de admin por engano.
-- Troque o e-mail abaixo pelo seu e-mail de admin antes de executar.

update public.profiles p
set xp = 0,
    updated_at = now()
from auth.users u
where u.id = p.id
  and lower(coalesce(u.email, '')) <> lower('vteixeira2020@gmail.com')
  and p.xp >= 300000;

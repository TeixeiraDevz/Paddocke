-- Remove tarefas de demonstracao que podem ter sido migradas para contas reais
-- antes da correcao de isolamento local/remoto. Nao remove tarefas do admin.

delete from public.tasks t
using auth.users u
where u.id = t.user_id
  and lower(coalesce(u.email, '')) <> lower('vteixeira2020@gmail.com')
  and t.title in (
    'Revisar anotações de Cálculo',
    'Finalizar apresentação do projeto',
    'Treino de superiores',
    'Organizar documentos pessoais',
    'Entregar lista de exercícios'
  );

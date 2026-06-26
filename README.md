# Paddocke

MVP de um planejador pessoal com tarefas, calendario, Pomodoro, gamificacao e
assistente inteligente por voz.

## Executar

Requer Node.js 20 ou superior.

```powershell
npm start
```

Acesse `http://localhost:3000`.

## Recursos atuais

- Tarefas nas categorias Pessoais / Estudos, Faculdade, Trabalho e Treino
- Filtros, busca, prioridades e persistencia local com sincronizacao Supabase quando configurado
- Calendario mensal e exportacao `.ics` compativel com Google Calendar
- Pomodoro com pausas curtas e longas
- Experiencia, niveis de 1 a 100, patentes e sequencia diaria
- Assistente somente por voz, com IA via OpenAI e fallback local
- Tema claro e escuro
- Tooltips de tarefas no calendario
- Pomodoro sem musica, focado apenas em tempo e tarefa vinculada
- Resumo diario de tarefas por e-mail
- Layout responsivo para desktop, tablet e celular
- Login e cadastro responsivos com Supabase Auth
- Entrada com Google OAuth
- Recuperacao de senha com tela para definir nova senha
- Perfil, tarefas, tema, gamificacao e preferencias salvos por usuario no Supabase

## Comandos do assistente

- `Crie uma tarefa revisar Calculo para amanha as 19h na faculdade`
- `Quais sao minhas tarefas de hoje?`
- `Concluir tarefa revisar Calculo`
- `Excluir tarefa revisar Calculo`
- `Iniciar Pomodoro`
- `Qual e meu nivel?`
- `Abrir calendario`

## Integracoes

Crie um arquivo `.env` a partir de `.env.example` e informe as chaves desejadas:

- `OPENAI_API_KEY`: ativa o assistente inteligente no servidor.
- `RESEND_API_KEY`: ativa o envio diario por e-mail.
- `EMAIL_FROM`: remetente validado no Resend.
- `SUPABASE_URL`: URL publica do projeto Supabase.
- `SUPABASE_ANON_KEY`: chave anon/publica do projeto Supabase.

Sem essas chaves, tarefas, voz, Pomodoro e interpretacao local continuam
funcionando. Sem Supabase, o app usa `localStorage`.

## Supabase

`supabase/schema.sql` cria as tabelas e politicas RLS. A funcao
`supabase/functions/daily-task-email` envia os resumos em producao e deve ser
chamada por um Cron do Supabase a cada minuto com o header `x-cron-secret`.

### Configuracao do Supabase

1. Acesse `https://supabase.com/dashboard` e crie um projeto.
2. Entre no projeto e va em `Project Settings > API Keys` ou
   `Integrations > Data API`.
3. Copie a `Project URL` para `SUPABASE_URL`.
4. Copie a chave `anon public` ou `publishable key` para
   `SUPABASE_ANON_KEY`.
5. No Supabase, abra `SQL Editor > New query`, cole o conteudo de
   `supabase/schema.sql` e execute.
6. Va em `Authentication > Providers` e habilite `Email`.
7. Va em `Authentication > URL Configuration` e configure:
   - `Site URL`: `http://localhost:3000`
   - `Redirect URLs`: `http://localhost:3000/`
   - `Redirect URLs`: `http://localhost:3000/auth/callback`
8. Para login com Google, va em `Authentication > Providers > Google` e copie a
   callback mostrada pelo Supabase, normalmente:
   `https://SEU-PROJETO.supabase.co/auth/v1/callback`.
9. No Google Cloud Console, crie um OAuth Client do tipo `Web application` e
   adicione essa callback em `Authorized redirect URIs`.
10. Copie o `Client ID` e o `Client Secret` do Google para o provider Google no
    Supabase e salve.

Com `SUPABASE_URL` e `SUPABASE_ANON_KEY` no `.env`, o app sincroniza:

- `profiles`: nome, avatar, XP, sessoes de foco, recorde de sequencia, tema e plano.
- `tasks`: tarefas do usuario com RLS.
- `notification_preferences`: opt-in, e-mail e horario do resumo diario.

No primeiro login real, se o usuario ainda nao tiver tarefas no Supabase, o app
migra uma vez as tarefas locais do navegador para a conta autenticada.

## OpenAI

O assistente usa a Responses API no servidor, em `server.js`. A chave da OpenAI
nunca deve ficar no navegador; ela entra apenas no `.env`.

### Configuracao da OpenAI

1. Acesse `https://platform.openai.com/` e entre na sua conta.
2. Confira se o projeto tem billing/creditos ativos.
3. Va em `API keys` e clique em `Create new secret key`.
4. Copie a chave no momento da criacao. Ela nao aparece completa novamente.
5. No arquivo `.env`, preencha:

```env
OPENAI_API_KEY=sua-chave-aqui
OPENAI_MODEL=gpt-5.4-mini
```

6. Reinicie o servidor com:

```powershell
npm run stop
npm start
```

7. Abra `http://localhost:3000/api/config`. Quando estiver correto,
   `aiConfigured` deve retornar `true`.

Com a chave configurada, o Assistente Paddocke interpreta comandos com IA. Sem a
chave, ele continua funcionando com o interpretador local mais simples.

## E-mail diario automatico

O resumo diario usa uma Supabase Edge Function chamada `daily-task-email`. Ela
deve ser chamada a cada minuto pelo Supabase Cron; a propria funcao verifica o
horario escolhido por cada usuario em `notification_preferences`.

### Secrets da Edge Function

No Supabase, configure estas secrets para a funcao:

```env
SUPABASE_URL=https://egdltobtsldomxzlzhnt.supabase.co
SUPABASE_SECRET_KEY=sua-secret-key-do-supabase
RESEND_API_KEY=sua-chave-resend
EMAIL_FROM=Paddocke <seu-remetente-validado>
CRON_SECRET=um-texto-longo-aleatorio
```

`SUPABASE_SECRET_KEY` deve ser uma Secret key do Supabase para backend. Nao use
essa chave no frontend.

### Deploy da funcao

Autentique a Supabase CLI:

```powershell
npx supabase login
```

Configure as secrets:

```powershell
npx supabase secrets set SUPABASE_URL=https://egdltobtsldomxzlzhnt.supabase.co --project-ref egdltobtsldomxzlzhnt
npx supabase secrets set SUPABASE_SECRET_KEY=sua-secret-key-do-supabase --project-ref egdltobtsldomxzlzhnt
npx supabase secrets set RESEND_API_KEY=sua-chave-resend --project-ref egdltobtsldomxzlzhnt
npx supabase secrets set "EMAIL_FROM=Paddocke <seu-remetente-validado>" --project-ref egdltobtsldomxzlzhnt
npx supabase secrets set CRON_SECRET=mesmo-valor-usado-no-cron --project-ref egdltobtsldomxzlzhnt
```

Depois faca o deploy:

```powershell
npm run supabase:functions:deploy:email
```

Use `--no-verify-jwt` porque a funcao e chamada pelo Cron com o header
`x-cron-secret`.

### Agendamento do Cron

Depois do deploy:

1. Abra `supabase/cron-daily-task-email.sql`.
2. Troque `REPLACE_WITH_THE_SAME_CRON_SECRET_USED_IN_EDGE_FUNCTION` pelo mesmo
   valor usado em `CRON_SECRET`.
3. Cole o SQL no `Supabase > SQL Editor`.
4. Execute.

O job `paddocke-daily-task-email` roda a cada minuto e envia e-mails apenas para
usuarios cujo horario configurado bate com o minuto atual e que ainda nao
receberam resumo naquele dia.

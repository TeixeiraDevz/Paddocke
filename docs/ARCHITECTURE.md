# Paddocke Architecture

Paddocke is currently a small SaaS MVP served by a Node HTTP entrypoint and a browser app. The codebase is being migrated from a single-file prototype into feature-oriented modules while keeping production stable.

## Runtime Shape

- `server.js` is the HTTP/Vercel entrypoint.
- `server/` contains backend concerns split by responsibility:
  - `api.js`: API routing.
  - `assistant.js`: assistant command and AI integration.
  - `config.js`: environment, public runtime config, MIME types.
  - `http.js`: shared request/response helpers.
  - `notifications.js`: notification preference and email logic.
  - `static.js`: static asset and SPA fallback serving.
- `public/index.html` loads the app as an ES module.
- `public/app.js` remains the current frontend orchestrator.
- `public/js/` contains extracted frontend modules:
  - `domain/app-config.js`: app constants, categories, XP rules, patents.
  - `domain/initial-state.js`: state factory.
  - `shared/formatters.js`: pure date/text/number helpers.
  - `ui/icons.js`: SVG icon registry.

## Frontend Target

The next frontend step is to move each product area into a feature folder:

- `features/auth`: login, signup, Google OAuth, confirmation polling.
- `features/tasks`: task CRUD, filters, counts, daily summary.
- `features/calendar`: mini/full calendar, selected day panel, task movement.
- `features/pomodoro`: timer state, floating timer, focus history.
- `features/assistant`: Paddocke UI, speech recognition, command dispatch.
- `features/profile`: profile, rank, XP, avatar/banner editing.
- `features/notifications`: notification preferences and test email.

Each feature should expose a small public API and receive dependencies through parameters instead of importing mutable global state directly. This keeps the code close to SOLID without forcing a heavy framework rewrite before the MVP is validated.

## Security Baseline

- User data must always be scoped by `user_id` in Supabase queries.
- Admin XP/rank must be derived from an allowlist, not from client-editable profile data.
- Secrets must never be shipped through `/api/config`; only public keys and capability flags can be returned.
- Local `.env` loading is disabled on Vercel.
- RLS policies are required for `tasks`, `profiles`, and `notification_preferences`.

## Validation

Run these before deploy:

```bash
npm run qa:mvp
node --check server.js
node --check public/app.js
npx vercel build --prod --yes
```

`scripts/qa-mvp.js` validates production-critical flows and invariants: public config, Google OAuth redirect, optimized rank assets, MIME types, Supabase scoping, RLS references, and notification fallback behavior.

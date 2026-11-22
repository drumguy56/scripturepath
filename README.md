# ScripturePath

Bible study app: studies and lessons, study progress and journal, lesson comments, study groups with chat and session scheduling, and Google Calendar sync.

Stack: Vite + React frontend in the repo root, Hono API on Bun in `server/`, Postgres via Drizzle. Email and password auth with server-side sessions.

## Requirements

- Bun (runs the API) and Node 22+ (builds the frontend)
- Postgres 14+

## Setup

```bash
npm install
cp .env.example .env        # then fill in DATABASE_URL and ADMIN_EMAIL at minimum
npm run db:migrate          # create tables
npm run seed                # load studies and lessons (optional)
npm run dev                 # API on PORT (default 3000) + Vite on :5173, /api is proxied
```

Open http://localhost:5173 in dev.

## Production

```bash
npm run build               # builds the frontend into dist/
npm run db:migrate
npm start                   # Bun serves the API and dist/ on PORT
```

The server serves `dist/` and `public/` (including `/media`, the curriculum images) from the same port, so one process is the whole app. Set `APP_URL` to the public URL.

Docker or any Node/Bun host works. Run the server behind TLS.

**Single instance only.** Realtime updates (group chat, groups) use an in-process event bus over SSE. Running more than one API process will not deliver events across instances.

## Environment

See `.env.example`. Required: `DATABASE_URL`, `ADMIN_EMAIL`. Everything else is optional:

- `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `MAIL_FROM` (optional): send verification codes and the new-member alert through Gmail SMTP. Use a Google app password, not the account password. Without them, codes and alerts go to the server log.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: enable Google Calendar sync. Redirect URI `<APP_URL>/api/calendar/callback`, scope `calendar.events`. Without them, calendar connect returns 503.
- `API_BIBLE_KEY`: Bible text from API.Bible. Without it, Bible chapters come from the fallback source.

## Layout

- `src/`: frontend. `src/api/client.js` is the API client (entities, functions, auth, calendar).
- `server/index.ts`: Hono app, static files, SSE.
- `server/routes/`: auth, entities, events (SSE), calendar (Google OAuth), functions.
- `server/lib/policy.ts`: who can read and write what. Authorization lives here, not in the client.
- `server/functions/`: group, weather, and Bible functions.
- `server/db/`: schema, migrations (new migration with `bun server/db/new-migration.ts <name>` after schema changes).
- `server/shared/`: curriculum and schedule helpers shared by server and client.
- `public/media/`: curriculum images.

## Checks

```bash
npm run lint
npm run build
npm run typecheck
```

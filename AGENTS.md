# AGENTS.md

## Project context

ScripturePath is a standalone app: Vite + React frontend in the repo root, Hono API on Bun in `server/`, Postgres through Drizzle. It is user-owned application code. Keep changes focused on the request and follow existing conventions.

Start with `README.md` for setup and environment variables.

## Key files

- `src/api/client.js`: the only frontend data access layer (entities, functions, auth, calendar).
- `src/lib/AuthContext.jsx`: current user state.
- `server/lib/policy.ts`: authorization rules. Add checks here, never only in the client.
- `server/lib/records.ts`: generic entity storage on the `records` jsonb table.
- `server/functions/`: named server functions called via `functions.invoke`.
- `server/db/schema.ts`: tables. After changes run `npm run db:generate` and `npm run db:migrate`.
- `.env`: local secrets, never commit.

## Working notes

- Dev: `npm run dev` (API with watch + Vite with `/api` proxy).
- Server-owned fields (author, members, member_profiles, group host) are set by the server. Clients cannot set them.
- Run `npm run lint`, `npm run build`, and `npm run typecheck` before finishing.

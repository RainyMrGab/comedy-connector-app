# Comedy Connector — Claude Context

Social platform for local comedy communities (performers, coaches, teams). Deploys free on Netlify; configurable per city via env vars.

## Claude Instructions

- DO NOT COMMIT unless told specifically to do so

## Commands

```bash
pnpm dev               # local dev server — uses PGLite (no external DB needed)
pnpm dev:netlify       # dev server via Netlify CLI — uses production Neon DB + Identity
pnpm build             # production build
pnpm check             # TypeScript + Svelte type checking (run after changes)
pnpm db:setup          # push schema + run all migrations (production Neon DB)
pnpm db:push           # push schema changes only (no migration files)
pnpm db:migrate        # apply SQL migration files only
pnpm db:generate       # generate migration files from schema changes (no DB connection needed)
pnpm db:studio         # Drizzle Studio GUI (production Neon DB)
pnpm db:studio:local   # Drizzle Studio GUI (local PGLite DB at .local-db/)
```

**Note on `db:*` commands**: These require `NETLIFY_DATABASE_URL` to be set. Add it to your `.env` file (it's gitignored). When using `pnpm dev:netlify`, Netlify CLI injects it automatically — but drizzle-kit commands run outside that context and read from `.env` directly.

**Local Development (no Netlify account needed):**
1. `cp .env.example .env` (leave `NETLIFY_DATABASE_URL` commented out — PGLite is used instead)
2. `pnpm install && pnpm dev`
3. Navigate to `http://localhost:5173/dev-login` to pick a test user
4. PGLite auto-creates `.local-db/` on first request and seeds 3 test users

To run `db:*` commands against the production Neon DB, uncomment and set `NETLIFY_DATABASE_URL` in `.env`.

**⚠️ Production Auth Limitation:**
Netlify Identity authentication does NOT work in local development (the `nf_jwt` cookie is domain-specific). Use `pnpm dev:netlify` to connect to the production Neon DB with real auth, or deploy previews for full auth testing.

## Tech Stack

- **SvelteKit 2 + Svelte 5 runes** — `$state`, `$derived`, `$effect`, `$bindable`, `untrack()`
- **Tailwind v4 + Skeleton UI v4** — `@skeletonlabs/skeleton` + `@skeletonlabs/skeleton-svelte`
- **Drizzle ORM** on Neon Postgres (prod) or PGLite (local dev)
- **Netlify Identity** — JWT auth; decoded in `hooks.server.ts` → `event.locals.user`
- **Resend** — transactional email (contact form + monthly freshness reminders)
- **netlify-cli** — devDependency, accessed via `pnpm netlify <cmd>` or `pnpm dev:netlify`

## Path Aliases (svelte.config.js)

| Alias | Resolves to |
|-------|-------------|
| `$lib` | `src/lib` |
| `$components` | `src/lib/components` |
| `$server` | `src/lib/server` |
| `$stores` | `src/lib/stores` |
| `$types` | `src/lib/types` |
| `$utils` | `src/lib/utils` |
| `$config` | `src/lib/config` |

## Key Files

| File | Purpose |
|------|---------|
| `src/hooks.server.ts` | Auth: PGLite dev_session cookie (local) or `nf_jwt` JWT (prod) |
| `src/lib/server/db/index.ts` | Drizzle client — PGLite locally, Neon in production |
| `src/lib/server/db/local.ts` | PGLite initialization + migration runner |
| `src/lib/server/db/seed.ts` | 3 local dev test users (performer, coach, new user) |
| `src/lib/server/db/schema/` | One file per entity + `relations.ts` |
| `src/lib/server/search.ts` | Full-text search with cursor pagination |
| `src/lib/server/email.ts` | Resend helpers |
| `src/lib/server/teams.ts` | Stub team creation + claim flow |
| `src/lib/config/city.ts` | City name, domain, resource links (uses `$env/dynamic/public`) |
| `netlify/functions/identity-signup.ts` | Creates DB user on Netlify Identity signup |
| `netlify/functions/freshness-reminder.ts` | Monthly email cron (1st of month, 9am EST) |
| `src/routes/dev-login/` | Local-only auth page — redirects to `/` in production |

## Svelte 5 Patterns & Gotchas

- **Props derived from other props**: use `$derived`, not `const`
- **State initialized from prop (one-time snapshot)**: `let x = $state(untrack(() => prop))`
- **Skip first `$effect` run** (avoid re-fetching SSR data on hydration): use a plain `let isInitialRender = true` flag
- **Dynamic Tailwind classes**: ternary literals only — `x ? 'class-a' : 'class-b'` (no string interpolation)
- **Modal backdrops**: `<button class="fixed inset-0 ..." onclick={close}>` — NOT a `<div>` (avoids a11y warning)
- **Toast store**: `toastStore.success(msg)` / `toastStore.error(msg)` — NOT `.add({message, type})`
- **`import type` from `$server/*`** is safe in `.svelte` components (TypeScript erases types)
- **Env vars (server)**: use `$env/dynamic/private` (not static) in server modules
- **Netlify function imports**: use relative `.js` paths, e.g. `../../src/lib/server/db/schema/foo.js`

## Database Notes

- Schema-first with Drizzle — edit schema files, then `pnpm db:push` (prod Neon, via `netlify env:run`) or server auto-applies locally
- Migrations: `src/lib/server/db/migrations/` — `0000_initial_schema.sql` (tables) + `0001_add_fulltext_search.sql` (FTS)
- PGLite local DB auto-applies migrations on first server request (idempotent via `__drizzle_migrations` table)
- FTS: `tsvector` generated columns + GIN indexes on `personal_profiles`, `teams`, `coach_profiles`
- Team stub/claim lifecycle: `status = 'stub'` → performer references unknown team → any user can claim → `status = 'active'`
- Approval flow: team adds member/coach → `approval_status = 'pending'` → target user approves/rejects

## Env Vars

| Variable | Scope | Notes |
|----------|-------|-------|
| `NETLIFY_DATABASE_URL` | Server | Add to `.env` to use Neon DB (for `db:*` commands). If unset, PGLite is used. Netlify CLI also injects it automatically during `dev:netlify`. Set in Netlify dashboard for prod. |
| `RESEND_API_KEY` | Server | Resend dashboard — not needed for local dev |
| `FEEDBACK_EMAIL` | Server | Destination address for `/feedback` form submissions |
| `PUBLIC_CITY_NAME` | Public | Defaults to `Pittsburgh` |
| `PUBLIC_CITY_DOMAIN` | Public | Defaults to `pittsburgh.comedyconnector.app` |
| `PUBLIC_SITE_URL` | Public | Full URL for email links |
| `PUBLIC_DEPLOY_CONTEXT` | Public | Set per-context in `netlify.toml` — drives the EnvironmentBanner |

## Local Dev Auth

`IS_LOCAL` = `!NETLIFY_DATABASE_URL && NODE_ENV !== 'production'` (both guards required).

When `IS_LOCAL`:
- `hooks.server.ts` reads `dev_session` cookie instead of Netlify JWT
- `/dev-login` page (auto-redirects to `/` in production) lets you pick one of 3 seeded test users
- Test users: `performer@dev.local`, `coach@dev.local`, `newuser@dev.local`
- `.local-db/` is gitignored — each developer's local data is private

# Comedy Connector — Claude Context

Social platform for local comedy communities (performers, coaches, teams). Deploys free on Netlify; configurable per
city via env vars.

## Claude Instructions

- DO NOT COMMIT unless told specifically to do so

## UX Convention — Action Feedback

Whenever a user takes an action (form submit, approve, reject, delete, etc.), the frontend must show a clear result:
either a success confirmation (toast, redirect to result page, or both) or a descriptive error message. Never silently
succeed or fail.

When possible, redirect to the logical "result" page after an action:

- Editing a team → redirect to the team view page
- Approving/rejecting a request → refresh the approvals page (remove the resolved item)
- Creating something → redirect to the new item's view page

Use `toastStore.success(msg)` / `toastStore.error(msg)` for inline feedback, combined with `await update()` in
`use:enhance` callbacks to refresh page data.

## Commands

```bash
pnpm dev               # local dev server — connects to Supabase staging DB
pnpm build             # production build
pnpm check             # TypeScript + Svelte type checking (run after changes)
pnpm db:setup          # push schema + run all migrations (requires SUPABASE_DATABASE_URL in .env)
pnpm db:push           # push schema changes only (no migration files)
pnpm db:migrate        # apply SQL migration files only
pnpm db:generate       # generate migration files from schema changes (no DB connection needed)
pnpm db:studio         # Drizzle Studio GUI (requires SUPABASE_DATABASE_URL in .env)
pnpm db:seed:staging   # seed the Supabase staging DB with Muppets test data
```

## Agent Environment Notes

- New agent worktrees may start with a minimal shell where `node`, `npx`, `pnpm`, and `corepack` are not on `PATH`.
  First try the user's NVM installs under `$HOME/.nvm/versions/node`, e.g. choose a current LTS/current install and run
  `PATH="$HOME/.nvm/versions/node/<version>/bin:$PATH" corepack enable`, then run `pnpm`.
- Prefer the repo's declared package manager (`packageManager` in `package.json`) through Corepack. For this repo,
  `pnpm --version` should resolve to `10.30.1`.
- If `node` is needed only for tooling and NVM is unavailable, Codex may have a bundled runtime from
  `load_workspace_dependencies`, but it may not include `pnpm` or `corepack`.
- Networked package operations and audit calls often require explicit permission. If `pnpm audit`, `pnpm update`,
  `pnpm add`, or `pnpm install` fails with DNS/registry errors, rerun the same command with escalated permissions
  instead of working around the package manager.
- Starting `pnpm dev` may require permission to bind to localhost. If `listen EPERM` occurs, rerun with escalation.
  Stop any dev server you started before finishing the turn.
- macOS process inspection commands such as `ps` may be blocked by permissions. Track server sessions started by the
  agent and stop those sessions directly when possible.

**Note on `db:*` commands**: These require `SUPABASE_DATABASE_URL` to be set in `.env` (pointing to the Supabase staging or
production Transaction Pooler URL). The env var is gitignored.

**Local Development:**

1. `cp .env.example .env` and set `SUPABASE_DATABASE_URL` to the Supabase staging Transaction Pooler URL
2. `pnpm install && pnpm dev`
3. Navigate to `http://localhost:5173/dev-login` to pick a test user (seeded via `pnpm db:seed:staging`)

**⚠️ Auth note:**
Netlify Identity auth only works in production (domain-specific JWT cookie). Local dev uses a `dev_session` cookie
set by `/dev-login`. Phase 2 of the Supabase migration will replace Netlify Identity with Supabase Auth.

## Tech Stack

- **SvelteKit 2 + Svelte 5 runes** — `$state`, `$derived`, `$effect`, `$bindable`, `untrack()`
- **Tailwind v4 + Skeleton UI v4** — `@skeletonlabs/skeleton` + `@skeletonlabs/skeleton-svelte`
- **Drizzle ORM** on Supabase Postgres (staging + prod) via `postgres` package
- **Netlify Identity** — JWT auth (production only); decoded in `hooks.server.ts` → `event.locals.user`
- **Resend** — transactional email (contact form + monthly freshness reminders)
- **netlify-cli** — devDependency, accessed via `pnpm netlify <cmd>`

## Path Aliases (svelte.config.js)

| Alias         | Resolves to          |
|---------------|----------------------|
| `$lib`        | `src/lib`            |
| `$components` | `src/lib/components` |
| `$server`     | `src/lib/server`     |
| `$stores`     | `src/lib/stores`     |
| `$types`      | `src/lib/types`      |
| `$utils`      | `src/lib/utils`      |
| `$config`     | `src/lib/config`     |

## Key Files

| File                                      | Purpose                                                              |
|-------------------------------------------|----------------------------------------------------------------------|
| `src/hooks.server.ts`                     | Auth: `dev_session` cookie (local) or `nf_jwt` JWT (prod)            |
| `src/lib/server/db/index.ts`              | Drizzle client — Supabase Postgres via `postgres` package            |
| `src/lib/server/db/seed.ts`               | Muppets test dataset seeding logic (called by scripts/seed-staging.ts) |
| `src/lib/config/devUsers.ts`              | DEV_USERS list for /dev-login picker                                 |
| `src/lib/server/db/schema/`               | One file per entity + `relations.ts`                                 |
| `src/lib/server/search.ts`                | Full-text search with cursor pagination                              |
| `src/lib/server/email.ts`                 | Resend helpers                                                       |
| `src/lib/server/teams.ts`                 | Stub team creation + claim flow                                      |
| `src/lib/config/city.ts`                  | City name, domain, resource links (uses `$env/dynamic/public`)       |
| `netlify/functions/identity-signup.ts`    | Creates DB user on Netlify Identity signup (Phase 2: will be removed) |
| `netlify/functions/freshness-reminder.ts` | Monthly email cron (1st of month, 9am EST)                           |
| `scripts/seed-staging.ts`                 | CLI script: seed staging Supabase DB with Muppets data               |
| `src/routes/dev-login/`                   | Dev auth picker — redirects to `/` in production                     |

## Svelte 5 Patterns & Gotchas

- **Props derived from other props**: use `$derived`, not `const`
- **State initialized from prop (one-time snapshot)**: `let x = $state(untrack(() => prop))`
- **Skip first `$effect` run** (avoid re-fetching SSR data on hydration): use a plain `let isInitialRender = true` flag
- **Dynamic Tailwind classes**: ternary literals only — `x ? 'class-a' : 'class-b'` (no string interpolation)
- **Modal backdrops**: `<button class="fixed inset-0 ..." onclick={close}>` — NOT a `<div>` (avoids a11y warning)
- **Toast store**: `toastStore.success(msg)` / `toastStore.error(msg)` — NOT `.add({message, type})`
- **Services**: Abstract 3rd party integrations in `src/lib/services/`. Use these services to centralize logic like initialization and fallback behavior (e.g., logging to console if an API key is missing).
- **`import type` from `$server/*`** is safe in `.svelte` components (TypeScript erases types)
- **Env vars (server)**: use `$env/dynamic/private` (not static) in server modules
- **Netlify function imports**: use relative `.js` paths, e.g. `../../src/lib/server/db/schema/foo.js`

## Database Notes

- Schema-first with Drizzle — edit schema files, then `pnpm db:push` (requires `SUPABASE_DATABASE_URL` in `.env`)
- Migrations: `src/lib/server/db/migrations/` — `0000_initial_schema.sql` (tables) + `0001_add_fulltext_search.sql` (FTS)
- FTS: `tsvector` generated columns + GIN indexes on `personal_profiles`, `teams`, `coach_profiles`
- Team stub/claim lifecycle: `status = 'stub'` → performer references unknown team → any user can claim → `status = 'active'`
- Approval flow: team adds member/coach → `approval_status = 'pending'` → target user approves/rejects
- Supabase connection: use Transaction Pooler URL (port 6543) with `prepare: false` for serverless compatibility

## Env Vars

| Variable                | Scope  | Notes                                                                                      |
|-------------------------|--------|--------------------------------------------------------------------------------------------|
| `SUPABASE_DATABASE_URL`     | Server | Transaction Pooler URL (port 6543) — used by the app at runtime. Auto-set by Netlify–Supabase extension for prod/deploy-preview. Set staging URL in `.env` for local dev and in Netlify branch-deploy context. |
| `SUPABASE_DIRECT_URL`       | Server | Direct connection URL (port 5432) — used by drizzle-kit only (`db:push`, `db:studio`). Falls back to `SUPABASE_DATABASE_URL` if unset. Not needed in Netlify (drizzle-kit never runs there). |
| `SUPABASE_ANON_KEY`         | Server | Set automatically by Netlify–Supabase extension. Used by supabase-js (Phase 2+).          |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Set automatically by Netlify–Supabase extension. Server-only admin key (Phase 2+).        |
| `SUPABASE_JWT_SECRET`       | Server | Set automatically by Netlify–Supabase extension. Used for auth (Phase 2+).                |
| `RESEND_API_KEY`        | Server | Resend dashboard — not needed for local dev                                                |
| `FEEDBACK_EMAIL`        | Server | Destination address for `/feedback` form submissions                                       |
| `PUBLIC_CITY_NAME`      | Public | Defaults to `Pittsburgh`                                                                   |
| `PUBLIC_CITY_DOMAIN`    | Public | Defaults to `pittsburgh.comedyconnector.app`                                               |
| `PUBLIC_SITE_URL`       | Public | Full URL for email links                                                                   |
| `PUBLIC_DEPLOY_CONTEXT` | Public | Set per-context in `netlify.toml` — drives the EnvironmentBanner                          |

## Local Dev Auth

`IS_LOCAL` = `NODE_ENV !== 'production'`.

When `IS_LOCAL`:

- `hooks.server.ts` reads `dev_session` cookie set by `/dev-login`
- `/dev-login` page (auto-redirects to `/` in production) shows the Muppets test user picker
- Test users are seeded via `pnpm db:seed:staging` into the Supabase staging DB

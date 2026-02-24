# Comedy Connector — Claude Context

Social platform for local comedy communities (performers, coaches, teams). Deploys free on Netlify; configurable per city via env vars.

## Claude Instructions

- DO NOT COMMIT unless told specifically to do so

## Commands

```bash
pnpm dev:netlify   # dev server (required for DB env vars, but auth won't work locally)
pnpm build         # production build
pnpm check         # TypeScript + Svelte type checking (run after changes)
pnpm db:setup      # push schema + run all migrations (first-time / after migrations added)
pnpm db:push       # push schema changes only (no migration files)
pnpm db:migrate    # apply SQL migration files only
pnpm db:studio     # Drizzle Studio GUI
pnpm env:pull      # pull Netlify env vars into .env
```

**⚠️ Local Development Limitation:**
Netlify Identity authentication does NOT work in local development (the `nf_jwt` cookie is domain-specific). For testing authentication features, always use deploy previews. See `TROUBLESHOOTING_AUTH.md` for details.

## Tech Stack

- **SvelteKit 2 + Svelte 5 runes** — `$state`, `$derived`, `$effect`, `$bindable`, `untrack()`
- **Tailwind v4 + Skeleton UI v4** — `@skeletonlabs/skeleton` + `@skeletonlabs/skeleton-svelte`
- **Drizzle ORM** on Neon Postgres (via `@netlify/neon` HTTP driver)
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
| `src/hooks.server.ts` | Reads `nf_jwt` cookie/Bearer → sets `locals.user` |
| `src/lib/server/db/index.ts` | Drizzle client (neon HTTP driver) |
| `src/lib/server/db/schema/` | One file per entity + `relations.ts` |
| `src/lib/server/search.ts` | Full-text search with cursor pagination |
| `src/lib/server/email.ts` | Resend helpers |
| `src/lib/server/teams.ts` | Stub team creation + claim flow |
| `src/lib/config/city.ts` | City name, domain, resource links (uses `$env/dynamic/public`) |
| `netlify/functions/identity-signup.ts` | Creates DB user on Netlify Identity signup |
| `netlify/functions/freshness-reminder.ts` | Monthly email cron (1st of month, 9am EST) |

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

- Schema-first with Drizzle — edit schema files, then `pnpm db:push` (dev) or `pnpm db:generate` + `pnpm db:migrate` (prod)
- Custom FTS migration: `src/lib/server/db/migrations/0001_add_fulltext_search.sql` — adds `tsvector` generated columns + GIN indexes
- `db:push` + `db:migrate` are complementary: push handles schema, migrate handles custom SQL
- Team stub/claim lifecycle: `status = 'stub'` → performer references unknown team → any user can claim → `status = 'active'`
- Approval flow: team adds member/coach → `approval_status = 'pending'` → target user approves/rejects

## Env Vars

| Variable | Scope | Notes |
|----------|-------|-------|
| `NETLIFY_DATABASE_URL` | Server | Neon Postgres — set per deploy context in Netlify dashboard (see Database Environments below) |
| `NETLIFY_DATABASE_URL_IDENTITY` | Server | Identity/users database URL — set for **all contexts**. Used by identity-signup function to keep users consistent across environments. |
| `RESEND_API_KEY` | Server | Resend dashboard |
| `PUBLIC_CITY_NAME` | Public | Defaults to `Pittsburgh` |
| `PUBLIC_CITY_DOMAIN` | Public | Defaults to `pittsburgh.comedyconnector.app` |
| `PUBLIC_SITE_URL` | Public | Full URL for email links |
| `PUBLIC_DEPLOY_CONTEXT` | Public | `production` / `deploy-preview` / `branch-deploy` / `dev` — drives the env banner |

## Database Environments

**Shared Users, Separate Data**: The `users` table is shared across all environments (always in production DB), while all other tables (profiles, teams, etc.) are separate per environment. This allows:
- Same Identity users to log in to production and staging
- Consistent user IDs across environments
- Independent profile/team data for testing

Two Neon projects: one for production, one for staging.

### Environment Variable Setup

| Variable | Set in Netlify | Value |
|----------|----------------|-------|
| `NETLIFY_DATABASE_URL` | Per-context | Production DB for prod context, Staging DB for other contexts |
| `NETLIFY_DATABASE_URL_IDENTITY` | All contexts (same value) | Production DB URL (for identity-signup function to maintain shared users) |

### How It Works

| Deploy context | App uses (SvelteKit) | identity-signup uses | Result |
|----------------|----------------------|----------------------|--------|
| Production | Production DB | Production DB | Users + data in production |
| Deploy preview | Staging DB | Production DB | Shared users, staging data |
| Branch deploy | Staging DB | Production DB | Shared users, staging data |
| Local dev | Staging DB (from `.env`) | Production DB (from `.env`) | Shared users, staging data |

### Initial Setup

1. Run migrations on **both** databases:
   ```bash
   # Production database
   NETLIFY_DATABASE_URL="<prod-url>" pnpm db:setup
   
   # Staging database
   NETLIFY_DATABASE_URL="<staging-url>" pnpm db:setup
   ```

2. Copy users from production to staging (one-time):
   ```sql
   -- Connect to staging DB
   INSERT INTO users (id, identity_id, email, created_at, updated_at)
   SELECT id, identity_id, email, created_at, updated_at
   FROM production_users_table
   ON CONFLICT (identity_id) DO NOTHING;
   ```

`PUBLIC_DEPLOY_CONTEXT` is set per context in `netlify.toml` (non-secret label). The `EnvironmentBanner` component in `src/lib/components/layout/EnvironmentBanner.svelte` reads it and shows a banner on all non-production deploys.

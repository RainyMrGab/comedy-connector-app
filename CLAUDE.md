# Comedy Connector — Claude Context

Social platform for local comedy communities (performers, coaches, teams). Deploys free on Netlify; configurable per city via env vars.

## Commands

```bash
pnpm dev:netlify   # dev server (required for Identity + DB env vars)
pnpm build         # production build
pnpm check         # TypeScript + Svelte type checking (run after changes)
pnpm db:setup      # push schema + run all migrations (first-time / after migrations added)
pnpm db:push       # push schema changes only (no migration files)
pnpm db:migrate    # apply SQL migration files only
pnpm db:studio     # Drizzle Studio GUI
pnpm env:pull      # pull Netlify env vars into .env
```

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
| `NETLIFY_DATABASE_URL` | Server | Neon Postgres, auto-provisioned by Netlify DB |
| `RESEND_API_KEY` | Server | Resend dashboard |
| `PUBLIC_CITY_NAME` | Public | Defaults to `Pittsburgh` |
| `PUBLIC_CITY_DOMAIN` | Public | Defaults to `pittsburgh.comedyconnector.app` |
| `PUBLIC_SITE_URL` | Public | Full URL for email links |

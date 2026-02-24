# Comedy Connector

A social platform for local comedy communities — helping performers, coaches, and teams discover and connect with each
other.

Built as an open-source template that any city's comedy scene can deploy for free on Netlify.

## Project status

[![Netlify Status](https://api.netlify.com/api/v1/badges/5c07aaa7-bf97-416e-972c-1d3e68c3f393/deploy-status)](https://app.netlify.com/projects/comedy-connector-app/deploys)

## Features

- **Performer profiles** — training history, video highlights, interest flags (open to book openers, looking for team,
  seeking coach)
- **Coach profiles** — coaching bio, availability for private sessions / team coaching / workshops
- **Team profiles** — bio, video, roster management, recruiting members and coaches.
- **Approval workflow** — team admins add members/coaches; listed person must approve before it appears publicly
- **Connect modes** — Find a Book Opener, Join a Team, Find a Coach
- **Contact form** — authenticated-only contact dialog; sender's email set as reply-to (privacy-safe)
- **Freshness reminders** — monthly email to performers and team contacts to keep profiles updated

## Tech Stack

| Layer           | Technology                               |
|-----------------|------------------------------------------|
| Frontend        | SvelteKit 2 + Svelte 5 (runes)           |
| Styles          | Tailwind v4 + Skeleton UI v4             |
| Icons           | Lucide Svelte                            |
| Database        | Netlify DB (Neon Postgres) + Drizzle ORM |
| Auth            | Netlify Identity                         |
| Email           | Resend                                   |
| Deploy          | Netlify (free tier)                      |
| Package manager | pnpm 10                                  |

## Local Development

### Prerequisites

- Node 22+
- pnpm 10+

### Setup

```bash
# Install dependencies (includes netlify-cli as a devDependency)
pnpm install

# Copy environment file
cp .env.example .env
# Fill in NETLIFY_DATABASE_URL (see below)

# Push schema + run all migrations
pnpm db:setup

# Start dev server (netlify dev enables Identity + DB env vars)
pnpm dev:netlify
```

### Environment Variables

| Variable               | Required             | Description                                        |
|------------------------|----------------------|----------------------------------------------------|
| `NETLIFY_DATABASE_URL` | Yes                  | Neon Postgres connection string                    |
| `RESEND_API_KEY`       | Yes (email features) | Resend API key for contact + reminder emails       |
| `PUBLIC_CITY_NAME`     | No                   | City name (default: `Pittsburgh`)                  |
| `PUBLIC_CITY_DOMAIN`   | No                   | Domain (default: `pittsburgh.comedyconnector.app`) |
| `PUBLIC_SITE_URL`      | No                   | Full site URL for email links                      |

**Getting your database URL locally:**

```bash
pnpm netlify login
pnpm netlify link   # link to your Netlify site
```

### Useful Scripts

```bash
pnpm dev:netlify   # dev server with Netlify Identity + DB env vars
pnpm dev           # vite dev server only (no Identity/DB)
pnpm build         # production build
pnpm check         # TypeScript + Svelte type checking
pnpm db:setup      # push schema + run all migrations (first-time setup)
pnpm db:push       # push schema to DB (schema changes only, no migration files)
pnpm db:migrate    # run pending SQL migration files
pnpm db:generate   # generate SQL migration files from schema diff
pnpm db:studio     # open Drizzle Studio (DB GUI)
```

## Deployment

### Netlify (Recommended — Free Tier)

1. Fork this repo
2. **Create two Neon projects** (free tier on [neon.tech](https://neon.tech)):
    - One for production (e.g., `comedy-connector-prod`)
    - One for staging (e.g., `comedy-connector-staging`)
    - Copy the connection strings for each
3. **New site → Import from Git** on Netlify
4. **Enable Netlify Identity**: Site settings → Identity → Enable
5. Set environment variables in Site settings → Environment variables:
    - Set these **per deploy context** (different values per context):
        - `NETLIFY_DATABASE_URL`:
            - **Production**: `<production-db-url>`
            - **Deploy preview**: `<staging-db-url>`
            - **Branch deploy**: `<staging-db-url>`
    - Set these **for all contexts** (same value everywhere):
        - `NETLIFY_DATABASE_URL_IDENTITY`: `<production-db-url>` (used by Identity signup for shared users)
        - `RESEND_API_KEY` — from [resend.com](https://resend.com)
        - `PUBLIC_CITY_NAME` — your city (e.g., `Chicago`)
        - `PUBLIC_CITY_DOMAIN` — your domain
        - `PUBLIC_SITE_URL` — `https://your-domain.com`
    
6. After first deploy, run migrations against **each database**:
   ```bash
   # Production database
   NETLIFY_DATABASE_URL=<prod-db-url> pnpm db:setup
   
   # Staging database
   NETLIFY_DATABASE_URL=<staging-db-url> pnpm db:setup
   ```

7. **(Optional) Copy existing users to staging** if you already have production users:
   ```sql
   -- Connect to your staging database and run:
   INSERT INTO users (id, identity_id, email, created_at, updated_at)
   SELECT id, identity_id, email, created_at, updated_at
   FROM <production_db>.users
   ON CONFLICT (identity_id) DO NOTHING;
   ```

Pushes to `main` auto-deploy to production. Pull requests create deploy previews using the staging database.

**How it works:** 
- **Shared users**: Identity signups always write to the production database, so user IDs are consistent across environments
- **Separate data**: All other tables (profiles, teams, etc.) are environment-specific
- **Benefits**: Same users can log in to both prod and staging, but with different profile/team data for testing

## Customizing for Your City

1. Update resource links in `src/lib/config/city.ts`
2. Set `PUBLIC_CITY_NAME`, `PUBLIC_CITY_DOMAIN`, `PUBLIC_SITE_URL` on Netlify
3. Update the GitHub footer URL in `src/lib/components/layout/Footer.svelte`
4. Optionally customize theme colors in `src/app.css` (`@layer theme`)

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── contact/    ContactDialog.svelte
│   │   ├── layout/     Header, Footer
│   │   ├── search/     SearchBar, FilterPanel, ResultCard, ResultsList (infinite scroll)
│   │   └── ui/         Toast, LoadingSpinner, EmptyState, ConfirmDialog
│   ├── config/city.ts  City config + resource links
│   ├── server/
│   │   ├── db/         Drizzle schema, migrations, client
│   │   ├── auth.ts     JWT decode + user resolution (hooks.server.ts middleware)
│   │   ├── email.ts    Resend helpers (contact message, freshness reminder)
│   │   ├── profiles.ts Profile lookup by slug/user
│   │   ├── search.ts   Full-text search + cursor pagination
│   │   └── teams.ts    Team helpers (stub creation, claim flow)
│   └── stores/         auth, toast (Svelte 5 $state runes)
├── routes/
│   ├── api/            contact/, search/, approvals/[id], profiles/search
│   ├── approvals/      Pending approvals dashboard
│   ├── coaches/        Browse + [slug] public view
│   ├── connect/        Landing + book-opener/ + join-team/ + find-coach/
│   ├── performers/     Browse + [slug] public view
│   ├── profile/        Own profile CRUD (edit, performer, coach)
│   ├── resources/      Community links
│   └── teams/          Browse + create/ + [slug] view/edit/claim
netlify/
└── functions/
    ├── identity-signup.ts      DB user creation on Netlify Identity signup
    └── freshness-reminder.ts   Monthly reminder cron (0 14 1 * *)
```

## Future Features

Designed for but not yet implemented:

- Photo upload via Netlify Blobs
- Pull coach bios from Google Sheet or external source
- Calendar integration for coach availability
- Multi-city admin dashboard

## License

See [LICENSE](LICENSE).

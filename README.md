# Comedy Connector

A social platform for local comedy communities — helping performers, coaches, and teams discover and connect with each other.

Built as an open-source template that any city's comedy scene can deploy for free on Netlify + Supabase.

## Project status

[![Netlify Status](https://api.netlify.com/api/v1/badges/5c07aaa7-bf97-416e-972c-1d3e68c3f393/deploy-status)](https://app.netlify.com/projects/comedy-connector-app/deploys)

## Features

- **Performer profiles** — training history, video highlights, interest flags (open to book openers, looking for team, seeking coach)
- **Coach profiles** — coaching bio, availability for private sessions / team coaching / workshops
- **Team profiles** — bio, video, roster management, recruiting members and coaches
- **Approval workflow** — team admins add members/coaches; listed person must approve before it appears publicly
- **Connect modes** — Find a Book Opener, Join a Team, Find a Coach
- **Contact form** — authenticated-only contact dialog; sender's email set as reply-to (privacy-safe)
- **Photo uploads** — profile photos, team photos, and performer highlight images via Supabase Storage
- **Freshness reminders** — monthly email to performers and team contacts to keep profiles updated

## Tech Stack

| Layer           | Technology                                              |
|-----------------|---------------------------------------------------------|
| Frontend        | SvelteKit 2 + Svelte 5 (runes)                          |
| Styles          | Tailwind v4 + Skeleton UI v4                            |
| Icons           | Lucide Svelte                                           |
| Database        | Supabase Postgres + Drizzle ORM                         |
| Auth            | Supabase Auth (email/password + Google OAuth)           |
| Storage         | Supabase Storage                                        |
| Email           | Resend                                                  |
| Deploy          | Netlify (free tier)                                     |
| Package manager | pnpm 10                                                 |

## Local Development

### Prerequisites

- Node 22+
- pnpm 10+
- A Supabase account with a staging project ([supabase.com](https://supabase.com))

### Setup

```bash
# Install dependencies
pnpm install

# Copy environment file and fill in your Supabase staging credentials
cp .env.example .env

# Push the schema to your staging Supabase project
pnpm db:push

# Seed staging with Muppets test users
pnpm db:seed:staging

# Start local dev server
pnpm dev
```

Navigate to `http://localhost:5173/dev-login` to pick a test user and start exploring.

### Local Auth

In local dev (`pnpm dev`), `/login` redirects to `/dev-login` — a test user picker that signs in via Supabase Auth using a shared `DEV_USER_PASSWORD`. This page is blocked on all Netlify contexts (deploy preview, branch, production).

```
http://localhost:5173/dev-login
```

Test users seeded by `pnpm db:seed:staging`:
- **Kermit the Frog** — performer, team member
- **Miss Piggy** — performer, team member
- **Fozzie Bear** — performer, coach, admin
- *(and more Muppets)*

### Testing prod mode locally

To test the real login/signup flow locally (no dev-login shortcut) while still pointing at your staging database:

```bash
pnpm dev:prod
```

This sets `PUBLIC_DEPLOY_CONTEXT=preview` so the app behaves like a deploy preview — real Supabase Auth, no `/dev-login`. Use the email/password you set during `pnpm db:seed:staging` (`DEV_USER_PASSWORD`) to sign in.

### Environment Variables

| Variable                | Required locally | Description                                                           |
|-------------------------|------------------|-----------------------------------------------------------------------|
| `SUPABASE_DATABASE_URL` | **Yes**          | Transaction Pooler URL (port 6543) from your staging Supabase project |
| `SUPABASE_DIRECT_URL`   | No               | Direct URL (port 5432) — used by `db:push` and `db:studio` only      |
| `SUPABASE_URL`          | **Yes**          | Your staging project API URL (`https://xxxx.supabase.co`)             |
| `SUPABASE_ANON_KEY`     | **Yes**          | Staging anon/publishable key                                          |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes**      | Staging service role/secret key (for seed script and file uploads)    |
| `DEV_USER_PASSWORD`     | **Yes**          | Shared password for all seeded test users                             |
| `RESEND_API_KEY`        | No               | Resend API key for contact + reminder emails                          |
| `PUBLIC_CITY_NAME`      | No               | City name (default: `Pittsburgh`)                                     |
| `PUBLIC_CITY_DOMAIN`    | No               | Domain (default: `pittsburgh.comedyconnector.app`)                    |
| `PUBLIC_SITE_URL`       | No               | Full site URL for email links                                         |

### Scripts

```bash
pnpm dev               # local dev — connects to Supabase staging, /dev-login auth
pnpm dev:prod          # local dev in "prod mode" — real login flow, no /dev-login
pnpm build             # production build
pnpm check             # TypeScript + Svelte type checking
pnpm db:push           # push schema changes to Supabase (uses SUPABASE_DIRECT_URL)
pnpm db:studio         # Drizzle Studio GUI (uses SUPABASE_DIRECT_URL)
pnpm db:seed:staging   # seed staging DB + create Supabase Auth test users
```

### Resetting staging data

```bash
# Re-run the seed script (it upserts, so it's safe to run multiple times)
pnpm db:seed:staging
```

## Deployment

### Netlify + Supabase (Free Tier)

1. **Fork this repo**
2. **New site → Import from Git** on Netlify
3. **Create two Supabase projects**: one for production, one for staging
4. **Install the Netlify–Supabase extension**: Netlify dashboard → Integrations → Supabase → Install → connect to your production project. This auto-sets `SUPABASE_DATABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_JWT_SECRET` for the production and deploy-preview contexts.
5. **Set remaining environment variables** in Netlify dashboard → Site configuration → Environment variables:
   - `SUPABASE_URL` — `https://YOUR_PROD_PROJECT_REF.supabase.co` (production context)
   - `SUPABASE_URL` — `https://YOUR_STAGING_PROJECT_REF.supabase.co` (branch-deploy context)
   - `SUPABASE_DATABASE_URL` — staging Transaction Pooler URL (branch-deploy context override)
   - `RESEND_API_KEY` — from [resend.com](https://resend.com)
   - `PUBLIC_CITY_NAME`, `PUBLIC_CITY_DOMAIN`, `PUBLIC_SITE_URL`
6. **Apply the auth trigger SQL** in both Supabase projects' SQL editors (see `docs/supabase-triggers.sql`)
7. **Push the schema** to both projects:
   ```bash
   # Staging (reads SUPABASE_DIRECT_URL from .env)
   pnpm db:push

   # Production (pass the prod direct URL)
   SUPABASE_DIRECT_URL=<prod_direct_url> pnpm db:push
   ```
8. **Seed staging**: `pnpm db:seed:staging`

Pushes to `main` auto-deploy to production. Deploy previews run against production Supabase data.

See `docs/supabase-migration-guide.md` for the full step-by-step setup runbook.

## Invite-Only / Beta Mode

Supabase Auth supports invite-only signup. To restrict registration to invited users:

1. **Disable public signups**: Supabase dashboard → Authentication → Providers → Email → uncheck "Enable sign ups". Do this for both staging and production projects.

2. **Invite a user** (no code needed): Supabase dashboard → Authentication → Users → "Invite user" → enter their email address. Supabase sends them a one-time magic link.

3. **What the invitee sees**: They click the link in their email → are automatically signed in → redirected to `/profile`. Their account has no password yet.

4. **Setting a password**: After the initial sign-in, they use **Forgot password?** on the login page to receive a password reset email, then set a permanent password via the `/auth/set-password` page.

> **Google OAuth bypass**: If you also have Google OAuth enabled, invited users can skip the password setup and sign in with Google instead. Their invite automatically links to their Google account via matching email address.

## Customizing for Your City

1. Create a resource file at `src/lib/config/resources/[your-city].ts` (copy `pittsburgh.ts` as a starting point)
2. Update the import in `src/lib/config/city.ts` to point to your file
3. Set `PUBLIC_CITY_NAME`, `PUBLIC_CITY_DOMAIN`, `PUBLIC_SITE_URL` in Netlify
4. Set `FEEDBACK_EMAIL` (server env var) to the address feedback should go to
5. Optionally customize theme colors in `src/app.css` (`@layer theme`)

## Add Your City

Want to run Comedy Connector for your city? Here's how:

1. **Open an issue** on [GitHub](https://github.com/RainyMrGab/comedy-connector-app/issues) to let us know which city you're setting up — we're happy to help
2. Fork the repo and follow the [Deployment](#deployment) and [Customizing for Your City](#customizing-for-your-city) sections
3. Create `src/lib/config/resources/[your-city].ts` with your local links (use `pittsburgh.ts` as a template)
4. Update the import in `src/lib/config/city.ts`
5. Make a PR to contribute your city resources back to the repo. Ideally there are not code changes in the forks so it's easy for you to keep your fork updated.

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── contact/    ContactDialog.svelte
│   │   ├── layout/     Header, Footer
│   │   ├── search/     SearchBar, FilterPanel, ResultCard, ResultsList (infinite scroll)
│   │   └── ui/         Toast, LoadingSpinner, EmptyState, ConfirmDialog, PhotoPicker
│   ├── config/
│   │   ├── city.ts          City config (name, domain, siteUrl, resources)
│   │   ├── devUsers.ts      Seeded test users for /dev-login
│   │   └── resources/       Per-city resource link files
│   ├── server/
│   │   ├── db/         Drizzle schema, migrations, client
│   │   ├── supabase.ts Server Supabase client factory (session + admin)
│   │   ├── auth.ts     User lookup by Supabase Auth UUID
│   │   ├── email.ts    Resend helpers (contact message, freshness reminder)
│   │   ├── profiles.ts Profile lookup by slug/user
│   │   ├── search.ts   Full-text search + cursor pagination
│   │   └── teams.ts    Team helpers (stub creation, claim flow)
│   ├── stores/         auth, toast (Svelte 5 $state runes)
│   └── utils/          highlights.ts, dates.ts, validation.ts
├── routes/
│   ├── api/            contact/, search/, approvals/[id], profiles/search, upload/
│   ├── auth/           callback/ (OAuth), set-password/
│   ├── approvals/      Pending approvals dashboard
│   ├── coaches/        Browse + [slug] public view
│   ├── connect/        Landing + book-opener/ + join-team/ + find-coach/
│   ├── dev-login/      Test user picker (local dev only)
│   ├── performers/     Browse + [slug] public view
│   ├── profile/        Own profile CRUD (edit, performer, coach)
│   ├── resources/      Community links
│   └── teams/          Browse + create/ + [slug] view/edit/claim
netlify/
└── functions/
    └── freshness-reminder.ts   Monthly reminder cron (1st–7th of month)
docs/
├── supabase-migration-guide.md  Full setup + migration runbook
└── supabase-triggers.sql        Auth trigger SQL (apply in Supabase SQL editor)
```

## License

See [LICENSE](LICENSE).

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

| Layer           | Technology                                                    |
|-----------------|---------------------------------------------------------------|
| Frontend        | SvelteKit 2 + Svelte 5 (runes)                                |
| Styles          | Tailwind v4 + Skeleton UI v4                                  |
| Icons           | Lucide Svelte                                                 |
| Database        | PGLite (local dev) / Neon Postgres (production) + Drizzle ORM |
| Auth            | Netlify Identity                                              |
| Email           | Resend                                                        |
| Deploy          | Netlify (free tier)                                           |
| Package manager | pnpm 10                                                       |

## Local Development

### Prerequisites

- Node 22+
- pnpm 10+

### Setup

```bash
# Install dependencies (includes netlify-cli as a devDependency)
pnpm install

# Copy environment file (leave NETLIFY_DATABASE_URL commented out)
cp .env.example .env

# Start local dev server — PGLite auto-initializes on first request
pnpm dev
```

On first startup, the app creates `.local-db/` (a local Postgres-compatible file database powered
by [PGLite](https://pglite.dev)) and seeds 3 test users. Navigate to `http://localhost:5173/dev-login` to select a test
user and start exploring.

> **No database account or external service needed** for local development.

### Local Auth

Since Netlify Identity cookies are domain-specific and won't work on `localhost`, a simple dev login page is provided:

- `http://localhost:5173/dev-login` — pick from 3 seeded test users
- **Dev Performer** — has a full performer profile
- **Dev Coach** — has a full coach profile
- **New User** — no profile (tests the onboarding flow)
- This page automatically redirects to `/` in production (not exploitable remotely)

### Environment Variables

| Variable               | Required locally     | Description                                        |
|------------------------|----------------------|----------------------------------------------------|
| `NETLIFY_DATABASE_URL` | **No** — uses PGLite | Neon Postgres. Leave unset to use local PGLite.    |
| `RESEND_API_KEY`       | No (email features)  | Resend API key for contact + reminder emails       |
| `PUBLIC_CITY_NAME`     | No                   | City name (default: `Pittsburgh`)                  |
| `PUBLIC_CITY_DOMAIN`   | No                   | Domain (default: `pgh.comedyconnector.app`)        |
| `PUBLIC_SITE_URL`      | No                   | Full site URL for email links                      |

### Useful Scripts

```bash
pnpm dev               # local dev — PGLite file DB, /dev-login auth
pnpm dev:netlify       # dev via Netlify CLI — uses production Neon DB + Identity auth
pnpm build             # production build
pnpm check             # TypeScript + Svelte type checking
pnpm db:setup          # push schema + run all migrations (production Neon DB)
pnpm db:push           # push schema to production DB (no migration files)
pnpm db:migrate        # run pending SQL migration files on production DB
pnpm db:generate       # generate SQL migration files from schema diff
pnpm db:studio         # Drizzle Studio GUI (production Neon DB)
pnpm db:studio:local   # Drizzle Studio GUI (local PGLite at .local-db/)
```

### Resetting local data

```bash
rm -rf .local-db/
pnpm dev   # PGLite recreates and re-seeds automatically on first request
```

## Deployment

### Netlify (Recommended — Free Tier)

1. Fork this repo
2. **New site → Import from Git** on Netlify
3. **Enable Netlify DB**: Site settings → Database → Enable (auto-provisions Neon Postgres)
4. **Enable Netlify Identity**: Site settings → Identity → Enable
5. Set environment variables in Site settings → Environment variables:
    - `RESEND_API_KEY` — from [resend.com](https://resend.com)
    - `PUBLIC_CITY_NAME` — your city (e.g., `Chicago`)
    - `PUBLIC_CITY_DOMAIN` — your domain
    - `PUBLIC_SITE_URL` — `https://your-domain.com`
6. After first deploy, run all migrations:
   ```bash
   NETLIFY_DATABASE_URL=<your-db-url> pnpm db:setup
   ```
   (then run `pnpm db:setup`)

Pushes to `main` auto-deploy. Netlify Identity handles user registration.

## Customizing for Your City

1. Create a resource file at `src/lib/config/resources/[your-city].ts` (copy `pittsburgh.ts` as a starting point)
2. Update the import in `src/lib/config/city.ts` to point to your file
3. Set `PUBLIC_CITY_NAME`, `PUBLIC_CITY_DOMAIN`, `PUBLIC_SITE_URL` on Netlify
4. Set `FEEDBACK_EMAIL` (server env var) to the address feedback should go to
5. Optionally customize theme colors in `src/app.css` (`@layer theme`)

## Add Your City

Want to run Comedy Connector for your city? Here's how:

1. **Open an issue** on [GitHub](https://github.com/RainyMrGab/comedy-connector-app/issues) to let us know which city
   you're setting up — we're happy to help
2. Fork the repo and follow the [Deployment](#deployment) and [Customizing for Your City](#customizing-for-your-city)
   sections
3. Create `src/lib/config/resources/[your-city].ts` with your local links (use `pittsburgh.ts` as a template)
4. Update the import in `src/lib/config/city.ts`
5. Make a PR to contribute your city resources back to the repo. Ideally there are not code changes in the forks so 
   it's easy for you to keep your fork updated.
6. This process is new, be patient.

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── contact/    ContactDialog.svelte
│   │   ├── layout/     Header, Footer
│   │   ├── search/     SearchBar, FilterPanel, ResultCard, ResultsList (infinite scroll)
│   │   └── ui/         Toast, LoadingSpinner, EmptyState, ConfirmDialog
│   ├── config/
│   │   ├── city.ts          City config (name, domain, siteUrl, resources)
│   │   └── resources/       Per-city resource link files
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

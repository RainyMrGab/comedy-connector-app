# Comedy Connector

A social platform for local comedy communities — helping performers, coaches, and teams discover and connect with each other.

Built as an open-source template that any city's comedy scene can deploy for free on Netlify.

## Features

- **Performer profiles** — training history, video highlights, interest flags (open to book openers, looking for team, seeking coach)
- **Coach profiles** — coaching bio, availability for private sessions / team coaching / workshops
- **Team profiles** — roster management, stub teams (auto-created from performer references, claimable)
- **Approval workflow** — team admins add members/coaches; listed person must approve before it appears publicly
- **Full-text search** — Postgres tsvector + GIN indexes, cursor-based infinite scroll
- **Connect modes** — Find a Book Opener, Join a Team, Find a Coach
- **Contact form** — authenticated-only contact dialog; sender's email set as reply-to (privacy-safe)
- **Freshness reminders** — monthly email to performers and team contacts to keep profiles updated

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | SvelteKit 2 + Svelte 5 (runes) |
| Styles | Tailwind v4 + Skeleton UI v4 |
| Icons | Lucide Svelte |
| Database | Netlify DB (Neon Postgres) + Drizzle ORM |
| Auth | Netlify Identity |
| Email | Resend |
| Deploy | Netlify (free tier) |
| Package manager | pnpm 10 |

## Local Development

### Prerequisites

- Node 22+
- pnpm 10+
- Netlify CLI (`npm i -g netlify-cli`)

### Setup

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env
# Fill in NETLIFY_DATABASE_URL (see below)

# Push schema to database
pnpm db:push

# Apply full-text search migration (Phase 6)
psql $NETLIFY_DATABASE_URL < src/lib/server/db/migrations/0001_add_fulltext_search.sql

# Start dev server (use netlify dev for Identity + DB)
netlify dev
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NETLIFY_DATABASE_URL` | Yes | Neon Postgres connection string |
| `RESEND_API_KEY` | Yes (email features) | Resend API key for contact + reminder emails |
| `PUBLIC_CITY_NAME` | No | City name (default: `Pittsburgh`) |
| `PUBLIC_CITY_DOMAIN` | No | Domain (default: `pittsburgh.comedyconnector.app`) |
| `PUBLIC_SITE_URL` | No | Full site URL for email links |

**Getting your database URL locally:**

```bash
netlify login
netlify link        # link to your Netlify site
netlify env:pull .env
```

### Useful Scripts

```bash
pnpm dev           # dev server (or: netlify dev)
pnpm build         # production build
pnpm check         # TypeScript + Svelte type checking
pnpm db:push       # push schema to DB (no migration file)
pnpm db:generate   # generate SQL migration files
pnpm db:studio     # open Drizzle Studio (DB GUI)
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
6. After first deploy, run the FTS migration:
   ```bash
   psql $NETLIFY_DATABASE_URL < src/lib/server/db/migrations/0001_add_fulltext_search.sql
   ```

Pushes to `main` auto-deploy. Netlify Identity handles user registration.

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

MIT

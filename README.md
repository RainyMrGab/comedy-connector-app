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
# Edit .env and fill in your database URLs (see below)

# Push schema + run all migrations
pnpm db:setup

# Link to your Netlify site (for local dev with Identity)
pnpm netlify login
pnpm netlify link

# Start dev server
pnpm dev:netlify
```

#### Local Development with Authentication

**⚠️ Important:** Netlify Identity authentication has limitations in local development. The `netlify dev` command proxies requests through Netlify's servers to enable Identity, but there are caveats:

**What Works:**
- ✅ Login/signup flows (proxied through Netlify)
- ✅ Database connections
- ✅ API routes and server-side rendering
- ✅ Environment variables from your linked site

**What's Tricky:**
- ⚠️ The `nf_jwt` cookie is set for your Netlify domain, not `localhost`
- ⚠️ Browser may not send the cookie on every request
- ⚠️ Hot reload can break the auth state
- ⚠️ Some Identity widget features may not work consistently

**Best Practices:**

1. **For UI/Component Development:** Use `pnpm dev:netlify` and work around auth
2. **For Authentication Testing:** Use deploy previews (push your branch and test on the preview URL)

**Alternative: Make Local Auth More Reliable**

If you need more reliable local authentication for development:

```bash
# 1. Start Netlify dev with live session
pnpm dev:netlify

# 2. In netlify.toml, ensure [dev] section is configured:
[dev]
  command = "pnpm run dev"
  port = 8888          # External port (Netlify proxy)
  targetPort = 5173    # Your Vite dev server
  autoLaunch = false

# 3. After login, the proxy should maintain your session
# 4. If it breaks, log out and back in via the widget
```

**Why Deploy Previews Are Better:**

Deploy previews provide a production-like environment where:
- ✅ Netlify Identity works exactly as in production
- ✅ All features are fully functional
- ✅ Fast deployment (usually < 2 minutes)
- ✅ Unique URL for each branch/PR
- ✅ No local environment quirks

**Recommended Workflow:**
1. Develop UI/components locally with `pnpm dev:netlify`
2. Push branch when you need to test authentication
3. Test thoroughly on deploy preview
4. Iterate and repeat

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
# Development
pnpm dev:netlify   # Netlify dev server (proxies auth, loads env vars from linked site)
pnpm dev           # Vite dev server only (faster, but no Identity/remote env vars)

# Building
pnpm build         # Production build
pnpm preview       # Preview production build locally

# Quality
pnpm check         # TypeScript + Svelte type checking

# Database
pnpm db:setup      # Push schema + run all migrations (first-time setup)
pnpm db:push       # Push schema changes to DB (no migration files)
pnpm db:migrate    # Run pending SQL migration files
pnpm db:generate   # Generate SQL migration files from schema diff
pnpm db:studio     # Open Drizzle Studio (visual DB GUI)

# Netlify CLI
pnpm netlify login      # Authenticate with Netlify
pnpm netlify link       # Link to a Netlify site
pnpm netlify env:pull   # Pull environment variables to .env
pnpm netlify dev        # Same as dev:netlify
```

**When to use which dev command:**

- **`pnpm dev:netlify`** - When you need env vars from Netlify or want to test with auth (with caveats)
- **`pnpm dev`** - When doing pure UI work and want faster hot reload

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

## Understanding Netlify Dev Proxy

The `netlify dev` command (aliased as `pnpm dev:netlify`) runs a local proxy server that attempts to replicate the Netlify production environment:

### How It Works

```
Browser (localhost:8888)
    ↓
Netlify CLI Proxy
    ↓ proxies requests to ↓
    ├─→ Netlify Identity (for auth)
    ├─→ Netlify Functions
    └─→ Your Vite Dev Server (localhost:5173)
```

**What the proxy does:**
1. Forwards requests to Netlify's authentication service
2. Injects environment variables from your linked site
3. Simulates serverless function execution
4. Proxies everything else to your local Vite server

### Authentication Flow with Netlify Dev

When you use `netlify dev`:

1. **Login/Signup:** Widget opens and communicates with Netlify's servers
2. **Token Creation:** Netlify creates a JWT token for your session
3. **Cookie Setting:** The `nf_jwt` cookie is set
4. **The Problem:** Cookie is scoped to `your-site.netlify.app`, NOT `localhost:8888`
5. **Result:** Some requests include the cookie, some don't (browser inconsistency)

### Why Authentication Is Unreliable Locally

**Technical Reasons:**

1. **Cookie Domain Mismatch:**
   - Identity widget sets cookie for `*.netlify.app`
   - Your browser at `localhost:8888` may or may not send it
   - Depends on browser, security settings, and request type

2. **Hot Module Replacement:**
   - Vite's HMR can cause auth state to reset
   - Page refreshes may lose authentication
   - Requires manual re-login

3. **Proxy Limitations:**
   - Some Identity widget features expect a real Netlify domain
   - Webhooks (like identity-signup) won't fire locally
   - Email confirmation flows don't work

### Making Local Auth More Reliable

If you need local authentication for development, here are some strategies:

#### Option 1: Use Session Storage (Most Reliable)

The Netlify CLI automatically tries to maintain your session. To improve reliability:

```bash
# 1. Make sure you're linked to your site
pnpm netlify link

# 2. Start dev server
pnpm dev:netlify

# 3. Access via the proxy URL shown (usually http://localhost:8888)
# DO NOT use localhost:5173 directly

# 4. Log in via the Identity widget
# 5. If auth breaks, log out and back in
```

#### Option 2: Use a Test Account

Create a dedicated test account for local development:

```bash
# In your Netlify site dashboard:
# Identity → Invite users → Add test@example.com
# Use this account exclusively for local testing
```

#### Option 3: Mock Authentication (For UI Development)

For UI work that doesn't need real auth:

```typescript
// In src/hooks.server.ts (temporarily)
export const handle: Handle = async ({ event, resolve }) => {
    // DEVELOPMENT ONLY - REMOVE BEFORE COMMITTING
    if (process.env.NODE_ENV === 'development') {
        event.locals.user = {
            id: 'dev-user-id',
            email: 'dev@example.com',
            identityId: 'dev-identity-id',
            createdAt: new Date(),
            updatedAt: new Date()
        };
    } else {
        const cookieToken = event.cookies.get('nf_jwt');
        const authHeader = event.request.headers.get('authorization');
        event.locals.user = await resolveUser(cookieToken, authHeader);
    }
    return resolve(event);
};
```

**⚠️ WARNING:** Never commit mocked auth to production!

### When to Use Deploy Previews Instead

**Always use deploy previews for:**
- ✅ Testing authentication flows
- ✅ Verifying user signup/login
- ✅ Testing identity webhooks
- ✅ Email confirmation flows
- ✅ Production-like behavior
- ✅ Final QA before merging

**Deploy previews are fast:**
- Usually build in < 2 minutes
- Unique URL per branch/PR
- Automatic builds on push
- Full Netlify Identity support

### Debugging Local Auth Issues

If authentication isn't working locally:

1. **Check the proxy is running:**
   ```bash
   # You should see:
   # ◈ Server now ready on http://localhost:8888
   ```

2. **Verify you're linked:**
   ```bash
   pnpm netlify link:show
   # Should show your site name
   ```

3. **Check for the JWT cookie:**
   - Open DevTools → Application → Cookies
   - Look for `nf_jwt` cookie
   - If missing, try logging out and back in

4. **Check server logs:**
   - Look for `[auth] No JWT token found` in terminal
   - This means the cookie isn't being sent

5. **Use the debug page:**
   - Visit `http://localhost:8888/auth-debug`
   - Shows server and client auth state

### Environment Variables in Local Dev

The Netlify CLI can pull environment variables from your linked site:

```bash
# One-time: Pull env vars from Netlify
pnpm netlify env:pull

# This creates/updates .env with your site's environment variables
# However, you should manually set database URLs in .env for local dev
```

**Recommended .env for local development:**

```bash
# Use staging database for app data
NETLIFY_DATABASE_URL=postgresql://...staging-db...

# Use production database for users table  
NETLIFY_DATABASE_URL_IDENTITY=postgresql://...production-db...

# Other env vars pulled from Netlify
RESEND_API_KEY=...
PUBLIC_CITY_NAME=...
PUBLIC_SITE_URL=...
```

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

## Troubleshooting

### "My Profile" Link Not Showing

**Problem:** You're logged in (Identity popup appears) but the "My Profile" link doesn't show in the navigation.

**Diagnosis:**
1. Visit `/auth-debug` while logged in
2. Check what it says for "Server-Side" and "Client-Side"

**Common Causes:**

- **Testing locally:** Authentication is unreliable on `localhost`. → **Solution:** Test on a deploy preview
- **Environment variable not set:** `NETLIFY_DATABASE_URL_IDENTITY` is missing → **Solution:** Set it in Netlify dashboard
- **User not in database:** Identity signup function failed or didn't run → **Solution:** Delete user and re-signup, or manually create user record

**Detailed troubleshooting:** See `TROUBLESHOOTING_AUTH.md`

### Build Fails: "NETLIFY_DATABASE_URL not set"

**Problem:** Build fails with database connection error.

**Solution:** This was fixed with lazy database initialization. Make sure you have the latest code:
- Check that `src/lib/server/db/index.ts` uses lazy initialization with Proxy
- The database connection shouldn't be created at build time

### Local Dev: Database Connection Fails

**Problem:** `NETLIFY_DATABASE_URL environment variable is not set`

**Solutions:**

1. **Create/update `.env` file:**
   ```bash
   cp .env.example .env
   # Edit .env with your database URLs
   ```

2. **Pull from Netlify (if linked):**
   ```bash
   pnpm netlify link
   pnpm netlify env:pull
   ```

3. **Link to your site first:**
   ```bash
   pnpm netlify login
   pnpm netlify link
   ```

### Identity Widget Not Loading

**Problem:** The login/signup dialog doesn't appear.

**Causes & Solutions:**

1. **Not linked to a Netlify site:**
   ```bash
   pnpm netlify link
   ```

2. **Identity not enabled:** Go to Netlify dashboard → Site settings → Identity → Enable

3. **Testing locally:** Identity widget may not load properly on localhost → Use deploy preview

### Database Migrations Not Running

**Problem:** Tables don't exist or schema is outdated.

**Solution:**

```bash
# For production database
NETLIFY_DATABASE_URL="<prod-url>" pnpm db:setup

# For staging database  
NETLIFY_DATABASE_URL="<staging-url>" pnpm db:setup

# Or use push for quick schema updates (dev only)
pnpm db:push
```

### Hot Reload Breaks Authentication

**Problem:** Making code changes causes you to be logged out.

**Why:** Vite's HMR can reset the client-side auth state.

**Solutions:**
- Refresh the page after login to establish a stable session
- Use deploy previews for auth-heavy development
- Accept that local dev auth is flaky and test on deploy previews

### More Help

- `TROUBLESHOOTING_AUTH.md` - Comprehensive authentication debugging guide
- `AUTH_RESOLUTION_SUMMARY.md` - Overview of the auth system
- `/auth-debug` page - Real-time auth state diagnostics
- Browser console - Look for `[auth]`, `[db]`, and `[layout]` log messages

## Future Features

Designed for but not yet implemented:

- Photo upload via Netlify Blobs
- Pull coach bios from Google Sheet or external source
- Calendar integration for coach availability
- Multi-city admin dashboard

## License

See [LICENSE](LICENSE).

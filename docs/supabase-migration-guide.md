# Supabase Migration Guide

This document captures the manual steps required alongside the code changes for each phase of the migration
from Neon/PGLite/Netlify Identity to Supabase.

---

## Phase 1: Database Migration

### What changed in code
- Removed `@neondatabase/serverless` and `@electric-sql/pglite`
- Added `postgres` driver; Drizzle ORM and all queries are unchanged
- Env var renamed: `NETLIFY_DATABASE_URL` → `SUPABASE_DATABASE_URL`
- PGLite local DB removed; local dev now connects to Supabase staging

### Manual steps

#### 1. Create Supabase projects

1. Go to [supabase.com](https://supabase.com) and sign in
2. Create **production** project (e.g. "comedy-connector-prod")
3. Create **staging** project (e.g. "comedy-connector-staging")
4. Note the **Transaction Pooler** connection string for each project:
   - Dashboard → Project Settings → Database → Connection string → Transaction pooler
   - URL format: `postgresql://postgres.PROJECTREF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres`

#### 2. Connect Netlify to Supabase (production)

1. In Netlify dashboard → Integrations → search "Supabase" → Install
2. Connect the integration to your **production** Supabase project
3. The integration auto-sets these vars for the **production** context:
   - `SUPABASE_DATABASE_URL` — direct postgres connection URL ✅ (used by Drizzle)
   - `SUPABASE_ANON_KEY` — public anon key (used by supabase-js in Phase 2+)
   - `SUPABASE_SERVICE_ROLE_KEY` — server-only admin key (used by supabase-js in Phase 2+)
   - `SUPABASE_JWT_SECRET` — JWT secret (used by supabase-js in Phase 2+)

> **Note on connection URL:** `SUPABASE_DATABASE_URL` from the extension is the direct connection (port 5432).
> For local dev and staging, use the **Transaction Pooler URL** (port 6543) instead — it's serverless-safe.
> Get it from: Supabase dashboard → Project Settings → Database → Connection string → Transaction pooler.
> The code uses `prepare: false` which works with both direct and pooler connections.

#### 3. Override SUPABASE_DATABASE_URL for branch deploys only

The Netlify–Supabase extension sets `SUPABASE_DATABASE_URL` for all contexts (including deploy previews).
That's intentional — deploy previews (PR builds) should test against **production** so you catch issues before merging.

Only branch deploys need a staging override:
- Netlify dashboard → Environment variables → `SUPABASE_DATABASE_URL` → Add context-specific value
- **Branch deploys** context: staging Transaction Pooler URL (port 6543)

Leave **Deploy previews** with no override — it inherits the production value from the extension.

#### 4. Set local .env

```bash
cp .env.example .env
```

Edit `.env` and set both URLs for the **staging** project:
```
# Transaction Pooler (port 6543) — used by the app at runtime
SUPABASE_DATABASE_URL=postgresql://postgres.STAGINGREF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres

# Direct connection (port 5432) — used by drizzle-kit (db:push, db:studio)
SUPABASE_DIRECT_URL=postgresql://postgres.STAGINGREF:PASSWORD@db.STAGINGREF.supabase.co:5432/postgres
```

> **Password with special characters:** If your password contains `#`, URL-encode it as `%23` in both
> strings (no shell quoting needed). Other special chars: `@` → `%40`, `:` → `%3A`.

#### 5. Apply schema to both Supabase projects

The drizzle-kit migration journal starts at `0001` — `0000_initial_schema.sql` predates migration
tracking and was never added to the journal. A fresh Supabase project therefore requires a one-time
manual bootstrap before `db:migrate` can run.

**For each project (staging, then production):**

**a) Drop any leftover custom types** (safe no-ops if they don't exist):

```sql
DROP TYPE IF EXISTS public.recipient_type CASCADE;
DROP TYPE IF EXISTS public.team_status CASCADE;
DROP TYPE IF EXISTS public.approval_status CASCADE;
DROP TYPE IF EXISTS public.tag_domain CASCADE;
DROP TYPE IF EXISTS public.tag_status CASCADE;
```

**b) Apply the base schema** — paste and run the full contents of
`src/lib/server/db/migrations/0000_initial_schema.sql` in the Supabase SQL editor.

**c) Run migrations:**

```bash
# Staging — reads SUPABASE_DIRECT_URL from .env
pnpm db:migrate

# Production — temporarily override with the production session-pooler URL
# (Session pooler: Project Settings → Database → Connection string → Session pooler, port 5432)
SUPABASE_DIRECT_URL=<prod_session_pooler_url> pnpm db:migrate
```

This creates `__drizzle_migrations` and applies entries `0001`–`0009`. Going forward, new schema
changes follow the standard workflow:
1. Edit schema files in `src/lib/server/db/schema/`
2. `pnpm db:generate` — generates a new SQL migration file
3. `pnpm db:migrate` — applies it (staging from `.env`; production via `SUPABASE_DIRECT_URL` override)

#### 6. Migrate data from Neon to Supabase production

Option A — pg_dump / pg_restore:
```bash
# Dump from Neon (get NEON_URL from Netlify dashboard before shutting it down)
pg_dump "$NEON_URL" --no-owner --no-acl -f neon_backup.sql

# Restore to Supabase production (use the direct connection, not pooler, for pg_restore)
# Get the direct URL from: Supabase → Project Settings → Database → Direct connection
psql "$SUPABASE_DIRECT_URL" < neon_backup.sql
```

Option B — Use a GUI tool like TablePlus or Postico to copy rows table-by-table.

#### 7. Seed staging

```bash
pnpm db:seed:staging
```

This inserts the Muppets test dataset (11 users, 2 teams, profiles, tags) into staging.

#### 8. Verify

```bash
pnpm dev       # app loads, /dev-login shows test users
pnpm check     # no TypeScript errors
pnpm build     # production build succeeds
```

#### 9. Shut down Neon

After verifying production is working on Supabase, shut down the Neon project:
- Neon dashboard → Project → Danger zone → Delete project

---

## Phase 2: Auth Migration (Netlify Identity → Supabase Auth)

### What changed in code
- Added `@supabase/supabase-js` and `@supabase/ssr`
- Removed `netlify-identity-widget`
- New `src/lib/server/supabase.ts` — per-request Supabase server client factory
- `hooks.server.ts` — replaced JWT decoding with `supabase.auth.getUser()` (validates server-side)
- New `src/routes/auth/callback/+server.ts` — OAuth code exchange
- `src/routes/login/` — replaced GoTrue API calls with `locals.supabase.auth.signIn/signUp`; added email signup toggle; Google button uses `?/loginWithGoogle` action
- `src/routes/dev-login/` — replaced `dev_session` cookie with `supabase.auth.signInWithPassword` + `DEV_USER_PASSWORD`
- `src/routes/api/auth/logout/` — replaced cookie delete with `supabase.auth.signOut()`
- `src/routes/+layout.svelte` — removed Netlify Identity widget init; auth state now purely from server data
- `scripts/seed-staging.ts` — also creates Supabase Auth users via admin API (requires `DEV_USER_PASSWORD`)
- Deleted `netlify/functions/identity-signup.ts`

### Manual steps

#### 1. Set SUPABASE_URL in Netlify env vars

The Netlify–Supabase extension does NOT set `SUPABASE_URL` automatically. Add it manually:
- Netlify dashboard → Site configuration → Environment variables → Add variable
- Key: `SUPABASE_URL`
- Set per-context:
  - **Production**: `https://PROD_PROJECT_REF.supabase.co`
  - **Branch deploys**: `https://STAGING_PROJECT_REF.supabase.co`
  - **Deploy previews**: `https://PROD_PROJECT_REF.supabase.co` (inherits from production)

Also add to your local `.env`:
```
SUPABASE_URL=https://STAGING_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=<staging anon key>
SUPABASE_SERVICE_ROLE_KEY=<staging service role key>
DEV_USER_PASSWORD=<choose a strong shared password for test users>
```

#### 2. Apply the auth trigger SQL

Run in Supabase SQL editor for **both** staging and production projects:

```sql
-- File: docs/supabase-triggers.sql
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.users
    SET identity_id = NEW.id::text,
        auth_provider = COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
        updated_at = now()
    WHERE email = NEW.email;

  IF NOT FOUND THEN
    INSERT INTO public.users (identity_id, email, auth_provider)
    VALUES (NEW.id::text, NEW.email, COALESCE(NEW.raw_app_meta_data->>'provider', 'email'));
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
```

#### 3. Enable Google OAuth in Supabase

For **both** staging and production projects:
1. Supabase dashboard → Authentication → Providers → Google → Enable
2. Paste your Google OAuth Client ID and Client Secret
3. Note the Supabase callback URL shown (e.g. `https://PROJECTREF.supabase.co/auth/v1/callback`)

Also add your app's `/auth/callback` route to Supabase's Redirect URLs allow list:
- Supabase dashboard → Authentication → URL Configuration → Redirect URLs
- Add: `http://localhost:5173/auth/callback` (staging, local dev)
- Add: `https://yourapp.netlify.app/auth/callback` (production)

#### 4. Update Google Cloud Console

In your Google Cloud project → APIs & Services → Credentials → OAuth 2.0 Client:
- Add both Supabase callback URLs (staging + production) to Authorized redirect URIs

#### 5. Enable auto-confirm for email signups (optional but recommended for a community app)

- Supabase dashboard → Authentication → Email → Confirm email → **disable** (set to off)
- This lets users sign up and use the app immediately without email confirmation

#### 6. Seed staging test users

```bash
pnpm db:seed:staging
```

With `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `DEV_USER_PASSWORD` set in `.env`, this
also creates Supabase Auth accounts for each Muppets test user.

#### 7. Verify local dev

```bash
pnpm dev
# navigate to http://localhost:5173/dev-login
# pick a test user → should sign in via Supabase and redirect to /profile
```

#### 8. Announce to existing users

Existing production users' Netlify Identity accounts will not transfer. They need to re-register.
Their profile data will be preserved (linked by email via the DB trigger).
Send an email announcement before deploying Phase 2 to production.

---

## Phase 3: Image Uploads (Supabase Storage)

### What changed in code
- New `src/lib/utils/highlights.ts` — `Highlight` type + `normalizeHighlights()` (backward-compatible with legacy string[] data)
- `performer_profiles.ts` schema — `videoHighlights` column type annotation updated to `Highlight[]`
- `src/lib/server/supabase.ts` — added `createSupabaseAdminClient()` (service role, for server-side uploads)
- New `src/routes/api/upload/+server.ts` — POST endpoint accepting `file` + `bucket`; validates, uploads to Supabase Storage, returns public URL
- New `src/lib/components/ui/PhotoPicker.svelte` — reusable component: upload button + URL text fallback; emits selected URL via hidden form field
- `src/routes/profile/edit/+page.svelte` — `photoUrl` text input replaced with `PhotoPicker`
- `src/routes/teams/[slug]/edit/+page.svelte` — `photoUrl` text input replaced with `PhotoPicker`
- `src/routes/profile/performer/+page.svelte` — highlights section replaced with mixed link/image editor (up to 5 items); highlights submitted as JSON blob
- `src/routes/profile/performer/+page.server.ts` — reads highlights JSON blob; normalizes via `normalizeHighlights()`
- `src/routes/performers/[slug]/+page.svelte` — view updated to render uploaded images directly (`type: 'image'`) vs links/embeds (`type: 'link'`); normalizes legacy data on read

### Manual steps

#### 1. Create Storage bucket

In Supabase dashboard → Storage for **both** staging and production:

1. Create bucket `user-media` — **Public** bucket, allowed MIME types: `image/*`

Making the bucket public means anyone can read the files via their public URL (required for displaying images in the app). All three upload surfaces (profile photo, team photo, performer highlights) share this single bucket — files are separated by path (`userId/timestamp.ext`). Uploads go through your server using the service role key, so bucket RLS policies on INSERT are not needed for this architecture.

#### 2. Verify uploads work

After creating the buckets, test locally:

1. `pnpm dev`
2. Log in via `/dev-login`, go to `/profile/edit`
3. Click "UPLOAD PHOTO" — select an image
4. If upload fails, check that `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set in `.env`

#### 3. Legacy data (existing `videoHighlights`)

Existing performer `videoHighlights` data is stored as `string[]`. The `normalizeHighlights()` function transparently converts it to `Highlight[]` on read, so no data migration is needed. New saves will write in the `Highlight[]` format.

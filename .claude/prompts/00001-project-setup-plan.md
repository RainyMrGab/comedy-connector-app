# Comedy Connector App - Implementation Plan

## Context

Comedy Connector is a social app for a city's comedy community (initially Pittsburgh) to create profiles, discover each other, and connect. Performers, coaches, and teams can create rich profiles with interest flags, and the app facilitates connections without exposing contact info. The app must run entirely on free-tier services and be configurable for other cities to run their own instances.

**Domain**: `pittsburgh.comedyconnector.app` (dynamic city name per instance)

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | **SvelteKit** (Svelte 5 w/ runes) | Lighter than React/Next.js, built-in API routes |
| Styles | **Tailwind v4** + **Skeleton UI v4** (`@skeletonlabs/skeleton` + `@skeletonlabs/skeleton-svelte` 4.11.0) | SCSS modules where Tailwind is insufficient |
| Icons | **Lucide Svelte** (`lucide-svelte`) | Tree-shakable, 1500+ icons |
| Validation | **Zod** | Server + client form validation |
| Database | **Netlify DB** (Neon Postgres) + **Drizzle ORM** | 0.5 GB free, auto-provisioned |
| Auth | **Netlify Identity** | 1,000 free users, drop-in widget, JWT-based |
| Email | **Resend** | 3,000 emails/month free |
| Deploy | **Netlify** (auto-deploy on push) | `@sveltejs/adapter-netlify` |
| Package Manager | **pnpm** | Per project settings |

---

## Project Structure

```
comedy-connector-app/
├── netlify/
│   └── functions/
│       ├── identity-signup.ts        # Creates DB user on Netlify Identity signup
│       └── freshness-reminder.ts     # Monthly scheduled reminder emails
├── src/
│   ├── app.html                      # HTML shell with data-theme
│   ├── app.css                       # Tailwind + Skeleton imports
│   ├── app.d.ts                      # App namespace types (locals.user)
│   ├── hooks.server.ts               # Auth middleware: JWT → user resolution
│   ├── hooks.client.ts               # Netlify Identity widget init
│   ├── lib/
│   │   ├── server/
│   │   │   ├── db/
│   │   │   │   ├── index.ts          # Drizzle client via @netlify/neon
│   │   │   │   ├── schema/           # One file per entity + relations.ts
│   │   │   │   └── migrations/       # Drizzle Kit generated
│   │   │   ├── search.ts             # Postgres full-text search queries
│   │   │   ├── auth.ts               # JWT decode + user lookup helper
│   │   │   └── email.ts              # Resend client + email builders
│   │   ├── components/
│   │   │   ├── layout/               # Header, Footer, Nav, MobileMenu
│   │   │   ├── profile/              # Profile forms, cards, views, sub-components
│   │   │   ├── team/                 # Team forms, cards, views, member/coach managers
│   │   │   ├── search/               # SearchBar, FilterPanel, ResultsList, InfiniteScroll
│   │   │   ├── contact/              # ContactForm (dialog)
│   │   │   └── ui/                   # PhotoUpload, ConfirmDialog, Toast, LoadingSpinner, EmptyState
│   │   ├── stores/                   # Svelte 5 rune-based state (auth, toast, search)
│   │   ├── types/                    # TypeScript types per domain
│   │   ├── utils/                    # dates, validation (Zod), url/slug, constants
│   │   └── config/
│   │       └── city.ts               # City name, domain, resource links
│   └── routes/
│       ├── +layout.svelte/server.ts  # Root layout + auth state load
│       ├── +page.svelte              # Landing page
│       ├── profile/                  # Own profile CRUD (edit/, performer/, coach/)
│       ├── performers/               # Browse + [slug] public view
│       ├── coaches/                  # Browse + [slug] public view
│       ├── teams/                    # Browse + create/ + [slug] view + [slug]/edit
│       ├── connect/                  # Landing + book-opener/ + join-team/ + find-coach/
│       ├── approvals/                # Pending approvals dashboard
│       ├── resources/                # Static resource links
│       └── api/                      # API-only: contact/ (auth required), approvals/[id], teams/search, profiles/search
├── drizzle.config.ts
├── svelte.config.js                  # adapter-netlify, aliases
├── vite.config.ts
├── netlify.toml
├── .env.example
└── README.md
```

---

## Database Schema (Drizzle ORM)

**Design decisions**:
- Performer/coach as **separate tables** (not flags/JSON) — clean FKs, independent queries, opt-in by row existence
- Interest flags as **boolean columns** — direct SQL filtering, standard indexes
- Social links as **JSONB** — flexible key-value pairs
- Dates as separate **year/month integer columns** + `is_current` boolean — handles "month/year or year only, to present"
- **Generated tsvector columns** with GIN indexes for full-text search
- **Single source of truth for team relationships**: `team_members` and `team_coaches` are the only tables linking people to teams. No separate "team history" tables. A performer's team history = their `team_members` rows.
- **Wikipedia-style stub teams**: When a performer references a team that doesn't exist yet, a "stub" team is created (name + slug only, `status = 'stub'`, `created_by_user_id = null`). Anyone can later "claim" a stub team by filling out its full profile, becoming the creator. Multiple performers can reference the same stub before it's claimed. Stubs are matched by case-insensitive name.
- **No `pending_approvals` table**: The `approval_status` column on `team_members`/`team_coaches` is sufficient. The approvals dashboard queries these tables directly (`WHERE profile_id = ? AND approval_status = 'pending'`).

### Tables

| Table | Key Fields | Purpose |
|-------|-----------|---------|
| `users` | `id`, `identity_id` (unique), `email` | Links Netlify Identity to app data |
| `personal_profiles` | `user_id` (unique FK), `name`, `slug` (unique), `photo_url`, `social_links` (jsonb), `bio`, `training`, `looking_for`, `contact_email`, `freshness_reminders_enabled` | Base profile for every user |
| `performer_profiles` | `profile_id` (unique FK), `video_highlights` (jsonb string[]), 3 interest flag booleans, `looking_for` | Opt-in performer extension |
| `coach_profiles` | `profile_id` (unique FK), `coaching_bio`, 3 interest flag booleans, `availability` | Opt-in coach extension |
| `teams` | `created_by_user_id` (nullable — null for stubs), `name`, `slug`, `status` (`stub` or `active`), `photo_url`, `description`, `video_url`, `form`, `is_practice_group`, 3 interest flag booleans, `looking_for`, `primary_contact_profile_id`, `freshness_reminders_enabled` | Team profiles (including unclaimed stubs) |
| `team_members` | `team_id` FK, `profile_id` (optional FK), `member_name` (for non-app members), start/end year+month, `is_current`, `approval_status` (pending/approved/rejected) | Team roster — single source of truth for performer↔team relationships |
| `team_coaches` | `team_id` FK, `profile_id` (optional FK), `coach_name`, start/end year+month, `is_current`, `approval_status` | Team coaching staff — single source of truth for coach↔team relationships |
| `contact_messages` | `recipient_type`, `recipient_id`, `sender_user_id` (required — must be logged in), `subject`, `message` | Audit log of contact messages |

### Stub team lifecycle

1. Performer adds "Team XYZ" to their profile → app searches `teams` for case-insensitive name match
2. **Match found**: Link `team_members` row to existing team (stub or active)
3. **No match**: Create new stub team (`status='stub'`, `created_by_user_id=null`, auto-generate slug)
4. Stub team profile page shows: "This team hasn't been set up yet. Are you a member? Claim this team to add details."
5. Any logged-in user can "claim" a stub → fills out full team profile → `status` becomes `active`, `created_by_user_id` set
6. Stubs appear in search results only if they have approved members (so they're not empty noise)

### Full-text search

Custom SQL migration adds generated `tsvector` columns + GIN indexes on:
- `personal_profiles` (name, bio, training, looking_for)
- `teams` (name, description, form, looking_for) — active teams only in search
- `coach_profiles` (coaching_bio, availability)

Search uses `websearch_to_tsquery` for natural language input with `ts_rank` for relevance ordering.

---

## Authentication Flow

1. **Client**: Netlify Identity widget handles signup/login UI. On login, fires event with JWT.
2. **Client store** (`auth.svelte.ts`): Captures JWT + user metadata via `$state` runes.
3. **Every request** (`hooks.server.ts`): Extracts `Authorization: Bearer <jwt>`, decodes payload, looks up user by `identity_id`, sets `event.locals.user`.
4. **Protected routes**: Check `locals.user` in load/action functions, redirect to `/` if null.
5. **Signup trigger** (`netlify/functions/identity-signup.ts`): On Netlify Identity confirmation, creates `users` row in DB.
6. **Form actions**: Include JWT as hidden field; server reads from header or form data fallback.

### Access levels
- **Public**: Home, browse/search, profile views, resources
- **Authenticated**: Profile CRUD, team create/edit, approvals, **contact form** (must be logged in to prevent spam)
- **Authorized**: Team edit (must be team member), approval actions (must be target user), team claim (any authenticated user)

---

## Key Skeleton UI v4 Components Used

| Component | Used For |
|-----------|----------|
| App Bar | Header navigation |
| Navigation | Desktop/mobile nav |
| Dialog | Contact form, confirmations |
| Toast | Success/error notifications |
| Avatar | Profile photos |
| Cards (Tailwind) | Profile/team cards in search results |
| Chips (Tailwind) | Interest flag badges |
| Switch | Boolean toggles |
| Tabs | Search mode switching |
| ~~Pagination~~ | Not used — using infinite scroll instead (see below) |
| Accordion | Expandable profile sections |
| Combobox | Search/select performers/coaches for team management |
| File Upload | Photo uploads |
| Forms/Inputs (Tailwind) | All form elements |

Custom theme: "comedy-connector" — vibrant purple primary, hot pink secondary, teal tertiary. Fun and colorful per requirements.

### Search UX: Cursor pagination + infinite scroll
Instead of page-based pagination, search results use **cursor-based pagination** with **infinite scroll**:
- API returns results + a `cursor` (the last item's sort key, e.g. `ts_rank` value + `id`)
- Frontend uses an **Intersection Observer** on a sentinel element at the bottom of the results list
- When the sentinel enters the viewport, fetch the next batch using the cursor
- Append new results to the existing list
- Show a loading spinner while fetching; hide sentinel when no more results
- This is a custom implementation (not a Skeleton component) using Svelte's reactivity

---

## Email (Resend)

- **Contact form emails**: Requires login. Sender's email (from their account) is used as reply-to; recipient never sees it in the app UI. This prevents spam while facilitating real connections.
- **Freshness reminders**: Sent to ALL performers + team primary contacts at once, first Sunday of the month at 9am EST. Summary with update links.
- **Templates**: Contact message, performer reminder, team contact reminder

---

## Implementation Phases

### Phase 1: Foundation
Scaffold SvelteKit + Tailwind v4 + Skeleton v4 + Netlify adapter. Set up Drizzle + Netlify DB (`users` table only). Implement Netlify Identity auth flow (widget, hooks, identity-signup function). Build root layout with Header/Footer. Deploy to Netlify.

**Test**: User can sign up, log in, log out. User row created in DB.

### Phase 2: Personal Profiles
Create `personal_profiles` schema + migration. Build profile forms (name, photo, social links, bio, training, looking for). Slug generation. Public profile view at `/performers/[slug]`.

**Test**: Create, edit, view personal profile. Public view accessible by slug URL.

### Phase 3: Performer & Coach Profiles
Create `performer_profiles` and `coach_profiles` schemas. Build opt-in forms with video highlights, interest flags, date range pickers. Public views at `/performers/[slug]` and `/coaches/[slug]`.

**Test**: Enable/disable performer/coach profiles. All specialized fields work.

### Phase 4: Team Profiles + Stub Teams
Create `teams`, `team_members`, `team_coaches` schemas (with `status` field for stub/active). Build team forms with member/coach management (Combobox for searching performers). Wikipedia-style stub team creation when performers reference unknown teams. Team claiming flow. Primary contact selection.

**Test**: Create team, add members (linked + text names), add coaches, set primary contact. Create a stub team by adding an unknown team name to a performer profile. Claim a stub team. Public team view shows "unclaimed" state for stubs.

### Phase 5: Approval Workflow
Add approval logic to team member/coach addition (sets `approval_status = 'pending'`). Build approvals dashboard querying `team_members`/`team_coaches` directly. Approve/reject API endpoint. Performer profile shows approved team memberships.

**Test**: Add performer to team → pending. Performer approves → shows on both profiles. Reject → removed from team.

### Phase 6: Search & Connect
Add tsvector generated columns + GIN indexes. Build search components (SearchBar, FilterPanel, ResultsList, InfiniteScroll with Intersection Observer). Cursor-based pagination API. Implement three Connect modes: Book Opener, Join Team, Find Coach. Add browse pages for performers/coaches/teams. Active teams only in search (stubs only if they have approved members).

**Test**: Search by keyword, filter by flags. Results ranked by relevance. Infinite scroll loads more results on scroll.

### Phase 7: Contact Form & Email
Set up Resend. Build ContactForm dialog. API endpoint for sending (requires login). Contact button on all public profile views. Sender's email from their account; reply-to set to sender.

**Test**: Send message as logged-in user. Recipient gets email with correct reply-to. Anonymous users see "Log in to contact" prompt.

### Phase 8: Freshness Reminders
Build scheduled Netlify Function for monthly emails. Summary templates. Notification preference toggle on profile edit.

**Test**: Invoke function manually; correct emails sent respecting preferences.

### Phase 9: Resources, Polish & Mobile
Resources page with static links. Complete footer. Mobile responsiveness audit. Loading/empty/error states. Custom Skeleton theme. Meta tags, favicon. Comprehensive README.

**Test**: All pages responsive. All states handled gracefully.

### Phase 10: CI, Testing & Launch
Verify Netlify auto-deploy on push. End-to-end testing. Lighthouse audit. Accessibility check. Security review. `.env.example` and deployment docs.

**Test**: Push to main → auto-deploys. All features pass manual E2E testing.

---

## Environment Variables

These will be configured after scaffolding — no need to provide them during planning.

| Variable | Scope | Source |
|----------|-------|--------|
| `NETLIFY_DATABASE_URL` | Server | Auto-provisioned by Netlify DB |
| `RESEND_API_KEY` | Server | Resend dashboard (set up in Phase 7) |
| `PUBLIC_CITY_NAME` | Public | Netlify env vars ("Pittsburgh") |
| `PUBLIC_CITY_DOMAIN` | Public | Netlify env vars |
| `PUBLIC_SITE_URL` | Public | Netlify env vars |

---

## netlify.toml (key config)

```toml
[build]
  command = "pnpm run build"
  publish = "build"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "20"
  PNPM_VERSION = "9"

# 1st of each month at 9am EST (14:00 UTC)
[functions."freshness-reminder"]
  schedule = "0 14 1 * *"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

---

## Verification Plan

After each phase, verify by:
1. Running `pnpm dev` locally with `netlify dev` for DB/Identity access
2. Testing the specific features listed in each phase's **Test** section
3. Deploying to Netlify preview (push to branch) to verify production behavior
4. After all phases: Lighthouse audit (performance, accessibility, SEO), cross-browser check (Chrome, Firefox, Safari, mobile)

---

## Future Features (design for, don't implement)
- Pull coach bios from `pittsburgh.improvcoaches.com` or Google Sheet
- Calendar integration for coach availability
- (Documented in README)

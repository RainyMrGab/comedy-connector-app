# Freshness Reminders Overhaul

## Context

Comedy Connector's directory value depends on profiles staying current. The app already has a skeleton freshness reminder system (monthly cron, opt-out column, basic HTML email), but it needs to be made mandatory, enriched with full profile content, rate-limited to 50 emails/day, and testable without waiting for a cron trigger.

---

## Goals

1. Remove opt-out — freshness polls are a condition of using the app
2. Add a disclosure notice to all profile/team forms
3. Rewrite the email to include all staleable data in a single per-user message
4. Rate-limit to 50 emails/day, spread across days 1–7 of each month
5. Store schedule config centrally
6. Build a local simulator endpoint to test email sending

---

## Architecture Decisions

### Eligibility filter: login-based (replaces new-user exclusion)
- Only email users who have **not logged in during the previous calendar month**
- Filter: `users.lastSeenAt IS NULL OR users.lastSeenAt < first day of previous month`
- This naturally covers new users too (just signed up = logged in recently = excluded)
- Requires adding `lastSeenAt` to the `users` table and updating it in `hooks.server.ts`
- `hooks.server.ts` fires a non-blocking update (`catch(console.error)`, no await) when a user authenticates — debounced to at most once per day to avoid excessive writes

### Rate limiting: offset-based batching (no extra DB state)
- Cron runs daily on days 1–7 at 10am EST (`0 15 1-7 * *`)
- `offset = (dayOfMonth - 1) * DAILY_LIMIT` — each day processes the next 50
- Users are ordered by `users.lastSeenAt ASC NULLS FIRST` (least-recently-seen users go first)
- Covers up to 350 users (7 × 50); well above expected scale
- **Backstop on day 7**: after sending the last batch, count any remaining eligible users; if any exist, send an alert email to `FEEDBACK_EMAIL` ("X users were not reached this month — consider increasing DAILY_EMAIL_LIMIT or POLLING_WINDOW_DAYS")

### Consolidated email: one per user
- Old approach: separate email for performer + separate email per team contact
- New approach: ONE email per user with all their sections (personal, performer, coach, owned teams)
- Budget efficiency: a user who is performer + team owner gets 1 email instead of 2, stretching the 50/day budget further
- Most effective for re-engaging inactive users — one comprehensive "here's everything" beats multiple narrow emails

### Opt-out removal
- Drop `freshnessRemindersEnabled` from both `personal_profiles` and `teams` tables
- Combine with `lastSeenAt` addition into a single migration
- Remove from Zod schemas, server handlers, and UI

---

## Config: `src/lib/config/reminders.ts` (NEW)

```ts
export const reminderConfig = {
  // Cron schedule for netlify.toml: days 1–7 of month at 10am EST (15:00 UTC)
  cronSchedule: '0 15 1-7 * *',
  scheduleDescription: 'Daily on the 1st–7th of each month at 10am EST',
  // Max emails sent per daily cron run (Resend free tier budget — 50 reserved for reminders)
  dailyEmailLimit: 50,
  // How many days the polling window runs (determines max users reachable: 7 × 50 = 350)
  pollingWindowDays: 7,
  // Only email users inactive for longer than this many calendar months
  inactivityThresholdMonths: 1,
};
```

---

## Shared Logic: `src/lib/server/reminders.ts` (NEW)

Accepts `db` as a parameter so it can be used by both:
- The Netlify function (which creates its own Neon connection)
- The SvelteKit simulator endpoint (which uses the app's `$server/db`)

### Exports:
- `getFreshnessRecipients(db, offset, limit, inactiveSince)` → structured recipient data
- `countRemainingRecipients(db, offset, limit, inactiveSince)` → number of users not yet reached (for backstop)
- `buildFreshnessEmailHtml(recipient, siteUrl)` → HTML string
- `buildFreshnessEmailText(recipient, siteUrl)` → plain text fallback

### Eligibility filter applied to all queries:
`users.lastSeenAt IS NULL OR users.lastSeenAt < inactiveSince`
where `inactiveSince = first day of previous calendar month`

### Ordering:
`ORDER BY users.lastSeenAt ASC NULLS FIRST` — users who've been away longest (or never logged in) go first

### Data fetched per batch of 50:
1. Personal profiles + user emails (filtered by inactivity, ordered, offset/limit)
2. Performer profiles for those profile IDs (batched IN query)
3. Coach profiles for those profile IDs (batched IN query)
4. Active teams where `primaryContactProfileId IN [profileIds]`
5. Current (approved) team members and coaches for those teams

### Backstop logic (runs only when `dayOfMonth === POLLING_WINDOW_DAYS`):
- Call `countRemainingRecipients(db, currentOffset + DAILY_LIMIT, ...)`
- If count > 0: send alert to `FEEDBACK_EMAIL` with subject "⚠️ Comedy Connector: X users not reached in freshness poll" and body suggesting increasing limits

### Email content per user:
- **Personal section:** training, lookingFor → links to `/profile/edit`
- **Performer section** (if exists): interest flags (openToBookOpeners, lookingForTeam, lookingForCoach), lookingFor, current approved teams → link to `/profile/performer`
- **Coach section** (if exists): availability, interest flags (availableForPrivate, availableForTeams, availableForWorkshops) → link to `/profile/coach`
- **Team section(s)** (if primary contact): per team — form, interest flags, lookingFor, current member names, current coach names → link to `/teams/[slug]/edit`

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/lib/config/reminders.ts` | Central config: schedule, limits, inactivity threshold |
| `src/lib/server/reminders.ts` | Shared query + email building logic (db-injected) |
| `src/lib/server/db/migrations/0002_freshness_overhaul.sql` | Add `last_seen_at` to users; drop opt-out columns |
| `src/routes/dev/simulate-freshness/+page.svelte` | Dev simulator UI (button to trigger) |
| `src/routes/dev/simulate-freshness/+page.server.ts` | Server action: runs reminder logic, returns results |

---

## Files to Modify

| File | Change |
|------|--------|
| `netlify.toml` | Schedule: `0 14 1 * *` → `0 15 1-7 * *` |
| `netlify/functions/freshness-reminder.ts` | Rewrite: use `reminderConfig` for offset/backstop, import shared logic from `reminders.ts`, send consolidated emails |
| `src/lib/server/db/schema/users.ts` | Add `lastSeenAt: timestamp('last_seen_at', { withTimezone: true })` (nullable) |
| `src/lib/server/db/schema/personal_profiles.ts` | Remove `freshnessRemindersEnabled` field |
| `src/lib/server/db/schema/teams.ts` | Remove `freshnessRemindersEnabled` field |
| `src/hooks.server.ts` | After resolving user, fire-and-forget `lastSeenAt` update (debounced: skip if already updated today) |
| `src/lib/utils/validation.ts` | Remove `freshnessRemindersEnabled` from `personalProfileSchema` and `teamSchema` |
| `src/routes/profile/edit/+page.svelte` | Remove checkbox; replace with disclosure notice |
| `src/routes/profile/edit/+page.server.ts` | Remove `freshnessRemindersEnabled` form read + DB write |
| `src/routes/teams/create/+page.svelte` | Remove checkbox; add disclosure notice |
| `src/routes/teams/create/+page.server.ts` | Remove `freshnessRemindersEnabled` from raw/insert |
| `src/routes/teams/[slug]/edit/+page.server.ts` | Remove `freshnessRemindersEnabled` from raw/update |
| `src/lib/server/email.ts` | Remove old `sendFreshnessReminder()` (superseded by `reminders.ts`) |

---

## Disclosure Notice (UI Copy)

Replace the checkbox on both personal profile and team forms with a static notice:

> 📬 **Profile freshness reminders:** Comedy Connector emails you once a month to help keep your listing accurate. We won't use your email for spam or share it with third parties — these reminders exist solely to keep the community directory useful for everyone.

Place it directly above the submit button.

---

## Simulator Page: `/dev/simulate-freshness`

- Redirects to `/` if `PUBLIC_DEPLOY_CONTEXT === 'production'`
- Requires auth (`locals.user` check)
- Displays: a "Send Freshness Emails (Day 1 batch)" button
- On submit: calls server action → runs `getFreshnessRecipients(db, 0, DAILY_LIMIT, cutoff)` + sends via Resend
- If `RESEND_API_KEY` is missing (pure local dev): returns a dry-run summary showing who WOULD receive email + HTML preview of first email
- Returns: sent count, skipped count, any errors, list of recipients

---

## Migration: `0002_freshness_overhaul.sql`

```sql
-- Track user activity for inactivity-based filtering
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

-- Remove mandatory opt-out columns (freshness reminders are now required)
ALTER TABLE personal_profiles DROP COLUMN IF EXISTS freshness_reminders_enabled;
ALTER TABLE teams DROP COLUMN IF EXISTS freshness_reminders_enabled;
```

Run via `pnpm db:migrate` against Neon; PGLite picks it up automatically on next dev server start.

---

## Email Design Notes (for spam filter & open rate)

- **Subject:** `[Comedy Connector] Is your profile still accurate? (1 min check)`
- **From name:** `Comedy Connector <noreply@[hostname]>` (matches domain)
- **Plain text fallback:** always included
- **No images** that might trigger spam filters
- **Structure:** clear sections with emoji headers, current values shown inline (so they can scan without clicking), direct edit links at top of each section
- **Footer:** site URL, explanation of why they received it (no unsubscribe link — mandatory)

---

## Bug Fix: Local Migration Not Applied

**Root cause:** `meta/_journal.json` only lists `0001_add_fulltext_search`. Drizzle's PGLite migrator reads this journal to decide which SQL files to run — `0002_freshness_overhaul.sql` is silently skipped.

**Fix:** Add the entry to `src/lib/server/db/migrations/meta/_journal.json`:

```json
{
  "version": "7",
  "dialect": "postgresql",
  "entries": [
    {
      "idx": 1,
      "version": "7",
      "when": 1740261840000,
      "tag": "0001_add_fulltext_search",
      "breakpoints": true
    },
    {
      "idx": 2,
      "version": "7",
      "when": 1743116400000,
      "tag": "0002_freshness_overhaul",
      "breakpoints": true
    }
  ]
}
```

After editing, `rm -rf .local-db && pnpm dev` will apply the migration cleanly.

---

## Verification Steps

1. `pnpm db:generate` then `pnpm db:migrate` to apply the schema change
2. `pnpm dev:netlify`
3. Log in as each test user (performer, coach, new user via dev-login)
4. Visit `/profile/edit` → confirm no opt-out checkbox, disclosure notice present
5. Visit `/teams/create` → confirm no opt-out checkbox, disclosure notice present
6. Navigate to `/dev/simulate-freshness`
7. Click "Send" → inspect returned JSON for sent count + recipient list
8. **Pause for manual email verification** — check that each test account received the correct sections
9. `pnpm check` — TypeScript + Svelte type check passes

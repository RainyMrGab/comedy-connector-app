# Redesign Plan: Xerox Zine Design System

## Objective

Migrate the Comedy Connector app from its current Skeleton UI v4 + "comedy-connector" Tailwind theme to the Xerox Zine
design system defined in `docs/design.md`. The reference implementation lives in
`src/routes/preview/zine/+page.svelte` — use it as the authoritative source for tokens, components, and patterns.

**Three-word vibe:** Raw, scrappy, loud.

---

## Current State

- **Theme:** Skeleton UI v4 cerberus base + custom oklch color scale (purple, pink, teal)
- **Fonts:** System defaults / Skeleton defaults
- **Radius:** Rounded corners everywhere (`rounded-xl`, `rounded-lg`)
- **Shadows:** Tailwind `shadow-lg` (blurred)
- **Hero:** Dark gradient (`bg-gradient-to-br from-surface-900 via-primary-950`)
- **Cards:** `border border-surface-200 bg-surface-50`
- **Buttons:** `btn preset-filled-primary-500`, `btn preset-tonal-surface`

---

## Target Design System

All tokens live as CSS custom properties on a `.zine-root` wrapper (or `:root` globally once committed):

| Token              | Value     | Usage                                  |
|--------------------|-----------|----------------------------------------|
| `--zine-bg`        | `#F4EFE6` | Page background — warm off-white paper |
| `--zine-surface`   | `#EBE5D8` | Card backgrounds — slightly darker     |
| `--zine-primary`   | `#1C1C1C` | Text, borders, shadows — near-black    |
| `--zine-accent`    | `#D93B2B` | Red — CTAs, alerts, highlights         |
| `--zine-muted`     | `#2E7D7D` | Teal — tags, icons, secondary          |
| `--zine-highlight` | `#F2C84B` | Yellow — CTA strip background          |

**Fonts:** Permanent Marker (headings) + Courier Prime (body) via Google Fonts in `<svelte:head>`.

**Borders:** `2px solid #1C1C1C`, `border-radius: 0` everywhere.

**Shadows:** `4px 4px 0px #1C1C1C` (no blur). Hover: `6px 6px 0px` + `translate(-2px, -2px)`.

---

## Information Architecture

Users are migrating from spreadsheets and forums with no prior mental model of this app. The IA is
built around **user intent**, not entity categories. There are four distinct modes:

| Intent | User says | Route |
|--------|-----------|-------|
| Discovery | "Who's in the scene?" | `/performers`, `/coaches`, `/teams` |
| High-intent task | "I need someone specific" | `/connect/*` |
| Self-promotion | "I want to be found" | `/profile/*` |
| Community context | "What else is here?" | `/resources` |

**Browse and Connect are distinct modes.** Browse is passive (who exists). Connect is active (I want
an outcome). The nav and landing page must reinforce this split. Connect is the core value
proposition — it's the thing spreadsheets can't do.

**Profile and Approvals are operational, not navigational.** Accessed via the auth CTA only.

### Site Map

```
/ (Home — newcomer orientation)
│
├── /performers            list + search
│   └── /performers/[slug]     profile detail
├── /coaches               list + search
│   └── /coaches/[slug]        profile detail
├── /teams                 list + search
│   ├── /teams/[slug]          team detail
│   ├── /teams/[slug]/edit     (auth-gated)
│   ├── /teams/[slug]/claim    (auth-gated)
│   └── /teams/create          (auth-gated)
├── /connect               hub — explains the 3 actions
│   ├── /connect/book-opener   find performers available to open
│   ├── /connect/find-coach    find coaches available for sessions
│   └── /connect/join-team     find teams accepting members
├── /resources
└── [auth-gated]
    ├── /profile
    ├── /profile/edit
    ├── /profile/performer
    ├── /profile/coach
    └── /approvals
```

---

## Navigation Structure

### Desktop

```
[COMEDY CONNECTOR]   PERFORMERS · COACHES · TEAMS   ★ CONNECT ★   RESOURCES   [JOIN THE SCENE]
```

- **Wordmark** — Permanent Marker, links to `/`
- **Browse group** — `PERFORMERS · COACHES · TEAMS` — Courier Prime ALL-CAPS, dot separators,
  same visual weight — signals these are parallel browse categories
- **★ CONNECT ★** — teal inline stars flank the label — visually distinct from browse group.
  This is the action hub, not another list. Stars are inline text (`★`), not images.
  Link → `/connect`
- **RESOURCES** — Courier Prime ALL-CAPS, same weight as browse links (no decoration)
- **Auth CTA** (right-aligned, flex push):
  - Logged out: `[JOIN THE SCENE]` — `.btn-accent` (red stamp)
  - Logged in: `[MY PROFILE]` — `.btn-outline`

### Mobile

Hamburger → full-height zine overlay:
- Wordmark at top
- Browse links stacked (PERFORMERS / COACHES / TEAMS)
- `★ CONNECT ★` on its own row, teal stars
- RESOURCES
- Auth button pinned to bottom

### Why ★ CONNECT ★?

The zine aesthetic uses decorative inline elements (stars, stamps, dashes) as separators. Flanking
stars signal "this item is different in kind" without requiring a dropdown, color block, or sub-label.
It's authentic to the aesthetic and teaches the Browse/Connect distinction at a glance.

---

## Scope: Pages and Components

### Layout Components (shared across all pages)

- `src/lib/components/layout/Header.svelte`
- `src/lib/components/layout/Footer.svelte`
- `src/routes/+layout.svelte`

### Page Routes

| Route                  | File                                          |
|------------------------|-----------------------------------------------|
| Landing                | `src/routes/+page.svelte`                     |
| Performers list        | `src/routes/performers/+page.svelte`          |
| Performer detail       | `src/routes/performers/[slug]/+page.svelte`   |
| Coaches list           | `src/routes/coaches/+page.svelte`             |
| Coach detail           | `src/routes/coaches/[slug]/+page.svelte`      |
| Teams list             | `src/routes/teams/+page.svelte`               |
| Team detail            | `src/routes/teams/[slug]/+page.svelte`        |
| Team edit              | `src/routes/teams/[slug]/edit/+page.svelte`   |
| Team claim             | `src/routes/teams/[slug]/claim/+page.svelte`  |
| Team create            | `src/routes/teams/create/+page.svelte`        |
| Connect hub            | `src/routes/connect/+page.svelte`             |
| Book an opener         | `src/routes/connect/book-opener/+page.svelte` |
| Join a team            | `src/routes/connect/join-team/+page.svelte`   |
| Find a coach           | `src/routes/connect/find-coach/+page.svelte`  |
| Profile hub            | `src/routes/profile/+page.svelte`             |
| Edit profile           | `src/routes/profile/edit/+page.svelte`        |
| Performer profile edit | `src/routes/profile/performer/+page.svelte`   |
| Coach profile edit     | `src/routes/profile/coach/+page.svelte`       |
| Approvals              | `src/routes/approvals/+page.svelte`           |
| Resources              | `src/routes/resources/+page.svelte`           |

### Shared UI Components

- `src/lib/components/ui/EmptyState.svelte`
- `src/lib/components/ui/ConfirmDialog.svelte`
- `src/lib/components/ui/Toast.svelte`
- `src/lib/components/search/SearchBar.svelte`
- `src/lib/components/search/FilterPanel.svelte`
- `src/lib/components/search/ResultCard.svelte`
- `src/lib/components/search/ResultsList.svelte`
- `src/lib/components/contact/ContactDialog.svelte`

---

## Phased Implementation

### Phase 1 — Global Foundation

**Files:** `src/app.css`, `src/app.html`, `src/routes/+layout.svelte`

- Add Google Fonts embed (`Permanent Marker`, `Courier Prime`) in root layout `<svelte:head>`
- Replace the Skeleton cerberus theme import with the zine CSS variables on `:root`
- Set `background: var(--zine-bg)`, `color: var(--zine-primary)`, `font-family: 'Courier Prime', monospace` as global
  base styles
- Remove or override Skeleton's rounded-corner defaults

**Reference:** CSS variable block and `<svelte:head>` in `src/routes/preview/zine/+page.svelte`

---

### Phase 2 — Layout Shell: Header + Footer

**Files:** `src/lib/components/layout/Header.svelte`, `src/lib/components/layout/Footer.svelte`

**Header:**

- Replace current sticky navbar with zine nav: `border-bottom: 2px solid var(--zine-primary)`
- Wordmark: Permanent Marker 20px, near-black, links to `/`
- Browse links: `PERFORMERS · COACHES · TEAMS` — Courier Prime ALL-CAPS, 12px, `letter-spacing: 0.08em`, dot-separated
- `★ CONNECT ★`: teal inline stars (`color: var(--zine-muted)`), label same Courier ALL-CAPS — links to `/connect`
- `RESOURCES`: same Courier treatment, no stars
- Auth CTA (right): `[JOIN THE SCENE]` `.btn-accent` (logged out) / `[MY PROFILE]` `.btn-outline` (logged in)
- Mobile: hamburger → full-height zine overlay, same items stacked, auth button at bottom
- Remove all `preset-*` Skeleton classes

**Footer:**

- Dark background (`--zine-primary`), yellow wordmark (`--zine-highlight`)
- Courier Prime body text
- 3-column layout retained; all link/text colors updated

---

### Phase 3 — Landing Page

**File:** `src/routes/+page.svelte`

Section order (answers newcomer questions in sequence):

```
HERO           "YOUR SCENE. YOUR PEOPLE."
               Off-white bg, tilted Permanent Marker h1 (88px, −2deg)
               Courier Prime body: one sentence explaining what this place is
               Auth-conditional CTAs:
                 Logged out → [JOIN THE SCENE] (.btn-accent) + [BROWSE THE SCENE] (.btn-outline)
                 Logged in  → [SET UP YOUR PROFILE] (.btn-accent) + [BROWSE] (.btn-outline)

RULE           ★ ─── decorative teal banner strip ─── ★

CONNECT        "WHAT DO YOU NEED?" — section heading (Permanent Marker, −1deg)
               3 large torn-card quick-actions:
                 🎤 BOOK AN OPENER   teal tag: "BOOKING"   → /connect/book-opener
                 📚 FIND A COACH     teal tag: "COACHING"  → /connect/find-coach
                 🤝 JOIN A TEAM      teal tag: "TEAMS"     → /connect/join-team
               Each card: big ALL-CAPS label, one sentence, teal "→ GO" link
               These cards should be larger/heavier than the Features cards below

FEATURES       "WHO'S HERE?" — section heading (Permanent Marker, −1deg)
               3-col index card grid (Performers / Coaches / Teams)
               Zine card anatomy: teal tag → red icon → ALL-CAPS label → Courier description
               Links to list pages (/performers, /coaches, /teams)

CTA STRIP      Yellow bg (`--zine-highlight`), shown only to logged-out users
               "READY TO BE FOUND?" — Permanent Marker h2, centered
               [ JOIN THE SCENE ] — .btn-accent
```

Remove: dark gradient hero, `bg-gradient-to-br`, `rounded-xl` classes, `preset-*` button classes.

**Reference:** Full hero + features + CTA strip markup in `src/routes/preview/zine/+page.svelte`

---

### Phase 4 — List Pages (Performers, Coaches, Teams)

**Files:** `src/routes/performers/+page.svelte`, `src/routes/coaches/+page.svelte`, `src/routes/teams/+page.svelte`

- Page header: Permanent Marker h1, rotated −1deg, on warm bg
- SearchBar + FilterPanel: Courier Prime inputs, `2px solid` borders, `0` radius
- Results grid: zine card anatomy (tag → icon → label → description)
- Empty state: zine-styled (see EmptyState component phase)
- Pagination / load-more: `.btn-outline` style

---

### Phase 5 — Detail Pages

**Files:** `[performers|coaches|teams]/[slug]/+page.svelte`

- Profile header: warm paper bg, near-black ink, Permanent Marker name
- Bio/description: Courier Prime, 1.7 line-height
- Tags/badges: teal border, teal text, 10px ALL-CAPS Courier
- Action buttons (Contact, Join, Claim): zine button variants
- Team member lists: small torn-card style items with offset shadow
- Remove all `rounded-*`, `shadow-lg`, gradient backgrounds

---

### Phase 6 — Connect Pages

**Files:** `src/routes/connect/+page.svelte` and sub-routes

- Hub page: 3 large torn-card links matching landing page Connect section
- Sub-pages (book-opener, join-team, find-coach): search + result cards in zine style
- Form controls: Courier Prime inputs, 2px borders, 0 radius, no box-shadow blur

---

### Phase 7 — Profile Edit Pages

**Files:** `src/routes/profile/**`

- Forms: Courier Prime labels ALL-CAPS, inputs with `2px solid` border, 0 radius
- Section headers: Permanent Marker, slight rotation
- Save/cancel buttons: `.btn-accent` / `.btn-outline`
- Profile hub: torn-card links to performer/coach edit sections

---

### Phase 8 — Supporting Pages

**Files:** `src/routes/approvals/+page.svelte`, `src/routes/resources/+page.svelte`,
`src/routes/teams/create/+page.svelte`, `src/routes/teams/[slug]/edit/+page.svelte`,
`src/routes/teams/[slug]/claim/+page.svelte`

- Apply zine card/form/typography patterns consistently
- Approvals: pending items as torn-card rows with teal/red status tags
- Resources: accordion or torn-card section per category

---

### Phase 9 — Shared UI Components

**Files:** all `src/lib/components/**`

| Component       | Change                                                                 |
|-----------------|------------------------------------------------------------------------|
| `EmptyState`    | Permanent Marker heading, Courier body, red icon, `.btn-accent` action |
| `ConfirmDialog` | Remove blur backdrop, use near-black overlay; zine button variants     |
| `Toast`         | Near-black bg, Courier text, teal/red/yellow type colors, 0 radius     |
| `SearchBar`     | 2px border, 0 radius, Courier placeholder                              |
| `FilterPanel`   | Courier labels ALL-CAPS, checkbox/select with 2px borders              |
| `ResultCard`    | Full zine card anatomy (tag → icon → label → description)              |
| `ContactDialog` | Zine form styling, `.btn-accent` submit                                |

---

### Phase 10 — Polish + Cleanup

- Remove unused Skeleton `preset-*` class references
- Audit `pnpm check` for TypeScript errors (0 errors, 0 warnings target)
- Verify Google Fonts load correctly in both `pnpm dev` and `pnpm dev:netlify`
- Test auth-conditional rendering on landing page (logged in vs logged out)
- Test mobile responsive layout for Header hamburger menu
- Test dark-mode — zine design is light-only; add `color-scheme: light` on `:root` to disable dark mode system overrides

---

## Key Constraints

- **No new dependencies** — zine styles are pure CSS custom properties + Google Fonts; Skeleton UI can stay (it provides
  modal/overlay primitives still used by `ConfirmDialog`)
- **Svelte 5 patterns** — `$state`, `$derived`, `$props()`, no legacy runes
- **Dynamic Tailwind classes** — ternary literals only, no string interpolation
- **`pnpm check` must pass** after every phase with 0 errors
- **DO NOT COMMIT** unless explicitly asked

---

## Reference Files

| What                     | Where                                     |
|--------------------------|-------------------------------------------|
| Design token spec        | `docs/design.md`                          |
| Full zine implementation | `src/routes/preview/zine/+page.svelte`    |
| Root layout              | `src/routes/+layout.svelte`               |
| Header component         | `src/lib/components/layout/Header.svelte` |
| Footer component         | `src/lib/components/layout/Footer.svelte` |
| Current landing page     | `src/routes/+page.svelte`                 |

# Design System: Xerox Zine

## Philosophy

The Xerox Zine direction channels the energy of DIY punk flyers and underground zine culture. Everything looks like it
was cut, pasted, and photocopied — intentionally imperfect, densely typeset, and unmistakably handmade. The aesthetic
signals authenticity: this is a tool built by and for the community, not a corporate product.

**Three-word vibe:** Raw, scrappy, loud.

---

## Dribbble Description (Landing Page)

Off-white paper-textured background, slightly warm. Hero section slams a bold hand-lettered headline — "YOUR SCENE. YOUR
PEOPLE." — at a slight tilt, in dense black ink. Beneath it, a red ink-stamp button: FIND YOUR TEAM. Rough-cut dashed
borders divide sections like scissored newspaper columns. Navigation is mono-spaced, all-caps, tight. Feature cards look
like torn index cards pinned unevenly — each with a hand-circled label and a single icon. Typography breathes unevenly:
big, crashingly loud headers shrink into small dense Courier body text. Teal and red appear as highlight blobs behind
key phrases, like marker swipes. Spacing is intentionally imperfect — things feel pasted, not aligned. Buttons have
thick black borders, no radius. The overall mood: a flyer for something underground that you have to check out.

---

## Colors

All colors are defined as CSS custom properties on the root wrapper. Change the 6 hex values to retheme the entire UI.

| Token              | Value     | Usage                                    |
|--------------------|-----------|------------------------------------------|
| `--zine-bg`        | `#F4EFE6` | Page background — warm off-white paper   |
| `--zine-surface`   | `#EBE5D8` | Card backgrounds — slightly darker paper |
| `--zine-primary`   | `#1C1C1C` | Text, borders, shadows — near-black ink  |
| `--zine-accent`    | `#D93B2B` | Red ink stamp — CTAs, alerts, highlights |
| `--zine-muted`     | `#2E7D7D` | Teal — secondary accents, tags, icons    |
| `--zine-highlight` | `#F2C84B` | Yellow marker — CTA strips, callout bg   |

---

## Typography

### Fonts

- **Heading:** Permanent Marker (Google Fonts) — hand-lettered, kinetic, loud
- **Body:** Courier Prime (Google Fonts) — typewriter mono, dense, archival

Both loaded via `<svelte:head>` Google Fonts embed. No system font fallback needed for preview; production can add
`cursive` and `monospace` fallbacks.

### Scale

| Role        | Size    | Weight | Treatment                        |
|-------------|---------|--------|----------------------------------|
| Hero H1     | 88px    | 400    | Permanent Marker, rotated −2deg  |
| Section H2  | 36px    | 400    | Permanent Marker, rotated −1deg  |
| CTA H2      | 42px    | 400    | Permanent Marker, centered       |
| Card label  | 14px    | 700    | Courier Prime, ALL-CAPS, tracked |
| Body copy   | 16px    | 400    | Courier Prime, 1.7 line-height   |
| Small / tag | 10–12px | 700    | Courier Prime, ALL-CAPS, spaced  |
| Wordmark    | 20px    | 400    | Permanent Marker                 |

---

## UI Style

### Borders & Radius

- **Border:** `2px solid #1C1C1C` on all interactive elements and cards
- **Border radius:** `0px` — sharp corners everywhere, no exceptions

### Shadow

- **Standard:** `4px 4px 0px #1C1C1C` — offset flat shadow, no blur
- **Hover state:** `6px 6px 0px #1C1C1C` + `translate(-2px, -2px)` — lifts the element
- No `box-shadow` blur values. Ever.

### Buttons

| Variant        | Background       | Color              | Border              |
|----------------|------------------|--------------------|---------------------|
| `.btn-accent`  | `--zine-accent`  | white              | `2px solid primary` |
| `.btn-outline` | transparent      | `--zine-primary`   | `2px solid primary` |
| `.btn-dark`    | `--zine-primary` | `--zine-highlight` | `2px solid primary` |

All buttons: ALL-CAPS label, Courier Prime, `letter-spacing: 0.08em`, no border radius, offset shadow.

### Cards

```
background:  var(--zine-surface)   /* #EBE5D8 */
border:      2px solid #1C1C1C
box-shadow:  4px 4px 0px #1C1C1C
border-radius: 0
padding:     24px
```

Card anatomy (top to bottom):

1. **Tag** — 10px ALL-CAPS, teal border, teal text (`--zine-muted`)
2. **Icon** — 28px, accent color (`--zine-accent`)
3. **Label** — 14px bold ALL-CAPS Courier
4. **Description** — 13px Courier, 80% opacity

---

## Spacing

| Token           | Value                           |
|-----------------|---------------------------------|
| Base unit       | 4px                             |
| Card padding    | 24px                            |
| Grid gap        | 24px                            |
| Section padding | 64px vertical / 48px horizontal |
| Hero padding    | 80px vertical / 64px horizontal |
| Nav padding     | 16px vertical / 32px horizontal |

---

## Layout Structure

```
┌─────────────────────────────────────────┐
│ NAV: Wordmark | Links | CTA button      │  sticky, border-bottom
├─────────────────────────────────────────┤
│ HERO: big tilted headline               │  2-col: text + stamp deco
│       body copy                         │
│       [RED BUTTON] [OUTLINE BUTTON]     │
├─────────────────────────────────────────┤
│ ★ DECORATIVE RULE ★                    │  teal text, surface bg
├─────────────────────────────────────────┤
│ FEATURES: section heading (tilted)      │  3-col card grid
│ [ card ] [ card ] [ card ]              │
│ [ card ] [ card ] [ card ]              │
│ [ card ] [ card ] [ card ]              │
├─────────────────────────────────────────┤
│ CTA STRIP: yellow bg, centered          │  eyebrow + heading + button
├─────────────────────────────────────────┤
│ FOOTER: wordmark | meta text            │  dark bg, yellow wordmark
└─────────────────────────────────────────┘
```

---

## Iterability Notes

The preview page (`/preview/zine`) is designed to make visual iteration fast:

- **All colors** are CSS variables defined in one block at the top of `.zine-root` — retheme by changing 6 hex values
- **All feature cards** are driven by a `const features = [...]` array — add, remove, or reorder without touching markup
- **Section structure** is clearly separated with comments — move sections independently
- **Button variants** are defined as separate CSS classes — swap variants by changing a single class name
- **Font pairing** is swappable via `--font-heading` and `--font-body` CSS variables

---

## Inspiration

- Riot Grrrl zines (1990s Pacific Northwest)
- Early 90s punk show handbills
- Crass Records sleeves
- Chicago Reader classified sections
- Kinko's circa 1994

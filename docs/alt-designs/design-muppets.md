# Muppets (70s Variety Show) — Design System

## Philosophy

The Muppets direction draws from the warm, earnest energy of classic variety television — Saturday night specials, beloved local programming, the feeling of something that's been on the air for thirty years and everyone in town watches. Nothing is rushed. Margins are generous. Colors are harvest-warm. The aesthetic communicates community through coziness, not urgency.

**Three-word vibe:** Groovy, warm, theatrical.

---

## Dribbble Description (Landing Page)

Warm cream background with a large decorative sunburst radiating behind the hero — alternating gold and cream rays, softly transparent. The headline sits in tall serif type: "Pittsburgh's Comedy Community" in deep brown, soft and inviting. Below it, a harvest-gold pill button with rounded ends: **Get On Stage**. Sections stack in generous, relaxed columns separated by thin wavy dividers in burnt orange. Feature cards have rounded corners, a faint drop shadow, and a 6px burnt-orange top accent stripe. Icons are chunky and friendly. Body type is clean sans-serif, airy, with generous line-height. Avocado green appears as a badge color on team and role listings. The nav is a warm-brown bar with cream lettering, slightly oversized. Everything breathes — wide margins, unhurried rhythm. Mood: a beloved local TV show everyone in town knows.

---

## Colors

All colors are defined as CSS custom properties on the root wrapper.

| Token          | Value     | Usage                                          |
|----------------|-----------|------------------------------------------------|
| `--v-bg`       | `#F7EDD5` | Page background — warm cream                   |
| `--v-surface`  | `#F0E4C3` | Card backgrounds — slightly deeper cream       |
| `--v-primary`  | `#3D2B1F` | Text, nav — deep warm brown                    |
| `--v-accent`   | `#C85C1A` | Burnt orange — card stripes, dividers, icons   |
| `--v-muted`    | `#6B8C3E` | Avocado green — badges, tags, secondary accents|
| `--v-highlight`| `#D4A843` | Harvest gold — primary buttons, sunburst rays  |

---

## Typography

### Fonts
- **Heading:** Playfair Display — tall, editorial serif; warm, inviting, slightly formal
- **Body:** DM Sans — clean, optically-sized sans-serif; light and airy at large line-heights

Both loaded via `<svelte:head>` Google Fonts embed.

### Scale

| Role         | Size   | Weight | Treatment                              |
|--------------|--------|--------|----------------------------------------|
| Hero H1      | 56px   | 700    | Playfair Display, centered             |
| Hero H1 (sm) | 40px   | 700    | Playfair Display, responsive           |
| Section H2   | 36px   | 600    | Playfair Display                       |
| CTA H2       | 40px   | 700    | Playfair Display, centered             |
| Card label   | 16px   | 600    | DM Sans                                |
| Body copy    | 17px   | 400    | DM Sans, 1.8 line-height               |
| Small / badge| 12px   | 500    | DM Sans, ALL-CAPS, tracked             |
| Nav links    | 15px   | 500    | DM Sans, cream on brown                |
| Wordmark     | 22px   | 700    | Playfair Display, italic               |

---

## UI Style

### Borders & Radius
- **Cards:** `border-radius: 14px`
- **Buttons (primary/outline):** `border-radius: 9999px` — pill shape
- **Badges:** `border-radius: 9999px`
- No hard borders on cards — shadow defines the edge

### Shadow
- **Card:** `0 4px 20px rgba(61, 43, 31, 0.10)` — soft, diffuse, no offset
- **Card hover:** `0 8px 32px rgba(61, 43, 31, 0.15)` — slightly deeper
- **Button:** `0 2px 8px rgba(61, 43, 31, 0.15)` on primary
- No hard offset shadows

### Buttons

| Variant          | Background        | Color          | Shape  |
|------------------|-------------------|----------------|--------|
| `.btn-primary`   | `--v-highlight`   | `--v-primary`  | pill   |
| `.btn-outline`   | transparent       | `--v-primary`  | pill, 2px border |
| `.btn-dark`      | `--v-primary`     | `--v-bg`       | pill   |

All buttons: DM Sans, `font-weight: 600`, `padding: 12px 28px`.

### Cards

```
background:    var(--v-surface)
border-radius: 14px
box-shadow:    0 4px 20px rgba(61, 43, 31, 0.10)
overflow:      hidden  ← enables the top stripe
```

Card anatomy:
1. **Top stripe** — `6px` height, `background: var(--v-accent)` (burnt orange)
2. **Badge** — pill, avocado green bg, cream text, 12px ALL-CAPS DM Sans
3. **Icon** — 28px, accent color
4. **Label** — 16px DM Sans semibold
5. **Description** — 14px DM Sans, 1.6 line-height, muted opacity

---

## Spacing

| Token            | Value              |
|------------------|--------------------|
| Base unit        | 4px                |
| Card padding     | 28px               |
| Grid gap         | 28px               |
| Section padding  | 80px vertical / 48px horizontal |
| Hero padding     | 100px vertical / 64px horizontal |
| Nav padding      | 20px vertical / 40px horizontal |

---

## Layout Structure

```
┌─────────────────────────────────────────────┐
│ NAV: Wordmark (italic serif) | Links | CTA  │  brown bg, cream text, sticky
├─────────────────────────────────────────────┤
│          [SUNBURST — CSS conic-gradient]     │
│  HERO:   Pittsburgh's Comedy Community       │  centered, sunburst behind
│          body copy                           │
│          [GOLD PILL] [OUTLINE PILL]          │
├─────────────────────────────────────────────┤
│  ~~~~ wavy SVG divider in burnt orange ~~~~ │
├─────────────────────────────────────────────┤
│  FEATURES: section heading                  │  3-col card grid
│  [ card ] [ card ] [ card ]                 │  each: orange stripe, badge, icon
│  [ card ] [ card ] [ card ]                 │
│  [ card ] [ card ] [ card ]                 │
├─────────────────────────────────────────────┤
│  ~~~~ wavy SVG divider ~~~~                 │
├─────────────────────────────────────────────┤
│  CTA STRIP: avocado green bg, centered      │  eyebrow + serif heading + pill btn
├─────────────────────────────────────────────┤
│  FOOTER: wordmark | meta text               │  brown bg, cream text
└─────────────────────────────────────────────┘
```

---

## Decorative Elements

### Sunburst
CSS `repeating-conic-gradient` — alternating harvest-gold and transparent rays, 20° segments, low opacity (0.25–0.35), centered absolutely behind hero content.

### Wavy Divider
Inline SVG `<path>` with a sine-wave curve, `stroke: var(--v-accent)`, no fill, `stroke-width: 2`, full width.

---

## Iterability Notes

- **All colors** in one block at the top of `.variety-root` — retheme by changing 6 values
- **Feature cards** driven by `const features = [...]` array — add/reorder without touching markup
- **Sunburst** controlled by CSS variables for size/opacity — easy to tune or disable
- **Wavy divider** is a reusable component snippet — copy to add between any sections
- **Font pairing** swappable via `--font-heading` and `--font-body` CSS variables

---

## Inspiration

- The Muppet Show (1976–1981)
- Classic PBS variety programming
- Harvest Gold / Avocado Green era American design
- Bob Ross, Captain Kangaroo, Mr. Rogers' Neighborhood
- Vintage Pittsburgh theater programs

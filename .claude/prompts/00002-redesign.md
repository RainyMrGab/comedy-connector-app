You are a senior product designer.

Generate 5 clearly different visual design directions for a web app.

For each direction include:

- Name of the style
- 3-word vibe
- 5-color palette (hex)
- Font pairing
- One real-world design inspiration

Constraints:

- Keep each direction under 80 words
- Do NOT write code
- Focus on distinctive visual identity

Context:
Comedy Connector is the open-source project that allows a city's (mostly improv) comedy community to connect, especially
up-and-coming talent. It's a community-focused app that allows people to find teams, coaches, and openers (mainly).

Target vibe: nostalgic, DIY, community, welcoming

-------

## Comedy Connector — Design Directions

---

### 1. Xerox Zine

**Vibe:** Raw, scrappy, loud

`#F4EFE6` `#1C1C1C` `#D93B2B` `#F2C84B` `#2E7D7D`

**Fonts:** Permanent Marker + Courier Prime

Torn edges, photocopied textures, hand-circled callouts. Feels like a flyer stapled to a telephone pole. **Inspiration:
** Riot Grrrl zines, early 90s punk show handbills.

---

### 2. 70s Variety Show

**Vibe:** Groovy, warm, theatrical

`#C85C1A` `#D4A843` `#F7EDD5` `#6B8C3E` `#3D2B1F`

**Fonts:** Playfair Display + DM Sans

Sunburst motifs, rounded cards, warm harvest tones. Feels like opening credits rolling on a Saturday night special. *
*Inspiration:** The Muppet Show, classic PBS variety programming.

---------

----

I like the Xerox Zine and 70s Variety Show

For these 2 design directions...

Describe what the landing page would LOOK like visually.

Focus on:

- layout structure
- typography feeling
- spacing
- color usage
- button style
- card style
- hero section
- overall mood

Write it like you are describing a screenshot on Dribbble.

Constraints:

- 120–180 words
- No code
- No design explanations
- Just the visual description

Features overview:

- Create a personal profile
- Add a coach profile
- Add a team and link performers
- Find an opener (team who wants to open)
- Find a coach
- Join a practice group looking for new members
- Join a team looking for new members
- View team profiles
- View resources

--------

## Xerox Zine — Landing Page

Off-white paper-textured background, slightly warm. Hero section slams a bold hand-lettered headline — "YOUR SCENE. YOUR
PEOPLE." — at a slight tilt, in dense black ink. Beneath it, a red ink-stamp button: FIND YOUR TEAM. Rough-cut dashed
borders divide sections like scissored newspaper columns. Navigation is mono-spaced, all-caps, tight. Feature cards look
like torn index cards pinned unevenly — each with a hand-circled label and a single icon. Typography breathes unevenly:
big, crashingly loud headers shrink into small dense Courier body text. Teal and red appear as highlight blobs behind
key phrases, like marker swipes. Spacing is intentionally imperfect — things feel pasted, not aligned. Buttons have
thick black borders, no radius. The overall mood: a flyer for something underground that you *have* to check out.

---

## 70s Variety Show — Landing Page

Warm cream background with a large, decorative sunburst radiating behind the hero. The headline is set in a tall
serif — "Pittsburgh's Comedy Community" — in deep brown, soft and inviting. Below it, a harvest-gold pill button with
rounded ends: **Get On Stage**. Sections stack in generous, relaxed columns separated by thin wavy dividers. Feature
cards have rounded corners, a faint drop shadow, and a burnt-orange top accent stripe. Icons feel retro-illustrated —
chunky and friendly. Body type is clean sans-serif but airy, with generous line-height. Avocado green appears as a badge
color on team listings. The nav has a warm-brown bar with cream lettering, slightly oversized. Everything has a cozy,
unhurried rhythm — wide margins, slow scroll. Mood: a beloved local TV show that's been on the air for thirty years and
everyone in town watches.

--------

Ok let's go with Xerox Zine for now. Convert this design direction into a concise design system for SvelteKit using
Tailwind v4 + Skeleton UI v4.

Return only:

COLORS

- background
- surface
- primary
- accent
- muted

TYPOGRAPHY

- heading font
- body font
- size scale

UI STYLE

- border radius
- shadow style
- button style
- card style

SPACING

- base spacing unit
- section padding

Keep it implementation-ready.
Keep it under 120 words.

---

Now summarize the entire 70s variety show design philosophy and design system we've come up with in a Markdown 
document at @docs/design-[theme].md. Let's use "muppets" as the one-word theme name.

Then using that design system doc, create a simple Svelte design preview page to iterate on a new
design. Create it at /routes/preview/[theme]/+page.svelte, and model it after the visual
description described in the design philosophy doc.

Constraints:

- Single file
- Same stack: Svelte + SvelteKit + Tailwind v4 + Skeleton UI v4 + Lucide Svelte icons
- Build the layout such that it will be easy to iterate on the design as much as possble.

Use CSS variables for colors.

Do NOT include explanations.
Only return code.
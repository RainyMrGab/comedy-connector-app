<script lang="ts">
	import {
		Mic2,
		Users,
		UserCheck,
		Search,
		Plus,
		ArrowRight,
		BookOpen,
		Star,
		Calendar
	} from 'lucide-svelte';
	const features = [
		{
			icon: Mic2,
			label: 'Create a Profile',
			tag: 'PERFORMER',
			desc: "Tell the scene who you are — shows, experience, and what you're looking for."
		},
		{
			icon: UserCheck,
			label: 'Add a Coach Profile',
			tag: 'COACH',
			desc: 'List your coaching style, availability, and what you specialize in.'
		},
		{
			icon: Users,
			label: 'Add a Team',
			tag: 'TEAM',
			desc: 'Create a team page and link your performers. Build your roster.'
		},
		{
			icon: Search,
			label: 'Find an Opener',
			tag: 'CONNECT',
			desc: 'Looking for a team to open your show? Browse teams seeking stage time.'
		},
		{
			icon: Star,
			label: 'Find a Coach',
			tag: 'CONNECT',
			desc: 'Browse coaches by style, availability, and focus area.'
		},
		{
			icon: Plus,
			label: 'Join a Practice Group',
			tag: 'JOIN',
			desc: 'Find groups actively looking for new members to join their practice.'
		},
		{
			icon: Calendar,
			label: 'Join a Team',
			tag: 'JOIN',
			desc: 'Teams looking for performers post their openings here.'
		},
		{
			icon: BookOpen,
			label: 'View Team Profiles',
			tag: 'BROWSE',
			desc: "See who's on the roster, upcoming shows, and how to get in touch."
		},
		{
			icon: ArrowRight,
			label: 'View Resources',
			tag: 'LEARN',
			desc: 'Workshops, jams, and local opportunities curated for the scene.'
		}
	];
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Permanent+Marker&display=swap"
		rel="stylesheet"
	/>
	<title>Xerox Zine — Design Preview</title>
</svelte:head>

<div class="zine-root">
	<!-- ── NAV ──────────────────────────────────────────────── -->
	<nav class="zine-nav">
		<span class="wordmark">COMEDY CONNECTOR</span>
		<div class="nav-links">
			<a href="#find">FIND</a>
			<a href="#connect">CONNECT</a>
			<a href="#resources">RESOURCES</a>
		</div>
		<button class="btn-outline">JOIN THE SCENE</button>
	</nav>

	<!-- ── HERO ─────────────────────────────────────────────── -->
	<section class="hero">
		<div class="hero-inner">
			<div class="hero-headline">
				<h1 class="headline-line">YOUR SCENE.</h1>
				<h1 class="headline-line indent">YOUR PEOPLE.</h1>
			</div>
			<p class="hero-sub">
				Pittsburgh's open directory for improv performers, coaches, and teams.<br />
				Find your crew. Build your scene.
			</p>
			<div class="hero-actions">
				<button class="btn-accent">
					FIND YOUR TEAM <ArrowRight size={18} />
				</button>
				<button class="btn-outline">MAKE A PROFILE</button>
			</div>
		</div>
		<div class="hero-deco" aria-hidden="true">
			<span class="stamp">EST.<br />PITTSBURGH</span>
		</div>
	</section>

	<!-- ── DECORATIVE RULE ───────────────────────────────────── -->
	<div class="section-rule" aria-hidden="true">
		★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★ ★
	</div>

	<!-- ── FEATURES ──────────────────────────────────────────── -->
	<section class="features" id="find">
		<h2 class="section-heading">WHAT CAN YOU DO HERE?</h2>
		<div class="features-grid">
			{#each features as feature}
				<div class="zine-card">
					<div class="card-tag">{feature.tag}</div>
					<div class="card-icon">
						<feature.icon size={28} />
					</div>
					<h3 class="card-label">{feature.label}</h3>
					<p class="card-desc">{feature.desc}</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- ── CTA STRIP ─────────────────────────────────────────── -->
	<section class="cta-strip">
		<div class="cta-inner">
			<p class="cta-eyebrow">— IT'S FREE, FOREVER —</p>
			<h2 class="cta-heading">READY TO GET INVOLVED?</h2>
			<button class="btn-dark">
				CREATE YOUR PROFILE <ArrowRight size={18} />
			</button>
		</div>
	</section>

	<!-- ── FOOTER ────────────────────────────────────────────── -->
	<footer class="zine-footer">
		<span class="wordmark">COMEDY CONNECTOR</span>
		<span class="footer-meta">OPEN SOURCE · PITTSBURGH · MADE WITH ❤</span>
	</footer>
</div>

<style>
	/* ─── DESIGN TOKENS ──────────────────────────────────────── */
	/* Edit these 6 values to retheme the entire page            */
	.zine-root {
		--zine-bg: #f4efe6;
		--zine-surface: #ebe5d8;
		--zine-primary: #1c1c1c;
		--zine-accent: #d93b2b;
		--zine-muted: #2e7d7d;
		--zine-highlight: #f2c84b;

		--zine-shadow: 4px 4px 0px var(--zine-primary);
		--zine-border: 2px solid var(--zine-primary);

		--font-heading: 'Permanent Marker', cursive;
		--font-body: 'Courier Prime', monospace;

		background: var(--zine-bg);
		color: var(--zine-primary);
		font-family: var(--font-body);
		min-height: 100vh;
	}

	/* ─── NAV ────────────────────────────────────────────────── */
	.zine-nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 32px;
		border-bottom: var(--zine-border);
		background: var(--zine-bg);
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.wordmark {
		font-family: var(--font-heading);
		font-size: 20px;
		letter-spacing: 0.04em;
	}

	.nav-links {
		display: flex;
		gap: 32px;
	}

	.nav-links a {
		font-family: var(--font-body);
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-decoration: none;
		color: var(--zine-primary);
	}

	.nav-links a:hover {
		color: var(--zine-accent);
	}

	/* ─── BUTTONS ─────────────────────────────────────────────── */
	.btn-outline {
		font-family: var(--font-body);
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.08em;
		background: transparent;
		color: var(--zine-primary);
		border: var(--zine-border);
		padding: 8px 16px;
		cursor: pointer;
		box-shadow: var(--zine-shadow);
		transition:
			transform 0.1s,
			box-shadow 0.1s;
	}

	.btn-outline:hover {
		transform: translate(-2px, -2px);
		box-shadow: 6px 6px 0px var(--zine-primary);
	}

	.btn-accent {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-family: var(--font-body);
		font-size: 14px;
		font-weight: 700;
		letter-spacing: 0.08em;
		background: var(--zine-accent);
		color: #fff;
		border: var(--zine-border);
		padding: 12px 24px;
		cursor: pointer;
		box-shadow: var(--zine-shadow);
		transition:
			transform 0.1s,
			box-shadow 0.1s;
	}

	.btn-accent:hover {
		transform: translate(-2px, -2px);
		box-shadow: 6px 6px 0px var(--zine-primary);
	}

	.btn-dark {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-family: var(--font-body);
		font-size: 14px;
		font-weight: 700;
		letter-spacing: 0.08em;
		background: var(--zine-primary);
		color: var(--zine-highlight);
		border: var(--zine-border);
		padding: 12px 28px;
		cursor: pointer;
		box-shadow: 4px 4px 0px #555;
		transition:
			transform 0.1s,
			box-shadow 0.1s;
	}

	.btn-dark:hover {
		transform: translate(-2px, -2px);
		box-shadow: 6px 6px 0px #555;
	}

	/* ─── HERO ───────────────────────────────────────────────── */
	.hero {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 80px 64px;
		border-bottom: var(--zine-border);
		gap: 48px;
		overflow: hidden;
	}

	.hero-inner {
		flex: 1;
		max-width: 640px;
	}

	.hero-headline {
		transform: rotate(-2deg);
		transform-origin: left center;
		margin-bottom: 32px;
	}

	.headline-line {
		font-family: var(--font-heading);
		font-size: clamp(48px, 8vw, 88px);
		line-height: 1.05;
		color: var(--zine-primary);
		display: block;
	}

	.headline-line.indent {
		margin-left: 24px;
	}

	.hero-sub {
		font-size: 16px;
		line-height: 1.7;
		color: var(--zine-primary);
		margin-bottom: 32px;
		max-width: 480px;
		opacity: 0.85;
	}

	.hero-actions {
		display: flex;
		gap: 16px;
		flex-wrap: wrap;
	}

	.hero-deco {
		flex-shrink: 0;
	}

	.stamp {
		display: block;
		font-family: var(--font-heading);
		font-size: 22px;
		line-height: 1.3;
		text-align: center;
		color: var(--zine-accent);
		border: 4px solid var(--zine-accent);
		padding: 20px 28px;
		transform: rotate(8deg);
		opacity: 0.65;
		letter-spacing: 0.05em;
	}

	/* ─── DECORATIVE RULE ────────────────────────────────────── */
	.section-rule {
		text-align: center;
		padding: 12px 0;
		font-size: 13px;
		letter-spacing: 0.15em;
		color: var(--zine-muted);
		border-bottom: var(--zine-border);
		background: var(--zine-surface);
		overflow: hidden;
		white-space: nowrap;
	}

	/* ─── FEATURES ───────────────────────────────────────────── */
	.features {
		padding: 64px 48px;
	}

	.section-heading {
		font-family: var(--font-heading);
		font-size: 36px;
		margin-bottom: 40px;
		color: var(--zine-primary);
		transform: rotate(-1deg);
		display: inline-block;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 24px;
	}

	/* ─── CARD ───────────────────────────────────────────────── */
	.zine-card {
		background: var(--zine-surface);
		border: var(--zine-border);
		box-shadow: var(--zine-shadow);
		padding: 24px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		transition:
			transform 0.1s,
			box-shadow 0.1s;
	}

	.zine-card:hover {
		transform: translate(-2px, -2px);
		box-shadow: 6px 6px 0px var(--zine-primary);
	}

	.card-tag {
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.12em;
		color: var(--zine-muted);
		border: 1px solid var(--zine-muted);
		display: inline-block;
		padding: 2px 8px;
		width: fit-content;
	}

	.card-icon {
		color: var(--zine-accent);
		margin-top: 4px;
	}

	.card-label {
		font-family: var(--font-body);
		font-size: 14px;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--zine-primary);
	}

	.card-desc {
		font-size: 13px;
		line-height: 1.6;
		color: var(--zine-primary);
		opacity: 0.8;
	}

	/* ─── CTA STRIP ──────────────────────────────────────────── */
	.cta-strip {
		background: var(--zine-highlight);
		border-top: var(--zine-border);
		border-bottom: var(--zine-border);
		padding: 64px 48px;
	}

	.cta-inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
		text-align: center;
	}

	.cta-eyebrow {
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.15em;
		color: var(--zine-primary);
		opacity: 0.7;
	}

	.cta-heading {
		font-family: var(--font-heading);
		font-size: 42px;
		color: var(--zine-primary);
	}

	/* ─── FOOTER ─────────────────────────────────────────────── */
	.zine-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 24px 48px;
		border-top: var(--zine-border);
		background: var(--zine-primary);
		color: var(--zine-bg);
	}

	.zine-footer .wordmark {
		color: var(--zine-highlight);
	}

	.footer-meta {
		font-size: 11px;
		letter-spacing: 0.1em;
		opacity: 0.6;
	}
</style>

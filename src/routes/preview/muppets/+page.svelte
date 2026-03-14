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
			badge: 'PERFORMER',
			desc: "Tell the scene who you are — shows, experience, and what you're looking for."
		},
		{
			icon: UserCheck,
			label: 'Add a Coach Profile',
			badge: 'COACH',
			desc: 'List your coaching style, availability, and what you specialize in.'
		},
		{
			icon: Users,
			label: 'Add a Team',
			badge: 'TEAM',
			desc: 'Create a team page and link your performers. Build your roster.'
		},
		{
			icon: Search,
			label: 'Find an Opener',
			badge: 'CONNECT',
			desc: 'Looking for a team to open your show? Browse teams seeking stage time.'
		},
		{
			icon: Star,
			label: 'Find a Coach',
			badge: 'CONNECT',
			desc: 'Browse coaches by style, availability, and focus area.'
		},
		{
			icon: Plus,
			label: 'Join a Practice Group',
			badge: 'JOIN',
			desc: 'Find groups actively looking for new members to join their practice.'
		},
		{
			icon: Calendar,
			label: 'Join a Team',
			badge: 'JOIN',
			desc: 'Teams looking for performers post their openings here.'
		},
		{
			icon: BookOpen,
			label: 'View Team Profiles',
			badge: 'BROWSE',
			desc: "See who's on the roster, upcoming shows, and how to get in touch."
		},
		{
			icon: ArrowRight,
			label: 'View Resources',
			badge: 'LEARN',
			desc: 'Workshops, jams, and local opportunities curated for the scene.'
		}
	];
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap"
		rel="stylesheet"
	/>
	<title>Muppets (70s Variety) — Design Preview</title>
</svelte:head>

<div class="variety-root">
	<!-- ── NAV ──────────────────────────────────────────────── -->
	<nav class="v-nav">
		<span class="wordmark"><em>Comedy Connector</em></span>
		<div class="nav-links">
			<a href="#find">Find</a>
			<a href="#connect">Connect</a>
			<a href="#resources">Resources</a>
		</div>
		<button class="btn-light">Join the Scene</button>
	</nav>

	<!-- ── HERO ─────────────────────────────────────────────── -->
	<section class="hero">
		<div class="sunburst" aria-hidden="true"></div>
		<div class="hero-inner">
			<p class="hero-eyebrow">Pittsburgh's open community for comedy</p>
			<h1 class="hero-heading">Pittsburgh's<br />Comedy Community</h1>
			<p class="hero-sub">
				Find performers, coaches, and teams. Connect with the people who make the local scene go.
			</p>
			<div class="hero-actions">
				<button class="btn-primary">Get On Stage <ArrowRight size={18} /></button>
				<button class="btn-outline">Make a Profile</button>
			</div>
		</div>
	</section>

	<!-- ── WAVY DIVIDER ──────────────────────────────────────── -->
	<div class="wavy-divider" aria-hidden="true">
		<svg viewBox="0 0 1200 48" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
			<path
				d="M0,24 C100,4 200,44 300,24 C400,4 500,44 600,24 C700,4 800,44 900,24 C1000,4 1100,44 1200,24"
				stroke-width="2.5"
				fill="none"
			/>
		</svg>
	</div>

	<!-- ── FEATURES ──────────────────────────────────────────── -->
	<section class="features" id="find">
		<h2 class="section-heading">What can you do here?</h2>
		<div class="features-grid">
			{#each features as feature}
				<div class="v-card">
					<div class="card-stripe"></div>
					<div class="card-body">
						<span class="card-badge">{feature.badge}</span>
						<div class="card-icon">
							<feature.icon size={28} />
						</div>
						<h3 class="card-label">{feature.label}</h3>
						<p class="card-desc">{feature.desc}</p>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- ── WAVY DIVIDER ──────────────────────────────────────── -->
	<div class="wavy-divider" aria-hidden="true">
		<svg viewBox="0 0 1200 48" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
			<path
				d="M0,24 C100,4 200,44 300,24 C400,4 500,44 600,24 C700,4 800,44 900,24 C1000,4 1100,44 1200,24"
				stroke-width="2.5"
				fill="none"
			/>
		</svg>
	</div>

	<!-- ── CTA STRIP ─────────────────────────────────────────── -->
	<section class="cta-strip" id="connect">
		<p class="cta-eyebrow">Free, always, for everyone</p>
		<h2 class="cta-heading">Ready to get involved?</h2>
		<button class="btn-dark">
			Create Your Profile <ArrowRight size={18} />
		</button>
	</section>

	<!-- ── FOOTER ────────────────────────────────────────────── -->
	<footer class="v-footer">
		<span class="wordmark"><em>Comedy Connector</em></span>
		<span class="footer-meta">Open source · Pittsburgh · Made with love</span>
	</footer>
</div>

<style>
	/* ─── DESIGN TOKENS ──────────────────────────────────────── */
	/* Edit these 6 values to retheme the entire page            */
	.variety-root {
		--v-bg: #f7edd5;
		--v-surface: #f0e4c3;
		--v-primary: #3d2b1f;
		--v-accent: #c85c1a;
		--v-muted: #6b8c3e;
		--v-highlight: #d4a843;

		--v-shadow-card: 0 4px 20px rgba(61, 43, 31, 0.1);
		--v-shadow-card-hover: 0 8px 32px rgba(61, 43, 31, 0.16);
		--v-shadow-btn: 0 2px 8px rgba(61, 43, 31, 0.15);

		--font-heading: 'Playfair Display', Georgia, serif;
		--font-body: 'DM Sans', system-ui, sans-serif;

		/* Sunburst controls */
		--sunburst-size: 780px;
		--sunburst-opacity: 0.28;

		background: var(--v-bg);
		color: var(--v-primary);
		font-family: var(--font-body);
		min-height: 100vh;
	}

	/* ─── NAV ────────────────────────────────────────────────── */
	.v-nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20px 40px;
		background: var(--v-primary);
		color: var(--v-bg);
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.wordmark {
		font-family: var(--font-heading);
		font-size: 22px;
		color: var(--v-highlight);
	}

	.nav-links {
		display: flex;
		gap: 36px;
	}

	.nav-links a {
		font-size: 15px;
		font-weight: 500;
		color: var(--v-bg);
		text-decoration: none;
		opacity: 0.85;
		transition: opacity 0.15s;
	}

	.nav-links a:hover {
		opacity: 1;
	}

	/* ─── BUTTONS ─────────────────────────────────────────────── */
	.btn-primary {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 600;
		background: var(--v-highlight);
		color: var(--v-primary);
		border: none;
		border-radius: 9999px;
		padding: 13px 28px;
		cursor: pointer;
		box-shadow: var(--v-shadow-btn);
		transition:
			transform 0.15s,
			box-shadow 0.15s;
	}

	.btn-primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 18px rgba(61, 43, 31, 0.22);
	}

	.btn-outline {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 600;
		background: transparent;
		color: var(--v-primary);
		border: 2px solid var(--v-primary);
		border-radius: 9999px;
		padding: 11px 28px;
		cursor: pointer;
		transition:
			background 0.15s,
			color 0.15s;
	}

	.btn-outline:hover {
		background: var(--v-primary);
		color: var(--v-bg);
	}

	.btn-light {
		font-family: var(--font-body);
		font-size: 14px;
		font-weight: 600;
		background: var(--v-highlight);
		color: var(--v-primary);
		border: none;
		border-radius: 9999px;
		padding: 10px 22px;
		cursor: pointer;
		transition: opacity 0.15s;
	}

	.btn-light:hover {
		opacity: 0.88;
	}

	.btn-dark {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-family: var(--font-body);
		font-size: 15px;
		font-weight: 600;
		background: var(--v-primary);
		color: var(--v-bg);
		border: none;
		border-radius: 9999px;
		padding: 13px 32px;
		cursor: pointer;
		box-shadow: var(--v-shadow-btn);
		transition:
			transform 0.15s,
			box-shadow 0.15s;
	}

	.btn-dark:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 18px rgba(61, 43, 31, 0.22);
	}

	/* ─── HERO ───────────────────────────────────────────────── */
	.hero {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 100px 64px;
		text-align: center;
		overflow: hidden;
	}

	.sunburst {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: var(--sunburst-size);
		height: var(--sunburst-size);
		border-radius: 50%;
		background: repeating-conic-gradient(
			var(--v-highlight) 0deg 10deg,
			transparent 10deg 20deg
		);
		opacity: var(--sunburst-opacity);
		pointer-events: none;
	}

	.hero-inner {
		position: relative;
		z-index: 1;
		max-width: 640px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
	}

	.hero-eyebrow {
		font-size: 13px;
		font-weight: 500;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--v-accent);
		opacity: 0.9;
	}

	.hero-heading {
		font-family: var(--font-heading);
		font-size: clamp(40px, 6vw, 56px);
		font-weight: 700;
		line-height: 1.15;
		color: var(--v-primary);
	}

	.hero-sub {
		font-size: 17px;
		line-height: 1.8;
		color: var(--v-primary);
		opacity: 0.75;
		max-width: 480px;
	}

	.hero-actions {
		display: flex;
		gap: 16px;
		flex-wrap: wrap;
		justify-content: center;
		margin-top: 8px;
	}

	/* ─── WAVY DIVIDER ───────────────────────────────────────── */
	.wavy-divider {
		width: 100%;
		padding: 0 48px;
		box-sizing: border-box;
	}

	.wavy-divider svg {
		width: 100%;
		height: 48px;
		display: block;
	}

	.wavy-divider path {
		stroke: var(--v-accent);
		opacity: 0.45;
	}

	/* ─── FEATURES ───────────────────────────────────────────── */
	.features {
		padding: 64px 48px 80px;
	}

	.section-heading {
		font-family: var(--font-heading);
		font-size: 36px;
		font-weight: 600;
		color: var(--v-primary);
		margin-bottom: 40px;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 28px;
	}

	/* ─── CARD ───────────────────────────────────────────────── */
	.v-card {
		background: var(--v-surface);
		border-radius: 14px;
		box-shadow: var(--v-shadow-card);
		overflow: hidden;
		transition:
			transform 0.2s,
			box-shadow 0.2s;
	}

	.v-card:hover {
		transform: translateY(-4px);
		box-shadow: var(--v-shadow-card-hover);
	}

	.card-stripe {
		height: 6px;
		background: var(--v-accent);
	}

	.card-body {
		padding: 24px 28px 28px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.card-badge {
		display: inline-block;
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		background: var(--v-muted);
		color: #fff;
		border-radius: 9999px;
		padding: 3px 10px;
		width: fit-content;
	}

	.card-icon {
		color: var(--v-accent);
		margin-top: 4px;
	}

	.card-label {
		font-size: 16px;
		font-weight: 600;
		color: var(--v-primary);
		line-height: 1.3;
	}

	.card-desc {
		font-size: 14px;
		line-height: 1.65;
		color: var(--v-primary);
		opacity: 0.72;
	}

	/* ─── CTA STRIP ──────────────────────────────────────────── */
	.cta-strip {
		background: var(--v-muted);
		padding: 80px 48px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
		text-align: center;
	}

	.cta-eyebrow {
		font-size: 13px;
		font-weight: 500;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #fff;
		opacity: 0.75;
	}

	.cta-heading {
		font-family: var(--font-heading);
		font-size: 40px;
		font-weight: 700;
		color: #fff;
		line-height: 1.2;
	}

	/* ─── FOOTER ─────────────────────────────────────────────── */
	.v-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 24px 48px;
		background: var(--v-primary);
		color: var(--v-bg);
	}

	.v-footer .wordmark {
		color: var(--v-highlight);
	}

	.footer-meta {
		font-size: 12px;
		letter-spacing: 0.06em;
		opacity: 0.55;
	}
</style>

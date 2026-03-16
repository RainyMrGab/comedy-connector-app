<svelte:head>
	<title>Design Preview</title>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Source+Sans+3:wght@400;600&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<script lang="ts">
	import { Users, UserCheck, Mic2, Search, ArrowRight, Star, MapPin } from 'lucide-svelte';

	const teams = [
		{
			name: 'The Midnight Circus',
			type: 'Harold Team',
			members: 6,
			badge: 'Looking for Members',
			badgeColor: 'green',
			initials: ['MC', 'TJ', 'AL'],
		},
		{
			name: 'Chaos Theory',
			type: 'Shortform',
			members: 4,
			badge: 'Full',
			badgeColor: 'muted',
			initials: ['CT', 'BR', 'SE'],
		},
		{
			name: 'Sunday Funday',
			type: 'Practice Group',
			members: 8,
			badge: 'Open to Join',
			badgeColor: 'primary',
			initials: ['SF', 'KL', 'MN'],
		},
	];

	const coaches = [
		{
			name: 'Jamie Rivera',
			style: 'Character & Long Form',
			badge: 'Coach Available',
			badgeColor: 'accent',
			initials: 'JR',
		},
		{
			name: 'Taylor Kim',
			style: 'Shortform & Games',
			badge: 'Waitlist',
			badgeColor: 'muted',
			initials: 'TK',
		},
	];

	const performers = [
		{
			name: 'Alex Moreno',
			role: 'Opener',
			style: 'Alt Comedy',
			badge: 'Available',
			badgeColor: 'green',
			initials: 'AM',
		},
		{
			name: 'Sam Chen',
			role: 'Headliner',
			style: 'Sketch & Improv',
			badge: 'Booked',
			badgeColor: 'muted',
			initials: 'SC',
		},
	];

	const stickerTags = [
		{ label: 'Find a Team', color: 'primary', icon: Users },
		{ label: 'Find a Coach', color: 'accent', icon: UserCheck },
		{ label: 'Join a Practice Group', color: 'green', icon: Mic2 },
		{ label: 'Book an Opener', color: 'primary', icon: Star },
		{ label: 'Pittsburgh Comedy', color: 'accent', icon: MapPin },
	];

	const badgeClass: Record<string, string> = {
		green: 'badge-green',
		primary: 'badge-primary',
		accent: 'badge-accent',
		muted: 'badge-muted',
	};
</script>

<div class="preview-root">
	<!-- ============================================================
	     HERO
	     ============================================================ -->
	<section class="hero-section">
		<div class="container">
			<!-- Floating sticker tags -->
			<div class="sticker-cloud">
				{#each stickerTags as tag}
					<span class="sticker sticker-{tag.color}">
						<tag.icon size={14} />
						{tag.label}
					</span>
				{/each}
			</div>

			<div class="hero-content">
				<h1 class="hero-headline">Your local comedy<br />community lives here.</h1>
				<p class="hero-sub">
					Connect with performers, coaches, and teams in Pittsburgh. Find your people.
				</p>
				<div class="hero-actions">
					<button class="btn-pill btn-accent">
						Get Started <ArrowRight size={18} />
					</button>
					<button class="btn-pill btn-outline">
						<Search size={18} /> Browse the Community
					</button>
				</div>
			</div>
		</div>
	</section>

	<!-- ============================================================
	     TEAMS GRID
	     ============================================================ -->
	<section class="content-section">
		<div class="container">
			<div class="section-header">
				<h2 class="section-title">
					<Users size={24} class="inline-icon" /> Teams
				</h2>
				<button class="btn-pill btn-ghost btn-sm">See all <ArrowRight size={14} /></button>
			</div>
			<div class="card-grid">
				{#each teams as team}
					<div class="cc-card">
						<div class="card-top">
							<div class="avatar-cluster">
								{#each team.initials as ini}
									<div class="avatar avatar-sm">{ini}</div>
								{/each}
								<span class="member-count">+{team.members} members</span>
							</div>
							<span class="badge {badgeClass[team.badgeColor]}">{team.badge}</span>
						</div>
						<h3 class="card-title">{team.name}</h3>
						<p class="card-meta">{team.type}</p>
						<button class="btn-pill btn-primary btn-sm card-cta">View Team</button>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- ============================================================
	     COACHES + PERFORMERS ROW
	     ============================================================ -->
	<section class="content-section content-section--alt">
		<div class="container two-col">
			<!-- Coaches -->
			<div>
				<div class="section-header">
					<h2 class="section-title">
						<UserCheck size={24} class="inline-icon" /> Coaches
					</h2>
					<button class="btn-pill btn-ghost btn-sm">See all <ArrowRight size={14} /></button>
				</div>
				<div class="card-list">
					{#each coaches as coach}
						<div class="cc-card cc-card--row">
							<div class="avatar avatar-lg">{coach.initials}</div>
							<div class="card-body">
								<div class="card-row">
									<h3 class="card-title">{coach.name}</h3>
									<span class="badge {badgeClass[coach.badgeColor]}">{coach.badge}</span>
								</div>
								<p class="card-meta">{coach.style}</p>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Performers -->
			<div>
				<div class="section-header">
					<h2 class="section-title">
						<Mic2 size={24} class="inline-icon" /> Performers
					</h2>
					<button class="btn-pill btn-ghost btn-sm">See all <ArrowRight size={14} /></button>
				</div>
				<div class="card-list">
					{#each performers as performer}
						<div class="cc-card cc-card--row">
							<div class="avatar avatar-lg">{performer.initials}</div>
							<div class="card-body">
								<div class="card-row">
									<h3 class="card-title">{performer.name}</h3>
									<span class="badge {badgeClass[performer.badgeColor]}">{performer.badge}</span>
								</div>
								<p class="card-meta">{performer.role} · {performer.style}</p>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<!-- ============================================================
	     DESIGN TOKENS REFERENCE
	     ============================================================ -->
	<section class="content-section">
		<div class="container">
			<h2 class="section-title" style="margin-bottom: 32px;">Design Tokens</h2>

			<!-- Colors -->
			<h3 class="token-label">Colors</h3>
			<div class="swatch-row">
				<div class="swatch" style="background: var(--cc-bg); border: 1px solid #ddd;">
					<span>#F6F5F3</span><span>bg</span>
				</div>
				<div class="swatch" style="background: var(--cc-surface); border: 1px solid #ddd;">
					<span>#FFFFFF</span><span>surface</span>
				</div>
				<div class="swatch" style="background: var(--cc-primary);">
					<span style="color:#fff">#5B8DEF</span><span style="color:#fff">primary</span>
				</div>
				<div class="swatch" style="background: var(--cc-accent);">
					<span style="color:#fff">#F97316</span><span style="color:#fff">accent</span>
				</div>
				<div class="swatch" style="background: var(--cc-green);">
					<span style="color:#fff">#10B981</span><span style="color:#fff">green</span>
				</div>
				<div class="swatch" style="background: var(--cc-muted);">
					<span style="color:#fff">#1F2933</span><span style="color:#fff">muted</span>
				</div>
			</div>

			<!-- Type Scale -->
			<h3 class="token-label" style="margin-top: 40px;">Typography Scale</h3>
			<div class="type-scale">
				<div style="font-size: 40px; font-weight: 800; font-family: var(--cc-font-heading);">
					40px Hero Headline — Manrope ExtraBold
				</div>
				<div style="font-size: 32px; font-weight: 700; font-family: var(--cc-font-heading);">
					32px Page Title — Manrope Bold
				</div>
				<div style="font-size: 24px; font-weight: 700; font-family: var(--cc-font-heading);">
					24px Section Header — Manrope Bold
				</div>
				<div style="font-size: 18px; font-family: var(--cc-font-body);">
					18px Emphasized Body — Source Sans 3
				</div>
				<div style="font-size: 16px; font-family: var(--cc-font-body);">
					16px Body Text — Source Sans 3
				</div>
				<div style="font-size: 14px; font-family: var(--cc-font-body); color: #6b7280;">
					14px Small Label — Source Sans 3
				</div>
			</div>

			<!-- Buttons -->
			<h3 class="token-label" style="margin-top: 40px;">Buttons</h3>
			<div class="btn-row">
				<button class="btn-pill btn-primary">Primary Action</button>
				<button class="btn-pill btn-accent">CTA Button <ArrowRight size={16} /></button>
				<button class="btn-pill btn-green">Join Group</button>
				<button class="btn-pill btn-outline">Secondary</button>
				<button class="btn-pill btn-ghost">Ghost</button>
				<button class="btn-pill btn-primary btn-sm">Small</button>
			</div>
		</div>
	</section>
</div>

<style>
	/* ================================================================
	   DESIGN TOKENS — edit only this block to retheme the whole page
	   ================================================================ */
	:root {
		/* Colors */
		--cc-bg: #f6f5f3;
		--cc-surface: #ffffff;
		--cc-primary: #5b8def;
		--cc-accent: #f97316;
		--cc-green: #10b981;
		--cc-muted: #1f2933;

		/* Shape */
		--cc-radius: 14px;
		--cc-pill: 9999px;
		--cc-shadow: 0 2px 6px rgba(0, 0, 0, 0.06), 0 8px 20px rgba(0, 0, 0, 0.06);

		/* Typography */
		--cc-font-heading: 'Manrope', sans-serif;
		--cc-font-body: 'Source Sans 3', sans-serif;
	}

	.preview-root {
		background: var(--cc-bg);
		font-family: var(--cc-font-body);
		color: var(--cc-muted);
		min-height: 100vh;
	}

	/* ================================================================
	   LAYOUT
	   ================================================================ */
	.container {
		max-width: 1100px;
		margin: 0 auto;
		padding: 0 24px;
	}

	.two-col {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 40px;
	}

	@media (max-width: 700px) {
		.two-col {
			grid-template-columns: 1fr;
		}
	}

	/* ================================================================
	   HERO
	   ================================================================ */
	.hero-section {
		padding: 80px 0 64px;
		background: var(--cc-bg);
		position: relative;
		overflow: hidden;
	}

	.sticker-cloud {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin-bottom: 32px;
	}

	.sticker {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 6px 14px;
		border-radius: var(--cc-pill);
		font-family: var(--cc-font-heading);
		font-size: 13px;
		font-weight: 700;
		letter-spacing: 0.01em;
		box-shadow: var(--cc-shadow);
	}

	.sticker-primary {
		background: var(--cc-primary);
		color: #fff;
	}
	.sticker-accent {
		background: var(--cc-accent);
		color: #fff;
	}
	.sticker-green {
		background: var(--cc-green);
		color: #fff;
	}

	.hero-content {
		max-width: 680px;
	}

	.hero-headline {
		font-family: var(--cc-font-heading);
		font-size: clamp(32px, 5vw, 48px);
		font-weight: 800;
		line-height: 1.15;
		color: var(--cc-muted);
		margin: 0 0 16px;
	}

	.hero-sub {
		font-size: 18px;
		color: #4b5563;
		margin: 0 0 32px;
		line-height: 1.6;
	}

	.hero-actions {
		display: flex;
		gap: 12px;
		flex-wrap: wrap;
	}

	/* ================================================================
	   SECTIONS
	   ================================================================ */
	.content-section {
		padding: 64px 0;
	}

	.content-section--alt {
		background: var(--cc-surface);
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 24px;
	}

	.section-title {
		font-family: var(--cc-font-heading);
		font-size: 24px;
		font-weight: 700;
		color: var(--cc-muted);
		margin: 0;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	/* ================================================================
	   CARDS
	   ================================================================ */
	.card-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 20px;
	}

	.card-list {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.cc-card {
		background: var(--cc-surface);
		border-radius: var(--cc-radius);
		box-shadow: var(--cc-shadow);
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		transition: transform 0.15s ease, box-shadow 0.15s ease;
	}

	.cc-card:hover {
		transform: translateY(-2px);
		box-shadow:
			0 4px 12px rgba(0, 0, 0, 0.08),
			0 12px 28px rgba(0, 0, 0, 0.08);
	}

	.cc-card--row {
		flex-direction: row;
		align-items: center;
		gap: 14px;
		padding: 16px 20px;
	}

	.card-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.card-body {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.card-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}

	.card-title {
		font-family: var(--cc-font-heading);
		font-size: 17px;
		font-weight: 700;
		color: var(--cc-muted);
		margin: 0;
	}

	.card-meta {
		font-size: 14px;
		color: #6b7280;
		margin: 0;
	}

	.card-cta {
		align-self: flex-start;
		margin-top: 4px;
	}

	/* ================================================================
	   AVATARS
	   ================================================================ */
	.avatar-cluster {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.member-count {
		font-size: 12px;
		color: #6b7280;
		margin-left: 4px;
	}

	.avatar {
		border-radius: 50%;
		background: var(--cc-primary);
		color: #fff;
		font-family: var(--cc-font-heading);
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.avatar-sm {
		width: 28px;
		height: 28px;
		font-size: 10px;
		border: 2px solid var(--cc-surface);
	}

	.avatar-lg {
		width: 44px;
		height: 44px;
		font-size: 14px;
		background: var(--cc-accent);
	}

	/* ================================================================
	   BADGES
	   ================================================================ */
	.badge {
		display: inline-flex;
		align-items: center;
		padding: 3px 10px;
		border-radius: var(--cc-pill);
		font-family: var(--cc-font-heading);
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		white-space: nowrap;
	}

	.badge-green {
		background: #d1fae5;
		color: #065f46;
	}
	.badge-primary {
		background: #dbeafe;
		color: #1e40af;
	}
	.badge-accent {
		background: #ffedd5;
		color: #9a3412;
	}
	.badge-muted {
		background: #f3f4f6;
		color: #6b7280;
	}

	/* ================================================================
	   BUTTONS
	   ================================================================ */
	.btn-pill {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		border-radius: var(--cc-pill);
		font-family: var(--cc-font-heading);
		font-weight: 700;
		font-size: 15px;
		padding: 10px 22px;
		border: none;
		cursor: pointer;
		transition: opacity 0.15s ease, transform 0.1s ease;
	}

	.btn-pill:hover {
		opacity: 0.88;
		transform: scale(1.02);
	}

	.btn-pill:active {
		transform: scale(0.98);
	}

	.btn-sm {
		font-size: 13px;
		padding: 6px 14px;
	}

	.btn-primary {
		background: var(--cc-primary);
		color: #fff;
	}
	.btn-accent {
		background: var(--cc-accent);
		color: #fff;
	}
	.btn-green {
		background: var(--cc-green);
		color: #fff;
	}
	.btn-outline {
		background: transparent;
		color: var(--cc-muted);
		border: 2px solid var(--cc-muted);
	}
	.btn-ghost {
		background: transparent;
		color: var(--cc-primary);
	}
	.btn-ghost:hover {
		background: rgba(91, 141, 239, 0.08);
	}

	.btn-row {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		align-items: center;
	}

	/* ================================================================
	   DESIGN TOKEN REFERENCE
	   ================================================================ */
	.token-label {
		font-family: var(--cc-font-heading);
		font-size: 14px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #6b7280;
		margin: 0 0 16px;
	}

	.swatch-row {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
	}

	.swatch {
		width: 100px;
		height: 72px;
		border-radius: var(--cc-radius);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 4px;
		font-size: 11px;
		font-family: monospace;
		box-shadow: var(--cc-shadow);
	}

	.type-scale {
		display: flex;
		flex-direction: column;
		gap: 16px;
		line-height: 1.2;
	}

	:global(.inline-icon) {
		vertical-align: middle;
	}
</style>

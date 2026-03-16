<script lang="ts">
	import { authStore } from '$stores/auth.svelte';
	import { cityConfig } from '$config/city';
	import { Menu, X } from 'lucide-svelte';

	let { isLocal = false }: { isLocal?: boolean } = $props();
	let mobileMenuOpen = $state(false);

	async function openLogin() {
		const module = await import('netlify-identity-widget');
		module.default.open('login');
	}

	async function handleLogout() {
		const module = await import('netlify-identity-widget');
		module.default.logout();
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
</script>

<header class="zine-header">
	<div class="header-inner">
		<!-- Wordmark -->
		<a href="/" class="wordmark">
			<svg class="wm-mark" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
				<rect x="3" y="3" width="34" height="34" fill="#1c1c1c"/>
				<rect x="0" y="0" width="34" height="34" fill="#1c1c1c"/>
				<text x="17" y="25" font-family="'Courier Prime',monospace" font-weight="700" font-size="19" fill="#f4efe6" text-anchor="middle" letter-spacing="-1">CC</text>
			</svg>
			<span class="wm-text">Comedy Connector</span>
		</a>

		<!-- Desktop nav -->
		<nav class="desktop-nav" aria-label="Main navigation">
			<a href="/performers">PERFORMERS</a>
			<span class="dot" aria-hidden="true">·</span>
			<a href="/coaches">COACHES</a>
			<span class="dot" aria-hidden="true">·</span>
			<a href="/teams">TEAMS</a>
			<a href="/connect" class="connect-link">
				<span class="star">★</span> CONNECT <span class="star">★</span>
			</a>
			<a href="/resources">RESOURCES</a>
		</nav>

		<!-- Desktop auth -->
		<div class="desktop-auth">
			{#if authStore.loading && !isLocal}
				<div class="auth-loading"></div>
			{:else if authStore.isAuthenticated}
				<a href="/profile" class="btn-outline">MY PROFILE</a>
				{#if isLocal}
					<a href="/dev-login" class="btn-outline">SWITCH USER</a>
				{:else}
					<button onclick={handleLogout} class="btn-outline">SIGN OUT</button>
				{/if}
			{:else if isLocal}
				<a href="/dev-login" class="btn-accent">DEV LOGIN</a>
			{:else}
				<button onclick={openLogin} class="btn-accent">JOIN THE SCENE</button>
			{/if}
		</div>

		<!-- Mobile toggle -->
		<button
			class="mobile-toggle"
			onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
			aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
			aria-expanded={mobileMenuOpen}
		>
			{#if mobileMenuOpen}
				<X size={24} />
			{:else}
				<Menu size={24} />
			{/if}
		</button>
	</div>

	<!-- Mobile overlay -->
	{#if mobileMenuOpen}
		<button class="mobile-backdrop" onclick={closeMobileMenu} aria-label="Close menu"></button>
		<div class="mobile-menu">
			<div class="mobile-top">
				<a href="/" class="wordmark" onclick={closeMobileMenu}>
				<svg class="wm-mark" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
					<rect x="3" y="3" width="34" height="34" fill="#1c1c1c"/>
					<rect x="0" y="0" width="34" height="34" fill="#1c1c1c"/>
					<text x="17" y="25" font-family="'Courier Prime',monospace" font-weight="700" font-size="19" fill="#f4efe6" text-anchor="middle" letter-spacing="-1">CC</text>
				</svg>
				<span class="wm-text">{cityConfig.name} Comedy Connector</span>
			</a>
				<button class="mobile-close" onclick={closeMobileMenu} aria-label="Close menu">
					<X size={24} />
				</button>
			</div>
			<nav class="mobile-nav" aria-label="Mobile navigation">
				<a href="/performers" onclick={closeMobileMenu}>PERFORMERS</a>
				<a href="/coaches" onclick={closeMobileMenu}>COACHES</a>
				<a href="/teams" onclick={closeMobileMenu}>TEAMS</a>
				<a href="/connect" onclick={closeMobileMenu} class="connect-link">
					<span class="star">★</span> CONNECT <span class="star">★</span>
				</a>
				<a href="/resources" onclick={closeMobileMenu}>RESOURCES</a>
			</nav>
			<div class="mobile-auth">
				{#if authStore.isAuthenticated}
					<a href="/profile" onclick={closeMobileMenu} class="btn-outline">MY PROFILE</a>
					{#if isLocal}
						<a href="/dev-login" class="btn-outline">SWITCH USER</a>
					{:else}
						<button onclick={handleLogout} class="btn-outline">SIGN OUT</button>
					{/if}
				{:else if isLocal}
					<a href="/dev-login" onclick={closeMobileMenu} class="btn-accent">DEV LOGIN</a>
				{:else}
					<button onclick={() => { closeMobileMenu(); openLogin(); }} class="btn-accent">JOIN THE SCENE</button>
				{/if}
			</div>
		</div>
	{/if}
</header>

<style>
	.zine-header {
		position: sticky;
		top: 0;
		z-index: 50;
		background: var(--zine-bg);
		border-bottom: var(--zine-border);
	}

	.header-inner {
		display: flex;
		align-items: center;
		gap: 32px;
		padding: 14px 32px;
		max-width: 1280px;
		margin: 0 auto;
	}

	.wordmark {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		text-decoration: none;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.wm-mark {
		width: 30px;
		height: 30px;
		transform: rotate(-2deg);
		flex-shrink: 0;
	}

	.wm-text {
		font-family: var(--font-heading);
		font-size: 18px;
		line-height: 1;
		color: var(--zine-primary);
	}

	/* Desktop nav */
	.desktop-nav {
		display: none;
		align-items: center;
		gap: 20px;
    margin-top: 3px;
		flex: 1;
	}

	.desktop-nav a {
		font-family: var(--font-body);
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.08em;
		color: var(--zine-primary);
		text-decoration: none;
	}

	.desktop-nav a:hover {
		color: var(--zine-accent);
	}

	.dot {
		color: var(--zine-primary);
		font-size: 14px;
		opacity: 0.5;
	}

	.connect-link {
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}

	.star {
		color: var(--zine-muted);
	}

	.desktop-auth {
		display: none;
	}

	.auth-loading {
		width: 80px;
		height: 32px;
		background: var(--zine-surface);
		border: var(--zine-border);
		animation: pulse 1.5s ease-in-out infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.4; }
	}

	/* Normalize btn-accent height in header to match btn-outline */
	.header-inner :global(.btn-accent) {
		padding: 8px 16px;
		font-size: 12px;
	}

	/* Mobile toggle */
	.mobile-toggle {
		margin-left: auto;
		background: none;
		border: none;
		cursor: pointer;
		color: var(--zine-primary);
		display: flex;
		align-items: center;
		padding: 4px;
	}

	/* Desktop breakpoint — must come after base rules to override */
	@media (min-width: 768px) {
		.desktop-nav {
			display: flex;
		}
		.desktop-auth {
			display: flex;
			align-items: center;
			gap: 8px;
			margin-left: auto;
		}
		.mobile-toggle {
			display: none;
		}
	}

	/* Mobile overlay */
	.mobile-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(28, 28, 28, 0.4);
		z-index: 99;
		border: none;
		cursor: default;
	}

	.mobile-menu {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: var(--zine-bg);
		border-right: var(--zine-border);
		z-index: 100;
		display: flex;
		flex-direction: column;
		padding: 24px;
	}

	.mobile-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 32px;
	}

	.mobile-close {
		background: none;
		border: none;
		cursor: pointer;
		color: var(--zine-primary);
		display: flex;
		align-items: center;
	}

	.mobile-nav {
		display: flex;
		flex-direction: column;
		gap: 20px;
		flex: 1;
	}

	.mobile-nav a {
		font-family: var(--font-body);
		font-size: 16px;
		font-weight: 700;
		letter-spacing: 0.1em;
		color: var(--zine-primary);
		text-decoration: none;
	}

	.mobile-nav a:hover {
		color: var(--zine-accent);
	}

	.mobile-auth {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding-top: 24px;
		border-top: var(--zine-border);
	}

	.mobile-auth .btn-accent,
	.mobile-auth .btn-outline {
		text-align: center;
		justify-content: center;
	}
</style>

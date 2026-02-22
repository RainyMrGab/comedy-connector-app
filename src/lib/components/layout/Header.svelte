<script lang="ts">
	import { authStore } from '$stores/auth.svelte';
	import { cityConfig } from '$config/city';
	import { Menu, X, Mic2, Users, UserCheck } from 'lucide-svelte';

	let mobileMenuOpen = $state(false);

	const navLinks = [
		{ href: '/performers', label: 'Performers', icon: Mic2 },
		{ href: '/coaches', label: 'Coaches', icon: UserCheck },
		{ href: '/teams', label: 'Teams', icon: Users }
	];

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

<header class="bg-surface-900 text-surface-50 sticky top-0 z-50 shadow-md">
	<div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
		<!-- Logo -->
		<a href="/" class="flex items-center gap-2 text-xl font-bold hover:opacity-80 transition-opacity">
			<span class="text-primary-400">🎭</span>
			<span>{cityConfig.name} Comedy Connector</span>
		</a>

		<!-- Desktop nav -->
		<nav class="hidden md:flex items-center gap-6" aria-label="Main navigation">
			{#each navLinks as link}
				<a
					href={link.href}
					class="flex items-center gap-1 text-sm font-medium hover:text-primary-300 transition-colors"
				>
					<link.icon size={16} />
					{link.label}
				</a>
			{/each}
			<a href="/connect" class="text-sm font-medium hover:text-secondary-300 transition-colors">
				Connect
			</a>
		</nav>

		<!-- Desktop auth -->
		<div class="hidden md:flex items-center gap-3">
			{#if authStore.loading}
				<div class="w-20 h-8 bg-surface-700 animate-pulse rounded"></div>
			{:else if authStore.isAuthenticated}
				<a href="/profile" class="text-sm hover:text-primary-300 transition-colors">
					My Profile
				</a>
				<button
					onclick={handleLogout}
					class="btn btn-sm preset-tonal-surface"
				>
					Sign Out
				</button>
			{:else}
				<button
					onclick={openLogin}
					class="btn btn-sm preset-filled-primary-500"
				>
					Sign In / Register
				</button>
			{/if}
		</div>

		<!-- Mobile menu toggle -->
		<button
			class="md:hidden p-2 rounded hover:bg-surface-700 transition-colors"
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

	<!-- Mobile menu -->
	{#if mobileMenuOpen}
		<div class="md:hidden bg-surface-800 border-t border-surface-700 px-4 pb-4">
			<nav class="flex flex-col gap-2 pt-3" aria-label="Mobile navigation">
				{#each navLinks as link}
					<a
						href={link.href}
						onclick={closeMobileMenu}
						class="flex items-center gap-2 py-2 text-sm font-medium hover:text-primary-300 transition-colors"
					>
						<link.icon size={18} />
						{link.label}
					</a>
				{/each}
				<a
					href="/connect"
					onclick={closeMobileMenu}
					class="py-2 text-sm font-medium hover:text-secondary-300 transition-colors"
				>
					Connect
				</a>
				<hr class="border-surface-600 my-2" />
				{#if authStore.isAuthenticated}
					<a
						href="/profile"
						onclick={closeMobileMenu}
						class="py-2 text-sm hover:text-primary-300 transition-colors"
					>
						My Profile
					</a>
					<button onclick={handleLogout} class="btn btn-sm preset-tonal-surface w-full">
						Sign Out
					</button>
				{:else}
					<button onclick={openLogin} class="btn btn-sm preset-filled-primary-500 w-full">
						Sign In / Register
					</button>
				{/if}
			</nav>
		</div>
	{/if}
</header>

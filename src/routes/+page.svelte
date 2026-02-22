<script lang="ts">
	import { authStore } from '$stores/auth.svelte';
	import { cityConfig } from '$config/city';
	import { Mic2, Users, UserCheck, ArrowRight } from 'lucide-svelte';

	const features = [
		{
			icon: Mic2,
			title: 'Performers',
			description: 'Create a performer profile, showcase your training, and let the community know what you\'re looking for.',
			href: '/performers',
			color: 'text-primary-400'
		},
		{
			icon: UserCheck,
			title: 'Coaches',
			description: 'Find a coach that fits your style, or list yourself as available for private sessions, teams, and workshops.',
			href: '/coaches',
			color: 'text-secondary-400'
		},
		{
			icon: Users,
			title: 'Teams',
			description: 'Discover local teams, see who\'s on them, and find groups that are open to new members.',
			href: '/teams',
			color: 'text-tertiary-400'
		}
	];

	async function openSignup() {
		const module = await import('netlify-identity-widget');
		module.default.open('signup');
	}
</script>

<svelte:head>
	<title>{cityConfig.name} Comedy Connector</title>
	<meta name="description" content="Connect with {cityConfig.name}'s improv and comedy community. Find performers, coaches, and teams." />
</svelte:head>

<!-- Hero -->
<section class="bg-gradient-to-br from-surface-900 via-primary-950 to-surface-900 text-surface-50 py-20 px-4">
	<div class="mx-auto max-w-3xl text-center">
		<h1 class="text-4xl md:text-5xl font-bold mb-6 leading-tight">
			{cityConfig.name}'s Comedy Community,
			<span class="text-primary-400">Connected</span>
		</h1>
		<p class="text-lg text-surface-300 mb-8 max-w-xl mx-auto">
			Find performers to work with, coaches to learn from, and teams to join — all in one place.
			No cold DMs, no gatekeeping.
		</p>
		<div class="flex flex-col sm:flex-row gap-4 justify-center">
			{#if authStore.isAuthenticated}
				<a href="/profile/edit" class="btn preset-filled-primary-500 text-base px-6 py-3">
					Set Up Your Profile
					<ArrowRight size={18} />
				</a>
				<a href="/performers" class="btn preset-tonal-surface text-base px-6 py-3">
					Browse Community
				</a>
			{:else}
				<button onclick={openSignup} class="btn preset-filled-primary-500 text-base px-6 py-3">
					Join the Community
					<ArrowRight size={18} />
				</button>
				<a href="/performers" class="btn preset-tonal-surface text-base px-6 py-3">
					Browse Performers
				</a>
			{/if}
		</div>
	</div>
</section>

<!-- Connect section -->
<section class="py-12 px-4 bg-surface-100 dark:bg-surface-800">
	<div class="mx-auto max-w-4xl text-center">
		<h2 class="text-2xl font-bold text-surface-900 dark:text-surface-50 mb-2">Looking for something specific?</h2>
		<p class="text-surface-600 dark:text-surface-300 mb-8">Use our connect features to find exactly who you need.</p>
		<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
			<a href="/connect/book-opener" class="card bg-surface-50 dark:bg-surface-700 p-5 rounded-xl hover:ring-2 hover:ring-primary-500 transition-all text-left group">
				<p class="font-semibold text-surface-900 dark:text-surface-50 group-hover:text-primary-500 transition-colors">🎤 Book an Opener</p>
				<p class="text-sm text-surface-500 dark:text-surface-400 mt-1">Find performers available to open for your show.</p>
			</a>
			<a href="/connect/join-team" class="card bg-surface-50 dark:bg-surface-700 p-5 rounded-xl hover:ring-2 hover:ring-secondary-500 transition-all text-left group">
				<p class="font-semibold text-surface-900 dark:text-surface-50 group-hover:text-secondary-500 transition-colors">🤝 Join a Team</p>
				<p class="text-sm text-surface-500 dark:text-surface-400 mt-1">Find teams that are actively looking for new members.</p>
			</a>
			<a href="/connect/find-coach" class="card bg-surface-50 dark:bg-surface-700 p-5 rounded-xl hover:ring-2 hover:ring-tertiary-500 transition-all text-left group">
				<p class="font-semibold text-surface-900 dark:text-surface-50 group-hover:text-tertiary-500 transition-colors">📚 Find a Coach</p>
				<p class="text-sm text-surface-500 dark:text-surface-400 mt-1">Browse coaches available for private lessons or team coaching.</p>
			</a>
		</div>
	</div>
</section>

<!-- Feature cards -->
<section class="py-16 px-4">
	<div class="mx-auto max-w-5xl">
		<h2 class="text-2xl font-bold text-center text-surface-900 dark:text-surface-50 mb-10">
			Everything the {cityConfig.name} comedy scene needs
		</h2>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			{#each features as feature}
				<a
					href={feature.href}
					class="group rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 p-6 hover:border-primary-500 dark:hover:border-primary-500 transition-all hover:shadow-lg"
				>
					<feature.icon size={32} class="{feature.color} mb-4" />
					<h3 class="text-lg font-semibold text-surface-900 dark:text-surface-50 mb-2 group-hover:text-primary-500 transition-colors">
						{feature.title}
					</h3>
					<p class="text-sm text-surface-500 dark:text-surface-400">{feature.description}</p>
					<span class="mt-4 inline-flex items-center gap-1 text-sm text-primary-500 font-medium">
						Browse {feature.title}
						<ArrowRight size={14} />
					</span>
				</a>
			{/each}
		</div>
	</div>
</section>

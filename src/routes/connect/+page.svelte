<script lang="ts">
	import { cityConfig } from '$config/city';
	import { Mic2, Users, UserCheck, ArrowRight } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Connect | {cityConfig.name} Comedy Connector</title>
	<meta
		name="description"
		content="Connect with {cityConfig.name}'s comedy community — find book openers, join a team, or hire a coach."
	/>
</svelte:head>

<div class="mx-auto max-w-4xl px-4 py-16">
	<div class="text-center mb-12">
		<h1 class="text-4xl font-bold text-surface-900 dark:text-surface-50 mb-4">
			Connect with the Community
		</h1>
		<p class="text-lg text-surface-500 max-w-2xl mx-auto">
			Whether you're looking for a book opener, want to join a team, or need a coach — find your
			match in {cityConfig.name}'s comedy scene.
		</p>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
		<!-- Book Opener -->
		<a
			href="/connect/book-opener"
			class="card bg-surface-50 dark:bg-surface-800 rounded-2xl p-8 border border-surface-200 dark:border-surface-700 hover:border-secondary-500 dark:hover:border-secondary-500 hover:shadow-lg transition-all group text-center"
		>
			<div
				class="w-16 h-16 rounded-2xl bg-secondary-500 flex items-center justify-center text-white mx-auto mb-4"
			>
				<Mic2 size={28} />
			</div>
			<h2
				class="text-xl font-bold text-surface-900 dark:text-surface-50 group-hover:text-secondary-500 transition-colors mb-2"
			>
				Find a Book Opener
			</h2>
			<p class="text-surface-500 text-sm mb-4">
				Discover performers available to open your show or headline as a book opener.
			</p>
			<span class="flex items-center justify-center gap-1 text-secondary-500 text-sm font-medium">
				Browse performers <ArrowRight size={14} />
			</span>
		</a>

		<!-- Join a Team -->
		<a
			href="/connect/join-team"
			class="card bg-surface-50 dark:bg-surface-800 rounded-2xl p-8 border border-surface-200 dark:border-surface-700 hover:border-tertiary-500 dark:hover:border-tertiary-500 hover:shadow-lg transition-all group text-center"
		>
			<div
				class="w-16 h-16 rounded-2xl bg-tertiary-500 flex items-center justify-center text-white mx-auto mb-4"
			>
				<Users size={28} />
			</div>
			<h2
				class="text-xl font-bold text-surface-900 dark:text-surface-50 group-hover:text-tertiary-500 transition-colors mb-2"
			>
				Join a Team
			</h2>
			<p class="text-surface-500 text-sm mb-4">
				Find teams that are open to new members and looking to grow their roster.
			</p>
			<span class="flex items-center justify-center gap-1 text-tertiary-500 text-sm font-medium">
				Browse teams <ArrowRight size={14} />
			</span>
		</a>

		<!-- Find a Coach -->
		<a
			href="/connect/find-coach"
			class="card bg-surface-50 dark:bg-surface-800 rounded-2xl p-8 border border-surface-200 dark:border-surface-700 hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-lg transition-all group text-center"
		>
			<div
				class="w-16 h-16 rounded-2xl bg-primary-500 flex items-center justify-center text-white mx-auto mb-4"
			>
				<UserCheck size={28} />
			</div>
			<h2
				class="text-xl font-bold text-surface-900 dark:text-surface-50 group-hover:text-primary-500 transition-colors mb-2"
			>
				Find a Coach
			</h2>
			<p class="text-surface-500 text-sm mb-4">
				Connect with coaches offering private sessions, team coaching, or workshops.
			</p>
			<span class="flex items-center justify-center gap-1 text-primary-500 text-sm font-medium">
				Browse coaches <ArrowRight size={14} />
			</span>
		</a>
	</div>
</div>

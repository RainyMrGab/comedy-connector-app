<script lang="ts">
	import type { PageData } from './$types';
	import EmptyState from '$components/ui/EmptyState.svelte';
	import { UserCheck } from 'lucide-svelte';
	import { cityConfig } from '$config/city';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Coaches | {cityConfig.name} Comedy Connector</title>
	<meta name="description" content="Find comedy coaches in {cityConfig.name}." />
</svelte:head>

<div class="mx-auto max-w-6xl px-4 py-10">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-bold text-surface-900 dark:text-surface-50">Coaches</h1>
			<p class="text-surface-500 mt-1">{data.coaches.length} coach{data.coaches.length !== 1 ? 'es' : ''} in {cityConfig.name}</p>
		</div>
	</div>

	{#if data.coaches.length === 0}
		<EmptyState
			title="No coaches yet"
			description="Be the first to add a coach profile!"
			actionLabel="Add Coach Profile"
			actionHref="/profile/coach"
		/>
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each data.coaches as coach}
				<a
					href="/coaches/{coach.slug}"
					class="card bg-surface-50 dark:bg-surface-800 rounded-xl p-5 border border-surface-200 dark:border-surface-700 hover:border-secondary-500 dark:hover:border-secondary-500 transition-all hover:shadow-md group"
				>
					<div class="flex items-center gap-3 mb-3">
						{#if coach.photoUrl}
							<img src={coach.photoUrl} alt={coach.name} class="w-12 h-12 rounded-full object-cover" />
						{:else}
							<div class="w-12 h-12 rounded-full bg-secondary-500 flex items-center justify-center text-white font-bold">
								{coach.name[0].toUpperCase()}
							</div>
						{/if}
						<div>
							<p class="font-semibold text-surface-900 dark:text-surface-50 group-hover:text-secondary-500 transition-colors">
								{coach.name}
							</p>
							<span class="chip preset-tonal-secondary text-xs"><UserCheck size={10} /> Coach</span>
						</div>
					</div>
					{#if coach.coachingBio}
						<p class="text-sm text-surface-500 dark:text-surface-400 line-clamp-2">{coach.coachingBio}</p>
					{:else if coach.bio}
						<p class="text-sm text-surface-500 dark:text-surface-400 line-clamp-2">{coach.bio}</p>
					{/if}
					<div class="flex flex-wrap gap-1 mt-3">
						{#if coach.availableForPrivate}
							<span class="chip preset-tonal-secondary text-xs">Private Sessions</span>
						{/if}
						{#if coach.availableForTeams}
							<span class="chip preset-tonal-tertiary text-xs">Team Coaching</span>
						{/if}
						{#if coach.availableForWorkshops}
							<span class="chip preset-tonal-surface text-xs">Workshops</span>
						{/if}
					</div>
					{#if coach.availability}
						<p class="text-xs text-surface-400 mt-2">{coach.availability}</p>
					{/if}
				</a>
			{/each}
		</div>
	{/if}
</div>

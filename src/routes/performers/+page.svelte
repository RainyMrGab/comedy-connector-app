<script lang="ts">
	import type { PageData } from './$types';
	import EmptyState from '$components/ui/EmptyState.svelte';
	import { Mic2 } from 'lucide-svelte';
	import { cityConfig } from '$config/city';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Performers | {cityConfig.name} Comedy Connector</title>
	<meta name="description" content="Browse {cityConfig.name} improv and comedy performers." />
</svelte:head>

<div class="mx-auto max-w-6xl px-4 py-10">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-bold text-surface-900 dark:text-surface-50">Performers</h1>
			<p class="text-surface-500 mt-1">{data.performers.length} performer{data.performers.length !== 1 ? 's' : ''} in {cityConfig.name}</p>
		</div>
		<!-- Phase 6: SearchBar goes here -->
	</div>

	{#if data.performers.length === 0}
		<EmptyState
			title="No performers yet"
			description="Be the first to create a performer profile!"
			actionLabel="Create Profile"
			actionHref="/profile/edit"
		/>
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each data.performers as performer}
				<a
					href="/performers/{performer.slug}"
					class="card bg-surface-50 dark:bg-surface-800 rounded-xl p-5 border border-surface-200 dark:border-surface-700 hover:border-primary-500 dark:hover:border-primary-500 transition-all hover:shadow-md group"
				>
					<div class="flex items-center gap-3 mb-3">
						{#if performer.photoUrl}
							<img src={performer.photoUrl} alt={performer.name} class="w-12 h-12 rounded-full object-cover" />
						{:else}
							<div class="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">
								{performer.name[0].toUpperCase()}
							</div>
						{/if}
						<div>
							<p class="font-semibold text-surface-900 dark:text-surface-50 group-hover:text-primary-500 transition-colors">
								{performer.name}
							</p>
							<span class="chip preset-tonal-primary text-xs"><Mic2 size={10} /> Performer</span>
						</div>
					</div>
					{#if performer.bio}
						<p class="text-sm text-surface-500 dark:text-surface-400 line-clamp-2">{performer.bio}</p>
					{/if}
					<div class="flex flex-wrap gap-1 mt-3">
						{#if performer.openToBookOpeners}
							<span class="chip preset-tonal-secondary text-xs">Open to Book Openers</span>
						{/if}
						{#if performer.lookingForTeam}
							<span class="chip preset-tonal-tertiary text-xs">Looking for Team</span>
						{/if}
						{#if performer.lookingForCoach}
							<span class="chip preset-tonal-surface text-xs">Seeking Coach</span>
						{/if}
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>

<script lang="ts">
	import type { PageData } from './$types';
	import EmptyState from '$components/ui/EmptyState.svelte';
	import { Users, Plus } from 'lucide-svelte';
	import { authStore } from '$stores/auth.svelte';
	import { cityConfig } from '$config/city';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Teams | {cityConfig.name} Comedy Connector</title>
	<meta name="description" content="Browse improv and comedy teams in {cityConfig.name}." />
</svelte:head>

<div class="mx-auto max-w-6xl px-4 py-10">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-bold text-surface-900 dark:text-surface-50">Teams</h1>
			<p class="text-surface-500 mt-1">{data.teams.length} team{data.teams.length !== 1 ? 's' : ''} in {cityConfig.name}</p>
		</div>
		{#if authStore.isAuthenticated}
			<a href="/teams/create" class="btn preset-filled-tertiary-500 gap-1">
				<Plus size={16} />
				Create Team
			</a>
		{/if}
	</div>

	{#if data.teams.length === 0}
		<EmptyState
			title="No teams yet"
			description="Create the first team for {cityConfig.name}'s comedy scene!"
			actionLabel={authStore.isAuthenticated ? 'Create Team' : ''}
			actionHref="/teams/create"
		/>
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each data.teams as team}
				<a
					href="/teams/{team.slug}"
					class="card bg-surface-50 dark:bg-surface-800 rounded-xl p-5 border border-surface-200 dark:border-surface-700 hover:border-tertiary-500 dark:hover:border-tertiary-500 transition-all hover:shadow-md group"
				>
					<div class="flex items-center gap-3 mb-3">
						{#if team.photoUrl}
							<img src={team.photoUrl} alt={team.name} class="w-12 h-12 rounded-xl object-cover" />
						{:else}
							<div class="w-12 h-12 rounded-xl bg-tertiary-500 flex items-center justify-center text-white">
								<Users size={20} />
							</div>
						{/if}
						<div>
							<p class="font-semibold text-surface-900 dark:text-surface-50 group-hover:text-tertiary-500 transition-colors">
								{team.name}
							</p>
							<div class="flex gap-1 flex-wrap mt-1">
								{#if team.form}
									<span class="chip preset-tonal-tertiary text-xs">{team.form}</span>
								{/if}
								{#if team.isPracticeGroup}
									<span class="chip preset-tonal-surface text-xs">Practice Group</span>
								{/if}
								{#if team.status === 'stub'}
									<span class="chip preset-tonal-warning text-xs">Unclaimed</span>
								{/if}
							</div>
						</div>
					</div>
					{#if team.description}
						<p class="text-sm text-surface-500 dark:text-surface-400 line-clamp-2">{team.description}</p>
					{/if}
					<div class="flex flex-wrap gap-1 mt-3">
						{#if team.openToNewMembers}
							<span class="chip preset-tonal-primary text-xs">Open to Members</span>
						{/if}
						{#if team.seekingCoach}
							<span class="chip preset-tonal-secondary text-xs">Seeking Coach</span>
						{/if}
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>

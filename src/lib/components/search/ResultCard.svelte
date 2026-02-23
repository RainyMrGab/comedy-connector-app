<script lang="ts">
	import type { SearchResult } from '$server/search';
	import { Mic2, UserCheck, Users } from 'lucide-svelte';

	interface Props {
		result: SearchResult;
		type: 'performers' | 'coaches' | 'teams';
	}

	let { result, type }: Props = $props();

	const href = $derived(
		type === 'performers'
			? `/performers/${result.slug}`
			: type === 'coaches'
				? `/coaches/${result.slug}`
				: `/teams/${result.slug}`
	);
</script>

<a
	{href}
	class="card bg-surface-50 dark:bg-surface-800 rounded-xl p-5 border border-surface-200 dark:border-surface-700 transition-all hover:shadow-md group block
		{type === 'performers'
		? 'hover:border-primary-500 dark:hover:border-primary-500'
		: type === 'coaches'
			? 'hover:border-secondary-500 dark:hover:border-secondary-500'
			: 'hover:border-tertiary-500 dark:hover:border-tertiary-500'}"
>
	<div class="flex items-center gap-3 mb-3">
		{#if result.photoUrl}
			<img
				src={result.photoUrl}
				alt={result.name}
				class="w-12 h-12 object-cover {type === 'teams' ? 'rounded-xl' : 'rounded-full'}"
			/>
		{:else}
			<div
				class="w-12 h-12 flex items-center justify-center text-white font-bold
					{type === 'teams' ? 'rounded-xl' : 'rounded-full'}
					{type === 'performers'
					? 'bg-primary-500'
					: type === 'coaches'
						? 'bg-secondary-500'
						: 'bg-tertiary-500'}"
			>
				{#if type === 'teams'}
					<Users size={20} />
				{:else}
					{result.name[0]?.toUpperCase() ?? '?'}
				{/if}
			</div>
		{/if}
		<div>
			<p
				class="font-semibold text-surface-900 dark:text-surface-50 transition-colors
					{type === 'performers'
					? 'group-hover:text-primary-500'
					: type === 'coaches'
						? 'group-hover:text-secondary-500'
						: 'group-hover:text-tertiary-500'}"
			>
				{result.name}
			</p>
			{#if type === 'performers'}
				<span class="chip preset-tonal-primary text-xs"><Mic2 size={10} /> Performer</span>
			{:else if type === 'coaches'}
				<span class="chip preset-tonal-secondary text-xs"><UserCheck size={10} /> Coach</span>
			{:else}
				<div class="flex gap-1 flex-wrap mt-1">
					{#if result.form}
						<span class="chip preset-tonal-tertiary text-xs">{result.form}</span>
					{/if}
					{#if result.status === 'stub'}
						<span class="chip preset-tonal-warning text-xs">Unclaimed</span>
					{/if}
				</div>
			{/if}
		</div>
	</div>

	{#if result.bio}
		<p class="text-sm text-surface-500 dark:text-surface-400 line-clamp-2">{result.bio}</p>
	{/if}

	<div class="flex flex-wrap gap-1 mt-3">
		{#if result.openToBookOpeners}
			<span class="chip preset-tonal-secondary text-xs">Open to Book Openers</span>
		{/if}
		{#if result.lookingForTeam}
			<span class="chip preset-tonal-tertiary text-xs">Looking for Team</span>
		{/if}
		{#if result.lookingForCoach}
			<span class="chip preset-tonal-surface text-xs">Seeking Coach</span>
		{/if}
		{#if result.availableForPrivate}
			<span class="chip preset-tonal-secondary text-xs">Private Sessions</span>
		{/if}
		{#if result.availableForTeams}
			<span class="chip preset-tonal-tertiary text-xs">Team Coaching</span>
		{/if}
		{#if result.availableForWorkshops}
			<span class="chip preset-tonal-surface text-xs">Workshops</span>
		{/if}
		{#if result.openToNewMembers}
			<span class="chip preset-tonal-primary text-xs">Open to Members</span>
		{/if}
		{#if result.seekingCoach}
			<span class="chip preset-tonal-secondary text-xs">Seeking Coach</span>
		{/if}
	</div>
</a>

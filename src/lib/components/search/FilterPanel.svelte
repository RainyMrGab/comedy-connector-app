<script lang="ts">
	import type { SearchFilters } from '$server/search';

	interface Props {
		type: 'performers' | 'coaches' | 'teams';
		filters: SearchFilters;
		onchange: (filters: SearchFilters) => void;
	}

	let { type, filters, onchange }: Props = $props();

	function toggle(key: keyof SearchFilters) {
		const newVal: boolean | undefined = filters[key] ? undefined : true;
		onchange({ ...filters, [key]: newVal });
	}
</script>

{#if type === 'performers'}
	<div class="flex flex-wrap gap-2">
		<button
			type="button"
			onclick={() => toggle('openToBookOpeners')}
			class="chip cursor-pointer text-sm {filters.openToBookOpeners
				? 'preset-filled-secondary-500'
				: 'preset-tonal-surface'}"
		>
			Open to Book Openers
		</button>
		<button
			type="button"
			onclick={() => toggle('lookingForTeam')}
			class="chip cursor-pointer text-sm {filters.lookingForTeam
				? 'preset-filled-tertiary-500'
				: 'preset-tonal-surface'}"
		>
			Looking for Team
		</button>
		<button
			type="button"
			onclick={() => toggle('lookingForCoach')}
			class="chip cursor-pointer text-sm {filters.lookingForCoach
				? 'preset-filled-primary-500'
				: 'preset-tonal-surface'}"
		>
			Seeking Coach
		</button>
	</div>
{:else if type === 'coaches'}
	<div class="flex flex-wrap gap-2">
		<button
			type="button"
			onclick={() => toggle('availableForPrivate')}
			class="chip cursor-pointer text-sm {filters.availableForPrivate
				? 'preset-filled-secondary-500'
				: 'preset-tonal-surface'}"
		>
			Private Sessions
		</button>
		<button
			type="button"
			onclick={() => toggle('availableForTeams')}
			class="chip cursor-pointer text-sm {filters.availableForTeams
				? 'preset-filled-tertiary-500'
				: 'preset-tonal-surface'}"
		>
			Team Coaching
		</button>
		<button
			type="button"
			onclick={() => toggle('availableForWorkshops')}
			class="chip cursor-pointer text-sm {filters.availableForWorkshops
				? 'preset-filled-primary-500'
				: 'preset-tonal-surface'}"
		>
			Workshops
		</button>
	</div>
{:else if type === 'teams'}
	<div class="flex flex-wrap gap-2">
		<button
			type="button"
			onclick={() => toggle('openToNewMembers')}
			class="chip cursor-pointer text-sm {filters.openToNewMembers
				? 'preset-filled-primary-500'
				: 'preset-tonal-surface'}"
		>
			Open to New Members
		</button>
		<button
			type="button"
			onclick={() => toggle('seekingCoach')}
			class="chip cursor-pointer text-sm {filters.seekingCoach
				? 'preset-filled-secondary-500'
				: 'preset-tonal-surface'}"
		>
			Seeking Coach
		</button>
	</div>
{/if}

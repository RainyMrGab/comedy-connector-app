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
	<div class="filter-row">
		<button type="button" onclick={() => toggle('lookingForPracticeGroup')} class={filters.lookingForPracticeGroup ? 'filter-chip active' : 'filter-chip'}>Practice Group</button>
		<button type="button" onclick={() => toggle('lookingForSmallGroup')} class={filters.lookingForSmallGroup ? 'filter-chip active' : 'filter-chip'}>Small Group</button>
		<button type="button" onclick={() => toggle('lookingForIndieTeam')} class={filters.lookingForIndieTeam ? 'filter-chip active' : 'filter-chip'}>Indie Team</button>
	</div>
{:else if type === 'coaches'}
	<div class="filter-row">
		<button type="button" onclick={() => toggle('availableForPrivate')} class={filters.availableForPrivate ? 'filter-chip active' : 'filter-chip'}>Private Sessions</button>
		<button type="button" onclick={() => toggle('availableForTeams')} class={filters.availableForTeams ? 'filter-chip active' : 'filter-chip'}>Team Coaching</button>
		<button type="button" onclick={() => toggle('availableForWorkshops')} class={filters.availableForWorkshops ? 'filter-chip active' : 'filter-chip'}>Workshops</button>
	</div>
{:else if type === 'teams'}
	<div class="filter-row">
		<button type="button" onclick={() => toggle('openToNewMembers')} class={filters.openToNewMembers ? 'filter-chip active' : 'filter-chip'}>Open to New Members</button>
		<button type="button" onclick={() => toggle('seekingCoach')} class={filters.seekingCoach ? 'filter-chip active' : 'filter-chip'}>Seeking Coach</button>
	</div>
{/if}

<style>
	.filter-row { display: flex; flex-wrap: wrap; gap: 8px; }
	.filter-chip { font-family: var(--font-body); font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 4px 10px; border: 2px solid var(--zine-primary); background: transparent; color: var(--zine-primary); cursor: pointer; transition: background 0.1s, color 0.1s; }
	.filter-chip:hover { background: var(--zine-surface); }
	.filter-chip.active { background: var(--zine-primary); color: var(--zine-bg); border-color: var(--zine-primary); }
</style>

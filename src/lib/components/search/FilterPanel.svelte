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
		<button type="button" onclick={() => toggle('openToBookOpeners')} class={filters.openToBookOpeners ? 'filter-chip active' : 'filter-chip'}>Open to Book Openers</button>
		<button type="button" onclick={() => toggle('lookingForTeam')} class={filters.lookingForTeam ? 'filter-chip active' : 'filter-chip'}>Looking for Team</button>
		<button type="button" onclick={() => toggle('lookingForCoach')} class={filters.lookingForCoach ? 'filter-chip active' : 'filter-chip'}>Seeking Coach</button>
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
	.filter-chip { font-family: var(--font-body); font-size: 11px; font-weight: 700; letter-spacing: 0.08em; padding: 5px 12px; border: 1px solid var(--zine-primary); background: transparent; color: var(--zine-primary); cursor: pointer; transition: background 0.1s, color 0.1s; }
	.filter-chip:hover { background: var(--zine-surface); }
	.filter-chip.active { background: var(--zine-muted); border-color: var(--zine-muted); color: #fff; }
</style>

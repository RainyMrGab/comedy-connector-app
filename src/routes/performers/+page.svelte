<script lang="ts">
	import type { PageData } from './$types';
	import type { SearchFilters } from '$server/search';
	import SearchBar from '$components/search/SearchBar.svelte';
	import FilterPanel from '$components/search/FilterPanel.svelte';
	import ResultsList from '$components/search/ResultsList.svelte';
	import { cityConfig } from '$config/city';

	let { data }: { data: PageData } = $props();

	let query = $state('');
	let filters = $state<SearchFilters>({});
</script>

<svelte:head>
	<title>Performers | {cityConfig.name} Comedy Connector</title>
	<meta name="description" content="Browse {cityConfig.name} improv and comedy performers." />
</svelte:head>

<div class="list-page">
	<div class="page-header">
		<h1 class="page-title">PERFORMERS</h1>
		<div class="search-row">
			<SearchBar placeholder="Search performers..." onchange={(q) => (query = q)} />
			<FilterPanel type="performers" {filters} onchange={(f) => (filters = f)} />
		</div>
	</div>

	<ResultsList
		type="performers"
		{query}
		{filters}
		initialResults={data.initialResults}
		initialNextCursor={data.initialNextCursor}
	/>
</div>

<style>
	.list-page {
		max-width: 1152px;
		margin: 0 auto;
		padding: 48px 32px;
	}

	.page-header {
		margin-bottom: 32px;
	}

	.page-title {
		font-family: var(--font-heading);
		font-size: 48px;
		color: var(--zine-primary);
		transform: rotate(-1deg);
		display: inline-block;
		margin-bottom: 24px;
	}

	.search-row {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	@media (min-width: 640px) {
		.search-row {
			flex-direction: row;
			align-items: center;
			flex-wrap: wrap;
		}
	}
</style>

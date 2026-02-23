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

<div class="mx-auto max-w-6xl px-4 py-10">
	<div class="mb-6">
		<h1 class="text-3xl font-bold text-surface-900 dark:text-surface-50 mb-4">Performers</h1>
		<div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
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

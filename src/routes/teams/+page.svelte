<script lang="ts">
	import type { PageData } from './$types';
	import type { SearchFilters } from '$server/search';
	import SearchBar from '$components/search/SearchBar.svelte';
	import FilterPanel from '$components/search/FilterPanel.svelte';
	import ResultsList from '$components/search/ResultsList.svelte';
	import { authStore } from '$stores/auth.svelte';
	import { cityConfig } from '$config/city';
	import { Plus } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	let query = $state('');
	let filters = $state<SearchFilters>({});
</script>

<svelte:head>
	<title>Teams | {cityConfig.name} Comedy Connector</title>
	<meta name="description" content="Browse improv and comedy teams in {cityConfig.name}." />
</svelte:head>

<div class="mx-auto max-w-6xl px-4 py-10">
	<div class="mb-6">
		<div class="flex items-center justify-between mb-4">
			<h1 class="text-3xl font-bold text-surface-900 dark:text-surface-50">Teams</h1>
			{#if authStore.isAuthenticated}
				<a href="/teams/create" class="btn preset-filled-tertiary-500 gap-1">
					<Plus size={16} />
					Create Team
				</a>
			{/if}
		</div>
		<div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
			<SearchBar placeholder="Search teams..." onchange={(q) => (query = q)} />
			<FilterPanel type="teams" {filters} onchange={(f) => (filters = f)} />
		</div>
	</div>

	<ResultsList
		type="teams"
		{query}
		{filters}
		initialResults={data.initialResults}
		initialNextCursor={data.initialNextCursor}
	/>
</div>

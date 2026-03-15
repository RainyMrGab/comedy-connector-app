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

<div class="list-page">
	<div class="page-header">
		<div class="title-row">
			<h1 class="page-title">TEAMS</h1>
			{#if authStore.isAuthenticated}
				<a href="/teams/create" class="btn-outline">
					<Plus size={16} />
					CREATE TEAM
				</a>
			{/if}
		</div>
		<div class="search-row">
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

<style>
	.list-page { max-width: 1152px; margin: 0 auto; padding: 48px 32px; }
	.page-header { margin-bottom: 32px; }
	.title-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
	.page-title { font-family: var(--font-heading); font-size: 48px; color: var(--zine-primary); transform: rotate(-1deg); display: inline-block; margin: 0; }
	.search-row { display: flex; flex-direction: column; gap: 12px; }
	@media (min-width: 640px) { .search-row { flex-direction: row; align-items: center; flex-wrap: wrap; } }
</style>

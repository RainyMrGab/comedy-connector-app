<script lang="ts">
	import type { PageData } from './$types';
	import type { SearchFilters } from '$server/search';
	import SearchBar from '$components/search/SearchBar.svelte';
	import ResultsList from '$components/search/ResultsList.svelte';
	import { cityConfig } from '$config/city';
	import { Users, ArrowLeft } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	let query = $state('');
	// openToNewMembers is locked — this page always shows only teams recruiting members
	const filters: SearchFilters = { openToNewMembers: true };
</script>

<svelte:head>
	<title>Join a Team | {cityConfig.name} Comedy Connector</title>
	<meta
		name="description"
		content="Find {cityConfig.name} comedy teams that are open to new members."
	/>
</svelte:head>

<div class="list-page">
	<div class="page-header">
		<a href="/connect" class="back-link"><ArrowLeft size={14} /> CONNECT</a>
		<div class="title-row">
			<span class="title-icon"><Users size={20} /></span>
			<h1 class="page-title">JOIN A TEAM</h1>
		</div>
		<p class="page-desc">{cityConfig.name} teams actively looking for new members. Search by name or team type.</p>
		<SearchBar placeholder="Search teams..." onchange={(q) => (query = q)} />
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
	.back-link { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; color: var(--zine-muted); text-decoration: none; margin-bottom: 16px; }
	.back-link:hover { color: var(--zine-accent); }
	.title-row { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
	.title-icon { color: var(--zine-accent); }
	.page-title { font-family: var(--font-heading); font-size: 40px; color: var(--zine-primary); margin: 0; }
	.page-desc { font-size: 14px; opacity: 0.75; margin-bottom: 20px; }
</style>

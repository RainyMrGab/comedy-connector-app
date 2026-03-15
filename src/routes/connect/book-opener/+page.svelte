<script lang="ts">
	import type { PageData } from './$types';
	import type { SearchFilters } from '$server/search';
	import SearchBar from '$components/search/SearchBar.svelte';
	import ResultsList from '$components/search/ResultsList.svelte';
	import { cityConfig } from '$config/city';
	import { Mic2, ArrowLeft } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	let query = $state('');
	// openToBookOpeners is locked — this page always shows only book openers
	const filters: SearchFilters = { openToBookOpeners: true };
</script>

<svelte:head>
	<title>Find a Book Opener | {cityConfig.name} Comedy Connector</title>
	<meta
		name="description"
		content="Find performers in {cityConfig.name} who are available as book openers."
	/>
</svelte:head>

<div class="list-page">
	<div class="page-header">
		<a href="/connect" class="back-link"><ArrowLeft size={14} /> CONNECT</a>
		<div class="title-row">
			<span class="title-icon"><Mic2 size={20} /></span>
			<h1 class="page-title">BOOK AN OPENER</h1>
		</div>
		<p class="page-desc">Performers available to open shows in {cityConfig.name}. Search by name to narrow results.</p>
		<SearchBar placeholder="Search by name..." onchange={(q) => (query = q)} />
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
	.list-page { max-width: 1152px; margin: 0 auto; padding: 48px 32px; }
	.page-header { margin-bottom: 32px; }
	.back-link { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; color: var(--zine-muted); text-decoration: none; margin-bottom: 16px; }
	.back-link:hover { color: var(--zine-accent); }
	.title-row { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
	.title-icon { color: var(--zine-accent); }
	.page-title { font-family: var(--font-heading); font-size: 40px; color: var(--zine-primary); margin: 0; }
	.page-desc { font-size: 14px; opacity: 0.75; margin-bottom: 20px; }
</style>

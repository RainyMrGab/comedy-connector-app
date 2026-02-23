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

<div class="mx-auto max-w-6xl px-4 py-10">
	<div class="mb-6">
		<a
			href="/connect"
			class="flex items-center gap-1 text-sm text-surface-500 hover:text-surface-900 dark:hover:text-surface-50 transition-colors mb-4"
		>
			<ArrowLeft size={14} /> Back to Connect
		</a>
		<div class="flex items-center gap-3 mb-2">
			<div class="w-10 h-10 rounded-xl bg-secondary-500 flex items-center justify-center text-white">
				<Mic2 size={20} />
			</div>
			<h1 class="text-3xl font-bold text-surface-900 dark:text-surface-50">Find a Book Opener</h1>
		</div>
		<p class="text-surface-500 mb-4">
			These performers are available to open shows in {cityConfig.name}. Search by name to narrow
			results.
		</p>
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

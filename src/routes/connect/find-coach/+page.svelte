<script lang="ts">
	import type { PageData } from './$types';
	import type { SearchFilters } from '$server/search';
	import SearchBar from '$components/search/SearchBar.svelte';
	import FilterPanel from '$components/search/FilterPanel.svelte';
	import ResultsList from '$components/search/ResultsList.svelte';
	import { cityConfig } from '$config/city';
	import { UserCheck, ArrowLeft } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	let query = $state('');
	let filters = $state<SearchFilters>({});
</script>

<svelte:head>
	<title>Find a Coach | {cityConfig.name} Comedy Connector</title>
	<meta name="description" content="Find comedy coaches in {cityConfig.name}." />
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
			<div
				class="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center text-white"
			>
				<UserCheck size={20} />
			</div>
			<h1 class="text-3xl font-bold text-surface-900 dark:text-surface-50">Find a Coach</h1>
		</div>
		<p class="text-surface-500 mb-4">
			Connect with coaches in {cityConfig.name} offering private sessions, team coaching, and workshops.
		</p>
		<div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
			<SearchBar placeholder="Search coaches..." onchange={(q) => (query = q)} />
			<FilterPanel type="coaches" {filters} onchange={(f) => (filters = f)} />
		</div>
	</div>

	<ResultsList
		type="coaches"
		{query}
		{filters}
		initialResults={data.initialResults}
		initialNextCursor={data.initialNextCursor}
	/>
</div>

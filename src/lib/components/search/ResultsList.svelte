<script lang="ts">
	import { untrack } from 'svelte';
	import type { SearchResult, SearchCursor, SearchFilters } from '$server/search';
	import ResultCard from './ResultCard.svelte';
	import LoadingSpinner from '$components/ui/LoadingSpinner.svelte';
	import EmptyState from '$components/ui/EmptyState.svelte';

	interface Props {
		type: 'performers' | 'coaches' | 'teams';
		query: string;
		filters: SearchFilters;
		initialResults: SearchResult[];
		initialNextCursor: SearchCursor | null;
	}

	let { type, query, filters, initialResults, initialNextCursor }: Props = $props();

	let results = $state<SearchResult[]>(untrack(() => initialResults));
	let nextCursor = $state<SearchCursor | null>(untrack(() => initialNextCursor));
	let loading = $state(false);
	let loadingMore = $state(false);
	let sentinel = $state<HTMLDivElement | undefined>(undefined);

	// Skip initial render to avoid refetching SSR data
	let isInitialRender = true;

	function buildParams(q: string, f: SearchFilters, cursor?: SearchCursor): URLSearchParams {
		const params = new URLSearchParams({ type, q });
		if (cursor) params.set('cursor', JSON.stringify(cursor));
		if (f.openToBookOpeners) params.set('openToBookOpeners', 'true');
		if (f.lookingForTeam) params.set('lookingForTeam', 'true');
		if (f.lookingForCoach) params.set('lookingForCoach', 'true');
		if (f.availableForPrivate) params.set('availableForPrivate', 'true');
		if (f.availableForTeams) params.set('availableForTeams', 'true');
		if (f.availableForWorkshops) params.set('availableForWorkshops', 'true');
		if (f.openToNewMembers) params.set('openToNewMembers', 'true');
		if (f.seekingCoach) params.set('seekingCoach', 'true');
		return params;
	}

	async function fetchPage(
		q: string,
		f: SearchFilters,
		cursor?: SearchCursor
	): Promise<{ results: SearchResult[]; nextCursor: SearchCursor | null }> {
		const res = await fetch(`/api/search?${buildParams(q, f, cursor)}`);
		return res.json();
	}

	// Re-fetch when query or filters change (skip first render to use SSR data)
	$effect(() => {
		const q = query;
		const filterSnapshot = {
			openToBookOpeners: filters.openToBookOpeners,
			lookingForTeam: filters.lookingForTeam,
			lookingForCoach: filters.lookingForCoach,
			availableForPrivate: filters.availableForPrivate,
			availableForTeams: filters.availableForTeams,
			availableForWorkshops: filters.availableForWorkshops,
			openToNewMembers: filters.openToNewMembers,
			seekingCoach: filters.seekingCoach
		};

		if (isInitialRender) {
			isInitialRender = false;
			return;
		}

		loading = true;
		results = [];
		nextCursor = null;

		fetchPage(q, filterSnapshot, undefined).then((data) => {
			results = data.results;
			nextCursor = data.nextCursor;
			loading = false;
		});
	});

	async function loadMore() {
		if (!nextCursor || loadingMore) return;
		loadingMore = true;
		const cur = nextCursor;
		const data = await fetchPage(query, filters, cur);
		results = [...results, ...data.results];
		nextCursor = data.nextCursor;
		loadingMore = false;
	}

	// Infinite scroll via Intersection Observer on sentinel element
	$effect(() => {
		const el = sentinel;
		if (!el) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && nextCursor && !loadingMore) {
					loadMore();
				}
			},
			{ rootMargin: '300px' }
		);

		observer.observe(el);
		return () => observer.disconnect();
	});
</script>

<div>
	{#if loading}
		<div class="flex justify-center py-16">
			<LoadingSpinner />
		</div>
	{:else if results.length === 0}
		<EmptyState title="No results found" description="Try a different search or clear your filters." />
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each results as result (result.id)}
				<ResultCard {result} {type} />
			{/each}
		</div>
	{/if}

	<!-- Sentinel for infinite scroll -->
	{#if nextCursor}
		<div bind:this={sentinel} class="py-6 flex justify-center">
			{#if loadingMore}
				<LoadingSpinner />
			{/if}
		</div>
	{/if}
</div>

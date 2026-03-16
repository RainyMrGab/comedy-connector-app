<script lang="ts">
	import type { SearchResult } from '$server/search';
	import { Users } from 'lucide-svelte';

	interface Props {
		result: SearchResult;
		type: 'performers' | 'coaches' | 'teams';
	}

	let { result, type }: Props = $props();

	const href = $derived(
		type === 'performers'
			? `/performers/${result.slug}`
			: type === 'coaches'
				? `/coaches/${result.slug}`
				: `/teams/${result.slug}`
	);

	const typeLabel = $derived(
		type === 'performers' ? 'PERFORMER' : type === 'coaches' ? 'COACH' : 'TEAM'
	);
</script>

<a {href} class="result-card">
	<span class="type-tag">{typeLabel}</span>

	<div class="card-header">
		{#if result.photoUrl}
			<img src={result.photoUrl} alt={result.name} class="avatar" />
		{:else}
			<div class="avatar-placeholder">
				{#if type === 'teams'}
					<Users size={18} />
				{:else}
					{result.name[0]?.toUpperCase() ?? '?'}
				{/if}
			</div>
		{/if}
		<p class="card-name">{result.name}</p>
	</div>

	{#if result.bio}
		<p class="card-bio">{result.bio}</p>
	{/if}

	<div class="card-tags">
		{#if result.status === 'stub'}
			<span class="ztag stub">UNCLAIMED</span>
		{/if}
		{#if result.form}
			<span class="ztag">{result.form}</span>
		{/if}
		{#if result.openToBookOpeners}
			<span class="ztag">BOOK OPENERS</span>
		{/if}
		{#if result.lookingForTeam}
			<span class="ztag">SEEKING TEAM</span>
		{/if}
		{#if result.lookingForCoach}
			<span class="ztag">SEEKING COACH</span>
		{/if}
		{#if result.availableForPrivate}
			<span class="ztag">PRIVATE SESSIONS</span>
		{/if}
		{#if result.availableForTeams}
			<span class="ztag">TEAM COACHING</span>
		{/if}
		{#if result.availableForWorkshops}
			<span class="ztag">WORKSHOPS</span>
		{/if}
		{#if result.openToNewMembers}
			<span class="ztag">OPEN TO MEMBERS</span>
		{/if}
		{#if result.seekingCoach}
			<span class="ztag">SEEKING COACH</span>
		{/if}
	</div>
</a>

<style>
	.result-card { display: flex; flex-direction: column; gap: 8px; padding: 16px; background: var(--zine-surface); border: var(--zine-border); text-decoration: none; color: var(--zine-primary); transition: transform 0.1s, box-shadow 0.1s; }
	.result-card:hover { transform: translate(-2px, -2px); box-shadow: var(--zine-shadow); }
	.type-tag { font-size: 9px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; background: var(--zine-muted); color: #fff; padding: 2px 8px; align-self: flex-start; }
	.card-header { display: flex; align-items: center; gap: 10px; }
	.avatar { width: 40px; height: 40px; object-fit: cover; border: 1px solid var(--zine-primary); flex-shrink: 0; }
	.avatar-placeholder { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: var(--zine-primary); color: var(--zine-bg); font-weight: 700; font-size: 16px; flex-shrink: 0; }
	.card-name { font-weight: 700; font-size: 15px; line-height: 1.2; }
	.card-bio { font-size: 12px; opacity: 0.7; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
	.card-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
	.ztag { font-size: 9px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; background: var(--zine-primary); color: var(--zine-bg); padding: 2px 8px; }
	.ztag.stub { background: var(--zine-accent); color: #fff; }
</style>

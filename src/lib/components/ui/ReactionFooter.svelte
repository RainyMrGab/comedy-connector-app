<script lang="ts">
	import { enhance } from '$app/forms';
	import { ThumbsUp, Heart, PartyPopper } from 'lucide-svelte';
	import { toastStore } from '$stores/toast.svelte';

	interface ReactionCount {
		reactionType: string;
		count: number;
	}

	interface UserReaction {
		reactionType: string;
	}

	let {
		entityId,
		entityType,
		reactionCounts,
		userReactions,
		isLoggedIn
	}: {
		entityId: string;
		entityType: 'performer' | 'coach' | 'team';
		reactionCounts: ReactionCount[];
		userReactions: UserReaction[];
		isLoggedIn: boolean;
	} = $props();

	const REACTIONS = [
		{ type: 'like', label: 'Like', Icon: ThumbsUp },
		{ type: 'love', label: 'Love', Icon: Heart },
		{ type: 'celebrate', label: 'Celebrate', Icon: PartyPopper }
	] as const;

	let localCounts = $state(
		Object.fromEntries(REACTIONS.map((r) => [r.type, reactionCounts.find((c) => c.reactionType === r.type)?.count ?? 0]))
	);
	let localActive = $state(
		Object.fromEntries(REACTIONS.map((r) => [r.type, userReactions.some((u) => u.reactionType === r.type)]))
	);
</script>

<section class="reaction-footer">
	<div class="reaction-buttons">
		{#each REACTIONS as reaction}
			{@const active = localActive[reaction.type]}
			{@const count = localCounts[reaction.type]}
			{#if isLoggedIn}
				<form
					method="POST"
					action={active ? '?/unreact' : '?/react'}
					use:enhance={() => {
						// Optimistic update
						if (active) {
							localActive[reaction.type] = false;
							localCounts[reaction.type] = Math.max(0, localCounts[reaction.type] - 1);
						} else {
							localActive[reaction.type] = true;
							localCounts[reaction.type] = localCounts[reaction.type] + 1;
						}
						return async ({ result }) => {
							if (result.type === 'failure') {
								// Roll back
								localActive[reaction.type] = active;
								localCounts[reaction.type] = count;
								toastStore.error(
									(result.data as { error?: string } | undefined)?.error ?? 'Something went wrong.'
								);
							}
						};
					}}
				>
					<input type="hidden" name="reactionType" value={reaction.type} />
					<input type="hidden" name="entityId" value={entityId} />
					<input type="hidden" name="entityType" value={entityType} />
					<button type="submit" class={active ? 'reaction-btn active' : 'reaction-btn'} title={reaction.label}>
						<reaction.Icon size={15} />
						{#if count > 0}
							<span class="reaction-count">{count}</span>
						{/if}
					</button>
				</form>
			{:else}
				<a href="/login" class="reaction-btn" title="Sign in to add a reaction">
					<reaction.Icon size={15} />
					{#if count > 0}
						<span class="reaction-count">{count}</span>
					{/if}
				</a>
			{/if}
		{/each}
	</div>
</section>

<style>
	.reaction-footer {
		display: flex;
		align-items: center;
		gap: 16px;
		padding-top: 24px;
		margin-top: 8px;
		border-top: 1px solid var(--zine-border-color, #1c1c1c);
		flex-wrap: wrap;
	}

	.reaction-buttons {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.reaction-btn {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 5px 10px;
		font-family: var(--font-body);
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.06em;
		border: 1.5px solid var(--zine-primary);
		background: transparent;
		color: var(--zine-primary);
		cursor: pointer;
		text-decoration: none;
		transition: background 0.1s, color 0.1s;
		line-height: 1;
	}

	.reaction-btn:hover {
		background: var(--zine-primary);
		color: var(--zine-bg);
	}

	.reaction-btn.active {
		background: var(--zine-primary);
		color: var(--zine-bg);
	}

	.reaction-count {
		font-size: 10px;
	}

	form {
		display: contents;
	}
</style>

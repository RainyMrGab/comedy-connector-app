<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import EmptyState from '$components/ui/EmptyState.svelte';

	let { data }: { data: PageData } = $props();
	let pendingMemberships = $derived(data.pendingMemberships);
	let pendingCoachRoles = $derived(data.pendingCoachRoles);

	const total = $derived(pendingMemberships.length + pendingCoachRoles.length);
</script>

<svelte:head>
	<title>Pending Approvals | Comedy Connector</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-10">
	<h1 class="text-2xl font-bold text-surface-900 dark:text-surface-50 mb-2">Pending Approvals</h1>
	<p class="text-surface-500 mb-8">
		{total} item{total !== 1 ? 's' : ''} waiting for your approval.
	</p>

	{#if total === 0}
		<EmptyState
			title="All caught up!"
			description="No pending approvals right now."
		/>
	{/if}

	<!-- Team memberships -->
	{#if pendingMemberships.length > 0}
		<section class="mb-8">
			<h2 class="text-lg font-semibold text-surface-800 dark:text-surface-100 mb-4">
				Team Membership Requests ({pendingMemberships.length})
			</h2>
			<div class="space-y-3">
				{#each pendingMemberships as m}
					<div class="flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700">
						<div>
							<p class="font-medium text-surface-900 dark:text-surface-50">
								<a href="/teams/{m.teamSlug}" class="hover:text-primary-500 transition-colors">
									{m.teamName}
								</a>
							</p>
							<p class="text-xs text-surface-400 mt-1">Added {new Date(m.createdAt).toLocaleDateString()}</p>
						</div>
						<div class="flex gap-2">
							<form method="POST" action="/api/approvals/{m.id}?type=membership" use:enhance>
								<button type="submit" name="action" value="approve" class="btn preset-filled-success-500 btn-sm">
									Approve
								</button>
							</form>
							<form method="POST" action="/api/approvals/{m.id}?type=membership" use:enhance>
								<button type="submit" name="action" value="reject" class="btn preset-tonal-error btn-sm">
									Reject
								</button>
							</form>
						</div>
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Coach roles -->
	{#if pendingCoachRoles.length > 0}
		<section class="mb-8">
			<h2 class="text-lg font-semibold text-surface-800 dark:text-surface-100 mb-4">
				Coach Role Requests ({pendingCoachRoles.length})
			</h2>
			<div class="space-y-3">
				{#each pendingCoachRoles as c}
					<div class="flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700">
						<div>
							<p class="font-medium text-surface-900 dark:text-surface-50">
								<a href="/teams/{c.teamSlug}" class="hover:text-secondary-500 transition-colors">
									{c.teamName}
								</a>
							</p>
							<p class="text-xs text-surface-400 mt-1">Added {new Date(c.createdAt).toLocaleDateString()}</p>
						</div>
						<div class="flex gap-2">
							<form method="POST" action="/api/approvals/{c.id}?type=coach" use:enhance>
								<button type="submit" name="action" value="approve" class="btn preset-filled-success-500 btn-sm">
									Approve
								</button>
							</form>
							<form method="POST" action="/api/approvals/{c.id}?type=coach" use:enhance>
								<button type="submit" name="action" value="reject" class="btn preset-tonal-error btn-sm">
									Reject
								</button>
							</form>
						</div>
					</div>
				{/each}
			</div>
		</section>
	{/if}
</div>

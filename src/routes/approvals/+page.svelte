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

<div class="approvals-page">
	<h1 class="page-title">PENDING APPROVALS</h1>
	<p class="page-sub">{total} item{total !== 1 ? 's' : ''} waiting for your approval.</p>

	{#if total === 0}
		<EmptyState title="All caught up!" description="No pending approvals right now." />
	{/if}

	{#if pendingMemberships.length > 0}
		<section class="approval-section">
			<h2 class="section-label">TEAM MEMBERSHIP REQUESTS ({pendingMemberships.length})</h2>
			{#each pendingMemberships as m}
				<div class="approval-row">
					<div>
						<a href="/teams/{m.teamSlug}" class="approval-name">{m.teamName}</a>
						<p class="approval-date">Added {new Date(m.createdAt).toLocaleDateString()}</p>
					</div>
					<div class="approval-actions">
						<form method="POST" action="/api/approvals/{m.id}?type=membership" use:enhance>
							<button type="submit" name="action" value="approve" class="btn-approve">APPROVE</button>
						</form>
						<form method="POST" action="/api/approvals/{m.id}?type=membership" use:enhance>
							<button type="submit" name="action" value="reject" class="btn-reject">REJECT</button>
						</form>
					</div>
				</div>
			{/each}
		</section>
	{/if}

	{#if pendingCoachRoles.length > 0}
		<section class="approval-section">
			<h2 class="section-label">COACH ROLE REQUESTS ({pendingCoachRoles.length})</h2>
			{#each pendingCoachRoles as c}
				<div class="approval-row">
					<div>
						<a href="/teams/{c.teamSlug}" class="approval-name">{c.teamName}</a>
						<p class="approval-date">Added {new Date(c.createdAt).toLocaleDateString()}</p>
					</div>
					<div class="approval-actions">
						<form method="POST" action="/api/approvals/{c.id}?type=coach" use:enhance>
							<button type="submit" name="action" value="approve" class="btn-approve">APPROVE</button>
						</form>
						<form method="POST" action="/api/approvals/{c.id}?type=coach" use:enhance>
							<button type="submit" name="action" value="reject" class="btn-reject">REJECT</button>
						</form>
					</div>
				</div>
			{/each}
		</section>
	{/if}
</div>

<style>
	.approvals-page { max-width: 768px; margin: 0 auto; padding: 48px 32px; }
	.page-title { font-family: var(--font-heading); font-size: 40px; color: var(--zine-primary); transform: rotate(-1deg); display: inline-block; margin-bottom: 8px; }
	.page-sub { font-size: 14px; opacity: 0.7; margin-bottom: 32px; }
	.approval-section { margin-bottom: 32px; }
	.section-label { font-family: var(--font-body); font-size: 10px; font-weight: 700; letter-spacing: 0.12em; color: var(--zine-muted); margin-bottom: 12px; }
	.approval-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px; border: var(--zine-border); background: var(--zine-surface); margin-bottom: 8px; flex-wrap: wrap; }
	.approval-name { font-weight: 700; font-size: 14px; color: var(--zine-primary); text-decoration: none; }
	.approval-name:hover { color: var(--zine-muted); }
	.approval-date { font-size: 11px; opacity: 0.6; margin-top: 2px; }
	.approval-actions { display: flex; gap: 8px; }
	.btn-approve { font-family: var(--font-body); font-size: 11px; font-weight: 700; letter-spacing: 0.08em; background: var(--zine-muted); color: #fff; border: var(--zine-border); padding: 6px 14px; cursor: pointer; }
	.btn-reject { font-family: var(--font-body); font-size: 11px; font-weight: 700; letter-spacing: 0.08em; background: transparent; color: var(--zine-accent); border: 2px solid var(--zine-accent); padding: 6px 14px; cursor: pointer; }
</style>

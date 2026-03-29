<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let running = $state(false);

	let result = $derived(form?.result);
</script>

<svelte:head>
	<title>Simulate Freshness Reminders | Dev Tools</title>
</svelte:head>

<div class="dev-page">
	<div class="page-top">
		<h1 class="page-title">FRESHNESS REMINDER SIMULATOR</h1>
		<a href="/" class="btn-outline">← HOME</a>
	</div>

	<div class="info-card">
		<p>
			Triggers the <strong>Day 1 batch</strong> (offset 0, up to 50 recipients) of the monthly
			freshness reminder poll using the current eligibility filter
			<em>(inactive since start of last calendar month)</em>.
		</p>
		<ul>
			<li>If <code>RESEND_API_KEY</code> is set → emails are actually sent.</li>
			<li>If not → dry run: shows who would receive email + HTML preview of the first one.</li>
		</ul>
	</div>

	<form
		method="POST"
		use:enhance={() => {
			running = true;
			return async ({ update }) => {
				await update();
				running = false;
			};
		}}
	>
		<button type="submit" class="btn-accent" disabled={running}>
			{running ? 'RUNNING…' : 'SEND DAY 1 BATCH'}
		</button>
	</form>

	{#if result}
		<div class="result-section">
			<h2 class="section-label">RESULT</h2>

			<div class="result-meta">
				{#if result.dryRun}
					<span class="badge badge-dry">DRY RUN — no emails sent</span>
				{:else}
					<span class="badge badge-sent">✅ {result.sent} email(s) sent</span>
				{/if}
				<span class="count">{result.recipients.length} recipient(s) in batch</span>
			</div>

			{#if result.errors.length > 0}
				<div class="errors">
					<p class="error-label">ERRORS</p>
					{#each result.errors as err}
						<p class="error-row">{err}</p>
					{/each}
				</div>
			{/if}

			{#if result.recipients.length > 0}
				<h3 class="section-label" style="margin-top:24px;">RECIPIENTS</h3>
				<div class="recipient-list">
					{#each result.recipients as r}
						<div class="recipient-row">
							<div>
								<strong>{r.name}</strong>
								<span class="email">{r.email}</span>
							</div>
							<div class="sections">
								{#each r.sections as s}
									<span class="section-tag">{s}</span>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<p class="empty-state">No eligible recipients found (all users were active last month, or no profiles exist).</p>
			{/if}

			{#if result.firstEmailHtml}
				<h3 class="section-label" style="margin-top:32px;">EMAIL PREVIEW (first recipient)</h3>
				{#if result.firstEmailSubject}
					<div class="email-subject">
						<span class="subject-label">SUBJECT</span>
						<span class="subject-value">{result.firstEmailSubject}</span>
					</div>
				{/if}
				<div class="email-preview">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html result.firstEmailHtml}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.dev-page { max-width: 800px; margin: 0 auto; padding: 48px 32px; }
	.page-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 32px; }
	.page-title { font-family: var(--font-heading); font-size: 32px; color: var(--zine-primary); transform: rotate(-1deg); display: inline-block; margin: 0; }
	.info-card { background: var(--zine-surface); border: var(--zine-border); padding: 16px 20px; margin-bottom: 24px; font-size: 14px; }
	.info-card ul { margin: 8px 0 0; padding-left: 20px; }
	.info-card li { margin-bottom: 4px; }
	.result-section { margin-top: 32px; }
	.section-label { font-family: var(--font-body); font-size: 10px; font-weight: 700; letter-spacing: 0.12em; color: var(--zine-muted); border-bottom: 1px solid var(--zine-muted); padding-bottom: 6px; margin-bottom: 16px; }
	.result-meta { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
	.badge { font-size: 12px; font-weight: 700; padding: 4px 10px; }
	.badge-dry { background: #fef3c7; color: #92400e; }
	.badge-sent { background: #d1fae5; color: #065f46; }
	.count { font-size: 13px; color: var(--zine-muted); }
	.errors { background: #fef2f2; border: 1px solid #fca5a5; padding: 12px 14px; margin-bottom: 16px; }
	.error-label { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; color: #b91c1c; margin: 0 0 8px; }
	.error-row { font-size: 13px; color: #b91c1c; margin: 4px 0; }
	.recipient-list { display: flex; flex-direction: column; gap: 8px; }
	.recipient-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 10px 14px; background: var(--zine-surface); border: var(--zine-border); }
	.email { font-size: 12px; color: var(--zine-muted); margin-left: 8px; }
	.sections { display: flex; flex-wrap: wrap; gap: 4px; }
	.section-tag { font-size: 10px; font-weight: 700; letter-spacing: 0.08em; padding: 2px 7px; background: var(--zine-primary); color: var(--zine-highlight, #fff); }
	.empty-state { font-size: 13px; color: var(--zine-muted); font-style: italic; }
	.email-subject { display: flex; align-items: baseline; gap: 10px; padding: 8px 12px; background: var(--zine-surface); border: var(--zine-border); border-bottom: none; }
	.subject-label { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; color: var(--zine-muted); flex-shrink: 0; }
	.subject-value { font-size: 13px; font-weight: 600; }
	.email-preview { border: var(--zine-border); padding: 24px; background: #fff; margin-top: 0; }
</style>

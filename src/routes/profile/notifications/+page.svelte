<script lang="ts">
	import { enhance } from '$app/forms';
	import { untrack } from 'svelte';
	import type { PageData } from './$types';
	import { toastStore } from '$stores/toast.svelte';

	let { data }: { data: PageData } = $props();

	let emailOnMemberAdded = $state(untrack(() => data.preferences.emailOnMemberAdded));
	let emailOnCoachAdded = $state(untrack(() => data.preferences.emailOnCoachAdded));
	let saving = $state(false);

	function saveEnhance() {
		saving = true;
		return async ({ result, update }: { result: { type: string; data?: { message?: string; error?: string } }; update: () => Promise<void> }) => {
			if (result.type === 'success' && result.data?.message) {
				toastStore.success(result.data.message);
			} else if (result.type === 'failure' && result.data?.error) {
				toastStore.error(result.data.error);
			}
			await update();
			saving = false;
		};
	}
</script>

<svelte:head>
	<title>Notifications | Comedy Connector</title>
</svelte:head>

<div class="form-page">
	<h1 class="page-title">NOTIFICATIONS</h1>
	<p class="page-sub">Choose how Comedy Connector reaches out when something needs your attention.</p>

	<form method="POST" use:enhance={saveEnhance} class="zine-form">
		<label class="checkbox-label">
			<input type="checkbox" checked disabled />
			<span>
				<strong>📬 Monthly freshness check</strong>
				<span class="field-hint">Keeps your listing accurate. Can't be turned off.</span>
			</span>
		</label>
		<label class="checkbox-label">
			<input type="checkbox" name="emailOnMemberAdded" value="true" bind:checked={emailOnMemberAdded} />
			<span>
				<strong>🎭 Someone adds me as a performer</strong>
				<span class="field-hint">Email me when a team adds me and I need to approve it.</span>
			</span>
		</label>
		<label class="checkbox-label">
			<input type="checkbox" name="emailOnCoachAdded" value="true" bind:checked={emailOnCoachAdded} />
			<span>
				<strong>🎓 Someone adds me as a coach</strong>
				<span class="field-hint">Email me when a team adds me and I need to approve it.</span>
			</span>
		</label>
		<div class="form-actions">
			<button type="submit" class="btn-accent" disabled={saving}>{saving ? 'SAVING…' : 'SAVE PREFERENCES'}</button>
			<a href="/profile" class="btn-outline">CANCEL</a>
		</div>
	</form>
</div>

<style>
	.form-page { max-width: 640px; margin: 0 auto; padding: 48px 32px; }
	.page-title { font-family: var(--font-heading); font-size: 36px; color: var(--zine-primary); margin-bottom: 8px; transform: rotate(-1deg); display: inline-block; }
	.page-sub { font-size: 14px; opacity: 0.7; margin-bottom: 32px; }
	.zine-form { display: flex; flex-direction: column; gap: 20px; }
	.checkbox-label { display: flex; align-items: flex-start; gap: 12px; padding: 16px; border: var(--zine-border); background: var(--zine-surface); cursor: pointer; }
	.checkbox-label input[type='checkbox'] { margin-top: 3px; flex-shrink: 0; }
	.checkbox-label span { display: flex; flex-direction: column; gap: 4px; }
	.field-hint { font-size: 12px; font-weight: 400; opacity: 0.65; }
	.form-actions { display: flex; gap: 12px; padding-top: 8px; }
</style>

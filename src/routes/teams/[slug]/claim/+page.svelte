<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let team = $derived(data.team);
	let saving = $state(false);
</script>

<svelte:head>
	<title>Claim {team.name} | Comedy Connector</title>
</svelte:head>

<div class="form-page">
	<div class="claim-notice">
		<p class="claim-title">CLAIMING: {team.name}</p>
		<p class="claim-body">You're filling in the details for this stub team. All existing members will remain on the roster.</p>
	</div>

	{#if form?.error}
		<div class="form-error-banner">{form.error}</div>
	{/if}

	<form
		method="POST"
		use:enhance={() => {
			saving = true;
			return async ({ update }) => {
				await update();
				saving = false;
			};
		}}
		class="zine-form"
	>
		<div class="form-field">
			<label for="description">DESCRIPTION</label>
			<textarea id="description" name="description" rows="4" placeholder="Tell us about {team.name}..."></textarea>
		</div>

		<div class="two-col">
			<div class="form-field">
				<label for="form">FORM / STYLE</label>
				<input id="form" name="form" type="text" placeholder="e.g. Harold, Longform" />
			</div>
			<div class="form-field">
				<label for="videoUrl">VIDEO URL</label>
				<input id="videoUrl" name="videoUrl" type="url" placeholder="https://youtube.com/..." />
			</div>
		</div>

		<fieldset>
			<legend>TEAM STATUS</legend>
			<div class="checks">
				<label class="checkbox-label"><input type="checkbox" name="isPracticeGroup" value="true" /><span>Practice group</span></label>
				<label class="checkbox-label"><input type="checkbox" name="openToNewMembers" value="true" /><span>Open to new members</span></label>
				<label class="checkbox-label"><input type="checkbox" name="openToBookOpeners" value="true" /><span>Available to book as opener</span></label>
				<label class="checkbox-label"><input type="checkbox" name="seekingCoach" value="true" /><span>Seeking a coach</span></label>
			</div>
		</fieldset>

		<div class="form-field">
			<label for="lookingFor">LOOKING FOR</label>
			<input id="lookingFor" name="lookingFor" type="text" placeholder="Any specifics..." />
		</div>

		<div class="form-actions">
			<button type="submit" class="btn-accent" disabled={saving}>
				{saving ? 'CLAIMING…' : 'CLAIM TEAM'}
			</button>
			<a href="/teams/{team.slug}" class="btn-outline">CANCEL</a>
		</div>
	</form>
</div>

<style>
	.form-page { max-width: 640px; margin: 0 auto; padding: 48px 32px; }
	.claim-notice { background: var(--zine-surface); border: var(--zine-border); border-left: 4px solid var(--zine-muted); padding: 16px 20px; margin-bottom: 32px; box-shadow: var(--zine-shadow); }
	.claim-title { font-family: var(--font-heading); font-size: 18px; color: var(--zine-muted); margin-bottom: 6px; }
	.claim-body { font-size: 13px; opacity: 0.75; }
	.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
	.checks { display: flex; flex-direction: column; gap: 12px; }
	.form-actions { display: flex; gap: 12px; padding-top: 8px; }
	@media (max-width: 500px) { .two-col { grid-template-columns: 1fr; } }
</style>

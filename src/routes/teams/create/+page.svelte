<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let saving = $state(false);
</script>

<svelte:head>
	<title>Create Team | Comedy Connector</title>
</svelte:head>

<div class="form-page">
	<h1 class="page-title">CREATE A TEAM</h1>

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
			<label for="name">TEAM NAME <span class="required">*</span></label>
			<input id="name" name="name" type="text" class={form?.errors?.name ? 'input-error' : ''} value={form?.values?.name ?? ''} required placeholder="e.g. The Midnight Collective" />
			{#if form?.errors?.name}<p class="error-msg">{form.errors.name[0]}</p>{/if}
			<p class="field-note">If a team with this name already exists as an unclaimed stub, you'll claim it.</p>
		</div>
		<div class="form-field">
			<label for="description">DESCRIPTION</label>
			<textarea id="description" name="description" rows="4" placeholder="Tell us about your team...">{form?.values?.description ?? ''}</textarea>
		</div>
		<div class="form-field">
			<label for="photoUrl">PHOTO URL <small class="field-hint">(optional)</small></label>
			<input id="photoUrl" name="photoUrl" type="url" value={form?.values?.photoUrl ?? ''} placeholder="https://..." />
		</div>
		<div class="two-col">
			<div class="form-field">
				<label for="form">FORM / STYLE</label>
				<input id="form" name="form" type="text" value={form?.values?.form ?? ''} placeholder="e.g. Harold, Montage, Longform" />
			</div>
			<div class="form-field">
				<label for="videoUrl">HIGHLIGHT VIDEO URL</label>
				<input id="videoUrl" name="videoUrl" type="url" value={form?.values?.videoUrl ?? ''} placeholder="https://youtube.com/..." />
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
			<input id="lookingFor" name="lookingFor" type="text" value={form?.values?.lookingFor ?? ''} placeholder="e.g. A new bassist, someone strong in games..." />
		</div>
		<p class="freshness-notice">
			📬 <strong>Profile freshness reminders:</strong> Comedy Connector emails you once a month to help keep your team listing accurate. We won't use your email for spam or share it with third parties — these reminders exist solely to keep the community directory useful for everyone.
		</p>
		<div class="form-actions">
			<button type="submit" class="btn-accent" disabled={saving}>{saving ? 'CREATING…' : 'CREATE TEAM'}</button>
			<a href="/teams" class="btn-outline">CANCEL</a>
		</div>
	</form>
</div>

<style>
	.form-page { max-width: 640px; margin: 0 auto; padding: 48px 32px; }
	.page-title { font-family: var(--font-heading); font-size: 36px; color: var(--zine-primary); margin-bottom: 32px; transform: rotate(-1deg); display: inline-block; }
	.required { color: var(--zine-accent); }
	.field-note { font-size: 11px; opacity: 0.6; margin-top: 4px; }
	.zine-form { display: flex; flex-direction: column; gap: 24px; }
	.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
	.checks { display: flex; flex-direction: column; gap: 12px; }
	.form-actions { display: flex; gap: 12px; padding-top: 8px; }
	.freshness-notice { font-size: 13px; color: var(--zine-muted); border: 1px solid var(--zine-border-color, #e5e7eb); border-left: 3px solid var(--zine-primary); padding: 12px 14px; margin: 0; }
	.field-hint { font-size: 10px; font-weight: 400; letter-spacing: 0; text-transform: none; opacity: 0.65; }
	@media (max-width: 500px) { .two-col { grid-template-columns: 1fr; } }
</style>

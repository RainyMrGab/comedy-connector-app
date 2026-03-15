<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let profile = $derived(data.profile);

	let saving = $state(false);
</script>

<svelte:head>
	<title>{profile ? 'Edit Profile' : 'Create Profile'} | Comedy Connector</title>
</svelte:head>

<div class="form-page">
	<h1 class="page-title">{profile ? 'EDIT YOUR PROFILE' : 'CREATE YOUR PROFILE'}</h1>

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
			<label for="name">DISPLAY NAME <span class="required">*</span></label>
			<input id="name" name="name" type="text" class={form?.errors?.name ? 'input-error' : ''} value={form?.values?.name ?? profile?.name ?? ''} required placeholder="Your name as you want it displayed" />
			{#if form?.errors?.name}
				<p class="error-msg">{form.errors.name[0]}</p>
			{/if}
		</div>
		<div class="form-field">
			<label for="bio">BIO</label>
			<textarea id="bio" name="bio" rows="4" placeholder="Tell the community about yourself...">{form?.values?.bio ?? profile?.bio ?? ''}</textarea>
		</div>
		<div class="form-field">
			<label for="training">TRAINING &amp; EXPERIENCE</label>
			<textarea id="training" name="training" rows="4" placeholder="Where have you trained? Any notable experience?">{form?.values?.training ?? profile?.training ?? ''}</textarea>
		</div>
		<div class="form-field">
			<label for="lookingFor">LOOKING FOR</label>
			<input id="lookingFor" name="lookingFor" type="text" value={form?.values?.lookingFor ?? profile?.lookingFor ?? ''} placeholder="e.g. Team to join, coach, book opener gigs..." />
		</div>
		<div class="form-field">
			<label for="contactEmail">CONTACT EMAIL <small class="field-hint">(optional — shown to logged-in users)</small></label>
			<input id="contactEmail" name="contactEmail" type="email" value={form?.values?.contactEmail ?? profile?.contactEmail ?? ''} placeholder="Different from your login email if desired" />
		</div>
		<fieldset>
			<legend>SOCIAL LINKS</legend>
			<div class="social-grid">
				{#each ['instagram', 'tiktok', 'youtube', 'facebook', 'twitter', 'website'] as platform}
					<div class="form-field">
						<label for={platform}>{platform.toUpperCase()}</label>
						<input id={platform} name={platform} type="url" value={profile?.socialLinks?.[platform] ?? ''} placeholder="https://..." />
					</div>
				{/each}
			</div>
		</fieldset>
		<label class="checkbox-label">
			<input id="freshnessReminders" name="freshnessRemindersEnabled" type="checkbox" value="true" checked={profile?.freshnessRemindersEnabled ?? true} />
			<span>Send me monthly reminders to keep my profile fresh</span>
		</label>
		<div class="form-actions">
			<button type="submit" class="btn-accent" disabled={saving}>{saving ? 'SAVING…' : 'SAVE PROFILE'}</button>
			{#if profile}
				<a href="/profile" class="btn-outline">CANCEL</a>
			{/if}
		</div>
	</form>
</div>

<style>
	.form-page { max-width: 640px; margin: 0 auto; padding: 48px 32px; }
	.page-title { font-family: var(--font-heading); font-size: 36px; color: var(--zine-primary); margin-bottom: 32px; transform: rotate(-1deg); display: inline-block; }
	.required { color: var(--zine-accent); }
	.field-hint { font-size: 11px; font-weight: 400; letter-spacing: 0; text-transform: none; opacity: 0.65; }
	.zine-form { display: flex; flex-direction: column; gap: 24px; }
	.social-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 12px; }
	.form-actions { display: flex; gap: 12px; padding-top: 8px; }
	@media (max-width: 500px) { .social-grid { grid-template-columns: 1fr; } }
</style>

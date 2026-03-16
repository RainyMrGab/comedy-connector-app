<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let coach = $derived(data.coach);

	let saving = $state(false);
</script>

<svelte:head>
	<title>Coach Profile | Comedy Connector</title>
</svelte:head>

<div class="form-page">
	<div class="page-top">
		<h1 class="page-title">{coach ? 'EDIT COACH PROFILE' : 'ENABLE COACH PROFILE'}</h1>
		{#if coach}
			<form method="POST" action="?/remove" use:enhance>
				<button type="submit" class="btn-outline remove-btn">REMOVE COACH PROFILE</button>
			</form>
		{/if}
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
			<label for="coachingBio">COACHING BIO</label>
			<textarea id="coachingBio" name="coachingBio" rows="5" placeholder="Describe your coaching style, experience, what you focus on...">{coach?.coachingBio ?? ''}</textarea>
		</div>

		<fieldset>
			<legend>AVAILABLE FOR…</legend>
			<div class="checks">
				<label class="checkbox-label">
					<input type="checkbox" name="availableForPrivate" value="true" checked={coach?.availableForPrivate ?? false} />
					<span><strong>Private sessions</strong> — 1-on-1 coaching</span>
				</label>
				<label class="checkbox-label">
					<input type="checkbox" name="availableForTeams" value="true" checked={coach?.availableForTeams ?? false} />
					<span><strong>Team coaching</strong> — coaching improv teams</span>
				</label>
				<label class="checkbox-label">
					<input type="checkbox" name="availableForWorkshops" value="true" checked={coach?.availableForWorkshops ?? false} />
					<span><strong>Workshops</strong> — group workshops</span>
				</label>
			</div>
		</fieldset>

		<div class="form-field">
			<label for="availability">AVAILABILITY / SCHEDULING NOTES</label>
			<input id="availability" name="availability" type="text" value={coach?.availability ?? ''} placeholder="e.g. Weekends only, currently full, accepting new clients..." />
		</div>

		<div class="form-actions">
			<button type="submit" class="btn-accent" disabled={saving}>{saving ? 'SAVING…' : 'SAVE COACH PROFILE'}</button>
			<a href="/profile" class="btn-outline">CANCEL</a>
		</div>
	</form>
</div>

<style>
	.form-page { max-width: 640px; margin: 0 auto; padding: 48px 32px; }
	.page-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 32px; flex-wrap: wrap; }
	.page-title { font-family: var(--font-heading); font-size: 32px; color: var(--zine-primary); transform: rotate(-1deg); display: inline-block; margin: 0; }
	.remove-btn { color: var(--zine-accent); border-color: var(--zine-accent); font-size: 11px; }
	.zine-form { display: flex; flex-direction: column; gap: 24px; }
	.checks { display: flex; flex-direction: column; gap: 12px; margin-top: 12px; }
	.form-actions { display: flex; gap: 12px; padding-top: 8px; }
</style>

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

<div class="mx-auto max-w-2xl px-4 py-10">
	<div class="flex items-center justify-between mb-8">
		<h1 class="text-2xl font-bold text-surface-900 dark:text-surface-50">
			{coach ? 'Edit Coach Profile' : 'Enable Coach Profile'}
		</h1>
		{#if coach}
			<form method="POST" action="?/remove" use:enhance>
				<button type="submit" class="btn preset-tonal-error text-sm">Remove Coach Profile</button>
			</form>
		{/if}
	</div>

	{#if form?.error}
		<div class="alert preset-filled-error-500 mb-6">{form.error}</div>
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
		class="space-y-6"
	>
		<!-- Coaching Bio -->
		<div>
			<label for="coachingBio" class="label"><span>Coaching Bio</span></label>
			<textarea
				id="coachingBio"
				name="coachingBio"
				class="textarea"
				rows="5"
				placeholder="Describe your coaching style, experience, what you focus on..."
			>{coach?.coachingBio ?? ''}</textarea>
		</div>

		<!-- Availability flags -->
		<fieldset class="border border-surface-300 dark:border-surface-600 rounded-lg p-4">
			<legend class="px-2 text-sm font-semibold text-surface-600 dark:text-surface-300">Available for…</legend>
			<div class="space-y-3 mt-2">
				<label class="flex items-center gap-3 cursor-pointer">
					<input
						type="checkbox"
						class="checkbox"
						name="availableForPrivate"
						value="true"
						checked={coach?.availableForPrivate ?? false}
					/>
					<span class="text-sm text-surface-700 dark:text-surface-300">
						<strong>Private sessions</strong> — 1-on-1 coaching
					</span>
				</label>
				<label class="flex items-center gap-3 cursor-pointer">
					<input
						type="checkbox"
						class="checkbox"
						name="availableForTeams"
						value="true"
						checked={coach?.availableForTeams ?? false}
					/>
					<span class="text-sm text-surface-700 dark:text-surface-300">
						<strong>Team coaching</strong> — coaching improv teams
					</span>
				</label>
				<label class="flex items-center gap-3 cursor-pointer">
					<input
						type="checkbox"
						class="checkbox"
						name="availableForWorkshops"
						value="true"
						checked={coach?.availableForWorkshops ?? false}
					/>
					<span class="text-sm text-surface-700 dark:text-surface-300">
						<strong>Workshops</strong> — group workshops
					</span>
				</label>
			</div>
		</fieldset>

		<!-- Availability note -->
		<div>
			<label for="availability" class="label"><span>Availability / Scheduling Notes</span></label>
			<input
				id="availability"
				name="availability"
				type="text"
				class="input"
				value={coach?.availability ?? ''}
				placeholder="e.g. Weekends only, currently full, accepting new clients..."
			/>
		</div>

		<div class="flex gap-4 pt-4">
			<button type="submit" class="btn preset-filled-secondary-500" disabled={saving}>
				{saving ? 'Saving…' : 'Save Coach Profile'}
			</button>
			<a href="/profile" class="btn preset-tonal-surface">Cancel</a>
		</div>
	</form>
</div>

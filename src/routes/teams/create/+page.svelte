<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let saving = $state(false);
</script>

<svelte:head>
	<title>Create Team | Comedy Connector</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-4 py-10">
	<h1 class="text-2xl font-bold text-surface-900 dark:text-surface-50 mb-8">Create a Team</h1>

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
		<!-- Team Name -->
		<div>
			<label for="name" class="label">
				<span>Team Name <span class="text-error-500">*</span></span>
			</label>
			<input
				id="name"
				name="name"
				type="text"
				class="input {form?.errors?.name ? 'input-error' : ''}"
				value={form?.values?.name ?? ''}
				required
				placeholder="e.g. The Midnight Collective"
			/>
			{#if form?.errors?.name}
				<p class="text-error-500 text-xs mt-1">{form.errors.name[0]}</p>
			{/if}
			<p class="text-xs text-surface-400 mt-1">
				If a team with this name already exists as an unclaimed stub, you'll claim it.
			</p>
		</div>

		<!-- Description -->
		<div>
			<label for="description" class="label"><span>Description</span></label>
			<textarea id="description" name="description" class="textarea" rows="4" placeholder="Tell us about your team...">
				{form?.values?.description ?? ''}
			</textarea>
		</div>

		<!-- Form & Type -->
		<div class="grid grid-cols-2 gap-4">
			<div>
				<label for="form" class="label"><span>Form / Style</span></label>
				<input
					id="form"
					name="form"
					type="text"
					class="input"
					value={form?.values?.form ?? ''}
					placeholder="e.g. Harold, Montage, Longform"
				/>
			</div>
			<div>
				<label for="videoUrl" class="label"><span>Highlight Video URL</span></label>
				<input
					id="videoUrl"
					name="videoUrl"
					type="url"
					class="input"
					value={form?.values?.videoUrl ?? ''}
					placeholder="https://youtube.com/..."
				/>
			</div>
		</div>

		<!-- Flags -->
		<fieldset class="border border-surface-300 dark:border-surface-600 rounded-lg p-4">
			<legend class="px-2 text-sm font-semibold text-surface-600 dark:text-surface-300">Team status</legend>
			<div class="space-y-3 mt-2">
				<label class="flex items-center gap-3 cursor-pointer">
					<input type="checkbox" class="checkbox" name="isPracticeGroup" value="true" />
					<span class="text-sm text-surface-700 dark:text-surface-300">This is a practice group (not a performing team)</span>
				</label>
				<label class="flex items-center gap-3 cursor-pointer">
					<input type="checkbox" class="checkbox" name="openToNewMembers" value="true" />
					<span class="text-sm text-surface-700 dark:text-surface-300">Open to new members</span>
				</label>
				<label class="flex items-center gap-3 cursor-pointer">
					<input type="checkbox" class="checkbox" name="openToBookOpeners" value="true" />
					<span class="text-sm text-surface-700 dark:text-surface-300">Available to book as opener</span>
				</label>
				<label class="flex items-center gap-3 cursor-pointer">
					<input type="checkbox" class="checkbox" name="seekingCoach" value="true" />
					<span class="text-sm text-surface-700 dark:text-surface-300">Seeking a coach</span>
				</label>
			</div>
		</fieldset>

		<!-- Looking For -->
		<div>
			<label for="lookingFor" class="label"><span>Looking For</span></label>
			<input
				id="lookingFor"
				name="lookingFor"
				type="text"
				class="input"
				value={form?.values?.lookingFor ?? ''}
				placeholder="e.g. A new bassist, someone strong in games..."
			/>
		</div>

		<!-- Freshness reminders -->
		<div class="flex items-center gap-3">
			<input
				id="freshnessReminders"
				name="freshnessRemindersEnabled"
				type="checkbox"
				class="checkbox"
				value="true"
				checked
			/>
			<label for="freshnessReminders" class="text-sm text-surface-700 dark:text-surface-300">
				Send monthly reminders to keep team info fresh
			</label>
		</div>

		<div class="flex gap-4 pt-4">
			<button type="submit" class="btn preset-filled-tertiary-500" disabled={saving}>
				{saving ? 'Creating…' : 'Create Team'}
			</button>
			<a href="/teams" class="btn preset-tonal-surface">Cancel</a>
		</div>
	</form>
</div>

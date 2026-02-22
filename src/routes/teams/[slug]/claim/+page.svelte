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

<div class="mx-auto max-w-2xl px-4 py-10">
	<div class="alert preset-tonal-tertiary mb-8">
		<p class="font-semibold">Claiming: {team.name}</p>
		<p class="text-sm mt-1">You're filling in the details for this stub team. All existing members will remain on the roster.</p>
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
		<div>
			<label for="description" class="label"><span>Description</span></label>
			<textarea id="description" name="description" class="textarea" rows="4" placeholder="Tell us about {team.name}..."></textarea>
		</div>

		<div class="grid grid-cols-2 gap-4">
			<div>
				<label for="form" class="label"><span>Form / Style</span></label>
				<input id="form" name="form" type="text" class="input" placeholder="e.g. Harold, Longform" />
			</div>
			<div>
				<label for="videoUrl" class="label"><span>Video URL</span></label>
				<input id="videoUrl" name="videoUrl" type="url" class="input" placeholder="https://youtube.com/..." />
			</div>
		</div>

		<fieldset class="border border-surface-300 dark:border-surface-600 rounded-lg p-4">
			<legend class="px-2 text-sm font-semibold">Team status</legend>
			<div class="space-y-3 mt-2">
				<label class="flex items-center gap-3 cursor-pointer">
					<input type="checkbox" class="checkbox" name="isPracticeGroup" value="true" />
					<span class="text-sm">Practice group (not a performing team)</span>
				</label>
				<label class="flex items-center gap-3 cursor-pointer">
					<input type="checkbox" class="checkbox" name="openToNewMembers" value="true" />
					<span class="text-sm">Open to new members</span>
				</label>
				<label class="flex items-center gap-3 cursor-pointer">
					<input type="checkbox" class="checkbox" name="openToBookOpeners" value="true" />
					<span class="text-sm">Available to book as opener</span>
				</label>
				<label class="flex items-center gap-3 cursor-pointer">
					<input type="checkbox" class="checkbox" name="seekingCoach" value="true" />
					<span class="text-sm">Seeking a coach</span>
				</label>
			</div>
		</fieldset>

		<div>
			<label for="lookingFor" class="label"><span>Looking For</span></label>
			<input id="lookingFor" name="lookingFor" type="text" class="input" placeholder="Any specifics..." />
		</div>

		<div class="flex gap-4 pt-4">
			<button type="submit" class="btn preset-filled-tertiary-500" disabled={saving}>
				{saving ? 'Claiming…' : 'Claim Team'}
			</button>
			<a href="/teams/{team.slug}" class="btn preset-tonal-surface">Cancel</a>
		</div>
	</form>
</div>

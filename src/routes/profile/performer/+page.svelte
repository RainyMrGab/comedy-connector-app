<script lang="ts">
	import { enhance } from '$app/forms';
	import { untrack } from 'svelte';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let performer = $derived(data.performer);

	let saving = $state(false);
	// untrack: snapshot initial value for form — intentionally not reactive
	const initialHighlights = untrack(() => data.performer?.videoHighlights ?? ['']);
	let videoUrls = $state<string[]>(initialHighlights);

	function addVideo() {
		videoUrls = [...videoUrls, ''];
	}

	function removeVideo(i: number) {
		videoUrls = videoUrls.filter((_, idx) => idx !== i);
	}
</script>

<svelte:head>
	<title>Performer Profile | Comedy Connector</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-4 py-10">
	<div class="flex items-center justify-between mb-8">
		<h1 class="text-2xl font-bold text-surface-900 dark:text-surface-50">
			{performer ? 'Edit Performer Profile' : 'Enable Performer Profile'}
		</h1>
		{#if performer}
			<form method="POST" action="?/remove" use:enhance>
				<button type="submit" class="btn preset-tonal-error text-sm">
					Remove Performer Profile
				</button>
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
		<!-- Interest flags -->
		<fieldset class="border border-surface-300 dark:border-surface-600 rounded-lg p-4">
			<legend class="px-2 text-sm font-semibold text-surface-600 dark:text-surface-300">I'm interested in…</legend>
			<div class="space-y-3 mt-2">
				<label class="flex items-center gap-3 cursor-pointer">
					<input
						type="checkbox"
						class="checkbox"
						name="openToBookOpeners"
						value="true"
						checked={performer?.openToBookOpeners ?? false}
					/>
					<span class="text-sm text-surface-700 dark:text-surface-300">
						<strong>Book opener gigs</strong> — open for shows
					</span>
				</label>
				<label class="flex items-center gap-3 cursor-pointer">
					<input
						type="checkbox"
						class="checkbox"
						name="lookingForTeam"
						value="true"
						checked={performer?.lookingForTeam ?? false}
					/>
					<span class="text-sm text-surface-700 dark:text-surface-300">
						<strong>Looking for a team</strong> to join
					</span>
				</label>
				<label class="flex items-center gap-3 cursor-pointer">
					<input
						type="checkbox"
						class="checkbox"
						name="lookingForCoach"
						value="true"
						checked={performer?.lookingForCoach ?? false}
					/>
					<span class="text-sm text-surface-700 dark:text-surface-300">
						<strong>Looking for a coach</strong>
					</span>
				</label>
			</div>
		</fieldset>

		<!-- Looking For (free text) -->
		<div>
			<label for="lookingFor" class="label"><span>More about what you're looking for</span></label>
			<input
				id="lookingFor"
				name="lookingFor"
				type="text"
				class="input"
				value={performer?.lookingFor ?? ''}
				placeholder="Any specifics about what you're seeking..."
			/>
		</div>

		<!-- Video Highlights -->
		<div>
			<p class="label mb-2" role="presentation">
				<span>Video Highlights</span> <small class="text-surface-400">(up to 5 URLs)</small>
			</p>
			<div class="space-y-2">
				{#each videoUrls as url, i}
					<div class="flex gap-2">
						<input
							type="url"
							name="videoHighlights"
							class="input flex-1"
							value={url}
							placeholder="https://youtube.com/watch?v=..."
							oninput={(e) => { videoUrls[i] = (e.target as HTMLInputElement).value; }}
						/>
						{#if videoUrls.length > 1}
							<button
								type="button"
								class="btn preset-tonal-error btn-sm"
								onclick={() => removeVideo(i)}
								aria-label="Remove video"
							>×</button>
						{/if}
					</div>
				{/each}
				{#if videoUrls.length < 5}
					<button type="button" class="btn preset-tonal-surface btn-sm" onclick={addVideo}>
						+ Add Video
					</button>
				{/if}
			</div>
		</div>

		<div class="flex gap-4 pt-4">
			<button type="submit" class="btn preset-filled-primary-500" disabled={saving}>
				{saving ? 'Saving…' : 'Save Performer Profile'}
			</button>
			<a href="/profile" class="btn preset-tonal-surface">Cancel</a>
		</div>
	</form>
</div>

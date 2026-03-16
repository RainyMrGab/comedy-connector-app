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

<div class="form-page">
	<div class="page-top">
		<h1 class="page-title">{performer ? 'EDIT PERFORMER PROFILE' : 'ENABLE PERFORMER PROFILE'}</h1>
		{#if performer}
			<form method="POST" action="?/remove" use:enhance>
				<button type="submit" class="btn-outline remove-btn">REMOVE PERFORMER PROFILE</button>
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
		<fieldset>
			<legend>I'M INTERESTED IN…</legend>
			<div class="checks">
				<label class="checkbox-label">
					<input type="checkbox" name="openToBookOpeners" value="true" checked={performer?.openToBookOpeners ?? false} />
					<span><strong>Book opener gigs</strong> — open for shows</span>
				</label>
				<label class="checkbox-label">
					<input type="checkbox" name="lookingForTeam" value="true" checked={performer?.lookingForTeam ?? false} />
					<span><strong>Looking for a team</strong> to join</span>
				</label>
				<label class="checkbox-label">
					<input type="checkbox" name="lookingForCoach" value="true" checked={performer?.lookingForCoach ?? false} />
					<span><strong>Looking for a coach</strong></span>
				</label>
			</div>
		</fieldset>

		<div class="form-field">
			<label for="lookingFor">MORE ABOUT WHAT YOU'RE LOOKING FOR</label>
			<input id="lookingFor" name="lookingFor" type="text" value={performer?.lookingFor ?? ''} placeholder="Any specifics about what you're seeking..." />
		</div>

		<div class="form-field">
			<p class="form-label" role="presentation">VIDEO HIGHLIGHTS <small class="field-hint">(up to 5 URLs)</small></p>
			<div class="video-list">
				{#each videoUrls as url, i}
					<div class="video-row">
						<input type="url" name="videoHighlights" value={url} placeholder="https://youtube.com/watch?v=..." oninput={(e) => { videoUrls[i] = (e.target as HTMLInputElement).value; }} />
						{#if videoUrls.length > 1}
							<button type="button" class="btn-outline remove-video" onclick={() => removeVideo(i)} aria-label="Remove video">×</button>
						{/if}
					</div>
				{/each}
				{#if videoUrls.length < 5}
					<button type="button" class="btn-outline add-btn" onclick={addVideo}>+ ADD VIDEO</button>
				{/if}
			</div>
		</div>

		<div class="form-actions">
			<button type="submit" class="btn-accent" disabled={saving}>{saving ? 'SAVING…' : 'SAVE PERFORMER PROFILE'}</button>
			<a href="/profile" class="btn-outline">CANCEL</a>
		</div>
	</form>
</div>

<style>
	.form-page { max-width: 640px; margin: 0 auto; padding: 48px 32px; }
	.page-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 32px; flex-wrap: wrap; }
	.page-title { font-family: var(--font-heading); font-size: 32px; color: var(--zine-primary); transform: rotate(-1deg); display: inline-block; margin: 0; }
	.remove-btn { color: var(--zine-accent); border-color: var(--zine-accent); font-size: 11px; }
	.field-hint { font-size: 11px; font-weight: 400; letter-spacing: 0; text-transform: none; opacity: 0.65; }
	.zine-form { display: flex; flex-direction: column; gap: 24px; }
	.checks { display: flex; flex-direction: column; gap: 12px; margin-top: 12px; }
	.video-list { display: flex; flex-direction: column; gap: 8px; }
	.video-row { display: flex; gap: 8px; }
	.video-row input { flex: 1; }
	.remove-video { flex-shrink: 0; padding: 8px 12px; }
	.add-btn { align-self: flex-start; font-size: 11px; }
	.form-actions { display: flex; gap: 12px; padding-top: 8px; }
</style>

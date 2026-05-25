<script lang="ts">
	import { enhance } from '$app/forms';
	import { untrack } from 'svelte';
	import type { PageData, ActionData } from './$types';
	import TagEditor from '$components/ui/TagEditor.svelte';
	import { normalizeHighlights, type Highlight } from '$utils/highlights';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let performer = $derived(data.performer);

	let saving = $state(false);

	// Snapshot initial highlights — normalize legacy string[] to Highlight[]
	let highlights = $state<Highlight[]>(
		untrack(() => normalizeHighlights(data.performer?.videoHighlights))
	);

	function addHighlight() {
		if (highlights.length >= 5) return;
		highlights = [...highlights, { type: 'link', url: '' }];
	}

	function removeHighlight(i: number) {
		highlights = highlights.filter((_, idx) => idx !== i);
	}

	function setType(i: number, type: 'link' | 'image') {
		highlights = highlights.map((h, idx) => (idx === i ? { ...h, type, url: '' } : h));
	}

	function setUrl(i: number, url: string) {
		highlights = highlights.map((h, idx) => (idx === i ? { ...h, url } : h));
	}

	function setLabel(i: number, label: string) {
		highlights = highlights.map((h, idx) => (idx === i ? { ...h, label } : h));
	}

	// Per-row upload state
	let uploading = $state<boolean[]>([]);
	let uploadErrors = $state<string[]>([]);

	async function handleFileChange(event: Event, i: number) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		if (file.size > 5 * 1024 * 1024) {
			uploadErrors = uploadErrors.map((e, idx) => (idx === i ? 'Max 5 MB' : e));
			return;
		}
		if (!file.type.startsWith('image/')) {
			uploadErrors = uploadErrors.map((e, idx) => (idx === i ? 'Images only' : e));
			return;
		}

		uploadErrors = uploadErrors.map((e, idx) => (idx === i ? '' : e));
		uploading = uploading.map((u, idx) => (idx === i ? true : u));

		try {
			const body = new FormData();
			body.append('file', file);
			body.append('bucket', 'user-media');
			const res = await fetch('/api/upload', { method: 'POST', body });
			if (!res.ok) {
				const err = await res.json().catch(() => ({})) as { message?: string };
				throw new Error(err.message ?? 'Upload failed');
			}
			const { url } = await res.json() as { url: string };
			setUrl(i, url);
		} catch (err) {
			uploadErrors = uploadErrors.map((e, idx) =>
				idx === i ? (err instanceof Error ? err.message : 'Upload failed') : e
			);
		} finally {
			uploading = uploading.map((u, idx) => (idx === i ? false : u));
			input.value = '';
		}
	}

	// Ensure uploading/errors arrays are the right length
	$effect(() => {
		const len = highlights.length;
		if (uploading.length !== len) uploading = Array(len).fill(false);
		if (uploadErrors.length !== len) uploadErrors = Array(len).fill('');
	});
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
		action="?/save"
		use:enhance={() => {
			saving = true;
			return async ({ update }) => {
				await update();
				saving = false;
			};
		}}
		class="zine-form"
	>
		<!-- Hidden field carries the highlights JSON blob to the server -->
		<input type="hidden" name="highlights" value={JSON.stringify(highlights)} />

		<fieldset>
			<legend>I'M INTERESTED IN…</legend>
			<div class="checks">
				<label class="checkbox-label">
					<input type="checkbox" name="lookingForPracticeGroup" value="true" checked={performer?.lookingForPracticeGroup ?? false} />
					<span><strong>Joining a practice group</strong></span>
				</label>
				<label class="checkbox-label">
					<input type="checkbox" name="lookingForSmallGroup" value="true" checked={performer?.lookingForSmallGroup ?? false} />
					<span><strong>Small group partners</strong> (e.g. duo, trio)</span>
				</label>
				<label class="checkbox-label">
					<input type="checkbox" name="lookingForIndieTeam" value="true" checked={performer?.lookingForIndieTeam ?? false} />
					<span><strong>Joining an indie team</strong></span>
				</label>
			</div>
		</fieldset>

		<div class="form-field">
			<label for="lookingFor">MORE ABOUT WHAT YOU'RE LOOKING FOR</label>
			<input id="lookingFor" name="lookingFor" type="text" value={performer?.lookingFor ?? ''} placeholder="Any specifics about what you're seeking..." />
		</div>

		{#if performer}
			<div class="form-field">
				<p class="form-label" role="presentation">TAGS</p>
				<TagEditor domain="performer" entityId={performer.id} initialTags={data.performerTags} />
			</div>
		{/if}

		<!-- Highlights editor -->
		<div class="form-field">
			<p class="form-label" role="presentation">
				HIGHLIGHTS <small class="field-hint">(up to 5 — link a video/article or upload an image)</small>
			</p>

			<div class="highlights-editor">
				{#each highlights as highlight, i}
					<div class="highlight-row">
						<!-- Type toggle -->
						<div class="type-toggle">
							<button
								type="button"
								class="toggle-btn {highlight.type === 'link' ? 'active' : ''}"
								onclick={() => setType(i, 'link')}
							>
								LINK
							</button>
							<button
								type="button"
								class="toggle-btn {highlight.type === 'image' ? 'active' : ''}"
								onclick={() => setType(i, 'image')}
							>
								IMAGE
							</button>
						</div>

						<div class="highlight-inputs">
							{#if highlight.type === 'link'}
								<input
									type="url"
									placeholder="https://youtube.com/watch?v=... or any link"
									value={highlight.url}
									oninput={(e) => setUrl(i, (e.target as HTMLInputElement).value)}
								/>
							{:else}
								<!-- Image upload -->
								{#if highlight.url}
									<img src={highlight.url} alt="Uploaded highlight" class="upload-preview" />
								{/if}
								<div class="upload-controls">
									<label class="upload-label">
										<input
											type="file"
											accept="image/*"
											class="visually-hidden"
											disabled={uploading[i]}
											onchange={(e) => handleFileChange(e, i)}
										/>
										<span class="btn-outline upload-btn-sm">
											{#if uploading[i]}
												UPLOADING…
											{:else if highlight.url}
												REPLACE IMAGE
											{:else}
												UPLOAD IMAGE
											{/if}
										</span>
									</label>
									{#if uploadErrors[i]}
										<span class="upload-err">{uploadErrors[i]}</span>
									{/if}
								</div>
							{/if}

							<!-- Optional label -->
							<input
								type="text"
								placeholder="Label (optional)"
								value={highlight.label ?? ''}
								oninput={(e) => setLabel(i, (e.target as HTMLInputElement).value)}
								class="label-input"
							/>
						</div>

						<button
							type="button"
							class="btn-outline remove-btn-sm"
							onclick={() => removeHighlight(i)}
							aria-label="Remove highlight"
						>×</button>
					</div>
				{/each}

				{#if highlights.length < 5}
					<button type="button" class="btn-outline add-btn" onclick={addHighlight}>
						+ ADD HIGHLIGHT
					</button>
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
	.checks { display: flex; flex-direction: column; gap: 12px; }
	.form-actions { display: flex; gap: 12px; padding-top: 8px; }

	/* Highlights editor */
	.highlights-editor { display: flex; flex-direction: column; gap: 12px; }

	.highlight-row {
		display: flex;
		gap: 8px;
		align-items: flex-start;
		background: var(--zine-surface);
		border: var(--zine-border);
		padding: 12px;
	}

	.type-toggle { display: flex; flex-direction: column; gap: 2px; flex-shrink: 0; }

	.toggle-btn {
		font-family: var(--font-body);
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.1em;
		padding: 4px 8px;
		border: 1px solid var(--zine-muted);
		background: transparent;
		color: var(--zine-muted);
		cursor: pointer;
		white-space: nowrap;
	}
	.toggle-btn.active {
		background: var(--zine-primary);
		color: var(--zine-highlight);
		border-color: var(--zine-primary);
	}

	.highlight-inputs { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 0; }
	.label-input { font-size: 12px; }

	.upload-controls { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
	.upload-preview { width: 64px; height: 64px; object-fit: cover; border: var(--zine-border); }

	.upload-label { cursor: pointer; }
	.upload-btn-sm {
		font-size: 10px;
		padding: 5px 10px;
		display: inline-block;
		cursor: pointer;
	}
	.upload-err { font-size: 11px; color: var(--zine-accent); font-weight: 700; }

	.remove-btn-sm {
		flex-shrink: 0;
		padding: 4px 10px;
		font-size: 16px;
		line-height: 1;
		align-self: flex-start;
	}

	.add-btn { align-self: flex-start; font-size: 11px; }

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>

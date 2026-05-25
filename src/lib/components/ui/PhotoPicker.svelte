<script lang="ts">
	import { untrack } from 'svelte';

	interface Props {
		/** Form field name submitted with the parent form (e.g. "photoUrl") */
		fieldName: string;
		/** Current value — snapshot is taken on mount; reflects uploaded or typed URL */
		initialValue?: string;
		/** Supabase Storage bucket to upload into */
		bucket: 'user-media';
		/** Optional label shown above the control (omit to suppress the label row) */
		label?: string;
	}

	let { fieldName, initialValue = '', bucket, label }: Props = $props();

	// Snapshot initial value — not reactive to prop changes (form field pattern)
	let currentValue = $state(untrack(() => initialValue));
	let uploading = $state(false);
	let uploadError = $state('');
	let fileInput: HTMLInputElement | undefined = $state();

	async function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		// Client-side pre-check (server also validates)
		if (file.size > 5 * 1024 * 1024) {
			uploadError = 'File too large — maximum 5 MB';
			return;
		}
		if (!file.type.startsWith('image/')) {
			uploadError = 'Only image files are allowed';
			return;
		}

		uploadError = '';
		uploading = true;

		try {
			const body = new FormData();
			body.append('file', file);
			body.append('bucket', bucket);

			const res = await fetch('/api/upload', { method: 'POST', body });
			if (!res.ok) {
				const err = await res.json().catch(() => ({})) as { message?: string };
				throw new Error(err.message ?? `Upload failed (${res.status})`);
			}
			const { url } = await res.json() as { url: string };
			currentValue = url;
		} catch (err) {
			uploadError = err instanceof Error ? err.message : 'Upload failed — please try again';
		} finally {
			uploading = false;
			// Reset file input so the same file can be re-selected after an error
			if (input) input.value = '';
		}
	}
</script>

{#if label}
	<p class="picker-label" role="presentation">{label}</p>
{/if}

<!-- Hidden form field — carries the URL to the server on submit -->
<input type="hidden" name={fieldName} value={currentValue} />

<div class="photo-picker">
	{#if currentValue}
		<img src={currentValue} alt="" class="photo-preview" />
	{/if}

	<div class="picker-controls">
		<!-- Hidden file input -->
		<input
			bind:this={fileInput}
			type="file"
			accept="image/*"
			class="visually-hidden"
			onchange={handleFileChange}
			disabled={uploading}
		/>
		<button
			type="button"
			class="btn-outline upload-btn"
			onclick={() => fileInput?.click()}
			disabled={uploading}
		>
			{#if uploading}
				UPLOADING…
			{:else if currentValue}
				REPLACE PHOTO
			{:else}
				UPLOAD PHOTO
			{/if}
		</button>

		<span class="or-sep">or paste URL</span>

		<!-- URL text fallback — syncs currentValue; no name= so it doesn't double-submit -->
		<input
			type="url"
			class="url-input"
			placeholder="https://..."
			value={currentValue}
			oninput={(e) => {
				currentValue = (e.target as HTMLInputElement).value;
			}}
		/>
	</div>

	{#if uploadError}
		<p class="upload-error" role="alert">{uploadError}</p>
	{/if}
</div>

<style>
	.picker-label {
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--zine-primary);
		margin: 0 0 6px;
	}

	.photo-picker {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.photo-preview {
		width: 80px;
		height: 80px;
		object-fit: cover;
		border: var(--zine-border);
	}

	.picker-controls {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
	}

	.upload-btn {
		flex-shrink: 0;
		font-size: 11px;
	}

	.or-sep {
		font-size: 11px;
		opacity: 0.5;
		white-space: nowrap;
	}

	.url-input {
		flex: 1;
		min-width: 180px;
	}

	.upload-error {
		font-size: 12px;
		color: var(--zine-accent);
		font-weight: 700;
		margin: 0;
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>

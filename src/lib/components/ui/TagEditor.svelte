<script lang="ts">
	import { untrack } from 'svelte';
	import { Clock, X } from 'lucide-svelte';
	import type { TagDomain, EntityTagDisplay, TagOption } from '$lib/types/tags';

	interface Props {
		domain: TagDomain;
		entityId: string;
		initialTags?: EntityTagDisplay[];
	}

	let { domain, entityId, initialTags = [] }: Props = $props();

	const KEBAB_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

	let currentTags = $state<EntityTagDisplay[]>(untrack(() => [...initialTags]));
	let inputValue = $state('');
	let suggestions = $state<TagOption[]>([]);
	let showDropdown = $state(false);
	let focusedIndex = $state(-1);
	let validationError = $state('');
	let debounceTimer: ReturnType<typeof setTimeout>;
	let containerEl: HTMLDivElement;

	const normalizedInput = $derived(inputValue.trim().toLowerCase());
	const isValidKebab = $derived(normalizedInput === '' || KEBAB_RE.test(normalizedInput));
	const alreadyAdded = $derived(currentTags.some((t) => t.name === normalizedInput));
	const showSuggestNew = $derived(
		normalizedInput.length > 0 &&
		isValidKebab &&
		!alreadyAdded &&
		!suggestions.some((s) => s.name === normalizedInput)
	);

	async function removeTag(tag: EntityTagDisplay) {
		try {
			const res = await fetch(`/api/tags/entity/${tag.id}`, { method: 'DELETE' });
			if (!res.ok) {
				validationError = 'Failed to remove tag';
				return;
			}
			currentTags = currentTags.filter((t) => t.id !== tag.id);
		} catch {
			validationError = 'Failed to remove tag';
		}
	}

	function onInput() {
		clearTimeout(debounceTimer);
		validationError = '';
		focusedIndex = -1;

		if (!normalizedInput) {
			suggestions = [];
			showDropdown = false;
			return;
		}

		debounceTimer = setTimeout(async () => {
			const res = await fetch(`/api/tags?domain=${domain}&q=${encodeURIComponent(normalizedInput)}`);
			if (res.ok) {
				const data = await res.json();
				// Filter out already-added tags
				suggestions = (data.tags as TagOption[]).filter(
					(t) => !currentTags.some((ct) => ct.tagId === t.id)
				);
				showDropdown = true;
			}
		}, 200);
	}

	async function addTag(tagName: string) {
		const name = tagName.trim().toLowerCase();
		if (!KEBAB_RE.test(name)) {
			validationError = 'Tags must use kebab-case (e.g. long-form)';
			return;
		}
		if (alreadyAdded) return;

		inputValue = '';
		showDropdown = false;
		suggestions = [];
		focusedIndex = -1;

		try {
			const res = await fetch('/api/tags/entity', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ tagName: name, domain, entityId })
			});
			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				validationError = err.message ?? 'Failed to add tag';
				return;
			}
			const { entityTag } = await res.json();
			if (entityTag?.id) {
				currentTags = [...currentTags, { id: entityTag.id, tagId: entityTag.tagId, name: entityTag.name, status: entityTag.status }];
			}
		} catch {
			validationError = 'Failed to add tag';
		}
	}

	function onKeydown(e: KeyboardEvent) {
		const totalOptions = suggestions.length + (showSuggestNew ? 1 : 0);
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			focusedIndex = Math.min(focusedIndex + 1, totalOptions - 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			focusedIndex = Math.max(focusedIndex - 1, -1);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (focusedIndex >= 0 && focusedIndex < suggestions.length) {
				addTag(suggestions[focusedIndex].name);
			} else if (focusedIndex === suggestions.length && showSuggestNew) {
				addTag(normalizedInput);
			} else if (normalizedInput) {
				addTag(normalizedInput);
			}
		} else if (e.key === 'Escape') {
			showDropdown = false;
			focusedIndex = -1;
		}
	}

	function onClickOutside(e: MouseEvent) {
		if (containerEl && !containerEl.contains(e.target as Node)) {
			showDropdown = false;
			focusedIndex = -1;
		}
	}
</script>

<svelte:window onclick={onClickOutside} />

<div class="tag-editor" bind:this={containerEl}>
	{#if currentTags.length > 0}
		<div class="tag-chips">
			{#each currentTags as tag}
				<button
					type="button"
					class="tag-chip"
					class:tag-pending={tag.status !== 'approved'}
					onclick={() => removeTag(tag)}
					title="Remove tag"
				>
					{tag.name}
					{#if tag.status === 'pending'}
						<span class="pending-indicator" title="Pending admin approval">
							<Clock size={9} />
						</span>
					{/if}
					<X size={9} />
				</button>
			{/each}
		</div>
	{/if}

	<div class="input-wrap">
		<input
			type="text"
			class="tag-input"
			class:input-error={!isValidKebab && normalizedInput.length > 0}
			placeholder="Add a tag (e.g. long-form)…"
			bind:value={inputValue}
			oninput={onInput}
			onkeydown={onKeydown}
			onfocus={() => { if (normalizedInput && suggestions.length > 0) showDropdown = true; }}
			autocomplete="off"
			spellcheck={false}
		/>
		{#if showDropdown && (suggestions.length > 0 || showSuggestNew)}
			<ul class="dropdown" role="listbox">
				{#each suggestions as suggestion, i}
					<li
						class="dropdown-option"
						class:focused={focusedIndex === i}
						role="option"
						aria-selected={focusedIndex === i}
						onmousedown={(e) => { e.preventDefault(); addTag(suggestion.name); }}
					>
						{suggestion.name}
					</li>
				{/each}
				{#if showSuggestNew}
					{@const suggestIndex = suggestions.length}
					<li
						class="dropdown-option suggest-new"
						class:focused={focusedIndex === suggestIndex}
						role="option"
						aria-selected={focusedIndex === suggestIndex}
						onmousedown={(e) => { e.preventDefault(); addTag(normalizedInput); }}
					>
						Suggest "<strong>{normalizedInput}</strong>" <span class="needs-approval">(requires approval)</span>
					</li>
				{/if}
			</ul>
		{/if}
	</div>

	{#if !isValidKebab && normalizedInput.length > 0}
		<p class="validation-error">Tags must use kebab-case (e.g. long-form)</p>
	{:else if validationError}
		<p class="validation-error">{validationError}</p>
	{/if}
	<p class="tag-hint">Tags added to your profile are visible after admin approval.</p>
</div>

<style>
	.tag-editor {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.tag-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.tag-chip {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-family: var(--font-body);
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		background: var(--zine-primary);
		color: var(--zine-bg);
		padding: 2px 8px;
		cursor: pointer;
		border: none;
	}

	.tag-chip:hover {
		background: var(--zine-muted);
	}

	.tag-chip.tag-pending {
		background: transparent;
		color: var(--zine-muted);
		border: 1px dashed var(--zine-muted);
		opacity: 0.7;
	}

	.pending-indicator {
		display: inline-flex;
		align-items: center;
		opacity: 0.8;
	}

	.input-wrap {
		position: relative;
	}

	.tag-input {
		width: 100%;
		font-family: var(--font-body);
		font-size: 13px;
		padding: 8px 12px;
		border: var(--zine-border);
		background: var(--zine-bg);
		color: var(--zine-primary);
		outline: none;
		box-sizing: border-box;
	}

	.tag-input:focus {
		border-color: var(--zine-muted);
	}

	.tag-input.input-error {
		border-color: var(--zine-accent);
	}

	.dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		z-index: 50;
		background: var(--zine-bg);
		border: var(--zine-border);
		border-top: none;
		list-style: none;
		margin: 0;
		padding: 0;
		max-height: 200px;
		overflow-y: auto;
	}

	.dropdown-option {
		padding: 8px 12px;
		font-size: 13px;
		cursor: pointer;
		color: var(--zine-primary);
	}

	.dropdown-option:hover,
	.dropdown-option.focused {
		background: var(--zine-surface);
	}

	.suggest-new {
		color: var(--zine-muted);
		border-top: 1px solid var(--zine-surface);
	}

	.needs-approval {
		font-size: 11px;
		opacity: 0.7;
	}

	.validation-error {
		font-size: 11px;
		color: var(--zine-accent);
		margin: 0;
	}

	.tag-hint {
		font-size: 11px;
		color: var(--zine-muted);
		opacity: 0.7;
		margin: 0;
	}
</style>

<script lang="ts">
	import type { TagDomain } from '$lib/types/tags';
	import { X } from 'lucide-svelte';

	interface TagOption {
		id: string;
		name: string;
	}

	interface Props {
		domain: TagDomain;
		selectedTags: TagOption[];
		onchange: (tags: TagOption[]) => void;
	}

	let { domain, selectedTags, onchange }: Props = $props();

	let inputValue = $state('');
	let suggestions = $state<TagOption[]>([]);
	let showDropdown = $state(false);
	let activeIndex = $state(-1);
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	function isSelected(tag: TagOption): boolean {
		return selectedTags.some((t) => t.id === tag.id);
	}

	function fetchSuggestions(q: string) {
		if (debounceTimer) clearTimeout(debounceTimer);
		if (!q.trim()) {
			suggestions = [];
			showDropdown = false;
			return;
		}
		debounceTimer = setTimeout(async () => {
			const res = await fetch(`/api/tags?domain=${domain}&q=${encodeURIComponent(q)}`);
			if (res.ok) {
				const data = await res.json();
				suggestions = (data.tags as TagOption[]).filter((t) => !isSelected(t));
				showDropdown = suggestions.length > 0;
				activeIndex = -1;
			}
		}, 200);
	}

	function selectTag(tag: TagOption) {
		onchange([...selectedTags, tag]);
		inputValue = '';
		suggestions = [];
		showDropdown = false;
	}

	function removeTag(tag: TagOption) {
		onchange(selectedTags.filter((t) => t.id !== tag.id));
	}

	function onInput(e: Event) {
		inputValue = (e.target as HTMLInputElement).value;
		fetchSuggestions(inputValue);
	}

	function onKeydown(e: KeyboardEvent) {
		if (!showDropdown) return;
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			activeIndex = Math.min(activeIndex + 1, suggestions.length - 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			activeIndex = Math.max(activeIndex - 1, -1);
		} else if (e.key === 'Enter' && activeIndex >= 0) {
			e.preventDefault();
			selectTag(suggestions[activeIndex]);
		} else if (e.key === 'Escape') {
			showDropdown = false;
			activeIndex = -1;
		}
	}

	function onBlur() {
		setTimeout(() => {
			showDropdown = false;
		}, 150);
	}
</script>

<div class="tag-search">
	<div class="input-wrap">
		<input
			type="text"
			placeholder="Filter by tag..."
			value={inputValue}
			oninput={onInput}
			onkeydown={onKeydown}
			onblur={onBlur}
			class="tag-input"
			autocomplete="off"
		/>
		{#if showDropdown}
			<ul class="dropdown" role="listbox">
				{#each suggestions as tag, i (tag.id)}
					<li
						role="option"
						aria-selected={i === activeIndex}
						class={i === activeIndex ? 'option active' : 'option'}
						onmousedown={() => selectTag(tag)}
					>
						{tag.name}
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	{#if selectedTags.length > 0}
		<div class="selected-tags">
			{#each selectedTags as tag (tag.id)}
				<button type="button" class="tag-chip" onclick={() => removeTag(tag)}>
					{tag.name} <X size={10} />
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.tag-search {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		gap: 6px;
	}

	.selected-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		flex: 1 1 0;
		min-width: 0;
	}

	.tag-chip {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-family: var(--font-body);
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		padding: 4px 8px;
		background: var(--zine-primary);
		color: var(--zine-bg);
		border: 2px solid var(--zine-primary);
		cursor: pointer;
		transition: background 0.1s, border-color 0.1s;
	}

	.tag-chip:hover {
		background: var(--zine-muted);
		border-color: var(--zine-muted);
	}

	.input-wrap {
		position: relative;
	}

	.tag-input {
		font-family: var(--font-body);
		font-size: 11px;
		letter-spacing: 0.05em;
		padding: 4px 10px;
		border: 2px solid var(--zine-primary);
		background: var(--zine-bg);
		color: var(--zine-primary);
		width: 160px;
		outline: none;
	}

	.tag-input::placeholder {
		color: var(--zine-muted);
		opacity: 0.6;
	}

	.tag-input:focus {
		border-color: var(--zine-muted);
	}

	.dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		min-width: 100%;
		background: var(--zine-bg);
		border: var(--zine-border);
		box-shadow: var(--zine-shadow);
		z-index: 20;
		list-style: none;
		margin: 2px 0 0;
		padding: 0;
	}

	.option {
		font-family: var(--font-body);
		font-size: 11px;
		padding: 6px 10px;
		cursor: pointer;
		letter-spacing: 0.05em;
	}

	.option:hover,
	.option.active {
		background: var(--zine-surface);
	}
</style>

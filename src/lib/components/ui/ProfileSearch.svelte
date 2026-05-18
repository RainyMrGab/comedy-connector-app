<script lang="ts">
	type Profile = { id: string; name: string; slug: string; photoUrl: string | null };

	let {
		type,
		label,
		inputId = 'profile-search',
		placeholder = 'Type a name to search...',
		fieldName = 'profileId',
		nameOnlyFieldName,
		selected = $bindable<Profile | null>(null),
		nameOnly = $bindable(''),
		onInvite
	}: {
		type: 'performer' | 'coach';
		label?: string;
		inputId?: string;
		placeholder?: string;
		fieldName?: string;
		nameOnlyFieldName?: string;
		selected?: Profile | null;
		nameOnly?: string;
		onInvite?: (query: string) => void;
	} = $props();

	let query = $state('');
	let results = $state<Profile[]>([]);
	let isOpen = $state(false);
	let focusedIndex = $state(-1);
	let wrapEl = $state<HTMLElement | null>(null);
	let listEl = $state<HTMLElement | null>(null);
	let searchTimeout: ReturnType<typeof setTimeout>;

	const trimmedQuery = $derived(query.trim());
	const hasStaticOptions = $derived(trimmedQuery.length > 0);
	const optionCount = $derived(results.length + (hasStaticOptions ? 2 : 0));

	async function search(q: string) {
		clearTimeout(searchTimeout);
		if (!q.trim()) {
			results = [];
			isOpen = false;
			return;
		}

		searchTimeout = setTimeout(async () => {
			const res = await fetch(`/api/profiles/search?q=${encodeURIComponent(q)}&type=${type}`);
			if (res.ok) {
				results = await res.json();
				isOpen = query.trim().length > 0;
				focusedIndex = -1;
			}
		}, 300);
	}

	function selectProfile(profile: Profile) {
		selected = profile;
		nameOnly = '';
		query = profile.name;
		results = [];
		isOpen = false;
		focusedIndex = -1;
	}

	function selectNameOnly() {
		if (!trimmedQuery) return;
		selected = null;
		nameOnly = trimmedQuery;
		query = trimmedQuery;
		results = [];
		isOpen = false;
		focusedIndex = -1;
	}

	function invite() {
		if (!trimmedQuery) return;
		onInvite?.(trimmedQuery);
		isOpen = false;
		focusedIndex = -1;
	}

	function chooseFocused() {
		if (focusedIndex < 0) return;
		if (focusedIndex < results.length && results[focusedIndex]) {
			selectProfile(results[focusedIndex]);
			return;
		}
		const staticIndex = focusedIndex - results.length;
		if (staticIndex === 0) invite();
		else if (staticIndex === 1) selectNameOnly();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!isOpen && e.key !== 'ArrowDown') return;
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			focusedIndex = Math.min(focusedIndex + 1, optionCount - 1);
			isOpen = true;
			scrollOptionIntoView();
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			focusedIndex = Math.max(focusedIndex - 1, 0);
			scrollOptionIntoView();
		} else if (e.key === 'Enter' && focusedIndex >= 0) {
			e.preventDefault();
			chooseFocused();
		} else if (e.key === 'Escape') {
			isOpen = false;
			focusedIndex = -1;
		}
	}

	function scrollOptionIntoView() {
		if (!listEl) return;
		const focused = listEl.querySelector<HTMLElement>(`[data-index="${focusedIndex}"]`);
		focused?.scrollIntoView({ block: 'nearest' });
	}

	$effect(() => {
		function handleMousedown(e: MouseEvent) {
			if (wrapEl && !wrapEl.contains(e.target as Node)) {
				isOpen = false;
				focusedIndex = -1;
			}
		}
		document.addEventListener('mousedown', handleMousedown);
		return () => document.removeEventListener('mousedown', handleMousedown);
	});
</script>

<div class="ps-wrap" bind:this={wrapEl}>
	{#if label}<label for={inputId} class="ps-label">{label}</label>{/if}
	<div class="ps-input-wrap">
		<input
			id={inputId}
			type="text"
			{placeholder}
			bind:value={query}
			oninput={() => {
				selected = null;
				nameOnly = '';
				search(query);
			}}
			onkeydown={handleKeydown}
			onfocus={() => { if (results.length > 0) isOpen = true; }}
			autocomplete="off"
			role="combobox"
			aria-expanded={isOpen}
			aria-autocomplete="list"
			aria-controls="{inputId}-listbox"
			class="ps-input"
		/>
		{#if isOpen && optionCount > 0}
			<ul
				id="{inputId}-listbox"
				class="ps-dropdown"
				role="listbox"
				bind:this={listEl}
			>
				{#each results as result, i}
					<li
						role="option"
						aria-selected={i === focusedIndex}
						data-index={i}
						class="ps-option {i === focusedIndex ? 'ps-option-focused' : ''}"
					>
						<button type="button" onclick={() => selectProfile(result)}>
							{#if result.photoUrl}
								<img src={result.photoUrl} alt="" class="ps-avatar" />
							{:else}
								<div class="ps-avatar ps-avatar-placeholder">{result.name[0]?.toUpperCase() ?? '?'}</div>
							{/if}
							<span>{result.name}</span>
						</button>
					</li>
				{/each}
				{#if hasStaticOptions}
					<li
						role="option"
						aria-selected={focusedIndex === results.length}
						data-index={results.length}
						class="ps-option {focusedIndex === results.length ? 'ps-option-focused' : ''}"
					>
						<button type="button" onclick={invite}>
							<span class="ps-static-icon">@</span>
							<span>Invite {trimmedQuery} to use Comedy Connector</span>
						</button>
					</li>
					<li
						role="option"
						aria-selected={focusedIndex === results.length + 1}
						data-index={results.length + 1}
						class="ps-option {focusedIndex === results.length + 1 ? 'ps-option-focused' : ''}"
					>
						<button type="button" onclick={selectNameOnly}>
							<span class="ps-static-icon">+</span>
							<span>Add {trimmedQuery} by name only</span>
						</button>
					</li>
				{/if}
			</ul>
		{/if}
	</div>
	{#if selected}
		<input type="hidden" name={fieldName} value={selected.id} />
	{/if}
	{#if nameOnlyFieldName && nameOnly}
		<input type="hidden" name={nameOnlyFieldName} value={nameOnly} />
	{/if}
</div>

<style>
	.ps-wrap { display: flex; flex-direction: column; gap: 6px; }

	.ps-label {
		font-family: var(--font-body);
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.1em;
		color: var(--zine-primary);
	}

	.ps-input-wrap {
		position: relative;
	}

	.ps-input {
		width: 100%;
		font-family: var(--font-body);
		font-size: 13px;
		padding: 8px 10px;
		border: var(--zine-border);
		background: var(--zine-bg);
		color: var(--zine-primary);
		outline: none;
		box-sizing: border-box;
	}

	.ps-input:focus {
		outline: 2px solid var(--zine-primary);
		outline-offset: -2px;
	}

	.ps-dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		width: 100%;
		z-index: 50;
		background: var(--zine-bg);
		border: var(--zine-border);
		border-top: none;
		box-shadow: 4px 4px 0 var(--zine-primary);
		list-style: none;
		margin: 0;
		padding: 0;
		max-height: 260px;
		overflow-y: auto;
	}

	.ps-option { margin: 0; padding: 0; }

	.ps-option button {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
		text-align: left;
		padding: 8px 12px;
		font-family: var(--font-body);
		font-size: 13px;
		background: transparent;
		border: none;
		cursor: pointer;
		color: var(--zine-primary);
	}

	.ps-option button:hover,
	.ps-option-focused button {
		background: var(--zine-surface);
	}

	.ps-avatar {
		width: 28px;
		height: 28px;
		object-fit: cover;
		border: 1px solid var(--zine-primary);
		flex-shrink: 0;
	}

	.ps-avatar-placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--zine-primary);
		color: var(--zine-bg);
		font-size: 11px;
		font-weight: 700;
	}

	.ps-static-icon {
		width: 28px;
		height: 28px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--zine-primary);
		background: var(--zine-bg);
		font-size: 12px;
		font-weight: 700;
		flex-shrink: 0;
	}
</style>

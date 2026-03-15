<script lang="ts">
	import { Search, X } from 'lucide-svelte';

	interface Props {
		placeholder?: string;
		onchange: (q: string) => void;
	}

	let { placeholder = 'Search...', onchange }: Props = $props();

	let inputValue = $state('');
	let debounceTimer: ReturnType<typeof setTimeout>;

	function handleInput() {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => onchange(inputValue), 300);
	}

	function clear() {
		inputValue = '';
		clearTimeout(debounceTimer);
		onchange('');
	}
</script>

<div class="search-wrap">
	<Search size={15} class="search-icon" />
	<input
		type="search"
		bind:value={inputValue}
		{placeholder}
		oninput={handleInput}
		class="search-input"
		aria-label="Search"
	/>
	{#if inputValue}
		<button
			type="button"
			onclick={clear}
			class="search-clear"
			aria-label="Clear search"
		>
			<X size={13} />
		</button>
	{/if}
</div>

<style>
	.search-wrap { position: relative; flex: 1; max-width: 380px; }
	.search-input { width: 100%; padding: 8px 32px 8px 34px; font-family: var(--font-body); font-size: 13px; background: var(--zine-bg); color: var(--zine-primary); border: var(--zine-border); outline: none; }
	.search-input::placeholder { opacity: 0.5; }
	.search-input:focus { outline: 2px solid var(--zine-accent); outline-offset: -2px; }
	:global(.search-icon) { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--zine-primary); opacity: 0.4; pointer-events: none; }
	.search-clear { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--zine-primary); opacity: 0.5; padding: 2px; }
	.search-clear:hover { opacity: 1; }
</style>

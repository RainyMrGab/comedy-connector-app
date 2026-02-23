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

<div class="relative flex-1 max-w-md">
	<Search
		size={16}
		class="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none"
	/>
	<input
		type="search"
		bind:value={inputValue}
		{placeholder}
		oninput={handleInput}
		class="input pl-9 pr-9 w-full"
		aria-label="Search"
	/>
	{#if inputValue}
		<button
			type="button"
			onclick={clear}
			class="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
			aria-label="Clear search"
		>
			<X size={14} />
		</button>
	{/if}
</div>

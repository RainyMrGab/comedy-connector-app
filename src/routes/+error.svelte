<script lang="ts">
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>Error {$page.status}</title>
</svelte:head>

<div class="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
	<span class="text-6xl mb-4">🎭</span>
	<h1 class="text-4xl font-bold text-surface-900 dark:text-surface-50 mb-2">{$page.status}</h1>
	<p class="text-surface-500 dark:text-surface-400 mb-6">{$page.error?.message ?? 'Something went wrong.'}</p>
	<a href="/" class="btn preset-filled-primary-500">Go Home</a>
</div>

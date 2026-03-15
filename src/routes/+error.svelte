<script lang="ts">
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>Error {$page.status}</title>
</svelte:head>

<div class="error-page">
	<span class="error-icon">★</span>
	<h1 class="error-code">{$page.status}</h1>
	<p class="error-msg">{$page.error?.message ?? 'Something went wrong.'}</p>
	<a href="/" class="btn-accent">GO HOME</a>
</div>

<style>
	.error-page { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; padding: 32px 16px; text-align: center; gap: 12px; }
	.error-icon { font-size: 48px; color: var(--zine-accent); line-height: 1; }
	.error-code { font-family: var(--font-heading); font-size: 72px; color: var(--zine-primary); margin: 0; }
	.error-msg { font-size: 14px; opacity: 0.65; margin: 0; }
</style>

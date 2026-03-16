<script lang="ts">
	let {
		title = 'Nothing here yet',
		description = '',
		actionLabel = '',
		actionHref = ''
	} = $props<{
		title?: string;
		description?: string;
		actionLabel?: string;
		actionHref?: string;
	}>();
</script>

<div class="empty-state">
	<span class="empty-icon">★</span>
	<h3 class="empty-title">{title}</h3>
	{#if description}
		<p class="empty-desc">{description}</p>
	{/if}
	{#if actionLabel && actionHref}
		<a href={actionHref} class="btn-accent">{actionLabel}</a>
	{/if}
</div>

<style>
	.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 64px 32px; text-align: center; }
	.empty-icon { font-size: 48px; color: var(--zine-accent); line-height: 1; }
	.empty-title { font-family: var(--font-heading); font-size: 24px; color: var(--zine-primary); margin: 0; }
	.empty-desc { font-size: 13px; opacity: 0.65; max-width: 320px; margin: 0; }
</style>

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

<div class="flex flex-col items-center justify-center gap-4 py-16 text-center text-surface-400">
	<span class="text-5xl">🎭</span>
	<h3 class="text-lg font-semibold text-surface-300">{title}</h3>
	{#if description}
		<p class="text-sm max-w-sm">{description}</p>
	{/if}
	{#if actionLabel && actionHref}
		<a href={actionHref} class="btn preset-filled-primary-500 mt-2">
			{actionLabel}
		</a>
	{/if}
</div>

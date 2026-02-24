<script lang="ts">
	import { env } from '$env/dynamic/public';

	const context = env.PUBLIC_DEPLOY_CONTEXT ?? '';
	const isNonProduction = context !== '' && context !== 'production';
</script>

{#if isNonProduction}
	<div class="bg-amber-400 text-amber-950 text-center text-xs font-semibold py-1 px-4">
		{context.toUpperCase()} — test environment, data is not shared with production
	</div>
{/if}

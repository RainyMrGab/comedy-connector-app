<script lang="ts">
	import { env } from '$env/dynamic/public';

	const context = env.PUBLIC_DEPLOY_CONTEXT ?? '';
	const isNonProduction = context !== '' && context !== 'production';

	const labels: Record<string, string> = {
		'deploy-preview': 'Deploy Preview',
		'branch-deploy': 'Branch Deploy',
		dev: 'Local Dev'
	};

	const label = labels[context] ?? context.toUpperCase();
</script>

{#if isNonProduction}
	<div class="bg-amber-400 text-amber-950 px-4 py-1 text-center text-xs font-semibold">
		{label} environment
	</div>
{/if}

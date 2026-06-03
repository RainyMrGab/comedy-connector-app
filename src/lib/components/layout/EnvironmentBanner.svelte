<script lang="ts">
	// deployContext comes from +layout.server.ts, which reads Netlify's CONTEXT runtime var.
	// Values: '' (local dev), 'production', 'deploy-preview', 'branch-deploy'
	let { deployContext = '' }: { deployContext?: string } = $props();

	const labels: Record<string, string> = {
		'deploy-preview': 'Deploy Preview',
		'branch-deploy': 'Branch Deploy',
		dev: 'Local Dev'
	};

	const isNonProduction = $derived(deployContext !== '' && deployContext !== 'production');
	const label = $derived(labels[deployContext] ?? deployContext.toUpperCase());
</script>

{#if isNonProduction}
	<div class="bg-amber-400 text-amber-950 px-4 py-1 text-center text-xs font-semibold">
		{label} environment
	</div>
{/if}

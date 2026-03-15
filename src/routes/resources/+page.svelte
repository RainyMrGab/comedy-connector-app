<script lang="ts">
	import { cityConfig } from '$config/city';
	import { ExternalLink } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Resources | {cityConfig.name} Comedy Connector</title>
	<meta
		name="description"
		content="Helpful links and resources for {cityConfig.name}'s comedy community — venues, classes, and more."
	/>
</svelte:head>

<div class="resources-page">
	<h1 class="page-title">COMMUNITY RESOURCES</h1>
	<p class="page-sub">Helpful links for {cityConfig.name}'s comedy scene.</p>

	{#each cityConfig.resources as section}
		<section class="resource-section">
			<h2 class="section-label">{section.category.toUpperCase()}</h2>
			<div class="resource-grid">
				{#each section.links as link}
					<a href={link.url} target="_blank" rel="noopener noreferrer" class="resource-card">
						<p class="resource-title">{link.title} <ExternalLink size={11} /></p>
						<p class="resource-desc">{link.description}</p>
					</a>
				{/each}
			</div>
		</section>
	{/each}

	<div class="suggest-box">
		<h2 class="suggest-title">KNOW A RESOURCE WE'RE MISSING?</h2>
		<p class="suggest-body">
			This site is open source. Suggest a resource for the {cityConfig.name} comedy community by opening an issue or PR on
			<a href="https://github.com/RainyMrGab/comedy-connector-app" target="_blank" rel="noopener noreferrer">GitHub</a>.
		</p>
	</div>
</div>

<style>
	.resources-page { max-width: 1024px; margin: 0 auto; padding: 48px 32px; }
	.page-title { font-family: var(--font-heading); font-size: 40px; color: var(--zine-primary); transform: rotate(-1deg); display: inline-block; margin-bottom: 8px; }
	.page-sub { font-size: 14px; opacity: 0.7; margin-bottom: 40px; }
	.resource-section { margin-bottom: 40px; }
	.section-label { font-family: var(--font-body); font-size: 10px; font-weight: 700; letter-spacing: 0.12em; color: var(--zine-muted); border-bottom: 1px solid var(--zine-muted); padding-bottom: 6px; margin-bottom: 16px; }
	.resource-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
	.resource-card { display: flex; flex-direction: column; gap: 4px; padding: 16px; border: var(--zine-border); background: var(--zine-surface); text-decoration: none; color: var(--zine-primary); transition: transform 0.1s, box-shadow 0.1s; }
	.resource-card:hover { transform: translate(-2px, -2px); box-shadow: var(--zine-shadow); }
	.resource-title { font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 4px; }
	.resource-desc { font-size: 12px; opacity: 0.75; }
	.suggest-box { margin-top: 48px; padding: 24px; background: var(--zine-surface); border: var(--zine-border); box-shadow: var(--zine-shadow); }
	.suggest-title { font-family: var(--font-heading); font-size: 22px; color: var(--zine-primary); margin-bottom: 8px; }
	.suggest-body { font-size: 13px; line-height: 1.6; }
	.suggest-body a { color: var(--zine-muted); text-decoration: underline; }
	@media (max-width: 640px) { .resource-grid { grid-template-columns: 1fr; } }
</style>

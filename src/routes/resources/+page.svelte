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

<div class="mx-auto max-w-4xl px-4 py-10">
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-surface-900 dark:text-surface-50">Community Resources</h1>
		<p class="text-surface-500 mt-2">
			Helpful links for {cityConfig.name}'s comedy scene.
		</p>
	</div>

	<div class="flex flex-col gap-8">
		{#each cityConfig.resources as section}
			<section>
				<h2 class="text-lg font-semibold text-surface-700 dark:text-surface-300 mb-3 uppercase tracking-wide text-sm">
					{section.category}
				</h2>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
					{#each section.links as link}
						<a
							href={link.url}
							target="_blank"
							rel="noopener noreferrer"
							class="card bg-surface-50 dark:bg-surface-800 rounded-xl p-4 border border-surface-200 dark:border-surface-700 hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-md transition-all group flex items-start gap-3"
						>
							<div class="flex-1">
								<p class="font-semibold text-surface-900 dark:text-surface-50 group-hover:text-primary-500 transition-colors flex items-center gap-1">
									{link.title}
									<ExternalLink size={12} class="opacity-50" />
								</p>
								<p class="text-sm text-surface-500 mt-0.5">{link.description}</p>
							</div>
						</a>
					{/each}
				</div>
			</section>
		{/each}
	</div>

	<div class="mt-12 p-6 rounded-xl bg-primary-50 dark:bg-primary-950 border border-primary-200 dark:border-primary-800">
		<h2 class="font-semibold text-primary-900 dark:text-primary-100 mb-1">Know a resource we're missing?</h2>
		<p class="text-sm text-primary-700 dark:text-primary-300">
			This site is open source. If you'd like to suggest a resource for the {cityConfig.name} comedy
			community, open an issue or PR on
			<a
				href="https://github.com/RainyMrGab/comedy-connector-app"
				target="_blank"
				rel="noopener noreferrer"
				class="underline hover:text-primary-500"
			>
				GitHub
			</a>.
		</p>
	</div>
</div>

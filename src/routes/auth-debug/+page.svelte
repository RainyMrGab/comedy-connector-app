<script lang="ts">
	import type { PageData } from './$types';
	import { authStore } from '$stores/auth.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Auth Diagnostics | Comedy Connector</title>
</svelte:head>

<div class="mx-auto max-w-4xl px-4 py-10">
	<h1 class="text-3xl font-bold mb-6">Authentication Diagnostics</h1>

	<div class="space-y-6">
		<!-- Server-side data -->
		<section class="card p-6 bg-surface-100 dark:bg-surface-800">
			<h2 class="text-xl font-semibold mb-4">Server-Side (data from +layout.server.ts)</h2>
			{#if data.user}
				<div class="space-y-2">
					<p class="text-green-600 dark:text-green-400 font-semibold">✅ User found in database</p>
					<pre class="bg-surface-200 dark:bg-surface-900 p-4 rounded overflow-auto">{JSON.stringify(data.user, null, 2)}</pre>
				</div>
			{:else}
				<div class="space-y-2">
					<p class="text-red-600 dark:text-red-400 font-semibold">❌ No user found in database</p>
					<p class="text-sm">The server couldn't find a user record for your Identity ID.</p>
				</div>
			{/if}
		</section>

		<!-- Client-side auth store -->
		<section class="card p-6 bg-surface-100 dark:bg-surface-800">
			<h2 class="text-xl font-semibold mb-4">Client-Side (authStore)</h2>
			<div class="space-y-2">
				<p><strong>Loading:</strong> {authStore.loading ? 'Yes' : 'No'}</p>
				<p><strong>Authenticated:</strong> {authStore.isAuthenticated ? 'Yes' : 'No'}</p>
				{#if authStore.user}
					<p class="text-green-600 dark:text-green-400 font-semibold">✅ User in store</p>
					<pre class="bg-surface-200 dark:bg-surface-900 p-4 rounded overflow-auto">{JSON.stringify(authStore.user, null, 2)}</pre>
				{:else}
					<p class="text-red-600 dark:text-red-400 font-semibold">❌ No user in store</p>
				{/if}
			</div>
		</section>

		<!-- Environment info -->
		<section class="card p-6 bg-surface-100 dark:bg-surface-800">
			<h2 class="text-xl font-semibold mb-4">Environment</h2>
			<p><strong>Deploy Context:</strong> {data.deployContext || 'unknown'}</p>
		</section>

		<!-- Instructions -->
		<section class="card p-6 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-500">
			<h2 class="text-xl font-semibold mb-4">What to check:</h2>
			<ol class="list-decimal list-inside space-y-2">
				<li>If server-side shows ❌: User wasn't created in the database or <code class="bg-surface-200 dark:bg-surface-800 px-1 rounded">NETLIFY_DATABASE_URL_IDENTITY</code> is not set correctly</li>
				<li>If server-side shows ✅ but client-side shows ❌: There's a sync issue in the layout</li>
				<li>Check the browser console for <code class="bg-surface-200 dark:bg-surface-800 px-1 rounded">[auth]</code> and <code class="bg-surface-200 dark:bg-surface-800 px-1 rounded">[layout]</code> log messages</li>
				<li>Check Netlify function logs for <code class="bg-surface-200 dark:bg-surface-800 px-1 rounded">identity-signup</code> errors</li>
			</ol>
		</section>
	</div>
</div>


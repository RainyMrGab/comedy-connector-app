<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Permanent+Marker&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<script lang="ts">
	import '../app.css';
	import { authStore } from '$stores/auth.svelte';
	import Header from '$components/layout/Header.svelte';
	import Footer from '$components/layout/Footer.svelte';
	import EnvironmentBanner from '$components/layout/EnvironmentBanner.svelte';
	import Toast from '$components/ui/Toast.svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();

	// Resolve auth state immediately from server data — the server is the source of truth.
	// Supabase session is validated server-side in hooks.server.ts on every request.
	$effect(() => {
		if (data.user) {
			authStore.setUser({ id: data.user.id, email: data.user.email });
		} else {
			authStore.setLoading(false);
		}
	});
</script>

<div class="flex min-h-screen flex-col">
	<EnvironmentBanner deployContext={data.deployContext} />
	<Header isLocal={data.isLocal} />
	<main class="flex-1">
		{@render children()}
	</main>
	<Footer />
</div>

<Toast />

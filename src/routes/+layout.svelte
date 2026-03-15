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
	import { invalidateAll } from '$app/navigation';
	import type { User } from 'netlify-identity-widget';
	import { authStore } from '$stores/auth.svelte';
	import { toastStore } from '$stores/toast.svelte';
	import Header from '$components/layout/Header.svelte';
	import Footer from '$components/layout/Footer.svelte';
	import EnvironmentBanner from '$components/layout/EnvironmentBanner.svelte';
	import Toast from '$components/ui/Toast.svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();

	// Resolve auth loading state immediately from server data.
	// The server is the source of truth for the initial render — don't wait for
	// the widget's async init, which can hang and leave a permanent loading spinner.
	$effect(() => {
		if (data.user) {
			authStore.setUser(
				{ id: data.user.id, email: data.user.email },
				null // token updated below by identity widget's init event
			);
		} else {
			authStore.setLoading(false);
		}
	});

	// Initialize Netlify Identity widget on the client (not used in local dev).
	// The widget's role here is token management and login/logout events only —
	// it does not control the loading state (effect above handles that).
	$effect(() => {
		if (data.isLocal) return;
		import('netlify-identity-widget').then((module) => {
			const identity = module.default;
			identity.init();
			identity.close(); // suppress the widget's own popup UI on page load

			identity.on('init', (user: User | null) => {
				if (user) {
					// Update auth store with the JWT token (server set user without it)
					const token = identity.currentUser()?.token?.access_token ?? null;
					authStore.setUser({ id: user.id, email: user.email, name: user.user_metadata?.full_name }, token);
				}
				// No else — loading already resolved by effect above
			});

			identity.on('login', (user: User) => {
				const token = identity.currentUser()?.token?.access_token ?? null;
				authStore.setUser({ id: user.id, email: user.email, name: user.user_metadata?.full_name }, token);
				identity.close();
				toastStore.success('Welcome back!');
				// Refresh server load fns without wiping client auth state
				invalidateAll();
			});

			identity.on('logout', () => {
				authStore.clearUser();
				toastStore.info('You have been signed out.');
				window.location.href = '/';
			});

			identity.on('error', (err: Error) => {
				console.error('Identity error:', err);
				authStore.setLoading(false);
			});
		});
	});
</script>

<div class="flex min-h-screen flex-col">
	<EnvironmentBanner />
	<Header isLocal={data.isLocal} />
	<main class="flex-1">
		{@render children()}
	</main>
	<Footer />
</div>

<Toast />

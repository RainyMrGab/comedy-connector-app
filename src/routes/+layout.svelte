<script lang="ts">
	import '../app.css';
	import type { User } from 'netlify-identity-widget';
	import { authStore } from '$stores/auth.svelte';
	import { toastStore } from '$stores/toast.svelte';
	import Header from '$components/layout/Header.svelte';
	import Footer from '$components/layout/Footer.svelte';
	import EnvironmentBanner from '$components/layout/EnvironmentBanner.svelte';
	import Toast from '$components/ui/Toast.svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();

	// Sync server-side user resolution into the client auth store on first load
	$effect(() => {
		if (data.user) {
			authStore.setUser(
				{ id: data.user.id, email: data.user.email },
				null // token managed client-side via Netlify Identity widget
			);
		} else {
			authStore.setLoading(false);
		}
	});

	// Initialize Netlify Identity widget on the client
	$effect(() => {
		import('netlify-identity-widget').then((module) => {
			const identity = module.default;
			identity.init();

			identity.on('init', (user: User | null) => {
				console.log('[layout] Identity init event, user:', user?.email || 'null');
				if (user) {
					const token = identity.currentUser()?.token?.access_token ?? null;
					console.log('[layout] Setting user from Identity widget');
					authStore.setUser({ id: user.id, email: user.email, name: user.user_metadata?.full_name }, token);
				} else {
					console.log('[layout] Identity widget: no user logged in');
					authStore.setLoading(false);
				}
			});

			identity.on('login', (user: User) => {
				const token = identity.currentUser()?.token?.access_token ?? null;
				authStore.setUser({ id: user.id, email: user.email, name: user.user_metadata?.full_name }, token);
				identity.close();
				toastStore.success('Welcome back!');
				// Reload to get server-side user data
				window.location.reload();
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
	<Header />
	<main class="flex-1">
		{@render children()}
	</main>
	<Footer />
</div>

<Toast />

<script lang="ts">
	import { enhance } from '$app/forms';
	import { cityConfig } from '$config/city';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let loading = $state(false);

	function signInWithGoogle() {
		// Pass the current page URL (including returnTo) as the redirect target so
		// that after Google OAuth, the layout's login event handler can pick up returnTo.
		const redirectTo = encodeURIComponent(window.location.href);
		window.location.href = `/.netlify/identity/authorize?provider=google&redirect_to=${redirectTo}`;
	}

	async function openSignup() {
		const module = await import('netlify-identity-widget');
		module.default.open('signup');
	}
</script>

<svelte:head>
	<title>Sign In — {cityConfig.name} Comedy Connector</title>
</svelte:head>

<div class="login-wrap">
	<div class="login-card">
		<h1 class="login-title">JOIN THE SCENE</h1>
		<p class="login-sub">
			{#if data.returnTo !== '/profile'}
				Sign in to continue.
			{:else}
				Sign in to connect with {cityConfig.name}'s comedy community.
			{/if}
		</p>

		{#if form?.error}
			<p class="login-error" role="alert">{form.error}</p>
		{/if}

		<form
			method="POST"
			action="?/login"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					loading = false;
					await update({ reset: false });
				};
			}}
			class="zine-form"
		>
			<input type="hidden" name="returnTo" value={data.returnTo} />

			<div class="form-field">
				<label for="email">EMAIL</label>
				<input
					id="email"
					type="email"
					name="email"
					autocomplete="email"
					required
					disabled={loading}
				/>
			</div>

			<div class="form-field">
				<label for="password">PASSWORD</label>
				<input
					id="password"
					type="password"
					name="password"
					autocomplete="current-password"
					required
					disabled={loading}
				/>
			</div>

			<button type="submit" class="btn-accent login-btn" disabled={loading}>
				{loading ? 'SIGNING IN…' : 'SIGN IN'}
			</button>
		</form>

		<div class="divider"><span>or</span></div>

		<button onclick={signInWithGoogle} class="btn-outline google-btn">
			<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
				<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
				<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
				<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
				<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
			</svg>
			CONTINUE WITH GOOGLE
		</button>

		<p class="signup-cta">
			New here?
			<button onclick={openSignup} class="signup-link">Create an account</button>
		</p>
	</div>
</div>

<style>
	.login-wrap {
		display: flex;
		min-height: 80vh;
		align-items: center;
		justify-content: center;
		padding: 16px;
	}

	.login-card {
		background: var(--zine-surface);
		border: var(--zine-border);
		box-shadow: var(--zine-shadow);
		width: 100%;
		max-width: 400px;
		padding: 32px;
	}

	.login-title {
		font-family: var(--font-heading);
		font-size: 28px;
		color: var(--zine-primary);
		margin: 0 0 8px;
		transform: rotate(-1deg);
		display: inline-block;
	}

	.login-sub {
		font-size: 13px;
		margin: 0 0 20px;
		line-height: 1.5;
		opacity: 0.75;
	}

	.login-error {
		background: color-mix(in srgb, var(--zine-accent) 10%, transparent);
		border: 1px solid var(--zine-accent);
		color: var(--zine-accent);
		font-size: 12px;
		font-weight: 700;
		padding: 8px 12px;
		margin-bottom: 16px;
	}

	.login-btn {
		width: 100%;
		margin-top: 4px;
	}

	.divider {
		display: flex;
		align-items: center;
		gap: 12px;
		margin: 20px 0;
		color: var(--zine-primary);
		opacity: 0.4;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.1em;
	}

	.divider::before,
	.divider::after {
		content: '';
		flex: 1;
		height: 1px;
		background: currentColor;
	}

	.google-btn {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
	}

	.signup-cta {
		font-size: 12px;
		text-align: center;
		margin: 20px 0 0;
		opacity: 0.65;
	}

	.signup-link {
		background: none;
		border: none;
		padding: 0;
		font-family: inherit;
		font-size: inherit;
		font-weight: 700;
		color: var(--zine-primary);
		cursor: pointer;
		text-decoration: underline;
	}

	.signup-link:hover {
		color: var(--zine-accent);
	}
</style>

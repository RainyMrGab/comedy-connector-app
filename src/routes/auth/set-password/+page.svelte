<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let saving = $state(false);
</script>

<svelte:head>
	<title>Set Password | Comedy Connector</title>
</svelte:head>

<div class="login-wrap">
	<div class="login-card">
		<h1 class="login-title">SET PASSWORD</h1>
		<p class="login-sub">Choose a password for your account. You'll use it to sign in from now on.</p>

		{#if form?.error}
			<p class="login-error" role="alert">{form.error}</p>
		{/if}

		<form
			method="POST"
			use:enhance={() => {
				saving = true;
				return async ({ update }) => {
					saving = false;
					await update({ reset: false });
				};
			}}
			class="zine-form"
		>
			<div class="form-field">
				<label for="password">NEW PASSWORD</label>
				<input
					id="password"
					type="password"
					name="password"
					autocomplete="new-password"
					required
					minlength={8}
					disabled={saving}
				/>
				<p class="field-hint">At least 8 characters</p>
			</div>

			<div class="form-field">
				<label for="confirm">CONFIRM PASSWORD</label>
				<input
					id="confirm"
					type="password"
					name="confirm"
					autocomplete="new-password"
					required
					minlength={8}
					disabled={saving}
				/>
			</div>

			<button type="submit" class="btn-accent login-btn" disabled={saving}>
				{saving ? 'SAVING…' : 'SET PASSWORD'}
			</button>
		</form>
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

	.field-hint {
		font-size: 11px;
		opacity: 0.55;
		margin: 4px 0 0;
	}

	.login-btn {
		width: 100%;
		margin-top: 4px;
	}
</style>

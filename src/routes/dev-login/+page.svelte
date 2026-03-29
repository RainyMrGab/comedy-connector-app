<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Dev Login — Comedy Connector</title>
</svelte:head>

<div class="login-wrap">
	<div class="login-card">
		<h1 class="login-title">LOCAL DEV LOGIN</h1>
		<p class="login-sub">Select a test user. Only available in local development.</p>

		<form method="POST" action="?/login" class="zine-form">
			<div class="form-field">
				<label for="userId">TEST USER</label>
				<select id="userId" name="userId" required>
					{#each data.users as user}
						<option value={user.id}>{user.label}</option>
					{/each}
				</select>
			</div>
			<input type="hidden" name="returnTo" value={data.returnTo} />
			<button type="submit" class="btn-accent">SIGN IN AS SELECTED USER</button>
		</form>

		<form method="POST" action="?/logout" style="margin-top: 8px;">
			<button type="submit" class="btn-outline" style="width: 100%;">CLEAR SESSION / SIGN OUT</button>
		</form>
	</div>
</div>

<style>
	.login-wrap { display: flex; min-height: 80vh; align-items: center; justify-content: center; padding: 16px; }
	.login-card { background: var(--zine-surface); border: var(--zine-border); box-shadow: var(--zine-shadow); width: 100%; max-width: 380px; padding: 32px; }
	.login-title { font-family: var(--font-heading); font-size: 24px; color: var(--zine-primary); margin: 0 0 8px; transform: rotate(-1deg); display: inline-block; }
	.login-sub { font-size: 12px; opacity: 0.65; margin: 0 0 24px; }
</style>

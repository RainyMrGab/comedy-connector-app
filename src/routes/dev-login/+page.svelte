<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Dev Login — Comedy Connector</title>
</svelte:head>

<div class="flex min-h-[80vh] items-center justify-center p-4">
	<div class="card bg-surface-100-900 w-full max-w-sm space-y-6 p-8">
		<div class="text-center">
			<h1 class="h3">Local Dev Login</h1>
			<p class="text-surface-500 mt-1 text-sm">
				Select a test user. Only available in local development.
			</p>
		</div>

		<form method="POST" action="?/login" class="space-y-4">
			<label class="label">
				<span class="label-text">Test User</span>
				<select name="userId" class="select" required>
					{#each data.users as user}
						<option value={user.id}>{user.label}</option>
					{/each}
				</select>
			</label>

			<button type="submit" class="btn preset-filled-primary-500 w-full">
				Sign In as Selected User
			</button>
		</form>

		<form method="POST" action="?/logout">
			<button type="submit" class="btn preset-tonal-surface w-full text-sm">
				Clear Session / Sign Out
			</button>
		</form>
	</div>
</div>

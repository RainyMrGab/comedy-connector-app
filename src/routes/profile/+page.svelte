<script lang="ts">
	import type { PageData } from './$types';
	import { Pencil, Mic2, UserCheck } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();
	let profile = $derived(data.profile);
	let performer = $derived(data.performer);
	let coach = $derived(data.coach);
</script>

<svelte:head>
	<title>My Profile | Comedy Connector</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-10">
	<div class="flex items-start justify-between mb-8">
		<div class="flex items-center gap-4">
			{#if profile.photoUrl}
				<img src={profile.photoUrl} alt={profile.name} class="w-20 h-20 rounded-full object-cover" />
			{:else}
				<div class="w-20 h-20 rounded-full bg-primary-500 flex items-center justify-center text-white text-2xl font-bold">
					{profile.name[0].toUpperCase()}
				</div>
			{/if}
			<div>
				<h1 class="text-2xl font-bold text-surface-900 dark:text-surface-50">{profile.name}</h1>
				<div class="flex gap-2 mt-1">
					{#if performer}
						<span class="chip preset-filled-primary-500 text-xs"><Mic2 size={12} /> Performer</span>
					{/if}
					{#if coach}
						<span class="chip preset-filled-secondary-500 text-xs"><UserCheck size={12} /> Coach</span>
					{/if}
				</div>
			</div>
		</div>
		<a href="/profile/edit" class="btn preset-tonal-surface gap-1">
			<Pencil size={16} />
			Edit Profile
		</a>
	</div>

	{#if profile.bio}
		<section class="mb-6">
			<h2 class="text-sm font-semibold uppercase text-surface-500 mb-2">Bio</h2>
			<p class="text-surface-700 dark:text-surface-300 whitespace-pre-line">{profile.bio}</p>
		</section>
	{/if}

	{#if profile.training}
		<section class="mb-6">
			<h2 class="text-sm font-semibold uppercase text-surface-500 mb-2">Training</h2>
			<p class="text-surface-700 dark:text-surface-300 whitespace-pre-line">{profile.training}</p>
		</section>
	{/if}

	{#if profile.lookingFor}
		<section class="mb-6">
			<h2 class="text-sm font-semibold uppercase text-surface-500 mb-2">Looking For</h2>
			<p class="text-surface-700 dark:text-surface-300">{profile.lookingFor}</p>
		</section>
	{/if}

	<div class="mt-8 flex gap-4">
		<a href="/profile/performer" class="btn {performer ? 'preset-tonal-primary' : 'preset-tonal-surface'}">
			<Mic2 size={16} />
			{performer ? 'Edit Performer Profile' : 'Add Performer Profile'}
		</a>
		<a href="/profile/coach" class="btn {coach ? 'preset-tonal-secondary' : 'preset-tonal-surface'}">
			<UserCheck size={16} />
			{coach ? 'Edit Coach Profile' : 'Add Coach Profile'}
		</a>
	</div>
</div>

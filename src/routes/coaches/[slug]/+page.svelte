<script lang="ts">
	import type { PageData } from './$types';
	import { authStore } from '$stores/auth.svelte';
	import { UserCheck, Mail, Globe, Users } from 'lucide-svelte';
	import { formatDateRange } from '$utils/dates';
	import { cityConfig } from '$config/city';
	import ContactDialog from '$components/contact/ContactDialog.svelte';

	let { data }: { data: PageData } = $props();
	let profile = $derived(data.profile);
	let coach = $derived(data.coach);
	let coachingRoles = $derived(data.coachingRoles);

	let contactOpen = $state(false);
</script>

<svelte:head>
	<title>{profile.name} — Coach | {cityConfig.name} Comedy Connector</title>
	<meta name="description" content="{profile.name} — improv coach in {cityConfig.name}." />
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-10">
	<div class="flex items-start gap-6 mb-8">
		{#if profile.photoUrl}
			<img src={profile.photoUrl} alt={profile.name} class="w-24 h-24 rounded-full object-cover shadow-md" />
		{:else}
			<div class="w-24 h-24 rounded-full bg-secondary-500 flex items-center justify-center text-white text-3xl font-bold shadow-md">
				{profile.name[0].toUpperCase()}
			</div>
		{/if}
		<div class="flex-1">
			<h1 class="text-3xl font-bold text-surface-900 dark:text-surface-50">{profile.name}</h1>
			<div class="flex flex-wrap gap-2 mt-2">
				<span class="chip preset-filled-secondary-500"><UserCheck size={12} /> Coach</span>
				{#if coach.availableForPrivate}
					<span class="chip preset-tonal-secondary">Private Sessions</span>
				{/if}
				{#if coach.availableForTeams}
					<span class="chip preset-tonal-tertiary">Team Coaching</span>
				{/if}
				{#if coach.availableForWorkshops}
					<span class="chip preset-tonal-surface">Workshops</span>
				{/if}
			</div>
			{#if coach.availability}
				<p class="text-sm text-surface-400 mt-2">{coach.availability}</p>
			{/if}

			{#if profile.socialLinks && Object.keys(profile.socialLinks).length > 0}
				<div class="flex flex-wrap gap-2 mt-3">
					{#each Object.entries(profile.socialLinks) as [platform, url]}
						{#if url}
							<a href={url} target="_blank" rel="noopener noreferrer" class="chip preset-tonal-surface hover:preset-filled-surface transition-all text-xs">
								<Globe size={12} />
								<span class="capitalize">{platform}</span>
							</a>
						{/if}
					{/each}
				</div>
			{/if}
		</div>

		{#if authStore.isAuthenticated}
			<button onclick={() => (contactOpen = true)} class="btn preset-filled-secondary-500 shrink-0 gap-1">
				<Mail size={16} />
				Contact
			</button>
		{:else}
			<button onclick={() => {const m = import('netlify-identity-widget'); m.then(i => i.default.open('login'));}} class="btn preset-tonal-surface shrink-0 text-sm">
				Log in to contact
			</button>
		{/if}
	</div>

	<ContactDialog
		bind:open={contactOpen}
		recipientId={profile.id}
		recipientType="personal_profile"
		recipientName={profile.name}
	/>

	{#if coach.coachingBio}
		<section class="mb-6">
			<h2 class="text-sm font-semibold uppercase text-surface-500 mb-2">Coaching Approach</h2>
			<p class="text-surface-700 dark:text-surface-300 whitespace-pre-line">{coach.coachingBio}</p>
		</section>
	{/if}

	{#if profile.bio}
		<section class="mb-6">
			<h2 class="text-sm font-semibold uppercase text-surface-500 mb-2">About</h2>
			<p class="text-surface-700 dark:text-surface-300 whitespace-pre-line">{profile.bio}</p>
		</section>
	{/if}

	{#if profile.training}
		<section class="mb-6">
			<h2 class="text-sm font-semibold uppercase text-surface-500 mb-2">Training & Experience</h2>
			<p class="text-surface-700 dark:text-surface-300 whitespace-pre-line">{profile.training}</p>
		</section>
	{/if}

	{#if coachingRoles.length > 0}
		<section class="mb-6">
			<h2 class="text-sm font-semibold uppercase text-surface-500 mb-3">Teams Coached</h2>
			<div class="flex flex-col gap-2">
				{#each coachingRoles as r}
					<a href="/teams/{r.teamSlug}" class="flex items-center gap-3 p-3 rounded-lg border border-surface-200 dark:border-surface-700 hover:border-secondary-500 transition-colors">
						<Users size={18} class="text-surface-400" />
						<div>
							<p class="font-medium text-surface-900 dark:text-surface-50">{r.teamName}</p>
							{#if r.startYear}
								<p class="text-xs text-surface-400">
									{formatDateRange(r.startYear, r.startMonth, r.endYear, r.endMonth, r.isCurrent)}
								</p>
							{/if}
						</div>
					</a>
				{/each}
			</div>
		</section>
	{/if}
</div>

<script lang="ts">
	import type { PageData } from './$types';
	import { authStore } from '$stores/auth.svelte';
	import { Mic2, Mail, Instagram, Youtube, Globe, Users } from 'lucide-svelte';
	import { formatDateRange } from '$utils/dates';
	import { cityConfig } from '$config/city';

	let { data }: { data: PageData } = $props();
	let profile = $derived(data.profile);
	let performer = $derived(data.performer);
	let memberships = $derived(data.memberships);

	const socialIcons: Record<string, typeof Mail> = {
		instagram: Instagram,
		youtube: Youtube,
		website: Globe
	};
</script>

<svelte:head>
	<title>{profile.name} | {cityConfig.name} Comedy Connector</title>
	<meta name="description" content="{profile.name} — comedian in {cityConfig.name}. {profile.bio?.slice(0, 120) ?? ''}" />
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-10">
	<!-- Header -->
	<div class="flex items-start gap-6 mb-8">
		{#if profile.photoUrl}
			<img src={profile.photoUrl} alt={profile.name} class="w-24 h-24 rounded-full object-cover shadow-md" />
		{:else}
			<div class="w-24 h-24 rounded-full bg-primary-500 flex items-center justify-center text-white text-3xl font-bold shadow-md">
				{profile.name[0].toUpperCase()}
			</div>
		{/if}
		<div class="flex-1">
			<h1 class="text-3xl font-bold text-surface-900 dark:text-surface-50">{profile.name}</h1>
			<div class="flex flex-wrap gap-2 mt-2">
				{#if performer}
					<span class="chip preset-filled-primary-500"><Mic2 size={12} /> Performer</span>
				{/if}
				{#if performer?.openToBookOpeners}
					<span class="chip preset-tonal-secondary">Open to Book Openers</span>
				{/if}
				{#if performer?.lookingForTeam}
					<span class="chip preset-tonal-tertiary">Looking for Team</span>
				{/if}
				{#if performer?.lookingForCoach}
					<span class="chip preset-tonal-surface">Seeking Coach</span>
				{/if}
			</div>

			<!-- Social links -->
			{#if profile.socialLinks && Object.keys(profile.socialLinks).length > 0}
				<div class="flex flex-wrap gap-2 mt-3">
					{#each Object.entries(profile.socialLinks) as [platform, url]}
						{#if url}
							<a
								href={url}
								target="_blank"
								rel="noopener noreferrer"
								class="chip preset-tonal-surface hover:preset-filled-surface transition-all text-xs"
								aria-label={platform}
							>
								{#if socialIcons[platform]}
									{@const Icon = socialIcons[platform]}
									<Icon size={12} />
								{/if}
								<span class="capitalize">{platform}</span>
							</a>
						{/if}
					{/each}
				</div>
			{/if}
		</div>

		<!-- Contact button (logged-in users only) -->
		{#if authStore.isAuthenticated}
			<a href="/connect?recipient={profile.id}&type=personal_profile" class="btn preset-filled-primary-500 shrink-0">
				<Mail size={16} />
				Contact
			</a>
		{:else}
			<a href="/" class="btn preset-tonal-surface shrink-0 text-sm">
				Log in to contact
			</a>
		{/if}
	</div>

	<!-- Bio -->
	{#if profile.bio}
		<section class="mb-6">
			<h2 class="text-sm font-semibold uppercase text-surface-500 mb-2">About</h2>
			<p class="text-surface-700 dark:text-surface-300 whitespace-pre-line">{profile.bio}</p>
		</section>
	{/if}

	<!-- Training -->
	{#if profile.training}
		<section class="mb-6">
			<h2 class="text-sm font-semibold uppercase text-surface-500 mb-2">Training & Experience</h2>
			<p class="text-surface-700 dark:text-surface-300 whitespace-pre-line">{profile.training}</p>
		</section>
	{/if}

	<!-- Looking For -->
	{#if profile.lookingFor}
		<section class="mb-6">
			<h2 class="text-sm font-semibold uppercase text-surface-500 mb-2">Looking For</h2>
			<p class="text-surface-700 dark:text-surface-300">{profile.lookingFor}</p>
		</section>
	{/if}

	<!-- Video Highlights -->
	{#if performer?.videoHighlights && performer.videoHighlights.length > 0}
		<section class="mb-6">
			<h2 class="text-sm font-semibold uppercase text-surface-500 mb-2">Video Highlights</h2>
			<div class="flex flex-col gap-2">
				{#each performer.videoHighlights as url}
					<a href={url} target="_blank" rel="noopener noreferrer" class="text-primary-500 hover:underline text-sm truncate">
						<Youtube size={14} class="inline mr-1" />{url}
					</a>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Team Memberships -->
	{#if memberships.length > 0}
		<section class="mb-6">
			<h2 class="text-sm font-semibold uppercase text-surface-500 mb-3">Teams</h2>
			<div class="flex flex-col gap-2">
				{#each memberships as m}
					<a
						href="/teams/{m.teamSlug}"
						class="flex items-center gap-3 p-3 rounded-lg border border-surface-200 dark:border-surface-700 hover:border-primary-500 transition-colors"
					>
						<Users size={18} class="text-surface-400" />
						<div>
							<p class="font-medium text-surface-900 dark:text-surface-50">{m.teamName}</p>
							{#if m.startYear}
								<p class="text-xs text-surface-400">
									{formatDateRange(m.startYear, m.startMonth, m.endYear, m.endMonth, m.isCurrent)}
								</p>
							{/if}
						</div>
						{#if m.teamStatus === 'stub'}
							<span class="chip preset-tonal-warning text-xs ml-auto">Unclaimed</span>
						{/if}
					</a>
				{/each}
			</div>
		</section>
	{/if}
</div>

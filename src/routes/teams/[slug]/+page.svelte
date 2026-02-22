<script lang="ts">
	import type { PageData } from './$types';
	import { authStore } from '$stores/auth.svelte';
	import { Users, UserCheck, Mail, Pencil, Video } from 'lucide-svelte';
	import { formatDateRange } from '$utils/dates';
	import { cityConfig } from '$config/city';

	let { data }: { data: PageData } = $props();
	let team = $derived(data.team);
	let members = $derived(data.members);
	let coaches = $derived(data.coaches);
	let isTeamMember = $derived(data.isTeamMember);
</script>

<svelte:head>
	<title>{team.name} | {cityConfig.name} Comedy Connector</title>
	<meta name="description" content="{team.name} — improv team in {cityConfig.name}." />
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-10">
	<!-- Header -->
	<div class="flex items-start gap-6 mb-6">
		{#if team.photoUrl}
			<img src={team.photoUrl} alt={team.name} class="w-24 h-24 rounded-xl object-cover shadow-md" />
		{:else}
			<div class="w-24 h-24 rounded-xl bg-tertiary-500 flex items-center justify-center shadow-md">
				<Users size={36} class="text-white" />
			</div>
		{/if}
		<div class="flex-1">
			<div class="flex items-center gap-3 flex-wrap">
				<h1 class="text-3xl font-bold text-surface-900 dark:text-surface-50">{team.name}</h1>
				{#if team.status === 'stub'}
					<span class="chip preset-tonal-warning">Unclaimed</span>
				{/if}
			</div>
			<div class="flex flex-wrap gap-2 mt-2">
				{#if team.form}
					<span class="chip preset-tonal-tertiary">{team.form}</span>
				{/if}
				{#if team.isPracticeGroup}
					<span class="chip preset-tonal-surface">Practice Group</span>
				{/if}
				{#if team.openToNewMembers}
					<span class="chip preset-tonal-primary">Open to Members</span>
				{/if}
				{#if team.openToBookOpeners}
					<span class="chip preset-tonal-secondary">Available to Book</span>
				{/if}
				{#if team.seekingCoach}
					<span class="chip preset-tonal-tertiary">Seeking Coach</span>
				{/if}
			</div>
		</div>

		<div class="flex flex-col gap-2 shrink-0">
			{#if isTeamMember}
				<a href="/teams/{team.slug}/edit" class="btn preset-tonal-surface btn-sm gap-1">
					<Pencil size={14} />
					Edit Team
				</a>
			{/if}
			{#if team.status === 'stub' && authStore.isAuthenticated}
				<a href="/teams/{team.slug}/claim" class="btn preset-filled-tertiary-500 btn-sm">
					Claim This Team
				</a>
			{/if}
			{#if authStore.isAuthenticated && team.primaryContactProfileId}
				<a href="/connect?recipient={team.id}&type=team" class="btn preset-filled-primary-500 btn-sm gap-1">
					<Mail size={14} />
					Contact
				</a>
			{/if}
		</div>
	</div>

	<!-- Stub call-to-action -->
	{#if team.status === 'stub'}
		<div class="alert preset-tonal-warning mb-6">
			<div>
				<p class="font-semibold">This team hasn't been set up yet.</p>
				<p class="text-sm mt-1">Are you a member? Claim this team to add details and manage the roster.</p>
				{#if authStore.isAuthenticated}
					<a href="/teams/{team.slug}/claim" class="btn preset-filled-warning-500 btn-sm mt-3">
						Claim This Team
					</a>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Description -->
	{#if team.description}
		<section class="mb-6">
			<h2 class="text-sm font-semibold uppercase text-surface-500 mb-2">About</h2>
			<p class="text-surface-700 dark:text-surface-300 whitespace-pre-line">{team.description}</p>
		</section>
	{/if}

	<!-- Looking For -->
	{#if team.lookingFor}
		<section class="mb-6">
			<h2 class="text-sm font-semibold uppercase text-surface-500 mb-2">Looking For</h2>
			<p class="text-surface-700 dark:text-surface-300">{team.lookingFor}</p>
		</section>
	{/if}

	<!-- Video -->
	{#if team.videoUrl}
		<section class="mb-6">
			<h2 class="text-sm font-semibold uppercase text-surface-500 mb-2">Video</h2>
			<a href={team.videoUrl} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 text-primary-500 hover:underline">
				<Video size={16} />
				Watch highlight video
			</a>
		</section>
	{/if}

	<!-- Members -->
	{#if members.length > 0}
		<section class="mb-6">
			<h2 class="text-sm font-semibold uppercase text-surface-500 mb-3">
				Members ({members.length})
			</h2>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
				{#each members as member}
					{#if member.profileId && member.slug}
						<a href="/performers/{member.slug}" class="flex items-center gap-3 p-3 rounded-lg border border-surface-200 dark:border-surface-700 hover:border-primary-500 transition-colors">
							{#if member.photoUrl}
								<img src={member.photoUrl} alt={member.name} class="w-10 h-10 rounded-full object-cover" />
							{:else}
								<div class="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-sm">
									{(member.name ?? '?')[0].toUpperCase()}
								</div>
							{/if}
							<div>
								<p class="font-medium text-surface-900 dark:text-surface-50 text-sm">{member.name}</p>
								{#if member.startYear}
									<p class="text-xs text-surface-400">
										{formatDateRange(member.startYear, member.startMonth, member.endYear, member.endMonth, member.isCurrent)}
									</p>
								{/if}
							</div>
						</a>
					{:else}
						<div class="flex items-center gap-3 p-3 rounded-lg border border-surface-200 dark:border-surface-700">
							<div class="w-10 h-10 rounded-full bg-surface-400 flex items-center justify-center text-white font-bold text-sm">
								<Users size={14} />
							</div>
							<div>
								<p class="font-medium text-surface-700 dark:text-surface-300 text-sm">{member.memberName ?? 'Unknown'}</p>
								{#if member.startYear}
									<p class="text-xs text-surface-400">
										{formatDateRange(member.startYear, member.startMonth, member.endYear, member.endMonth, member.isCurrent)}
									</p>
								{/if}
							</div>
						</div>
					{/if}
				{/each}
			</div>
		</section>
	{/if}

	<!-- Coaches -->
	{#if coaches.length > 0}
		<section class="mb-6">
			<h2 class="text-sm font-semibold uppercase text-surface-500 mb-3">
				Coaches
			</h2>
			<div class="flex flex-col gap-2">
				{#each coaches as coach}
					{#if coach.profileId && coach.slug}
						<a href="/coaches/{coach.slug}" class="flex items-center gap-3 p-3 rounded-lg border border-surface-200 dark:border-surface-700 hover:border-secondary-500 transition-colors">
							{#if coach.photoUrl}
								<img src={coach.photoUrl} alt={coach.name} class="w-10 h-10 rounded-full object-cover" />
							{:else}
								<div class="w-10 h-10 rounded-full bg-secondary-500 flex items-center justify-center text-white">
									<UserCheck size={14} />
								</div>
							{/if}
							<div>
								<p class="font-medium text-surface-900 dark:text-surface-50 text-sm">{coach.name}</p>
								{#if coach.startYear}
									<p class="text-xs text-surface-400">
										{formatDateRange(coach.startYear, coach.startMonth, coach.endYear, coach.endMonth, coach.isCurrent)}
									</p>
								{/if}
							</div>
						</a>
					{:else}
						<div class="flex items-center gap-3 p-3 rounded-lg border border-surface-200 dark:border-surface-700">
							<div class="w-10 h-10 rounded-full bg-secondary-400 flex items-center justify-center text-white">
								<UserCheck size={14} />
							</div>
							<p class="font-medium text-surface-700 dark:text-surface-300 text-sm">{coach.coachName ?? 'Unknown'}</p>
						</div>
					{/if}
				{/each}
			</div>
		</section>
	{/if}
</div>

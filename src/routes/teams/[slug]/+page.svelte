<script lang="ts">
	import type { PageData } from './$types';
	import { authStore } from '$stores/auth.svelte';
	import { Users, UserCheck, Mail, Pencil, Video, Globe } from 'lucide-svelte';
	import { formatDateRange } from '$utils/dates';
	import { cityConfig } from '$config/city';
	import ContactDialog from '$components/contact/ContactDialog.svelte';

	let { data }: { data: PageData } = $props();
	let team = $derived(data.team);
	let members = $derived(data.members);
	let coaches = $derived(data.coaches);
	let isTeamMember = $derived(data.isTeamMember);

	let contactOpen = $state(false);

	function getYoutubeEmbedUrl(url: string): string | null {
		const watchMatch = url.match(/youtube\.com\/watch\?v=([\w-]+)/);
		if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
		const shortMatch = url.match(/youtu\.be\/([\w-]+)/);
		if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
		return null;
	}
</script>

<svelte:head>
	<title>{team.name} | {cityConfig.name} Comedy Connector</title>
	<meta name="description" content="{team.name} — improv team in {cityConfig.name}." />
</svelte:head>

<div class="detail-page">
	<!-- Header -->
	<div class="profile-header">
		<div class="avatar-name">
			{#if team.photoUrl}
				<img src={team.photoUrl} alt={team.name} class="avatar" />
			{:else}
				<div class="avatar avatar-placeholder">
					<Users size={36} />
				</div>
			{/if}
			<div class="name-block">
				<div class="title-row">
					<h1 class="profile-name">{team.name}</h1>
					{#if team.status === 'stub'}
						<span class="zine-tag tag-warning">UNCLAIMED</span>
					{/if}
				</div>
				<div class="tag-row">
					{#if team.form}
						<span class="zine-tag">{team.form.toUpperCase()}</span>
					{/if}
					{#if team.isPracticeGroup}
						<span class="zine-tag">PRACTICE GROUP</span>
					{/if}
					{#if team.openToNewMembers}
						<span class="zine-tag tag-muted">OPEN TO MEMBERS</span>
					{/if}
					{#if team.openToBookOpeners}
						<span class="zine-tag">AVAILABLE TO BOOK</span>
					{/if}
					{#if team.seekingCoach}
						<span class="zine-tag">SEEKING COACH</span>
					{/if}
				</div>
			</div>
		</div>

		<div class="header-actions">
			{#if isTeamMember}
				<a href="/teams/{team.slug}/edit" class="btn-outline">
					<Pencil size={14} /> EDIT TEAM
				</a>
			{/if}
			{#if team.status === 'stub' && authStore.isAuthenticated}
				<a href="/teams/{team.slug}/claim" class="btn-accent">CLAIM THIS TEAM</a>
			{/if}
			{#if authStore.isAuthenticated && team.primaryContactProfileId}
				<button onclick={() => (contactOpen = true)} class="btn-accent">
					<Mail size={14} /> CONTACT
				</button>
			{/if}
		</div>
	</div>

	{#if team.primaryContactProfileId}
		<ContactDialog
			bind:open={contactOpen}
			recipientId={team.id}
			recipientType="team"
			recipientName={team.name}
		/>
	{/if}

	<!-- Stub callout -->
	{#if team.status === 'stub'}
		<div class="stub-callout">
			<p class="stub-title">THIS TEAM HASN'T BEEN SET UP YET.</p>
			<p class="stub-body">Are you a member? Claim this team to add details and manage the roster.</p>
			{#if authStore.isAuthenticated}
				<a href="/teams/{team.slug}/claim" class="btn-accent">CLAIM THIS TEAM</a>
			{/if}
		</div>
	{/if}

	{#if team.description}
		<section class="detail-section">
			<h2 class="section-label">ABOUT</h2>
			<p class="section-body">{team.description}</p>
		</section>
	{/if}

	{#if team.lookingFor}
		<section class="detail-section">
			<h2 class="section-label">LOOKING FOR</h2>
			<p class="section-body">{team.lookingFor}</p>
		</section>
	{/if}

	{#if team.videoUrl}
		{@const embedUrl = getYoutubeEmbedUrl(team.videoUrl)}
		<section class="detail-section">
			<h2 class="section-label">VIDEO</h2>
			{#if embedUrl}
				<div class="embed-wrap">
					<iframe
						src={embedUrl}
						title="Team highlight video"
						frameborder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowfullscreen
					></iframe>
				</div>
			{:else}
				<a href={team.videoUrl} target="_blank" rel="noopener noreferrer" class="video-link">
					<Globe size={14} /> Watch highlight video
				</a>
			{/if}
		</section>
	{/if}

	{#if members.length > 0}
		<section class="detail-section">
			<h2 class="section-label">MEMBERS ({members.length})</h2>
			<div class="member-grid">
				{#each members as member}
					{#if member.profileId && member.slug}
						<a href="/performers/{member.slug}" class="member-card">
							{#if member.photoUrl}
								<img src={member.photoUrl} alt={member.name} class="member-avatar" />
							{:else}
								<div class="member-avatar member-avatar-placeholder">
									{(member.name ?? '?')[0].toUpperCase()}
								</div>
							{/if}
							<div>
								<p class="member-name">{member.name}</p>
								{#if member.startYear}
									<p class="member-date">
										{formatDateRange(member.startYear, member.startMonth, member.endYear, member.endMonth, member.isCurrent)}
									</p>
								{/if}
							</div>
						</a>
					{:else}
						<div class="member-card member-card-unlinked">
							<div class="member-avatar member-avatar-placeholder">
								<Users size={14} />
							</div>
							<div>
								<p class="member-name">{member.memberName ?? 'Unknown'}</p>
								{#if member.startYear}
									<p class="member-date">
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

	{#if coaches.length > 0}
		<section class="detail-section">
			<h2 class="section-label">COACHES</h2>
			<div class="member-list">
				{#each coaches as coach}
					{#if coach.profileId && coach.slug}
						<a href="/coaches/{coach.slug}" class="member-row">
							{#if coach.photoUrl}
								<img src={coach.photoUrl} alt={coach.name} class="member-avatar" />
							{:else}
								<div class="member-avatar member-avatar-placeholder">
									<UserCheck size={14} />
								</div>
							{/if}
							<div>
								<p class="member-name">{coach.name}</p>
								{#if coach.startYear}
									<p class="member-date">
										{formatDateRange(coach.startYear, coach.startMonth, coach.endYear, coach.endMonth, coach.isCurrent)}
									</p>
								{/if}
							</div>
						</a>
					{:else}
						<div class="member-row">
							<div class="member-avatar member-avatar-placeholder">
								<UserCheck size={14} />
							</div>
							<p class="member-name">{coach.coachName ?? 'Unknown'}</p>
						</div>
					{/if}
				{/each}
			</div>
		</section>
	{/if}
</div>

<style>
	.detail-page { max-width: 768px; margin: 0 auto; padding: 48px 32px; }

	.profile-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 24px;
		padding: 24px;
		background: var(--zine-surface);
		border: var(--zine-border);
		box-shadow: var(--zine-shadow);
		margin-bottom: 32px;
		flex-wrap: wrap;
	}

	.avatar-name { display: flex; align-items: flex-start; gap: 20px; flex: 1; }

	.avatar { width: 80px; height: 80px; object-fit: cover; border: var(--zine-border); flex-shrink: 0; }

	.avatar-placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--zine-muted);
		color: #fff;
	}

	.name-block { flex: 1; }

	.title-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 8px; }

	.profile-name { font-family: var(--font-heading); font-size: 32px; color: var(--zine-primary); margin: 0; }

	.tag-row { display: flex; flex-wrap: wrap; gap: 6px; }

	.zine-tag {
		font-family: var(--font-body);
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		background: var(--zine-primary);
		color: var(--zine-bg);
		padding: 2px 8px;
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}

	.tag-muted { background: var(--zine-muted); color: #fff; }
	.tag-warning { background: var(--zine-accent); color: #fff; }

	.header-actions { display: flex; flex-direction: column; gap: 8px; flex-shrink: 0; }

	/* STUB CALLOUT */
	.stub-callout {
		padding: 20px 24px;
		background: #fffbeb;
		border: 2px solid #b45309;
		box-shadow: 4px 4px 0px #b45309;
		margin-bottom: 24px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.stub-title { font-family: var(--font-body); font-size: 13px; font-weight: 700; letter-spacing: 0.06em; color: #b45309; }
	.stub-body { font-size: 13px; color: var(--zine-primary); }

	/* SECTIONS */
	.detail-section { margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid var(--zine-surface); }

	.section-label {
		font-family: var(--font-body);
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.12em;
		color: var(--zine-muted);
		margin-bottom: 8px;
	}

	.section-body { font-size: 15px; line-height: 1.7; white-space: pre-line; }

	.video-link { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: var(--zine-muted); text-decoration: none; }
	.video-link:hover { color: var(--zine-accent); }
	.embed-wrap { position: relative; width: 100%; padding-bottom: 56.25%; height: 0; }
	.embed-wrap iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: var(--zine-border); }

	/* MEMBERS */
	.member-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }

	.member-card {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px;
		border: var(--zine-border);
		background: var(--zine-surface);
		text-decoration: none;
		color: var(--zine-primary);
		transition: box-shadow 0.1s, transform 0.1s;
	}

	.member-card:hover { box-shadow: var(--zine-shadow); transform: translate(-1px, -1px); }
	.member-card-unlinked { opacity: 0.65; cursor: default; }

	.member-list { display: flex; flex-direction: column; gap: 8px; }

	.member-row {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px;
		border: var(--zine-border);
		background: var(--zine-surface);
		text-decoration: none;
		color: var(--zine-primary);
		transition: box-shadow 0.1s, transform 0.1s;
	}

	.member-row:hover { box-shadow: var(--zine-shadow); transform: translate(-1px, -1px); }

	.member-avatar { width: 40px; height: 40px; object-fit: cover; border: 1px solid var(--zine-primary); flex-shrink: 0; }

	.member-avatar-placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--zine-primary);
		color: var(--zine-bg);
		font-size: 14px;
		font-weight: 700;
	}

	.member-name { font-size: 13px; font-weight: 700; }
	.member-date { font-size: 11px; opacity: 0.6; }

	@media (max-width: 640px) {
		.detail-page { padding: 24px 16px; }
		.profile-header { flex-direction: column; }
		.avatar-name { flex-direction: column; }
		.member-grid { grid-template-columns: 1fr; }
	}
</style>

<script lang="ts">
	import type { PageData } from './$types';
	import { authStore } from '$stores/auth.svelte';
	import { Sparkles, Mail, Instagram, Globe, Users, Video, Copy, Check } from 'lucide-svelte';
	import { formatDateRange } from '$utils/dates';
	import { cityConfig } from '$config/city';
	import ContactDialog from '$components/contact/ContactDialog.svelte';

	let { data }: { data: PageData } = $props();
	let profile = $derived(data.profile);
	let performer = $derived(data.performer);
	let memberships = $derived(data.memberships);

	let contactOpen = $state(false);
	let copied = $state(false);

	const profileUrl = $derived(`${cityConfig.siteUrl}/performers/${profile.slug}`);

	function copyProfileUrl() {
		navigator.clipboard.writeText(profileUrl);
		copied = true;
		setTimeout(() => { copied = false; }, 2000);
	}

	function getYoutubeEmbedUrl(url: string): string | null {
		const watchMatch = url.match(/youtube\.com\/watch\?v=([\w-]+)/);
		if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
		const shortMatch = url.match(/youtu\.be\/([\w-]+)/);
		if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
		return null;
	}

	function isImageUrl(url: string): boolean {
		return /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url);
	}

	const socialIcons: Record<string, typeof Mail> = {
		instagram: Instagram,
		tiktok: Video,
		twitter: Globe,
		bluesky: Globe,
		website: Globe
	};
</script>

<svelte:head>
	<title>{profile.name} | {cityConfig.name} Comedy Connector</title>
	<meta name="description" content="{profile.name} — comedian in {cityConfig.name}. {profile.bio?.slice(0, 120) ?? ''}" />
</svelte:head>

<div class="detail-page">
	<!-- Header card -->
	<div class="profile-header">
		<div class="avatar-name">
			{#if profile.photoUrl}
				<img src={profile.photoUrl} alt={profile.name} class="avatar" />
			{:else}
				<div class="avatar avatar-placeholder">
					{profile.name[0].toUpperCase()}
				</div>
			{/if}
			<div class="name-block">
				<h1 class="profile-name">{profile.name}</h1>
				<div class="tag-row">
					{#if performer}
						<span class="zine-tag tag-accent"><Sparkles size={10} /> PERFORMER</span>
					{/if}
					{#if performer?.lookingForPracticeGroup}
						<span class="zine-tag">SEEKING PRACTICE GROUP</span>
					{/if}
					{#if performer?.lookingForSmallGroup}
						<span class="zine-tag">SEEKING SMALL GROUP</span>
					{/if}
					{#if performer?.lookingForIndieTeam}
						<span class="zine-tag">SEEKING INDIE TEAM</span>
					{/if}
				</div>
				{#if profile.socialLinks && Object.keys(profile.socialLinks).length > 0}
					<div class="tag-row">
						{#each Object.entries(profile.socialLinks) as [platform, url]}
							{#if url}
								<a href={url} target="_blank" rel="noopener noreferrer" class="social-link" aria-label={platform}>
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
		</div>
		<div class="header-actions">
			{#if authStore.isAuthenticated}
				<button onclick={() => (contactOpen = true)} class="btn-accent">
					<Mail size={16} /> CONTACT
				</button>
			{:else}
				<button onclick={() => {const m = import('netlify-identity-widget'); m.then(i => i.default.open('login'));}} class="btn-outline">
					LOG IN TO CONTACT
				</button>
			{/if}
		</div>
	</div>

	<ContactDialog
		bind:open={contactOpen}
		recipientId={profile.id}
		recipientType="personal_profile"
		recipientName={profile.name}
	/>

	<div class="profile-url-row">
		<span class="profile-url-text">{profileUrl}</span>
		<button class="btn-copy" onclick={copyProfileUrl} aria-label="Copy profile URL">
			{#if copied}
				<Check size={13} /> Copied!
			{:else}
				<Copy size={13} /> Copy link
			{/if}
		</button>
	</div>

	{#if profile.bio}
		<section class="detail-section">
			<h2 class="section-label">ABOUT</h2>
			<p class="section-body">{profile.bio}</p>
		</section>
	{/if}

	{#if profile.training}
		<section class="detail-section">
			<h2 class="section-label">TRAINING &amp; EXPERIENCE</h2>
			<p class="section-body">{profile.training}</p>
		</section>
	{/if}

	{#if profile.lookingFor}
		<section class="detail-section">
			<h2 class="section-label">LOOKING FOR</h2>
			<p class="section-body">{profile.lookingFor}</p>
		</section>
	{/if}

	{#if performer?.videoHighlights && performer.videoHighlights.length > 0}
		<section class="detail-section">
			<h2 class="section-label">HIGHLIGHTS</h2>
			<div class="highlights-list">
				{#each performer.videoHighlights as url}
					{@const embedUrl = getYoutubeEmbedUrl(url)}
					{#if embedUrl}
						<div class="embed-wrap">
							<iframe
								src={embedUrl}
								title="Video highlight"
								frameborder="0"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowfullscreen
							></iframe>
						</div>
					{:else if isImageUrl(url)}
						<img src={url} alt="Highlight" class="highlight-img" />
					{:else}
						<a href={url} target="_blank" rel="noopener noreferrer" class="highlight-link">
							<Globe size={14} /> {url}
						</a>
					{/if}
				{/each}
			</div>
		</section>
	{/if}

	{#if memberships.length > 0}
		<section class="detail-section">
			<h2 class="section-label">TEAMS</h2>
			<div class="member-list">
				{#each memberships as m}
					<a href="/teams/{m.teamSlug}" class="member-row">
						{#if m.teamPhotoUrl}
							<img src={m.teamPhotoUrl} alt={m.teamName} class="team-thumb" />
						{:else}
							<div class="team-thumb team-thumb-placeholder">
								<Users size={16} />
							</div>
						{/if}
						<div>
							<p class="member-name">{m.teamName}</p>
							{#if m.startYear}
								<p class="member-date">
									{formatDateRange(m.startYear, m.startMonth, m.endYear, m.endMonth, m.isCurrent)}
								</p>
							{/if}
						</div>
						{#if m.teamStatus === 'stub'}
							<span class="zine-tag tag-warning ml-auto">UNCLAIMED</span>
						{/if}
					</a>
				{/each}
			</div>
		</section>
	{/if}
</div>

<style>
	.detail-page {
		max-width: 768px;
		margin: 0 auto;
		padding: 48px 32px;
	}

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

	.avatar-name {
		display: flex;
		align-items: flex-start;
		gap: 20px;
		flex: 1;
	}

	.avatar {
		width: 80px;
		height: 80px;
		object-fit: cover;
		border: var(--zine-border);
		flex-shrink: 0;
	}

	.avatar-placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--zine-accent);
		color: #fff;
		font-size: 28px;
		font-weight: 700;
		font-family: var(--font-body);
	}

	.name-block {
		flex: 1;
	}

	.profile-name {
		font-family: var(--font-heading);
		font-size: 32px;
		color: var(--zine-primary);
		margin-bottom: 8px;
	}

	.tag-row {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-bottom: 8px;
	}

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

	.tag-accent { background: var(--zine-muted); color: #fff; }
	.tag-warning { background: var(--zine-accent); color: #fff; }

	.tag-warning {
		color: #b45309;
		border-color: #b45309;
	}

	.social-link {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.08em;
		color: var(--zine-primary);
		text-decoration: none;
		border: 1px solid var(--zine-primary);
		padding: 2px 8px;
		opacity: 0.7;
	}

	.social-link:hover {
		opacity: 1;
		color: var(--zine-muted);
		border-color: var(--zine-muted);
	}

	.header-actions {
		flex-shrink: 0;
	}

	/* SECTIONS */
	.detail-section {
		margin-bottom: 24px;
		padding-bottom: 24px;
		border-bottom: 1px solid var(--zine-surface);
	}

	.section-label {
		font-family: var(--font-body);
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.12em;
		color: var(--zine-muted);
		margin-bottom: 8px;
	}

	.section-body {
		font-size: 15px;
		line-height: 1.7;
		white-space: pre-line;
	}

	.profile-url-row {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 24px;
		padding: 8px 12px;
		background: var(--zine-surface);
		border: var(--zine-border);
		flex-wrap: wrap;
	}

	.profile-url-text {
		font-size: 11px;
		color: var(--zine-muted);
		word-break: break-all;
		flex: 1;
	}

	.btn-copy {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-family: var(--font-body);
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.08em;
		color: var(--zine-primary);
		border: 1px solid var(--zine-primary);
		background: transparent;
		padding: 4px 10px;
		cursor: pointer;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.btn-copy:hover { background: var(--zine-primary); color: var(--zine-bg); }

	.highlights-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.embed-wrap {
		position: relative;
		width: 100%;
		padding-bottom: 56.25%;
		height: 0;
	}

	.embed-wrap iframe {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		border: var(--zine-border);
	}

	.highlight-img {
		max-width: 100%;
		border: var(--zine-border);
	}

	.highlight-link {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		color: var(--zine-muted);
		text-decoration: none;
		word-break: break-all;
	}

	.highlight-link:hover { color: var(--zine-accent); }

	/* MEMBER LIST */
	.member-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

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

	.member-row:hover {
		box-shadow: var(--zine-shadow);
		transform: translate(-1px, -1px);
	}

	.team-thumb {
		width: 40px;
		height: 40px;
		object-fit: cover;
		border: 1px solid var(--zine-primary);
		flex-shrink: 0;
	}

	.team-thumb-placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--zine-primary);
		color: var(--zine-bg);
	}

	.member-name {
		font-size: 14px;
		font-weight: 700;
	}

	.member-date {
		font-size: 11px;
		opacity: 0.6;
	}

	@media (max-width: 640px) {
		.detail-page { padding: 24px 16px; }
		.profile-header { flex-direction: column; }
		.avatar-name { flex-direction: column; }
	}
</style>

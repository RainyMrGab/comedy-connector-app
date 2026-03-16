<script lang="ts">
	import type { PageData } from './$types';
	import { Pencil, Sparkles, UserCheck } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();
	let profile = $derived(data.profile);
	let performer = $derived(data.performer);
	let coach = $derived(data.coach);
</script>

<svelte:head>
	<title>My Profile | Comedy Connector</title>
</svelte:head>

<div class="profile-page">
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
					{#if coach}
						<span class="zine-tag tag-muted"><UserCheck size={10} /> COACH</span>
					{/if}
				</div>
			</div>
		</div>
		<a href="/profile/edit" class="btn-outline">
			<Pencil size={16} /> EDIT PROFILE
		</a>
	</div>

	{#if profile.bio}
		<section class="detail-section">
			<h2 class="section-label">BIO</h2>
			<p class="section-body">{profile.bio}</p>
		</section>
	{/if}

	{#if profile.training}
		<section class="detail-section">
			<h2 class="section-label">TRAINING</h2>
			<p class="section-body">{profile.training}</p>
		</section>
	{/if}

	{#if profile.lookingFor}
		<section class="detail-section">
			<h2 class="section-label">LOOKING FOR</h2>
			<p class="section-body">{profile.lookingFor}</p>
		</section>
	{/if}

	<div class="profile-actions">
		<a href="/profile/performer" class="zine-card-link">
			<div class="card-tag">PERFORMER</div>
			<p class="card-action-label">
				{performer ? 'EDIT PERFORMER PROFILE' : 'ADD PERFORMER PROFILE'}
			</p>
			<span class="card-go">→</span>
		</a>
		<a href="/profile/coach" class="zine-card-link">
			<div class="card-tag">COACH</div>
			<p class="card-action-label">
				{coach ? 'EDIT COACH PROFILE' : 'ADD COACH PROFILE'}
			</p>
			<span class="card-go">→</span>
		</a>
	</div>
</div>

<style>
	.profile-page { max-width: 768px; margin: 0 auto; padding: 48px 32px; }
	.profile-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; padding: 24px; background: var(--zine-surface); border: var(--zine-border); box-shadow: var(--zine-shadow); margin-bottom: 32px; flex-wrap: wrap; }
	.avatar-name { display: flex; align-items: flex-start; gap: 16px; }
	.avatar { width: 72px; height: 72px; object-fit: cover; border: var(--zine-border); flex-shrink: 0; }
	.avatar-placeholder { display: flex; align-items: center; justify-content: center; background: var(--zine-accent); color: #fff; font-size: 24px; font-weight: 700; }
	.name-block { flex: 1; }
	.profile-name { font-family: var(--font-heading); font-size: 28px; color: var(--zine-primary); margin-bottom: 8px; }
	.tag-row { display: flex; flex-wrap: wrap; gap: 6px; }
	.zine-tag { font-family: var(--font-body); font-size: 9px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; background: var(--zine-primary); color: var(--zine-bg); padding: 2px 8px; display: inline-flex; align-items: center; gap: 4px; }
	.tag-accent { background: var(--zine-muted); color: #fff; }
	.tag-muted { background: var(--zine-muted); color: #fff; }
	.detail-section { margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid var(--zine-surface); }
	.section-label { font-family: var(--font-body); font-size: 10px; font-weight: 700; letter-spacing: 0.12em; color: var(--zine-muted); margin-bottom: 8px; }
	.section-body { font-size: 15px; line-height: 1.7; white-space: pre-line; }
	.profile-actions { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 32px; }
	.zine-card-link { flex: 1; min-width: 160px; background: var(--zine-surface); border: var(--zine-border); box-shadow: var(--zine-shadow); padding: 20px; text-decoration: none; color: var(--zine-primary); display: flex; flex-direction: column; gap: 8px; transition: transform 0.1s, box-shadow 0.1s; }
	.zine-card-link:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0px var(--zine-primary); }
	.card-tag { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; color: var(--zine-muted); border: 1px solid var(--zine-muted); padding: 2px 8px; width: fit-content; }
	.card-action-label { font-family: var(--font-body); font-size: 13px; font-weight: 700; letter-spacing: 0.06em; margin: 0; }
	.card-go { font-size: 16px; color: var(--zine-accent); }
</style>

<script lang="ts">
	import { cityConfig } from '$config/city';
	import { Mic2, Users, UserCheck } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Connect | {cityConfig.name} Comedy Connector</title>
	<meta
		name="description"
		content="Connect with {cityConfig.name}'s comedy community — find book openers, join a team, or hire a coach."
	/>
</svelte:head>

<div class="connect-page">
	<h1 class="page-title">WHAT DO YOU NEED?</h1>
	<div class="connect-grid">
		<a href="/connect/book-opener" class="zine-card">
			<div class="card-tag">BOOKING</div>
			<div class="card-icon"><Mic2 size={28} /></div>
			<h2 class="card-label">BOOK AN OPENER</h2>
			<p class="card-desc">Discover performers available to open your show or headline as a book opener.</p>
			<span class="card-go">→ GO</span>
		</a>
		<a href="/connect/join-team" class="zine-card">
			<div class="card-tag">TEAMS</div>
			<div class="card-icon"><Users size={28} /></div>
			<h2 class="card-label">JOIN A TEAM</h2>
			<p class="card-desc">Find teams that are open to new members and looking to grow their roster.</p>
			<span class="card-go">→ GO</span>
		</a>
		<a href="/connect/find-coach" class="zine-card">
			<div class="card-tag">COACHING</div>
			<div class="card-icon"><UserCheck size={28} /></div>
			<h2 class="card-label">FIND A COACH</h2>
			<p class="card-desc">Connect with coaches offering private sessions, team coaching, or workshops.</p>
			<span class="card-go">→ GO</span>
		</a>
	</div>
</div>

<style>
	.connect-page { max-width: 1024px; margin: 0 auto; padding: 64px 48px; }
	.page-title { font-family: var(--font-heading); font-size: 48px; color: var(--zine-primary); transform: rotate(-1deg); display: inline-block; margin-bottom: 40px; }
	.connect-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
	.zine-card { background: var(--zine-surface); border: var(--zine-border); box-shadow: var(--zine-shadow); padding: 32px; display: flex; flex-direction: column; gap: 12px; text-decoration: none; color: var(--zine-primary); transition: transform 0.1s, box-shadow 0.1s; }
	.zine-card:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0px var(--zine-primary); }
	.card-tag { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; color: var(--zine-muted); border: 1px solid var(--zine-muted); display: inline-block; padding: 2px 8px; width: fit-content; }
	.card-icon { color: var(--zine-accent); }
	.card-label { font-family: var(--font-body); font-size: 15px; font-weight: 700; letter-spacing: 0.06em; margin: 0; }
	.card-desc { font-size: 13px; line-height: 1.6; opacity: 0.8; margin: 0; }
	.card-go { font-size: 12px; font-weight: 700; letter-spacing: 0.08em; color: var(--zine-muted); margin-top: 4px; }
	@media (max-width: 768px) { .connect-page { padding: 48px 24px; } .connect-grid { grid-template-columns: 1fr; } }
</style>

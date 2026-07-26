<script lang="ts">
	import { cityConfig } from '$config/city';
</script>

<svelte:head>
	<title>Terms of Service | {cityConfig.name} Comedy Connector</title>
	<meta name="description" content="Terms of service for {cityConfig.name} Comedy Connector." />
</svelte:head>

<div class="legal-page">
	<h1 class="page-title">TERMS OF SERVICE</h1>
	<p class="page-sub">Last updated {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>

	<div class="legal-body">
		<h2>What this is</h2>
		<p>
			{cityConfig.name} Comedy Connector is a free, community-run, open-source directory connecting
			local performers, coaches, and teams. It's run as a volunteer project, not a company, and is
			provided as-is with no warranty of any kind.
		</p>

		<h2>Your content</h2>
		<p>
			You're responsible for anything you post to your profile — bios, photos, links, and team
			info. Don't post anything that isn't yours to post, or that's abusive, misleading, or
			illegal. We may remove content or accounts that violate this.
		</p>

		<h2>Accounts</h2>
		<p>
			You need a valid account to create or manage profiles. Team ownership and membership follow
			the approval flow built into the app — team admins approve who joins as a performer or coach
			under their team.
		</p>

		<h2>No guarantees</h2>
		<p>
			This is a small side project. We do our best to keep it running and your data safe, but we
			can't promise the service will always be available, bug-free, or permanent. Back up anything
			important elsewhere.
		</p>

		<h2>Open source</h2>
		<p>
			The code that runs this site is public under the license in the
			<a href="https://github.com/RainyMrGab/comedy-connector-app/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">GitHub repository</a>.
			Questions or concerns can go through the <a href="/feedback">feedback form</a> or
			<a href="https://github.com/RainyMrGab/comedy-connector-app/issues" target="_blank" rel="noopener noreferrer">GitHub issues</a>.
		</p>
	</div>
</div>

<style>
	.legal-page { max-width: 720px; margin: 0 auto; padding: 48px 32px; }
	.page-title { font-family: var(--font-heading); font-size: 40px; color: var(--zine-primary); transform: rotate(-1deg); display: inline-block; margin-bottom: 8px; }
	.page-sub { font-size: 13px; opacity: 0.6; margin-bottom: 40px; }
	.legal-body { font-size: 14px; line-height: 1.7; }
	.legal-body h2 { font-family: var(--font-heading); font-size: 20px; color: var(--zine-primary); margin-top: 32px; margin-bottom: 8px; }
	.legal-body h2:first-child { margin-top: 0; }
	.legal-body p { margin-bottom: 12px; }
	.legal-body a { color: var(--zine-muted); text-decoration: underline; }
</style>

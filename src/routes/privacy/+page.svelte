<script lang="ts">
	import { cityConfig } from '$config/city';
</script>

<svelte:head>
	<title>Privacy Policy | {cityConfig.name} Comedy Connector</title>
	<meta name="description" content="How {cityConfig.name} Comedy Connector handles your data." />
</svelte:head>

<div class="legal-page">
	<h1 class="page-title">PRIVACY POLICY</h1>
	<p class="page-sub">Last updated {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>

	<div class="legal-body">
		<h2>What we collect</h2>
		<p>
			When you sign in, we collect your email address and, if you sign in with Google, the basic
			profile info Google shares (name, email, profile photo). If you create a performer, coach,
			or team profile, we store the information you choose to add — bio, photos, links, and
			similar details you enter yourself.
		</p>

		<h2>How we use it</h2>
		<p>
			Your account info is used to run the directory: signing you in, showing your public profile
			to other members of {cityConfig.name}'s comedy community, and sending you emails you've asked
			for (e.g. notifications about your teams, or occasional freshness reminders). We don't sell
			your data or use it for advertising.
		</p>

		<h2>Who we share it with</h2>
		<p>
			We use a small number of service providers to run the app: <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">Supabase</a>
			for authentication and our database, <a href="https://resend.com" target="_blank" rel="noopener noreferrer">Resend</a>
			for sending emails, and Google for OAuth sign-in if you choose that option. These providers
			only process your data on our behalf to operate the site — they don't get to use it for
			anything else.
		</p>

		<h2>Your choices</h2>
		<p>
			You can edit or remove most of your profile information at any time from your account
			settings. To request deletion of your account entirely, reach out via the
			<a href="https://github.com/RainyMrGab/comedy-connector-app/issues" target="_blank" rel="noopener noreferrer">GitHub issues page</a>
			or the <a href="/feedback">feedback form</a>.
		</p>

		<h2>Questions</h2>
		<p>
			This is a small, open-source, community-run project — not a company. If you have questions
			about your data, the <a href="https://github.com/RainyMrGab/comedy-connector-app" target="_blank" rel="noopener noreferrer">source code is public</a>,
			and you're welcome to reach out via the <a href="/feedback">feedback form</a>.
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

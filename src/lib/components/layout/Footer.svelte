<script lang="ts">
	import { cityConfig } from '$config/city';
</script>

<footer class="zine-footer">
	<div class="footer-inner">
		<div class="footer-grid">
			<!-- Branding -->
			<div>
				<p class="wordmark">{cityConfig.name} Comedy Connector</p>
				<p class="footer-desc">
					Connecting {cityConfig.name}'s comedy community — performers, coaches, and teams.
				</p>
			</div>

			<!-- Explore -->
			<div>
				<p class="footer-heading">EXPLORE</p>
				<ul class="footer-links">
					<li><a href="/performers">Performers</a></li>
					<li><a href="/coaches">Coaches</a></li>
					<li><a href="/teams">Teams</a></li>
					<li><a href="/connect">Connect</a></li>
					<li><a href="/resources">Resources</a></li>
				</ul>
			</div>

			<!-- Account -->
			<div>
				<p class="footer-heading">ACCOUNT</p>
				<ul class="footer-links">
					<li><a href="/profile">My Profile</a></li>
					<li><a href="/profile/edit">Edit Profile</a></li>
					<li><a href="/approvals">Approvals</a></li>
				</ul>
			</div>
		</div>

		<div class="footer-bottom">
			<p>&copy; {new Date().getFullYear()} Comedy Connector — {cityConfig.name}</p>
			<p>
				<a href="https://github.com/RainyMrGab/comedy-connector-app/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">Open source</a>
				·
				<a href="https://github.com/RainyMrGab/comedy-connector-app/issues" target="_blank" rel="noopener noreferrer">Report a bug</a>
				·
				<a href="/feedback">Feedback</a>
				·
				<a href="https://www.paypal.com/paypalme/bmgray84" target="_blank" rel="noopener noreferrer">Support this project</a>
				·
				<a href="https://github.com/RainyMrGab/comedy-connector-app#add-your-city" target="_blank" rel="noopener noreferrer">Add your city</a>
			</p>
		</div>
	</div>
</footer>

<style>
	.zine-footer {
		background: var(--zine-primary);
		color: var(--zine-bg);
		border-top: var(--zine-border);
		margin-top: auto;
	}

	.footer-inner {
		max-width: 1280px;
		margin: 0 auto;
		padding: 40px 32px 24px;
	}

	.footer-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 32px;
	}

	@media (min-width: 640px) {
		.footer-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.wordmark {
		font-family: var(--font-heading);
		font-size: 18px;
		color: var(--zine-highlight);
		margin-bottom: 8px;
	}

	.footer-desc {
		font-size: 13px;
		opacity: 0.7;
		line-height: 1.6;
	}

	.footer-heading {
		font-family: var(--font-body);
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.12em;
		color: var(--zine-highlight);
		margin-bottom: 12px;
	}

	.footer-links {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.footer-links a {
		font-size: 13px;
		color: var(--zine-bg);
		text-decoration: none;
		opacity: 0.8;
	}

	.footer-links a:hover {
		color: var(--zine-highlight);
		opacity: 1;
	}

	.footer-bottom {
		margin-top: 32px;
		padding-top: 20px;
		border-top: 1px solid rgba(244, 239, 230, 0.2);
		display: flex;
		flex-direction: column;
		gap: 8px;
		font-size: 11px;
		opacity: 0.6;
		letter-spacing: 0.05em;
	}

	@media (min-width: 640px) {
		.footer-bottom {
			flex-direction: row;
			justify-content: space-between;
		}
	}

	.footer-bottom a {
		color: var(--zine-bg);
		text-decoration: none;
	}

	.footer-bottom a:hover {
		color: var(--zine-highlight);
	}
</style>

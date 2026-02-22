<script lang="ts">
	import { cityConfig } from '$config/city';
</script>

<footer class="bg-surface-900 text-surface-300 border-t border-surface-700 mt-auto">
	<div class="mx-auto max-w-7xl px-4 py-8">
		<div class="grid grid-cols-1 gap-8 sm:grid-cols-3">
			<!-- Branding -->
			<div>
				<p class="text-surface-50 font-semibold text-lg">🎭 {cityConfig.name} Comedy Connector</p>
				<p class="mt-2 text-sm">
					Connecting {cityConfig.name}'s comedy community — performers, coaches, and teams.
				</p>
			</div>

			<!-- Navigation -->
			<div>
				<p class="text-surface-50 font-semibold mb-3">Explore</p>
				<ul class="space-y-2 text-sm">
					<li><a href="/performers" class="hover:text-primary-400 transition-colors">Performers</a></li>
					<li><a href="/coaches" class="hover:text-primary-400 transition-colors">Coaches</a></li>
					<li><a href="/teams" class="hover:text-primary-400 transition-colors">Teams</a></li>
					<li><a href="/connect" class="hover:text-primary-400 transition-colors">Connect</a></li>
					<li><a href="/resources" class="hover:text-primary-400 transition-colors">Resources</a></li>
				</ul>
			</div>

			<!-- Account -->
			<div>
				<p class="text-surface-50 font-semibold mb-3">Account</p>
				<ul class="space-y-2 text-sm">
					<li><a href="/profile" class="hover:text-primary-400 transition-colors">My Profile</a></li>
					<li><a href="/profile/edit" class="hover:text-primary-400 transition-colors">Edit Profile</a></li>
					<li><a href="/approvals" class="hover:text-primary-400 transition-colors">Approvals</a></li>
				</ul>
			</div>
		</div>

		<div class="mt-8 border-t border-surface-700 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
			<p>&copy; {new Date().getFullYear()} Comedy Connector — {cityConfig.name} Instance</p>
			<p>
				Open source · Built with ❤️ for the comedy community ·
				<a
					href="https://github.com/RainyMrGab/comedy-connector-app"
					class="hover:text-primary-400 transition-colors"
					target="_blank"
					rel="noopener noreferrer"
				>
					GitHub
				</a>
			</p>
		</div>
	</div>
</footer>

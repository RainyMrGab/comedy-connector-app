<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let profile = $derived(data.profile);

	let saving = $state(false);
</script>

<svelte:head>
	<title>{profile ? 'Edit Profile' : 'Create Profile'} | Comedy Connector</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-4 py-10">
	<h1 class="text-2xl font-bold text-surface-900 dark:text-surface-50 mb-8">
		{profile ? 'Edit Your Profile' : 'Create Your Profile'}
	</h1>

	{#if form?.error}
		<div class="alert preset-filled-error-500 mb-6">{form.error}</div>
	{/if}

	<form
		method="POST"
		use:enhance={() => {
			saving = true;
			return async ({ update }) => {
				await update();
				saving = false;
			};
		}}
		class="space-y-6"
	>
		<!-- Name -->
		<div>
			<label for="name" class="label">
				<span>Display Name <span class="text-error-500">*</span></span>
			</label>
			<input
				id="name"
				name="name"
				type="text"
				class="input {form?.errors?.name ? 'input-error' : ''}"
				value={form?.values?.name ?? profile?.name ?? ''}
				required
				placeholder="Your name as you want it displayed"
			/>
			{#if form?.errors?.name}
				<p class="text-error-500 text-xs mt-1">{form.errors.name[0]}</p>
			{/if}
		</div>

		<!-- Bio -->
		<div>
			<label for="bio" class="label"><span>Bio</span></label>
			<textarea
				id="bio"
				name="bio"
				class="textarea"
				rows="4"
				placeholder="Tell the community about yourself..."
			>{form?.values?.bio ?? profile?.bio ?? ''}</textarea>
		</div>

		<!-- Training -->
		<div>
			<label for="training" class="label">
				<span>Training & Experience</span>
			</label>
			<textarea
				id="training"
				name="training"
				class="textarea"
				rows="4"
				placeholder="Where have you trained? Any notable experience?"
			>{form?.values?.training ?? profile?.training ?? ''}</textarea>
		</div>

		<!-- Looking For -->
		<div>
			<label for="lookingFor" class="label"><span>Looking For</span></label>
			<input
				id="lookingFor"
				name="lookingFor"
				type="text"
				class="input"
				value={form?.values?.lookingFor ?? profile?.lookingFor ?? ''}
				placeholder="e.g. Team to join, coach, book opener gigs..."
			/>
		</div>

		<!-- Contact Email -->
		<div>
			<label for="contactEmail" class="label">
				<span>Contact Email</span>
				<small class="text-surface-400">(optional, shown to logged-in users who contact you)</small>
			</label>
			<input
				id="contactEmail"
				name="contactEmail"
				type="email"
				class="input"
				value={form?.values?.contactEmail ?? profile?.contactEmail ?? ''}
				placeholder="Different from your login email if desired"
			/>
		</div>

		<!-- Social Links -->
		<fieldset class="border border-surface-300 dark:border-surface-600 rounded-lg p-4">
			<legend class="px-2 text-sm font-semibold text-surface-600 dark:text-surface-300">Social Links</legend>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
				{#each ['instagram', 'tiktok', 'youtube', 'facebook', 'twitter', 'website'] as platform}
					<div>
						<label for={platform} class="label capitalize"><span>{platform}</span></label>
						<input
							id={platform}
							name={platform}
							type="url"
							class="input"
							value={profile?.socialLinks?.[platform] ?? ''}
							placeholder="https://..."
						/>
					</div>
				{/each}
			</div>
		</fieldset>

		<!-- Freshness Reminders -->
		<div class="flex items-center gap-3">
			<input
				id="freshnessReminders"
				name="freshnessRemindersEnabled"
				type="checkbox"
				class="checkbox"
				value="true"
				checked={profile?.freshnessRemindersEnabled ?? true}
			/>
			<label for="freshnessReminders" class="text-sm text-surface-700 dark:text-surface-300">
				Send me monthly reminders to keep my profile fresh
			</label>
		</div>

		<div class="flex gap-4 pt-4">
			<button type="submit" class="btn preset-filled-primary-500" disabled={saving}>
				{saving ? 'Saving…' : 'Save Profile'}
			</button>
			{#if profile}
				<a href="/profile" class="btn preset-tonal-surface">Cancel</a>
			{/if}
		</div>
	</form>
</div>

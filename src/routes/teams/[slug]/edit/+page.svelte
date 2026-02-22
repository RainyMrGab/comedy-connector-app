<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let team = $derived(data.team);
	let members = $derived(data.members);
	let coaches = $derived(data.coaches);

	let savingTeam = $state(false);
	let addingMember = $state(false);
	let addingCoach = $state(false);

	// Combobox state for performer search
	let memberSearch = $state('');
	let coachSearch = $state('');
	let memberResults = $state<Array<{ id: string; name: string; slug: string }>>([]);
	let coachResults = $state<Array<{ id: string; name: string; slug: string }>>([]);
	let selectedMember = $state<{ id: string; name: string } | null>(null);
	let selectedCoach = $state<{ id: string; name: string } | null>(null);

	async function searchPerformers(query: string) {
		if (!query.trim()) { memberResults = []; return; }
		const res = await fetch(`/api/profiles/search?q=${encodeURIComponent(query)}&type=performer`);
		if (res.ok) memberResults = await res.json();
	}

	async function searchCoaches(query: string) {
		if (!query.trim()) { coachResults = []; return; }
		const res = await fetch(`/api/profiles/search?q=${encodeURIComponent(query)}&type=coach`);
		if (res.ok) coachResults = await res.json();
	}
</script>

<svelte:head>
	<title>Edit {team.name} | Comedy Connector</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-10">
	<div class="flex items-center justify-between mb-8">
		<h1 class="text-2xl font-bold text-surface-900 dark:text-surface-50">Edit Team: {team.name}</h1>
		<a href="/teams/{team.slug}" class="btn preset-tonal-surface">View Team</a>
	</div>

	{#if form?.error}
		<div class="alert preset-filled-error-500 mb-6">{form.error}</div>
	{/if}

	<!-- Team Details -->
	<section class="mb-10">
		<h2 class="text-lg font-semibold text-surface-800 dark:text-surface-100 mb-4">Team Details</h2>
		<form
			method="POST"
			action="?/updateTeam"
			use:enhance={() => {
				savingTeam = true;
				return async ({ update }) => { await update(); savingTeam = false; };
			}}
			class="space-y-4"
		>
			<div>
				<label for="description" class="label"><span>Description</span></label>
				<textarea id="description" name="description" class="textarea" rows="4">
					{team.description ?? ''}
				</textarea>
			</div>
			<div class="grid grid-cols-2 gap-4">
				<div>
					<label for="form" class="label"><span>Form / Style</span></label>
					<input id="form" name="form" type="text" class="input" value={team.form ?? ''} />
				</div>
				<div>
					<label for="videoUrl" class="label"><span>Video URL</span></label>
					<input id="videoUrl" name="videoUrl" type="url" class="input" value={team.videoUrl ?? ''} />
				</div>
			</div>
			<div class="flex flex-wrap gap-4">
				{#each [['isPracticeGroup', 'Practice Group'], ['openToNewMembers', 'Open to Members'], ['openToBookOpeners', 'Open to Book Openers'], ['seekingCoach', 'Seeking Coach']] as [name, label]}
					<label class="flex items-center gap-2 cursor-pointer">
						<input type="checkbox" class="checkbox" {name} value="true" checked={(team as any)[name]} />
						<span class="text-sm">{label}</span>
					</label>
				{/each}
			</div>
			<div>
				<label for="lookingFor" class="label"><span>Looking For</span></label>
				<input id="lookingFor" name="lookingFor" type="text" class="input" value={team.lookingFor ?? ''} />
			</div>
			<button type="submit" class="btn preset-filled-tertiary-500" disabled={savingTeam}>
				{savingTeam ? 'Saving…' : 'Save Changes'}
			</button>
		</form>
	</section>

	<!-- Members -->
	<section class="mb-10">
		<h2 class="text-lg font-semibold text-surface-800 dark:text-surface-100 mb-4">Members</h2>

		<!-- Existing members -->
		<div class="mb-4 space-y-2">
			{#each members as member}
				<div class="flex items-center justify-between p-3 rounded-lg bg-surface-100 dark:bg-surface-700">
					<div>
						<span class="font-medium text-sm">{member.name ?? member.memberName ?? 'Unknown'}</span>
						{#if member.approvalStatus === 'pending'}
							<span class="chip preset-tonal-warning text-xs ml-2">Pending</span>
						{/if}
					</div>
					<form method="POST" action="?/removeMember" use:enhance>
						<input type="hidden" name="memberId" value={member.id} />
						<button type="submit" class="btn preset-tonal-error btn-sm">Remove</button>
					</form>
				</div>
			{/each}
		</div>

		<!-- Add member form -->
		<form
			method="POST"
			action="?/addMember"
			use:enhance={() => {
				addingMember = true;
				return async ({ update }) => {
					await update();
					addingMember = false;
					memberSearch = '';
					selectedMember = null;
					memberResults = [];
				};
			}}
			class="border border-surface-300 dark:border-surface-600 rounded-lg p-4 space-y-3"
		>
			<p class="text-sm font-semibold text-surface-600 dark:text-surface-300">Add Member</p>
			<!-- Performer combobox -->
			<div class="relative">
				<label for="memberSearch" class="label text-xs"><span>Search app users</span></label>
				<input
					id="memberSearch"
					type="text"
					class="input"
					placeholder="Type a name to search performers..."
					bind:value={memberSearch}
					oninput={() => searchPerformers(memberSearch)}
					autocomplete="off"
				/>
				{#if memberResults.length > 0}
					<div class="absolute z-10 w-full bg-surface-50 dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg shadow-lg mt-1">
						{#each memberResults as result}
							<button
								type="button"
								class="w-full text-left px-4 py-2 text-sm hover:bg-surface-200 dark:hover:bg-surface-700"
								onclick={() => {
									selectedMember = { id: result.id, name: result.name };
									memberSearch = result.name;
									memberResults = [];
								}}
							>{result.name}</button>
						{/each}
					</div>
				{/if}
				{#if selectedMember}
					<input type="hidden" name="profileId" value={selectedMember.id} />
				{/if}
			</div>
			<div>
				<label for="memberName" class="label text-xs"><span>Or add by name only (non-app user)</span></label>
				<input id="memberName" name="memberName" type="text" class="input" placeholder="Full name..." />
			</div>
			<button type="submit" class="btn preset-tonal-primary btn-sm" disabled={addingMember}>
				{addingMember ? 'Adding…' : 'Add Member'}
			</button>
		</form>
	</section>

	<!-- Coaches -->
	<section class="mb-10">
		<h2 class="text-lg font-semibold text-surface-800 dark:text-surface-100 mb-4">Coaches</h2>
		<div class="mb-4 space-y-2">
			{#each coaches as coach}
				<div class="flex items-center justify-between p-3 rounded-lg bg-surface-100 dark:bg-surface-700">
					<div>
						<span class="font-medium text-sm">{coach.name ?? coach.coachName ?? 'Unknown'}</span>
						{#if coach.approvalStatus === 'pending'}
							<span class="chip preset-tonal-warning text-xs ml-2">Pending</span>
						{/if}
					</div>
					<form method="POST" action="?/removeCoach" use:enhance>
						<input type="hidden" name="coachId" value={coach.id} />
						<button type="submit" class="btn preset-tonal-error btn-sm">Remove</button>
					</form>
				</div>
			{/each}
		</div>

		<form
			method="POST"
			action="?/addCoach"
			use:enhance={() => {
				addingCoach = true;
				return async ({ update }) => {
					await update();
					addingCoach = false;
					coachSearch = '';
					selectedCoach = null;
					coachResults = [];
				};
			}}
			class="border border-surface-300 dark:border-surface-600 rounded-lg p-4 space-y-3"
		>
			<p class="text-sm font-semibold text-surface-600 dark:text-surface-300">Add Coach</p>
			<div class="relative">
				<label for="coachSearch" class="label text-xs"><span>Search coaches</span></label>
				<input
					id="coachSearch"
					type="text"
					class="input"
					placeholder="Type a name to search coaches..."
					bind:value={coachSearch}
					oninput={() => searchCoaches(coachSearch)}
					autocomplete="off"
				/>
				{#if coachResults.length > 0}
					<div class="absolute z-10 w-full bg-surface-50 dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg shadow-lg mt-1">
						{#each coachResults as result}
							<button
								type="button"
								class="w-full text-left px-4 py-2 text-sm hover:bg-surface-200 dark:hover:bg-surface-700"
								onclick={() => {
									selectedCoach = { id: result.id, name: result.name };
									coachSearch = result.name;
									coachResults = [];
								}}
							>{result.name}</button>
						{/each}
					</div>
				{/if}
				{#if selectedCoach}
					<input type="hidden" name="profileId" value={selectedCoach.id} />
				{/if}
			</div>
			<div>
				<label for="coachName" class="label text-xs"><span>Or add by name only (non-app user)</span></label>
				<input id="coachName" name="coachName" type="text" class="input" placeholder="Full name..." />
			</div>
			<button type="submit" class="btn preset-tonal-secondary btn-sm" disabled={addingCoach}>
				{addingCoach ? 'Adding…' : 'Add Coach'}
			</button>
		</form>
	</section>
</div>

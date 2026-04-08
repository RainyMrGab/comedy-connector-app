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
	let memberResults = $state<Array<{ id: string; name: string; slug: string; photoUrl: string | null }>>([]);
	let coachResults = $state<Array<{ id: string; name: string; slug: string; photoUrl: string | null }>>([]);
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

<div class="edit-page">
	<div class="page-top">
		<h1 class="page-title">EDIT TEAM</h1>
		<a href="/teams/{team.slug}" class="btn-outline">VIEW TEAM</a>
	</div>

	{#if form?.error}
		<div class="form-error-banner">{form.error}</div>
	{/if}

	<!-- Team Details -->
	<section class="edit-section">
		<h2 class="section-label">TEAM DETAILS</h2>
		<form
			method="POST"
			action="?/updateTeam"
			use:enhance={() => {
				savingTeam = true;
				return async ({ update }) => { await update(); savingTeam = false; };
			}}
			class="zine-form"
		>
			<div class="form-field">
				<label for="description">DESCRIPTION</label>
				<textarea id="description" name="description" rows="4">{team.description ?? ''}</textarea>
			</div>
			<div class="form-field">
				<label for="photoUrl">PHOTO URL <small class="field-hint">(optional)</small></label>
				<input id="photoUrl" name="photoUrl" type="url" value={team.photoUrl ?? ''} placeholder="https://..." />
			</div>
			<div class="two-col">
				<div class="form-field">
					<label for="form">FORM / STYLE</label>
					<input id="form" name="form" type="text" value={team.form ?? ''} />
				</div>
				<div class="form-field">
					<label for="videoUrl">VIDEO URL</label>
					<input id="videoUrl" name="videoUrl" type="url" value={team.videoUrl ?? ''} />
				</div>
			</div>
			<fieldset>
				<legend>TEAM STATUS</legend>
				<div class="checks">
					{#each [['isPracticeGroup', 'Practice group'], ['openToNewMembers', 'Open to members'], ['openToBookOpeners', 'Available to book as opener'], ['seekingCoach', 'Seeking a coach']] as [name, label]}
						<label class="checkbox-label">
							<input type="checkbox" {name} value="true" checked={(team as any)[name]} />
							<span>{label}</span>
						</label>
					{/each}
				</div>
			</fieldset>
			<div class="form-field">
				<label for="lookingFor">LOOKING FOR</label>
				<input id="lookingFor" name="lookingFor" type="text" value={team.lookingFor ?? ''} placeholder="e.g. two strong character improvisers" />
			</div>
			<div>
				<button type="submit" class="btn-accent" disabled={savingTeam}>
					{savingTeam ? 'SAVING…' : 'SAVE CHANGES'}
				</button>
			</div>
		</form>
	</section>

	<!-- Members -->
	<section class="edit-section">
		<h2 class="section-label">MEMBERS</h2>

		<div class="roster-list">
			{#each members as member}
				<div class="roster-row">
					<div class="roster-info">
						<span class="roster-name">{member.name ?? member.memberName ?? 'Unknown'}</span>
						{#if member.approvalStatus === 'pending'}
							<span class="status-tag">PENDING</span>
						{/if}
					</div>
					<form method="POST" action="?/removeMember" use:enhance>
						<input type="hidden" name="memberId" value={member.id} />
						<button type="submit" class="btn-remove">REMOVE</button>
					</form>
				</div>
			{/each}
		</div>

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
			class="subsection zine-form"
		>
			<p class="subsection-title">ADD MEMBER</p>
			<div class="form-field combo-wrap">
				<label for="memberSearch">SEARCH APP USERS</label>
				<input
					id="memberSearch"
					type="text"
					placeholder="Type a name to search performers..."
					bind:value={memberSearch}
					oninput={() => searchPerformers(memberSearch)}
					autocomplete="off"
				/>
				{#if memberResults.length > 0}
					<div class="combo-dropdown">
						{#each memberResults as result}
							<button
								type="button"
								class="combo-option"
								onclick={() => {
									selectedMember = { id: result.id, name: result.name };
									memberSearch = result.name;
									memberResults = [];
								}}
							>
								{#if result.photoUrl}
									<img src={result.photoUrl} alt="" class="combo-avatar" />
								{:else}
									<div class="combo-avatar combo-avatar-placeholder">{result.name[0]?.toUpperCase() ?? '?'}</div>
								{/if}
								{result.name}
							</button>
						{/each}
					</div>
				{/if}
				{#if selectedMember}
					<input type="hidden" name="profileId" value={selectedMember.id} />
				{/if}
			</div>
			<div class="form-field">
				<label for="memberName">OR ADD BY NAME ONLY <small class="field-hint">(non-app user)</small></label>
				<input id="memberName" name="memberName" type="text" placeholder="Full name..." />
			</div>
			<div>
				<button type="submit" class="btn-accent" disabled={addingMember}>
					{addingMember ? 'ADDING…' : 'ADD MEMBER'}
				</button>
			</div>
		</form>
	</section>

	<!-- Coaches -->
	<section class="edit-section">
		<h2 class="section-label">COACHES</h2>
		<div class="roster-list">
			{#each coaches as coach}
				<div class="roster-row">
					<div class="roster-info">
						<span class="roster-name">{coach.name ?? coach.coachName ?? 'Unknown'}</span>
						{#if coach.approvalStatus === 'pending'}
							<span class="status-tag">PENDING</span>
						{/if}
					</div>
					<form method="POST" action="?/removeCoach" use:enhance>
						<input type="hidden" name="coachId" value={coach.id} />
						<button type="submit" class="btn-remove">REMOVE</button>
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
			class="subsection zine-form"
		>
			<p class="subsection-title">ADD COACH</p>
			<div class="form-field combo-wrap">
				<label for="coachSearch">SEARCH COACHES</label>
				<input
					id="coachSearch"
					type="text"
					placeholder="Type a name to search coaches..."
					bind:value={coachSearch}
					oninput={() => searchCoaches(coachSearch)}
					autocomplete="off"
				/>
				{#if coachResults.length > 0}
					<div class="combo-dropdown">
						{#each coachResults as result}
							<button
								type="button"
								class="combo-option"
								onclick={() => {
									selectedCoach = { id: result.id, name: result.name };
									coachSearch = result.name;
									coachResults = [];
								}}
							>
								{#if result.photoUrl}
									<img src={result.photoUrl} alt="" class="combo-avatar" />
								{:else}
									<div class="combo-avatar combo-avatar-placeholder">{result.name[0]?.toUpperCase() ?? '?'}</div>
								{/if}
								{result.name}
							</button>
						{/each}
					</div>
				{/if}
				{#if selectedCoach}
					<input type="hidden" name="profileId" value={selectedCoach.id} />
				{/if}
			</div>
			<div class="form-field">
				<label for="coachName">OR ADD BY NAME ONLY <small class="field-hint">(non-app user)</small></label>
				<input id="coachName" name="coachName" type="text" placeholder="Full name..." />
			</div>
			<div>
				<button type="submit" class="btn-accent" disabled={addingCoach}>
					{addingCoach ? 'ADDING…' : 'ADD COACH'}
				</button>
			</div>
		</form>
	</section>
</div>

<style>
	.edit-page { max-width: 720px; margin: 0 auto; padding: 48px 32px; }
	.page-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 32px; }
	.page-title { font-family: var(--font-heading); font-size: 36px; color: var(--zine-primary); transform: rotate(-1deg); display: inline-block; margin: 0; }
	.edit-section { margin-bottom: 48px; }
	.section-label { font-family: var(--font-body); font-size: 10px; font-weight: 700; letter-spacing: 0.12em; color: var(--zine-muted); border-bottom: 1px solid var(--zine-muted); padding-bottom: 6px; margin-bottom: 20px; }
	.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
	.checks { display: flex; flex-direction: column; gap: 10px; margin-top: 10px; }
	.roster-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
	.roster-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: var(--zine-surface); border: var(--zine-border); }
	.roster-info { display: flex; align-items: center; gap: 8px; }
	.roster-name { font-size: 13px; font-weight: 700; }
	.status-tag { font-size: 9px; font-weight: 700; letter-spacing: 0.1em; color: var(--zine-highlight); background: var(--zine-primary); padding: 2px 6px; }
	.btn-remove { font-family: var(--font-body); font-size: 10px; font-weight: 700; letter-spacing: 0.1em; color: var(--zine-accent); border: 1px solid var(--zine-accent); background: transparent; padding: 4px 10px; cursor: pointer; }
	.btn-remove:hover { background: var(--zine-accent); color: #fff; }
	.subsection { border: var(--zine-border); padding: 20px; background: var(--zine-surface); }
	.subsection-title { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; color: var(--zine-muted); margin-bottom: 16px; }
	.combo-wrap { position: relative; }
	.combo-dropdown { position: absolute; z-index: 10; width: 100%; background: var(--zine-bg); border: var(--zine-border); border-top: none; box-shadow: var(--zine-shadow); }
	.combo-option { display: flex; align-items: center; gap: 8px; width: 100%; text-align: left; padding: 8px 12px; font-family: var(--font-body); font-size: 13px; background: transparent; border: none; cursor: pointer; color: var(--zine-primary); }
	.combo-option:hover { background: var(--zine-surface); }
	.combo-avatar { width: 28px; height: 28px; object-fit: cover; border-radius: 0; border: 1px solid var(--zine-primary); flex-shrink: 0; }
	.combo-avatar-placeholder { display: flex; align-items: center; justify-content: center; background: var(--zine-primary); color: var(--zine-bg); font-size: 11px; font-weight: 700; }
	.field-hint { font-size: 10px; font-weight: 400; letter-spacing: 0; text-transform: none; opacity: 0.65; }
	@media (max-width: 500px) { .two-col { grid-template-columns: 1fr; } }
</style>

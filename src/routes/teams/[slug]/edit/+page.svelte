<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import ProfileSearch from '$components/ui/ProfileSearch.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let team = $derived(data.team);
	let members = $derived(data.members);
	let coaches = $derived(data.coaches);

	let savingTeam = $state(false);
	let addingMember = $state(false);
	let addingCoach = $state(false);

	let selectedMember = $state<{ id: string; name: string; slug: string; photoUrl: string | null } | null>(null);
	let selectedCoach = $state<{ id: string; name: string; slug: string; photoUrl: string | null } | null>(null);
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
				<label for="name">TEAM NAME <span class="required">*</span></label>
				<input id="name" name="name" type="text" value={team.name} required />
			</div>
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
						{:else if !member.isCurrent}
							<span class="status-tag status-tag-alumni">ALUMNI</span>
						{/if}
					</div>
					<div class="roster-actions">
						{#if member.approvalStatus === 'approved'}
							<form method="POST" action="?/setMemberStatus" use:enhance>
								<input type="hidden" name="memberId" value={member.id} />
								<input type="hidden" name="isCurrent" value={member.isCurrent ? 'false' : 'true'} />
								<button type="submit" class="btn-toggle">
									{member.isCurrent ? 'SET ALUMNI' : 'SET ACTIVE'}
								</button>
							</form>
						{/if}
						<form method="POST" action="?/removeMember" use:enhance>
							<input type="hidden" name="memberId" value={member.id} />
							<button type="submit" class="btn-remove">REMOVE</button>
						</form>
					</div>
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
					selectedMember = null;
				};
			}}
			class="subsection zine-form"
		>
			<p class="subsection-title">ADD MEMBER</p>
			<ProfileSearch
				type="performer"
				label="SEARCH APP USERS"
				inputId="memberSearch"
				placeholder="Type a name to search performers..."
				fieldName="profileId"
				bind:selected={selectedMember}
			/>
			<div class="form-field">
				<label for="memberName">OR ADD BY NAME ONLY <small class="field-hint">(non-app user)</small></label>
				<input
					id="memberName"
					name="memberName"
					type="text"
					placeholder="Full name..."
					oninput={() => { selectedMember = null; }}
				/>
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
						{:else if !coach.isCurrent}
							<span class="status-tag status-tag-alumni">ALUMNI</span>
						{/if}
					</div>
					<div class="roster-actions">
						{#if coach.approvalStatus === 'approved'}
							<form method="POST" action="?/setCoachStatus" use:enhance>
								<input type="hidden" name="coachId" value={coach.id} />
								<input type="hidden" name="isCurrent" value={coach.isCurrent ? 'false' : 'true'} />
								<button type="submit" class="btn-toggle">
									{coach.isCurrent ? 'SET ALUMNI' : 'SET ACTIVE'}
								</button>
							</form>
						{/if}
						<form method="POST" action="?/removeCoach" use:enhance>
							<input type="hidden" name="coachId" value={coach.id} />
							<button type="submit" class="btn-remove">REMOVE</button>
						</form>
					</div>
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
					selectedCoach = null;
				};
			}}
			class="subsection zine-form"
		>
			<p class="subsection-title">ADD COACH</p>
			<ProfileSearch
				type="coach"
				label="SEARCH COACHES"
				inputId="coachSearch"
				placeholder="Type a name to search coaches..."
				fieldName="profileId"
				bind:selected={selectedCoach}
			/>
			<div class="form-field">
				<label for="coachName">OR ADD BY NAME ONLY <small class="field-hint">(non-app user)</small></label>
				<input
					id="coachName"
					name="coachName"
					type="text"
					placeholder="Full name..."
					oninput={() => { selectedCoach = null; }}
				/>
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
	.required { color: var(--zine-accent); }
	.edit-page { max-width: 720px; margin: 0 auto; padding: 48px 32px; }
	.page-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 32px; }
	.page-title { font-family: var(--font-heading); font-size: 36px; color: var(--zine-primary); transform: rotate(-1deg); display: inline-block; margin: 0; }
	.edit-section { margin-bottom: 48px; }
	.section-label { font-family: var(--font-body); font-size: 10px; font-weight: 700; letter-spacing: 0.12em; color: var(--zine-muted); border-bottom: 1px solid var(--zine-muted); padding-bottom: 6px; margin-bottom: 20px; }
	.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
	.checks { display: flex; flex-direction: column; gap: 10px; }
	.roster-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
	.roster-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 12px 14px; background: var(--zine-surface); border: var(--zine-border); }
	.roster-info { display: flex; align-items: center; gap: 8px; flex: 1; }
	.roster-name { font-size: 13px; font-weight: 700; }
	.roster-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
	.status-tag { font-size: 9px; font-weight: 700; letter-spacing: 0.1em; color: var(--zine-highlight); background: var(--zine-primary); padding: 2px 6px; }
	.status-tag-alumni { background: var(--zine-muted); color: #fff; }
	.btn-toggle { font-family: var(--font-body); font-size: 10px; font-weight: 700; letter-spacing: 0.1em; color: var(--zine-muted); border: 1px solid var(--zine-muted); background: transparent; padding: 4px 10px; cursor: pointer; }
	.btn-toggle:hover { background: var(--zine-muted); color: #fff; }
	.btn-remove { font-family: var(--font-body); font-size: 10px; font-weight: 700; letter-spacing: 0.1em; color: var(--zine-accent); border: 1px solid var(--zine-accent); background: transparent; padding: 4px 10px; cursor: pointer; }
	.btn-remove:hover { background: var(--zine-accent); color: #fff; }
	.subsection { border: var(--zine-border); padding: 20px; background: var(--zine-surface); }
	.subsection-title { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; color: var(--zine-muted); margin-bottom: 16px; }
	.field-hint { font-size: 10px; font-weight: 400; letter-spacing: 0; text-transform: none; opacity: 0.65; }
	@media (max-width: 500px) { .two-col { grid-template-columns: 1fr; } }
</style>

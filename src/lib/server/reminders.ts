/**
 * Shared freshness reminder logic.
 * Accepts a Drizzle `db` instance so it can be used by both:
 * - The Netlify scheduled function (Neon direct connection)
 * - The SvelteKit dev simulator endpoint (app db singleton)
 */
import { eq, or, isNull, lt, and, inArray, sql } from 'drizzle-orm';
import type { drizzle } from 'drizzle-orm/neon-http';
import { personalProfiles } from './db/schema/personal_profiles';
import { users } from './db/schema/users';
import { performerProfiles } from './db/schema/performer_profiles';
import { coachProfiles } from './db/schema/coach_profiles';
import { teams } from './db/schema/teams';
import { teamMembers } from './db/schema/team_members';
import { teamCoaches } from './db/schema/team_coaches';

// Type-compatible with both Neon and PGLite drizzle instances (db/index.ts casts PGLite to this)
type Db = ReturnType<typeof drizzle>;

// ---- Eligibility helper ----

/** Returns the Date representing the first day of the previous calendar month. */
export function getInactiveSinceCutoff(): Date {
	const now = new Date();
	return new Date(now.getFullYear(), now.getMonth() - 1, 1);
}

// ---- Constants ----

export const FRESHNESS_EMAIL_SUBJECT = `[Comedy Connector] Is your profile still accurate? (1 min check)`;

// ---- Data types ----

export interface FreshnessRecipient {
	userId: string;
	/** Preferred email — contactEmail if set, else users.email */
	email: string;
	name: string;
	profileSlug: string;
	personal: {
		training: string | null;
		lookingFor: string | null;
	};
	performer: {
		lookingForPracticeGroup: boolean;
		lookingForSmallGroup: boolean;
		lookingForIndieTeam: boolean;
		lookingFor: string | null;
		/** Names of teams the user is a current approved member of */
		currentTeamNames: string[];
	} | null;
	coach: {
		availability: string | null;
		availableForPrivate: boolean;
		availableForTeams: boolean;
		availableForPracticeGroup: boolean;
	} | null;
	/** Active teams where this user is the primary contact */
	ownedTeams: Array<{
		name: string;
		slug: string;
		form: string | null;
		openToNewMembers: boolean;
		openToBookOpeners: boolean;
		seekingCoach: boolean;
		lookingFor: string | null;
		memberNames: string[];
		coachNames: string[];
	}>;
}

// ---- Queries ----

/**
 * Returns the next batch of freshness reminder recipients.
 * Eligible = users whose `lastSeenAt` is before `inactiveSince` (or never set).
 * Ordered by lastSeenAt ASC NULLS FIRST (longest-inactive first).
 */
export async function getFreshnessRecipients(
	db: Db,
	offset: number,
	limit: number,
	inactiveSince: Date
): Promise<FreshnessRecipient[]> {
	// 1. Base: personal profiles + users (filtered, ordered, paginated)
	const baseRows = await db
		.select({
			profileId: personalProfiles.id,
			userId: users.id,
			name: personalProfiles.name,
			slug: personalProfiles.slug,
			contactEmail: personalProfiles.contactEmail,
			userEmail: users.email,
			training: personalProfiles.training,
			lookingFor: personalProfiles.lookingFor
		})
		.from(personalProfiles)
		.innerJoin(users, eq(personalProfiles.userId, users.id))
		.where(or(isNull(users.lastSeenAt), lt(users.lastSeenAt, inactiveSince)))
		.orderBy(sql`${users.lastSeenAt} ASC NULLS FIRST`)
		.limit(limit)
		.offset(offset);

	if (baseRows.length === 0) return [];

	const profileIds = baseRows.map((r) => r.profileId);

	// 2. Performer profiles
	const performerRows = await db
		.select({
			profileId: performerProfiles.profileId,
			lookingForPracticeGroup: performerProfiles.lookingForPracticeGroup,
			lookingForSmallGroup: performerProfiles.lookingForSmallGroup,
			lookingForIndieTeam: performerProfiles.lookingForIndieTeam,
			lookingFor: performerProfiles.lookingFor
		})
		.from(performerProfiles)
		.where(inArray(performerProfiles.profileId, profileIds));

	const performerMap = new Map(performerRows.map((r) => [r.profileId, r]));

	// 3. Coach profiles
	const coachRows = await db
		.select({
			profileId: coachProfiles.profileId,
			availability: coachProfiles.availability,
			availableForPrivate: coachProfiles.availableForPrivate,
			availableForTeams: coachProfiles.availableForTeams,
			availableForPracticeGroup: coachProfiles.availableForPracticeGroup
		})
		.from(coachProfiles)
		.where(inArray(coachProfiles.profileId, profileIds));

	const coachMap = new Map(coachRows.map((r) => [r.profileId, r]));

	// 4. Active teams owned (primary contact) by users in this batch
	const ownedTeamRows = await db
		.select({
			id: teams.id,
			primaryContactProfileId: teams.primaryContactProfileId,
			name: teams.name,
			slug: teams.slug,
			form: teams.form,
			openToNewMembers: teams.openToNewMembers,
			openToBookOpeners: teams.openToBookOpeners,
			seekingCoach: teams.seekingCoach,
			lookingFor: teams.lookingFor
		})
		.from(teams)
		.where(
			and(
				eq(teams.status, 'active'),
				inArray(
					teams.primaryContactProfileId,
					profileIds.map((id) => id)
				)
			)
		);

	// 5. Current approved members for those teams
	const ownedTeamIds = ownedTeamRows.map((t) => t.id);
	const memberRows =
		ownedTeamIds.length > 0
			? await db
					.select({
						teamId: teamMembers.teamId,
						memberName: teamMembers.memberName,
						profileName: personalProfiles.name
					})
					.from(teamMembers)
					.leftJoin(personalProfiles, eq(teamMembers.profileId, personalProfiles.id))
					.where(
						and(
							inArray(teamMembers.teamId, ownedTeamIds),
							eq(teamMembers.isCurrent, true),
							eq(teamMembers.approvalStatus, 'approved')
						)
					)
			: [];

	// 6. Current approved coaches for those teams
	const coachMemberRows =
		ownedTeamIds.length > 0
			? await db
					.select({
						teamId: teamCoaches.teamId,
						coachName: teamCoaches.coachName,
						profileName: personalProfiles.name
					})
					.from(teamCoaches)
					.leftJoin(personalProfiles, eq(teamCoaches.profileId, personalProfiles.id))
					.where(
						and(
							inArray(teamCoaches.teamId, ownedTeamIds),
							eq(teamCoaches.isCurrent, true),
							eq(teamCoaches.approvalStatus, 'approved')
						)
					)
			: [];

	// 7. Teams each performer is a current approved member of (for performer section)
	const membershipRows =
		profileIds.length > 0
			? await db
					.select({
						profileId: teamMembers.profileId,
						teamName: teams.name
					})
					.from(teamMembers)
					.innerJoin(teams, eq(teamMembers.teamId, teams.id))
					.where(
						and(
							inArray(teamMembers.profileId, profileIds),
							eq(teamMembers.isCurrent, true),
							eq(teamMembers.approvalStatus, 'approved'),
							eq(teams.status, 'active')
						)
					)
			: [];

	// ---- Assemble ----

	// Group members/coaches by team id
	const membersByTeam = new Map<string, string[]>();
	for (const m of memberRows) {
		const name = m.profileName ?? m.memberName ?? 'Unknown';
		const arr = membersByTeam.get(m.teamId) ?? [];
		arr.push(name);
		membersByTeam.set(m.teamId, arr);
	}

	const coachesByTeam = new Map<string, string[]>();
	for (const c of coachMemberRows) {
		const name = c.profileName ?? c.coachName ?? 'Unknown';
		const arr = coachesByTeam.get(c.teamId) ?? [];
		arr.push(name);
		coachesByTeam.set(c.teamId, arr);
	}

	// Group owned teams by primary contact profile id
	const ownedTeamsByProfile = new Map<string, typeof ownedTeamRows>();
	for (const t of ownedTeamRows) {
		if (!t.primaryContactProfileId) continue;
		const arr = ownedTeamsByProfile.get(t.primaryContactProfileId) ?? [];
		arr.push(t);
		ownedTeamsByProfile.set(t.primaryContactProfileId, arr);
	}

	// Group performer team memberships by profile id
	const membershipsByProfile = new Map<string, string[]>();
	for (const m of membershipRows) {
		if (!m.profileId) continue;
		const arr = membershipsByProfile.get(m.profileId) ?? [];
		arr.push(m.teamName);
		membershipsByProfile.set(m.profileId, arr);
	}

	return baseRows.map((row) => {
		const perf = performerMap.get(row.profileId);
		const coach = coachMap.get(row.profileId);
		const owned = ownedTeamsByProfile.get(row.profileId) ?? [];

		return {
			userId: row.userId,
			email: row.contactEmail ?? row.userEmail,
			name: row.name,
			profileSlug: row.slug,
			personal: {
				training: row.training,
				lookingFor: row.lookingFor
			},
			performer: perf
				? {
						lookingForPracticeGroup: perf.lookingForPracticeGroup,
						lookingForSmallGroup: perf.lookingForSmallGroup,
						lookingForIndieTeam: perf.lookingForIndieTeam,
						lookingFor: perf.lookingFor,
						currentTeamNames: membershipsByProfile.get(row.profileId) ?? []
					}
				: null,
			coach: coach
				? {
						availability: coach.availability,
						availableForPrivate: coach.availableForPrivate,
						availableForTeams: coach.availableForTeams,
						availableForPracticeGroup: coach.availableForPracticeGroup
					}
				: null,
			ownedTeams: owned.map((t) => ({
				name: t.name,
				slug: t.slug,
				form: t.form,
				openToNewMembers: t.openToNewMembers,
				openToBookOpeners: t.openToBookOpeners,
				seekingCoach: t.seekingCoach,
				lookingFor: t.lookingFor,
				memberNames: membersByTeam.get(t.id) ?? [],
				coachNames: coachesByTeam.get(t.id) ?? []
			}))
		};
	});
}

/**
 * Returns the count of eligible users beyond `afterOffset`.
 * Used for the backstop alert on the last day of the polling window.
 */
export async function countRemainingRecipients(
	db: Db,
	afterOffset: number,
	inactiveSince: Date
): Promise<number> {
	const rows = await db
		.select({ count: sql<number>`count(*)::int` })
		.from(personalProfiles)
		.innerJoin(users, eq(personalProfiles.userId, users.id))
		.where(or(isNull(users.lastSeenAt), lt(users.lastSeenAt, inactiveSince)));

	const total = rows[0]?.count ?? 0;
	return Math.max(0, total - afterOffset);
}

// ---- Email builders ----

const PURPLE = '#7c3aed';
const MUTED = '#6b7280';
const VERY_MUTED = '#9ca3af';
const LIGHT_BG = '#faf5ff';
const BORDER = '#e5e7eb';

function val(v: string | null | undefined, fallback = '<em style="color:#9ca3af">not set</em>'): string {
	return v ? escapeHtml(v) : fallback;
}

function escapeHtml(s: string): string {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function sectionHeader(emoji: string, label: string, editUrl: string): string {
	return `
<div style="margin-top:28px; border-left:3px solid ${PURPLE}; padding:12px 16px; background:${LIGHT_BG};">
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
    <tr>
      <td style="font-weight:700; font-size:13px; letter-spacing:0.05em; color:${PURPLE};">${emoji} ${label}</td>
      <td align="right">
        <a href="${editUrl}" style="font-size:12px; color:${PURPLE}; text-decoration:none; border:1px solid ${PURPLE}; padding:3px 10px;">Edit →</a>
      </td>
    </tr>
  </table>`;
}

function field(label: string, htmlValue: string): string {
	return `<p style="margin:6px 0; font-size:14px;"><span style="color:${MUTED}; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em;">${label}</span><br>${htmlValue}</p>`;
}

function flag(label: string, value: boolean): string {
	const icon = value ? '✅' : '⬜';
	return `<span style="font-size:13px; margin-right:12px;">${icon} ${label}</span>`;
}

export function buildFreshnessEmailHtml(recipient: FreshnessRecipient, siteUrl: string): string {
	const { name, profileSlug, personal, performer, coach, ownedTeams } = recipient;
	const profileBase = `${siteUrl}/profile`;

	let html = `
<div style="font-family:sans-serif; max-width:600px; margin:0 auto; color:#1a1a1a; line-height:1.5;">
  <h2 style="color:${PURPLE}; margin-bottom:4px;">Hey ${escapeHtml(name)}!</h2>
  <p style="color:${MUTED}; margin-top:0;">Quick monthly check from Comedy Connector — is everything below still accurate? Takes about a minute to scan.</p>`;

	// ---- Personal section ----
	html += sectionHeader('👤', 'PERSONAL PROFILE', `${profileBase}/edit`);
	html += field('Training &amp; Experience', val(personal.training));
	html += field('Looking For', val(personal.lookingFor));
	html += `</div>`;

	// ---- Performer section ----
	if (performer) {
		html += sectionHeader('🎭', 'PERFORMER PROFILE', `${profileBase}/performer`);
		html += `<p style="margin:6px 0; font-size:14px;"><span style="color:${MUTED}; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em;">Interest Flags</span><br>`;
		html += flag('Looking for practice group', performer.lookingForPracticeGroup);
		html += flag('Looking for small group partner', performer.lookingForSmallGroup);
		html += flag('Looking for indie team', performer.lookingForIndieTeam);
		html += `</p>`;
		html += field('Looking For (notes)', val(performer.lookingFor));
		if (performer.currentTeamNames.length > 0) {
			html += field(
				'Current Teams',
				performer.currentTeamNames.map(escapeHtml).join(', ')
			);
		} else {
			html += field('Current Teams', val(null, '<em style="color:#9ca3af">none listed</em>'));
		}
		html += `</div>`;
	}

	// ---- Coach section ----
	if (coach) {
		html += sectionHeader('🎓', 'COACH PROFILE', `${profileBase}/coach`);
		html += `<p style="margin:6px 0; font-size:14px;"><span style="color:${MUTED}; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em;">Availability Flags</span><br>`;
		html += flag('Available for private sessions', coach.availableForPrivate);
		html += flag('Available for teams', coach.availableForTeams);
		html += flag('Coaching a practice group', coach.availableForPracticeGroup);
		html += `</p>`;
		html += field('Availability (notes)', val(coach.availability));
		html += `</div>`;
	}

	// ---- Owned team sections ----
	for (const team of ownedTeams) {
		const teamEditUrl = `${siteUrl}/teams/${team.slug}/edit`;
		html += sectionHeader('🎪', `TEAM: ${escapeHtml(team.name).toUpperCase()}`, teamEditUrl);
		html += field('Form / Style', val(team.form));
		html += `<p style="margin:6px 0; font-size:14px;"><span style="color:${MUTED}; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em;">Interest Flags</span><br>`;
		html += flag('Open to new members', team.openToNewMembers);
		html += flag('Open to book openers', team.openToBookOpeners);
		html += flag('Seeking coach', team.seekingCoach);
		html += `</p>`;
		html += field('Looking For', val(team.lookingFor));
		html += field(
			'Current Members',
			team.memberNames.length > 0
				? team.memberNames.map(escapeHtml).join(', ')
				: '<em style="color:#9ca3af">none listed</em>'
		);
		html += field(
			'Current Coaches',
			team.coachNames.length > 0
				? team.coachNames.map(escapeHtml).join(', ')
				: '<em style="color:#9ca3af">none listed</em>'
		);
		html += `</div>`;
	}

	// ---- Footer ----
	html += `
  <p style="color:${VERY_MUTED}; font-size:12px; margin-top:32px; border-top:1px solid ${BORDER}; padding-top:16px;">
    You're receiving this because you have an active profile on
    <a href="${siteUrl}" style="color:${PURPLE};">${siteUrl}</a>.
    These monthly reminders help keep the Comedy Connector directory accurate for everyone.
    We will never use your email for spam or share it with third parties.
  </p>
</div>`;

	return html;
}

export function buildFreshnessEmailText(recipient: FreshnessRecipient, siteUrl: string): string {
	const { name, personal, performer, coach, ownedTeams } = recipient;
	const profileBase = `${siteUrl}/profile`;
	const lines: string[] = [
		`Hey ${name}!`,
		``,
		`Quick monthly check from Comedy Connector — is everything below still accurate?`,
		``,
		`── PERSONAL PROFILE ──────────────────`,
		`Update: ${profileBase}/edit`,
		`Training: ${personal.training ?? 'not set'}`,
		`Looking For: ${personal.lookingFor ?? 'not set'}`
	];

	if (performer) {
		lines.push(
			``,
			`── PERFORMER PROFILE ─────────────────`,
			`Update: ${profileBase}/performer`,
			`Looking for practice group: ${performer.lookingForPracticeGroup ? 'Yes' : 'No'}`,
			`Looking for small group partner: ${performer.lookingForSmallGroup ? 'Yes' : 'No'}`,
			`Looking for indie team: ${performer.lookingForIndieTeam ? 'Yes' : 'No'}`,
			`Looking For (notes): ${performer.lookingFor ?? 'not set'}`,
			`Current teams: ${performer.currentTeamNames.join(', ') || 'none listed'}`
		);
	}

	if (coach) {
		lines.push(
			``,
			`── COACH PROFILE ─────────────────────`,
			`Update: ${profileBase}/coach`,
			`Available for private sessions: ${coach.availableForPrivate ? 'Yes' : 'No'}`,
			`Available for teams: ${coach.availableForTeams ? 'Yes' : 'No'}`,
			`Coaching a practice group: ${coach.availableForPracticeGroup ? 'Yes' : 'No'}`,
			`Availability (notes): ${coach.availability ?? 'not set'}`
		);
	}

	for (const team of ownedTeams) {
		lines.push(
			``,
			`── TEAM: ${team.name.toUpperCase()} ─────────────────`,
			`Update: ${siteUrl}/teams/${team.slug}/edit`,
			`Form: ${team.form ?? 'not set'}`,
			`Open to new members: ${team.openToNewMembers ? 'Yes' : 'No'}`,
			`Open to book openers: ${team.openToBookOpeners ? 'Yes' : 'No'}`,
			`Seeking coach: ${team.seekingCoach ? 'Yes' : 'No'}`,
			`Looking For: ${team.lookingFor ?? 'not set'}`,
			`Members: ${team.memberNames.join(', ') || 'none listed'}`,
			`Coaches: ${team.coachNames.join(', ') || 'none listed'}`
		);
	}

	lines.push(
		``,
		`─────────────────────────────────────`,
		`You're receiving this because you have an active profile on ${siteUrl}.`,
		`These monthly reminders help keep the Comedy Connector directory accurate for everyone.`
	);

	return lines.join('\n');
}

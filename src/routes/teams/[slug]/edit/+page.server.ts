import { redirect, fail, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$server/db';
import { teams, teamMembers, teamCoaches, personalProfiles } from '$server/db/schema';
import { eq, and } from 'drizzle-orm';
import { getTeamBySlug, getTeamMembers, getOrCreateStubTeam } from '$server/teams';
import { getProfileByUserId } from '$server/profiles';
import { teamSchema } from '$utils/validation';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) redirect(302, '/');
	const team = await getTeamBySlug(params.slug);
	if (!team) error(404, 'Team not found');

	// Must be creator or an approved member
	const userProfile = await getProfileByUserId(locals.user.id);
	const isMember =
		team.createdByUserId === locals.user.id ||
		(userProfile &&
			(await db
				.select({ id: teamMembers.id })
				.from(teamMembers)
				.where(
					and(
						eq(teamMembers.teamId, team.id),
						eq(teamMembers.profileId, userProfile.id),
						eq(teamMembers.approvalStatus, 'approved')
					)
				)
				.limit(1)
				.then((r) => r.length > 0)));

	if (!isMember) error(403, 'You must be a team member to edit this team');

	const [members, coaches] = await Promise.all([
		getTeamMembers(team.id),
		db
			.select({
				id: teamCoaches.id,
				profileId: teamCoaches.profileId,
				coachName: teamCoaches.coachName,
				name: personalProfiles.name,
				slug: personalProfiles.slug,
				isCurrent: teamCoaches.isCurrent,
				approvalStatus: teamCoaches.approvalStatus
			})
			.from(teamCoaches)
			.leftJoin(personalProfiles, eq(teamCoaches.profileId, personalProfiles.id))
			.where(eq(teamCoaches.teamId, team.id))
	]);

	return { team, members, coaches, userProfile };
};

export const actions: Actions = {
	// Update team details
	updateTeam: async ({ request, params, locals }) => {
		if (!locals.user) return fail(401, { error: 'Not authenticated' });
		const team = await getTeamBySlug(params.slug);
		if (!team) return fail(404, { error: 'Not found' });

		const formData = await request.formData();
		const raw = {
			name: team.name, // name locked after creation
			description: String(formData.get('description') ?? ''),
			videoUrl: String(formData.get('videoUrl') ?? ''),
			form: String(formData.get('form') ?? ''),
			isPracticeGroup: formData.get('isPracticeGroup') === 'true',
			openToNewMembers: formData.get('openToNewMembers') === 'true',
			openToBookOpeners: formData.get('openToBookOpeners') === 'true',
			seekingCoach: formData.get('seekingCoach') === 'true',
			lookingFor: String(formData.get('lookingFor') ?? ''),
			freshnessRemindersEnabled: formData.get('freshnessRemindersEnabled') !== 'false'
		};

		const result = teamSchema.safeParse(raw);
		if (!result.success) return fail(400, { errors: result.error.flatten().fieldErrors });

		await db.update(teams).set({ ...result.data, updatedAt: new Date() }).where(eq(teams.id, team.id));
		return { success: true };
	},

	// Add a member (by profileId or name)
	addMember: async ({ request, params, locals }) => {
		if (!locals.user) return fail(401, { error: 'Not authenticated' });
		const team = await getTeamBySlug(params.slug);
		if (!team) return fail(404, { error: 'Not found' });

		const formData = await request.formData();
		const profileId = formData.get('profileId')?.toString() || null;
		const memberName = formData.get('memberName')?.toString() || null;
		const isCurrent = formData.get('isCurrent') !== 'false';

		if (!profileId && !memberName) {
			return fail(400, { error: 'Provide a performer or a name' });
		}

		// If adding a named team (not an app user), check for stub team
		const teamName = formData.get('teamName')?.toString();
		if (teamName) {
			await getOrCreateStubTeam(teamName);
		}

		// Approval: if the performer is an app user, set to pending (they must approve)
		// If it's just a name (no profileId), auto-approve
		const approvalStatus = profileId ? 'pending' : 'approved';

		await db.insert(teamMembers).values({
			teamId: team.id,
			profileId: profileId ?? undefined,
			memberName: memberName ?? undefined,
			isCurrent,
			approvalStatus
		});

		return { success: true };
	},

	// Remove a member
	removeMember: async ({ request, params, locals }) => {
		if (!locals.user) return fail(401, { error: 'Not authenticated' });
		const team = await getTeamBySlug(params.slug);
		if (!team) return fail(404, { error: 'Not found' });

		const formData = await request.formData();
		const memberId = formData.get('memberId')?.toString();
		if (!memberId) return fail(400, { error: 'Missing memberId' });

		await db.delete(teamMembers).where(and(eq(teamMembers.id, memberId), eq(teamMembers.teamId, team.id)));
		return { success: true };
	},

	// Add a coach
	addCoach: async ({ request, params, locals }) => {
		if (!locals.user) return fail(401, { error: 'Not authenticated' });
		const team = await getTeamBySlug(params.slug);
		if (!team) return fail(404, { error: 'Not found' });

		const formData = await request.formData();
		const profileId = formData.get('profileId')?.toString() || null;
		const coachName = formData.get('coachName')?.toString() || null;
		const isCurrent = formData.get('isCurrent') !== 'false';

		if (!profileId && !coachName) return fail(400, { error: 'Provide a coach or a name' });

		const approvalStatus = profileId ? 'pending' : 'approved';
		await db.insert(teamCoaches).values({
			teamId: team.id,
			profileId: profileId ?? undefined,
			coachName: coachName ?? undefined,
			isCurrent,
			approvalStatus
		});

		return { success: true };
	},

	// Remove a coach
	removeCoach: async ({ request, params, locals }) => {
		if (!locals.user) return fail(401, { error: 'Not authenticated' });
		const team = await getTeamBySlug(params.slug);
		if (!team) return fail(404, { error: 'Not found' });

		const formData = await request.formData();
		const coachId = formData.get('coachId')?.toString();
		if (!coachId) return fail(400, { error: 'Missing coachId' });

		await db.delete(teamCoaches).where(and(eq(teamCoaches.id, coachId), eq(teamCoaches.teamId, team.id)));
		return { success: true };
	}
};

import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$server/db';
import { users, personalProfiles, performerProfiles, teamMembers, teams } from '$server/db/schema';
import { eq, and } from 'drizzle-orm';
import { getProfileBySlug } from '$server/profiles';

export const load: PageServerLoad = async ({ params, locals }) => {
	const profile = await getProfileBySlug(params.slug);
	if (!profile) {
		error(404, 'Performer not found');
	}

	const [performer, memberships, profileUser] = await Promise.all([
		db
			.select()
			.from(performerProfiles)
			.where(eq(performerProfiles.profileId, profile.id))
			.limit(1),
		// Show approved team memberships on public profile
		db
			.select({
				teamId: teams.id,
				teamName: teams.name,
				teamSlug: teams.slug,
				teamStatus: teams.status,
				teamPhotoUrl: teams.photoUrl,
				startYear: teamMembers.startYear,
				startMonth: teamMembers.startMonth,
				endYear: teamMembers.endYear,
				endMonth: teamMembers.endMonth,
				isCurrent: teamMembers.isCurrent
			})
			.from(teamMembers)
			.innerJoin(teams, eq(teamMembers.teamId, teams.id))
			.where(
				and(eq(teamMembers.profileId, profile.id), eq(teamMembers.approvalStatus, 'approved'))
			),
		db.select({ id: users.id, admin: users.admin }).from(users).where(eq(users.id, profile.userId)).limit(1)
	]);

	return {
		profile,
		performer: performer[0] ?? null,
		memberships,
		isViewerAdmin: locals.user?.admin ?? false,
		isTargetAdmin: profileUser[0]?.admin ?? false,
		targetUserId: profileUser[0]?.id ?? null
	};
};

export const actions: Actions = {
	makeAdmin: async ({ locals, params }) => {
		if (!locals.user?.admin) return fail(403, { error: 'Forbidden' });

		const profile = await getProfileBySlug(params.slug);
		if (!profile) return fail(404, { error: 'Profile not found' });

		await db.update(users).set({ admin: true }).where(eq(users.id, profile.userId));
		return { success: true };
	}
};

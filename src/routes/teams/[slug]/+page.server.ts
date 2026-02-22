import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$server/db';
import { teamCoaches, personalProfiles } from '$server/db/schema';
import { eq, and } from 'drizzle-orm';
import { getTeamBySlug, getTeamMembers } from '$server/teams';

export const load: PageServerLoad = async ({ params, locals }) => {
	const team = await getTeamBySlug(params.slug);
	if (!team) error(404, 'Team not found');

	const [members, coaches] = await Promise.all([
		getTeamMembers(team.id),
		db
			.select({
				id: teamCoaches.id,
				profileId: teamCoaches.profileId,
				coachName: teamCoaches.coachName,
				name: personalProfiles.name,
				slug: personalProfiles.slug,
				photoUrl: personalProfiles.photoUrl,
				startYear: teamCoaches.startYear,
				startMonth: teamCoaches.startMonth,
				endYear: teamCoaches.endYear,
				endMonth: teamCoaches.endMonth,
				isCurrent: teamCoaches.isCurrent,
				approvalStatus: teamCoaches.approvalStatus
			})
			.from(teamCoaches)
			.leftJoin(personalProfiles, eq(teamCoaches.profileId, personalProfiles.id))
			.where(eq(teamCoaches.teamId, team.id))
	]);

	// Is the current logged-in user a member or the creator?
	let isTeamMember = false;
	if (locals.user) {
		const userProfile = await db
			.select({ id: personalProfiles.id })
			.from(personalProfiles)
			.where(eq(personalProfiles.userId, locals.user.id))
			.limit(1);
		if (userProfile[0]) {
			isTeamMember =
				team.createdByUserId === locals.user.id ||
				members.some((m) => m.profileId === userProfile[0].id && m.approvalStatus === 'approved');
		}
	}

	return {
		team,
		members: members.filter((m) => m.approvalStatus === 'approved'),
		coaches: coaches.filter((c) => c.approvalStatus === 'approved'),
		isTeamMember
	};
};

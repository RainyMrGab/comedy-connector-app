import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$server/db';
import { teamMembers, teamCoaches, teams, personalProfiles } from '$server/db/schema';
import { eq, and } from 'drizzle-orm';
import { getProfileByUserId } from '$server/profiles';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/');

	const userProfile = await getProfileByUserId(locals.user.id);
	if (!userProfile) return { pendingMemberships: [], pendingCoachRoles: [] };

	const [pendingMemberships, pendingCoachRoles] = await Promise.all([
		// Team membership requests pending approval from this user
		db
			.select({
				id: teamMembers.id,
				teamId: teams.id,
				teamName: teams.name,
				teamSlug: teams.slug,
				isCurrent: teamMembers.isCurrent,
				createdAt: teamMembers.createdAt
			})
			.from(teamMembers)
			.innerJoin(teams, eq(teamMembers.teamId, teams.id))
			.where(
				and(
					eq(teamMembers.profileId, userProfile.id),
					eq(teamMembers.approvalStatus, 'pending')
				)
			),
		// Coach role requests pending approval from this user
		db
			.select({
				id: teamCoaches.id,
				teamId: teams.id,
				teamName: teams.name,
				teamSlug: teams.slug,
				isCurrent: teamCoaches.isCurrent,
				createdAt: teamCoaches.createdAt
			})
			.from(teamCoaches)
			.innerJoin(teams, eq(teamCoaches.teamId, teams.id))
			.where(
				and(
					eq(teamCoaches.profileId, userProfile.id),
					eq(teamCoaches.approvalStatus, 'pending')
				)
			)
	]);

	return { pendingMemberships, pendingCoachRoles };
};

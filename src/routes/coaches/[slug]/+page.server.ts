import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$server/db';
import { coachProfiles, teamCoaches, teams } from '$server/db/schema';
import { eq, and } from 'drizzle-orm';
import { getProfileBySlug } from '$server/profiles';

export const load: PageServerLoad = async ({ params }) => {
	const profile = await getProfileBySlug(params.slug);
	if (!profile) error(404, 'Coach not found');

	const [coach, coachingRoles] = await Promise.all([
		db.select().from(coachProfiles).where(eq(coachProfiles.profileId, profile.id)).limit(1),
		db
			.select({
				teamId: teams.id,
				teamName: teams.name,
				teamSlug: teams.slug,
				teamStatus: teams.status,
				startYear: teamCoaches.startYear,
				startMonth: teamCoaches.startMonth,
				endYear: teamCoaches.endYear,
				endMonth: teamCoaches.endMonth,
				isCurrent: teamCoaches.isCurrent
			})
			.from(teamCoaches)
			.innerJoin(teams, eq(teamCoaches.teamId, teams.id))
			.where(
				and(eq(teamCoaches.profileId, profile.id), eq(teamCoaches.approvalStatus, 'approved'))
			)
	]);

	if (!coach[0]) error(404, 'Coach not found');

	return { profile, coach: coach[0], coachingRoles };
};

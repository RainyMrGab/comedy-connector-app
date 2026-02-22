import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$server/db';
import { personalProfiles, performerProfiles, teamMembers, teams } from '$server/db/schema';
import { eq, and } from 'drizzle-orm';
import { getProfileBySlug } from '$server/profiles';

export const load: PageServerLoad = async ({ params }) => {
	const profile = await getProfileBySlug(params.slug);
	if (!profile) {
		error(404, 'Performer not found');
	}

	const [performer, memberships] = await Promise.all([
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
			)
	]);

	return {
		profile,
		performer: performer[0] ?? null,
		memberships
	};
};

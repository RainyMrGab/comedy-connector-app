import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$server/db';
import { users, coachProfiles, teamCoaches, teams, tags, entityTags } from '$server/db/schema';
import { eq, and } from 'drizzle-orm';
import { getProfileBySlug } from '$server/profiles';

export const load: PageServerLoad = async ({ params, locals }) => {
	const profile = await getProfileBySlug(params.slug);
	if (!profile) error(404, 'Coach not found');

	const [coach, coachingRoles, profileUser] = await Promise.all([
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
			),
		db.select({ id: users.id, admin: users.admin }).from(users).where(eq(users.id, profile.userId)).limit(1)
	]);

	if (!coach[0]) error(404, 'Coach not found');

	const profileTags = await db
		.select({ id: entityTags.id, name: tags.name })
		.from(entityTags)
		.innerJoin(tags, eq(entityTags.tagId, tags.id))
		.where(and(eq(entityTags.entityId, coach[0].id), eq(entityTags.domain, 'coach'), eq(tags.status, 'approved')));

	return {
		profile,
		coach: coach[0],
		coachingRoles,
		profileTags,
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

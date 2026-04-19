import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$server/db';
import { teamMembers, teamCoaches, teams } from '$server/db/schema';
import { eq, and } from 'drizzle-orm';
import { getProfileByUserId } from '$server/profiles';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) redirect(302, `/login?returnTo=${encodeURIComponent(url.pathname)}`);

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

export const actions: Actions = {
	respond: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { error: 'Not authenticated' });

		const userProfile = await getProfileByUserId(locals.user.id);
		if (!userProfile) return fail(404, { error: 'Profile not found' });

		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const type = formData.get('type')?.toString();
		const action = formData.get('action')?.toString();

		if (!id || (type !== 'membership' && type !== 'coach') || (action !== 'approve' && action !== 'reject')) {
			return fail(400, { error: 'Invalid request' });
		}

		const approvalStatus = action === 'approve' ? 'approved' : 'rejected';

		if (type === 'membership') {
			const row = await db
				.select({ id: teamMembers.id })
				.from(teamMembers)
				.where(and(eq(teamMembers.id, id), eq(teamMembers.profileId, userProfile.id)))
				.limit(1);
			if (!row[0]) return fail(403, { error: 'Not authorized' });

			await db
				.update(teamMembers)
				.set({ approvalStatus, updatedAt: new Date() })
				.where(eq(teamMembers.id, id));
		} else {
			const row = await db
				.select({ id: teamCoaches.id })
				.from(teamCoaches)
				.where(and(eq(teamCoaches.id, id), eq(teamCoaches.profileId, userProfile.id)))
				.limit(1);
			if (!row[0]) return fail(403, { error: 'Not authorized' });

			await db
				.update(teamCoaches)
				.set({ approvalStatus, updatedAt: new Date() })
				.where(eq(teamCoaches.id, id));
		}

		const verb = action === 'approve' ? 'approved' : 'rejected';
		return { success: true, message: `Request ${verb}.` };
	}
};

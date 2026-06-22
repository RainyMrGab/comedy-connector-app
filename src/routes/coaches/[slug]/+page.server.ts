import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$server/db';
import { users, coachProfiles, teamCoaches, teams, tags, entityTags, reactions } from '$server/db/schema';
import { eq, and, count } from 'drizzle-orm';
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

	const entityId = coach[0].id;
	const [reactionCounts, userReactions] = await Promise.all([
		db
			.select({ reactionType: reactions.reactionType, count: count() })
			.from(reactions)
			.where(and(eq(reactions.entityId, entityId), eq(reactions.entityType, 'coach')))
			.groupBy(reactions.reactionType),
		locals.user
			? db
					.select({ reactionType: reactions.reactionType })
					.from(reactions)
					.where(
						and(
							eq(reactions.entityId, entityId),
							eq(reactions.entityType, 'coach'),
							eq(reactions.userId, locals.user.id)
						)
					)
			: Promise.resolve([])
	]);

	return {
		profile,
		coach: coach[0],
		coachingRoles,
		profileTags,
		reactionCounts,
		userReactions,
		isViewerAdmin: locals.user?.admin ?? false,
		isTargetAdmin: profileUser[0]?.admin ?? false,
		targetUserId: profileUser[0]?.id ?? null
	};
};

const VALID_REACTION_TYPES = ['like', 'love', 'celebrate'] as const;
type ValidReactionType = (typeof VALID_REACTION_TYPES)[number];

export const actions: Actions = {
	makeAdmin: async ({ locals, params }) => {
		if (!locals.user?.admin) return fail(403, { error: 'Forbidden' });

		const profile = await getProfileBySlug(params.slug);
		if (!profile) return fail(404, { error: 'Profile not found' });

		await db.update(users).set({ admin: true }).where(eq(users.id, profile.userId));
		return { success: true };
	},

	react: async ({ locals, request }) => {
		if (!locals.user) return fail(401, { error: 'Sign in to react.' });

		const data = await request.formData();
		const entityId = data.get('entityId') as string;
		const reactionType = data.get('reactionType') as ValidReactionType;

		if (!VALID_REACTION_TYPES.includes(reactionType)) return fail(400, { error: 'Invalid reaction.' });

		await db
			.insert(reactions)
			.values({ entityId, entityType: 'coach', reactionType, userId: locals.user.id })
			.onConflictDoNothing();

		return { success: true };
	},

	unreact: async ({ locals, request }) => {
		if (!locals.user) return fail(401, { error: 'Sign in to react.' });

		const data = await request.formData();
		const entityId = data.get('entityId') as string;
		const reactionType = data.get('reactionType') as ValidReactionType;

		if (!VALID_REACTION_TYPES.includes(reactionType)) return fail(400, { error: 'Invalid reaction.' });

		await db
			.delete(reactions)
			.where(
				and(
					eq(reactions.entityId, entityId),
					eq(reactions.reactionType, reactionType),
					eq(reactions.userId, locals.user.id)
				)
			);

		return { success: true };
	}
};

import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$server/db';
import { teamCoaches, personalProfiles, tags, entityTags, reactions } from '$server/db/schema';
import { eq, and, count } from 'drizzle-orm';
import { getTeamBySlug, getTeamMembers } from '$server/teams';

export const load: PageServerLoad = async ({ params, locals }) => {
	const team = await getTeamBySlug(params.slug);
	if (!team) error(404, 'Team not found');

	const [members, coaches, teamTags] = await Promise.all([
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
			.where(eq(teamCoaches.teamId, team.id)),
		db
			.select({ id: entityTags.id, name: tags.name })
			.from(entityTags)
			.innerJoin(tags, eq(entityTags.tagId, tags.id))
			.where(and(eq(entityTags.entityId, team.id), eq(entityTags.domain, 'team'), eq(tags.status, 'approved')))
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

	const approvedMembers = members.filter((m) => m.approvalStatus === 'approved');
	const approvedCoaches = coaches.filter((c) => c.approvalStatus === 'approved');

	const [reactionCounts, userReactions] = await Promise.all([
		db
			.select({ reactionType: reactions.reactionType, count: count() })
			.from(reactions)
			.where(and(eq(reactions.entityId, team.id), eq(reactions.entityType, 'team')))
			.groupBy(reactions.reactionType),
		locals.user
			? db
					.select({ reactionType: reactions.reactionType })
					.from(reactions)
					.where(
						and(
							eq(reactions.entityId, team.id),
							eq(reactions.entityType, 'team'),
							eq(reactions.userId, locals.user.id)
						)
					)
			: Promise.resolve([])
	]);

	return {
		team,
		currentMembers: approvedMembers.filter((m) => m.isCurrent),
		alumniMembers: approvedMembers.filter((m) => !m.isCurrent),
		currentCoaches: approvedCoaches.filter((c) => c.isCurrent),
		alumniCoaches: approvedCoaches.filter((c) => !c.isCurrent),
		isTeamMember,
		teamTags,
		reactionCounts,
		userReactions
	};
};

const VALID_REACTION_TYPES = ['like', 'love', 'celebrate'] as const;
type ValidReactionType = (typeof VALID_REACTION_TYPES)[number];

export const actions: Actions = {
	react: async ({ locals, request }) => {
		if (!locals.user) return fail(401, { error: 'Sign in to react.' });

		const data = await request.formData();
		const entityId = data.get('entityId') as string;
		const reactionType = data.get('reactionType') as ValidReactionType;

		if (!VALID_REACTION_TYPES.includes(reactionType)) return fail(400, { error: 'Invalid reaction.' });

		await db
			.insert(reactions)
			.values({ entityId, entityType: 'team', reactionType, userId: locals.user.id })
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

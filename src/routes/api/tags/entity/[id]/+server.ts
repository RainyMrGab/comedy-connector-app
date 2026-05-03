import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$server/db';
import { entityTags, performerProfiles, coachProfiles, teams, personalProfiles, teamMembers } from '$server/db/schema';
import { and, eq } from 'drizzle-orm';

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) error(401, 'Unauthorized');

	const [tag] = await db.select().from(entityTags).where(eq(entityTags.id, params.id)).limit(1);
	if (!tag) error(404, 'Not found');

	if (!locals.user.admin) {
		let isOwner = false;
		if (tag.domain === 'performer') {
			const [pp] = await db
				.select({ userId: personalProfiles.userId })
				.from(performerProfiles)
				.innerJoin(personalProfiles, eq(performerProfiles.profileId, personalProfiles.id))
				.where(eq(performerProfiles.id, tag.entityId))
				.limit(1);
			isOwner = pp?.userId === locals.user.id;
		} else if (tag.domain === 'coach') {
			const [cp] = await db
				.select({ userId: personalProfiles.userId })
				.from(coachProfiles)
				.innerJoin(personalProfiles, eq(coachProfiles.profileId, personalProfiles.id))
				.where(eq(coachProfiles.id, tag.entityId))
				.limit(1);
			isOwner = cp?.userId === locals.user.id;
		} else if (tag.domain === 'team') {
			const [t] = await db
				.select({ createdByUserId: teams.createdByUserId })
				.from(teams)
				.where(eq(teams.id, tag.entityId))
				.limit(1);
			if (t?.createdByUserId === locals.user.id) {
				isOwner = true;
			} else {
				const [profile] = await db
					.select({ id: personalProfiles.id })
					.from(personalProfiles)
					.where(eq(personalProfiles.userId, locals.user.id))
					.limit(1);

				if (profile) {
					const [membership] = await db
						.select({ id: teamMembers.id })
						.from(teamMembers)
						.where(
							and(
								eq(teamMembers.teamId, tag.entityId),
								eq(teamMembers.profileId, profile.id),
								eq(teamMembers.approvalStatus, 'approved')
							)
						)
						.limit(1);
					isOwner = Boolean(membership);
				}
			}
		}
		if (!isOwner) error(403, 'Forbidden');
	}

	await db.delete(entityTags).where(eq(entityTags.id, params.id));
	return json({ success: true });
};

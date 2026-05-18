import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$server/db';
import { personalProfiles, performerProfiles, coachProfiles, users } from '$server/db/schema';
import { ilike, eq, or } from 'drizzle-orm';

/**
 * GET /api/profiles/search?q=<query>&type=performer|coach
 * Used by the team edit combobox to search performers/coaches.
 */
export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) error(401, 'Not authenticated');

	const q = url.searchParams.get('q')?.trim() ?? '';
	const type = url.searchParams.get('type') ?? 'performer';

	if (q.length < 2) return json([]);

	if (type === 'coach') {
		const results = await db
			.select({
				id: personalProfiles.id,
				name: personalProfiles.name,
				slug: personalProfiles.slug,
				photoUrl: personalProfiles.photoUrl
			})
			.from(coachProfiles)
			.innerJoin(personalProfiles, eq(coachProfiles.profileId, personalProfiles.id))
			.innerJoin(users, eq(personalProfiles.userId, users.id))
			.where(
				or(
					ilike(personalProfiles.name, `%${q}%`),
					ilike(personalProfiles.contactEmail, `%${q}%`),
					ilike(users.email, `%${q}%`)
				)
			)
			.limit(10);
		return json(results);
	}

	// Default: performer
	const results = await db
		.select({
			id: personalProfiles.id,
			name: personalProfiles.name,
			slug: personalProfiles.slug,
			photoUrl: personalProfiles.photoUrl
		})
		.from(performerProfiles)
		.innerJoin(personalProfiles, eq(performerProfiles.profileId, personalProfiles.id))
		.innerJoin(users, eq(personalProfiles.userId, users.id))
		.where(
			or(
				ilike(personalProfiles.name, `%${q}%`),
				ilike(personalProfiles.contactEmail, `%${q}%`),
				ilike(users.email, `%${q}%`)
			)
		)
		.limit(10);

	return json(results);
};

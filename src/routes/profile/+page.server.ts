import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getProfileByUserId } from '$server/profiles';
import { db } from '$server/db';
import { performerProfiles, coachProfiles } from '$server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(302, '/');
	}

	const profile = await getProfileByUserId(locals.user.id);
	if (!profile) {
		redirect(302, '/profile/edit');
	}

	const [performer, coach] = await Promise.all([
		db.select().from(performerProfiles).where(eq(performerProfiles.profileId, profile.id)).limit(1),
		db.select().from(coachProfiles).where(eq(coachProfiles.profileId, profile.id)).limit(1)
	]);

	return {
		profile,
		performer: performer[0] ?? null,
		coach: coach[0] ?? null
	};
};

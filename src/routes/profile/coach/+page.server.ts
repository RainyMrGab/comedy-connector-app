import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$server/db';
import { coachProfiles } from '$server/db/schema';
import { eq } from 'drizzle-orm';
import { getProfileByUserId } from '$server/profiles';
import { coachProfileSchema } from '$utils/validation';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/');

	const profile = await getProfileByUserId(locals.user.id);
	if (!profile) redirect(302, '/profile/edit');

	const existing = await db
		.select()
		.from(coachProfiles)
		.where(eq(coachProfiles.profileId, profile.id))
		.limit(1);

	return { profile, coach: existing[0] ?? null };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { error: 'Not authenticated' });

		const profile = await getProfileByUserId(locals.user.id);
		if (!profile) return fail(400, { error: 'Create a profile first' });

		const formData = await request.formData();
		const raw = {
			coachingBio: String(formData.get('coachingBio') ?? ''),
			availableForPrivate: formData.get('availableForPrivate') === 'true',
			availableForTeams: formData.get('availableForTeams') === 'true',
			availableForWorkshops: formData.get('availableForWorkshops') === 'true',
			availability: String(formData.get('availability') ?? '')
		};

		const result = coachProfileSchema.safeParse(raw);
		if (!result.success) {
			return fail(400, { errors: result.error.flatten().fieldErrors });
		}

		const data = result.data;
		const existing = await db
			.select()
			.from(coachProfiles)
			.where(eq(coachProfiles.profileId, profile.id))
			.limit(1);

		if (existing.length > 0) {
			await db
				.update(coachProfiles)
				.set({ ...data, updatedAt: new Date() })
				.where(eq(coachProfiles.profileId, profile.id));
		} else {
			await db.insert(coachProfiles).values({ profileId: profile.id, ...data });
		}

		redirect(302, '/profile');
	},

	remove: async ({ locals }) => {
		if (!locals.user) return fail(401, { error: 'Not authenticated' });
		const profile = await getProfileByUserId(locals.user.id);
		if (!profile) return fail(400, { error: 'Profile not found' });
		await db.delete(coachProfiles).where(eq(coachProfiles.profileId, profile.id));
		redirect(302, '/profile');
	}
};

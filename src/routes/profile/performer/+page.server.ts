import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$server/db';
import { personalProfiles, performerProfiles } from '$server/db/schema';
import { eq } from 'drizzle-orm';
import { getProfileByUserId } from '$server/profiles';
import { performerProfileSchema } from '$utils/validation';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/');

	const profile = await getProfileByUserId(locals.user.id);
	if (!profile) redirect(302, '/profile/edit');

	const existing = await db
		.select()
		.from(performerProfiles)
		.where(eq(performerProfiles.profileId, profile.id))
		.limit(1);

	return { profile, performer: existing[0] ?? null };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { error: 'Not authenticated' });

		const profile = await getProfileByUserId(locals.user.id);
		if (!profile) return fail(400, { error: 'Create a profile first' });

		const formData = await request.formData();
		const videoHighlights = formData
			.getAll('videoHighlights')
			.map(String)
			.filter((v) => v.trim());

		const raw = {
			videoHighlights,
			openToBookOpeners: formData.get('openToBookOpeners') === 'true',
			lookingForTeam: formData.get('lookingForTeam') === 'true',
			lookingForCoach: formData.get('lookingForCoach') === 'true',
			lookingFor: String(formData.get('lookingFor') ?? '')
		};

		const result = performerProfileSchema.safeParse(raw);
		if (!result.success) {
			return fail(400, { errors: result.error.flatten().fieldErrors });
		}

		const data = result.data;
		const existing = await db
			.select()
			.from(performerProfiles)
			.where(eq(performerProfiles.profileId, profile.id))
			.limit(1);

		if (existing.length > 0) {
			await db
				.update(performerProfiles)
				.set({ ...data, updatedAt: new Date() })
				.where(eq(performerProfiles.profileId, profile.id));
		} else {
			await db.insert(performerProfiles).values({ profileId: profile.id, ...data });
		}

		redirect(302, '/profile');
	},

	remove: async ({ locals }) => {
		if (!locals.user) return fail(401, { error: 'Not authenticated' });
		const profile = await getProfileByUserId(locals.user.id);
		if (!profile) return fail(400, { error: 'Profile not found' });
		await db.delete(performerProfiles).where(eq(performerProfiles.profileId, profile.id));
		redirect(302, '/profile');
	}
};

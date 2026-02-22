import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$server/db';
import { personalProfiles } from '$server/db/schema';
import { eq } from 'drizzle-orm';
import { getProfileByUserId, resolveProfileSlug } from '$server/profiles';
import { personalProfileSchema } from '$utils/validation';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(302, '/');
	}
	const profile = await getProfileByUserId(locals.user.id);
	return { profile };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Not authenticated' });
		}

		const formData = await request.formData();
		const raw = {
			name: String(formData.get('name') ?? ''),
			bio: String(formData.get('bio') ?? ''),
			training: String(formData.get('training') ?? ''),
			lookingFor: String(formData.get('lookingFor') ?? ''),
			contactEmail: String(formData.get('contactEmail') ?? ''),
			freshnessRemindersEnabled: formData.get('freshnessRemindersEnabled') === 'true',
			socialLinks: {
				instagram: String(formData.get('instagram') ?? ''),
				tiktok: String(formData.get('tiktok') ?? ''),
				facebook: String(formData.get('facebook') ?? ''),
				twitter: String(formData.get('twitter') ?? ''),
				youtube: String(formData.get('youtube') ?? ''),
				website: String(formData.get('website') ?? '')
			}
		};

		const result = personalProfileSchema.safeParse(raw);
		if (!result.success) {
			return fail(400, {
				errors: result.error.flatten().fieldErrors,
				values: raw
			});
		}

		const data = result.data;
		const existing = await getProfileByUserId(locals.user.id);
		const slug = await resolveProfileSlug(data.name, existing?.id);

		// Clean empty social links
		const socialLinks = Object.fromEntries(
			Object.entries(data.socialLinks ?? {}).filter(([, v]) => v)
		);

		if (existing) {
			await db
				.update(personalProfiles)
				.set({
					name: data.name,
					slug,
					bio: data.bio ?? null,
					training: data.training ?? null,
					lookingFor: data.lookingFor ?? null,
					contactEmail: data.contactEmail || null,
					socialLinks,
					freshnessRemindersEnabled: data.freshnessRemindersEnabled ?? true,
					updatedAt: new Date()
				})
				.where(eq(personalProfiles.id, existing.id));
		} else {
			await db.insert(personalProfiles).values({
				userId: locals.user.id,
				name: data.name,
				slug,
				bio: data.bio ?? null,
				training: data.training ?? null,
				lookingFor: data.lookingFor ?? null,
				contactEmail: data.contactEmail || null,
				socialLinks,
				freshnessRemindersEnabled: data.freshnessRemindersEnabled ?? true
			});
		}

		redirect(302, '/profile');
	}
};

import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$server/db';
import { personalProfiles, performerProfiles, tags, entityTags } from '$server/db/schema';
import { eq, and } from 'drizzle-orm';
import { getProfileByUserId } from '$server/profiles';
import { performerProfileSchema } from '$utils/validation';
import { normalizeHighlights, type Highlight } from '$utils/highlights';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) redirect(302, `/login?returnTo=${encodeURIComponent(url.pathname)}`);

	const profile = await getProfileByUserId(locals.user.id);
	if (!profile) redirect(302, '/profile/edit');

	const existing = await db
		.select()
		.from(performerProfiles)
		.where(eq(performerProfiles.profileId, profile.id))
		.limit(1);

	const performer = existing[0] ?? null;

	const performerTags = performer
		? await db
				.select({
					id: entityTags.id,
					tagId: entityTags.tagId,
					name: tags.name,
					status: tags.status
				})
				.from(entityTags)
				.innerJoin(tags, eq(entityTags.tagId, tags.id))
				.where(and(eq(entityTags.entityId, performer.id), eq(entityTags.domain, 'performer')))
		: [];

	return { profile, performer, performerTags };
};

export const actions: Actions = {
	save: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { error: 'Not authenticated' });

		const profile = await getProfileByUserId(locals.user.id);
		if (!profile) return fail(400, { error: 'Create a profile first' });

		const formData = await request.formData();

		// Highlights are sent as a single JSON blob from the client-side editor
		let highlights: Highlight[];
		try {
			const raw = String(formData.get('highlights') ?? '[]');
			highlights = normalizeHighlights(JSON.parse(raw));
		} catch {
			highlights = [];
		}

		const raw = {
			highlights,
			lookingForPracticeGroup: formData.get('lookingForPracticeGroup') === 'true',
			lookingForSmallGroup: formData.get('lookingForSmallGroup') === 'true',
			lookingForIndieTeam: formData.get('lookingForIndieTeam') === 'true',
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

		// Store highlights in the videoHighlights column (same column, new format)
		const dbData = {
			videoHighlights: data.highlights ?? [],
			lookingForPracticeGroup: data.lookingForPracticeGroup ?? false,
			lookingForSmallGroup: data.lookingForSmallGroup ?? false,
			lookingForIndieTeam: data.lookingForIndieTeam ?? false,
			lookingFor: data.lookingFor ?? ''
		};

		if (existing.length > 0) {
			await db
				.update(performerProfiles)
				.set({ ...dbData, updatedAt: new Date() })
				.where(eq(performerProfiles.profileId, profile.id));
		} else {
			await db.insert(performerProfiles).values({ profileId: profile.id, ...dbData });
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

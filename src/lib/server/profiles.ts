import { db } from '$server/db';
import { personalProfiles, users } from '$server/db/schema';
import { eq } from 'drizzle-orm';
import { generateSlug, uniquifySlug } from '$utils/slug';

/** Resolve or create a unique slug for a profile name. */
export async function resolveProfileSlug(
	name: string,
	existingProfileId?: string
): Promise<string> {
	const base = generateSlug(name);
	let attempt = 1;
	while (true) {
		const candidate = uniquifySlug(base, attempt);
		const existing = await db
			.select({ id: personalProfiles.id })
			.from(personalProfiles)
			.where(eq(personalProfiles.slug, candidate))
			.limit(1);
		if (existing.length === 0 || existing[0].id === existingProfileId) {
			return candidate;
		}
		attempt++;
	}
}

/** Get a personal profile by user ID (includes the user row). */
export async function getProfileByUserId(userId: string) {
	const result = await db
		.select()
		.from(personalProfiles)
		.where(eq(personalProfiles.userId, userId))
		.limit(1);
	return result[0] ?? null;
}

/** Get a personal profile by slug (for public views). */
export async function getProfileBySlug(slug: string) {
	const result = await db
		.select()
		.from(personalProfiles)
		.where(eq(personalProfiles.slug, slug))
		.limit(1);
	return result[0] ?? null;
}

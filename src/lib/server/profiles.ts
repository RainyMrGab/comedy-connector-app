import { db } from '$server/db';
import { personalProfiles, users } from '$server/db/schema';
import { eq, or } from 'drizzle-orm';
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

/** Find a profile ID by user email or contact email. */
export async function findProfileIdByEmail(email: string): Promise<string | null> {
	const normalized = email.trim().toLowerCase();
	const result = await db
		.select({ id: personalProfiles.id })
		.from(personalProfiles)
		.leftJoin(users, eq(personalProfiles.userId, users.id))
		.where(or(eq(users.email, normalized), eq(personalProfiles.contactEmail, normalized)))
		.limit(1);
	return result[0]?.id ?? null;
}

/** Get or create a profile for a user if it doesn't exist. */
export async function ensureUserProfile(userId: string, email: string, fallbackName?: string | null): Promise<string> {
	const existing = await getProfileByUserId(userId);
	if (existing) return existing.id;

	const name = fallbackName?.trim() || email.split('@')[0];
	const slug = await resolveProfileSlug(name);
	const [inserted] = await db
		.insert(personalProfiles)
		.values({ userId, name, slug })
		.returning({ id: personalProfiles.id });
	return inserted.id;
}

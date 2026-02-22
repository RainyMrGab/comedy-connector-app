import { db } from '$server/db';
import { teams, teamMembers, personalProfiles } from '$server/db/schema';
import { eq, ilike, and } from 'drizzle-orm';
import { generateSlug, uniquifySlug } from '$utils/slug';

/** Resolve or create a unique slug for a team name. */
export async function resolveTeamSlug(name: string, existingTeamId?: string): Promise<string> {
	const base = generateSlug(name);
	let attempt = 1;
	while (true) {
		const candidate = uniquifySlug(base, attempt);
		const existing = await db
			.select({ id: teams.id })
			.from(teams)
			.where(eq(teams.slug, candidate))
			.limit(1);
		if (existing.length === 0 || existing[0].id === existingTeamId) {
			return candidate;
		}
		attempt++;
	}
}

/** Find an existing team by case-insensitive name match (for stub creation). */
export async function findTeamByName(name: string) {
	const result = await db
		.select()
		.from(teams)
		.where(ilike(teams.name, name))
		.limit(1);
	return result[0] ?? null;
}

/** Get a team by slug. */
export async function getTeamBySlug(slug: string) {
	const result = await db.select().from(teams).where(eq(teams.slug, slug)).limit(1);
	return result[0] ?? null;
}

/**
 * Get or create a stub team by name.
 * Used when a performer adds a team that doesn't exist yet.
 */
export async function getOrCreateStubTeam(name: string): Promise<typeof teams.$inferSelect> {
	const existing = await findTeamByName(name);
	if (existing) return existing;

	const slug = await resolveTeamSlug(name);
	const [created] = await db
		.insert(teams)
		.values({
			name,
			slug,
			status: 'stub',
			createdByUserId: null
		})
		.returning();
	return created;
}

/** Get team members with their profile info. */
export async function getTeamMembers(teamId: string) {
	return db
		.select({
			id: teamMembers.id,
			profileId: teamMembers.profileId,
			memberName: teamMembers.memberName,
			name: personalProfiles.name,
			slug: personalProfiles.slug,
			photoUrl: personalProfiles.photoUrl,
			startYear: teamMembers.startYear,
			startMonth: teamMembers.startMonth,
			endYear: teamMembers.endYear,
			endMonth: teamMembers.endMonth,
			isCurrent: teamMembers.isCurrent,
			approvalStatus: teamMembers.approvalStatus
		})
		.from(teamMembers)
		.leftJoin(personalProfiles, eq(teamMembers.profileId, personalProfiles.id))
		.where(eq(teamMembers.teamId, teamId));
}

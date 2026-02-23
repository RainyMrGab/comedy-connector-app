import { db } from '$server/db';
import { personalProfiles, performerProfiles, coachProfiles, teams, teamMembers } from '$server/db/schema';
import { sql, eq, and, inArray } from 'drizzle-orm';

export interface SearchResult {
	id: string;
	name: string;
	slug: string;
	photoUrl: string | null;
	bio: string | null;
	rank: number;
	// Flags (performer)
	openToBookOpeners?: boolean;
	lookingForTeam?: boolean;
	lookingForCoach?: boolean;
	// Flags (coach)
	availableForPrivate?: boolean;
	availableForTeams?: boolean;
	availableForWorkshops?: boolean;
	// Flags (team)
	openToNewMembers?: boolean;
	seekingCoach?: boolean;
	form?: string | null;
	status?: string;
}

export interface SearchFilters {
	openToBookOpeners?: boolean;
	lookingForTeam?: boolean;
	lookingForCoach?: boolean;
	availableForPrivate?: boolean;
	availableForTeams?: boolean;
	availableForWorkshops?: boolean;
	openToNewMembers?: boolean;
	seekingCoach?: boolean;
}

export interface SearchCursor {
	rank: number;
	id: string;
}

const PAGE_SIZE = 20;

/**
 * Search performers using Postgres full-text search.
 * Returns results with rank for cursor-based pagination.
 */
export async function searchPerformers(
	query: string,
	filters: SearchFilters = {},
	cursor?: SearchCursor,
	limit = PAGE_SIZE
): Promise<{ results: SearchResult[]; nextCursor: SearchCursor | null }> {
	const tsQuery = query.trim() ? sql`websearch_to_tsquery('english', ${query})` : null;

	// Build filter conditions for performerProfiles
	const filterConds = [];
	if (filters.openToBookOpeners) filterConds.push(eq(performerProfiles.openToBookOpeners, true));
	if (filters.lookingForTeam) filterConds.push(eq(performerProfiles.lookingForTeam, true));
	if (filters.lookingForCoach) filterConds.push(eq(performerProfiles.lookingForCoach, true));

	const rows = await db
		.select({
			id: personalProfiles.id,
			name: personalProfiles.name,
			slug: personalProfiles.slug,
			photoUrl: personalProfiles.photoUrl,
			bio: personalProfiles.bio,
			openToBookOpeners: performerProfiles.openToBookOpeners,
			lookingForTeam: performerProfiles.lookingForTeam,
			lookingForCoach: performerProfiles.lookingForCoach,
			rank: tsQuery
				? sql<number>`ts_rank(${personalProfiles}.search_vector, ${tsQuery})`
				: sql<number>`0`
		})
		.from(performerProfiles)
		.innerJoin(personalProfiles, eq(performerProfiles.profileId, personalProfiles.id))
		.where(
			and(
				tsQuery ? sql`${personalProfiles}.search_vector @@ ${tsQuery}` : undefined,
				...filterConds,
				cursor
					? sql`(ts_rank(${personalProfiles}.search_vector, ${tsQuery ?? sql`''::tsquery`}), ${personalProfiles}.id::text) < (${cursor.rank}, ${cursor.id})`
					: undefined
			)
		)
		.orderBy(sql`rank DESC, ${personalProfiles}.id DESC`)
		.limit(limit + 1);

	const hasMore = rows.length > limit;
	const results = rows.slice(0, limit).map((r) => ({ ...r, rank: Number(r.rank) }));
	const nextCursor =
		hasMore && results.length > 0
			? { rank: results[results.length - 1].rank, id: results[results.length - 1].id }
			: null;

	return { results, nextCursor };
}

export async function searchCoaches(
	query: string,
	filters: SearchFilters = {},
	cursor?: SearchCursor,
	limit = PAGE_SIZE
): Promise<{ results: SearchResult[]; nextCursor: SearchCursor | null }> {
	const tsQuery = query.trim() ? sql`websearch_to_tsquery('english', ${query})` : null;

	const filterConds = [];
	if (filters.availableForPrivate) filterConds.push(eq(coachProfiles.availableForPrivate, true));
	if (filters.availableForTeams) filterConds.push(eq(coachProfiles.availableForTeams, true));
	if (filters.availableForWorkshops) filterConds.push(eq(coachProfiles.availableForWorkshops, true));

	const rows = await db
		.select({
			id: personalProfiles.id,
			name: personalProfiles.name,
			slug: personalProfiles.slug,
			photoUrl: personalProfiles.photoUrl,
			bio: coachProfiles.coachingBio,
			availableForPrivate: coachProfiles.availableForPrivate,
			availableForTeams: coachProfiles.availableForTeams,
			availableForWorkshops: coachProfiles.availableForWorkshops,
			rank: tsQuery
				? sql<number>`ts_rank(${coachProfiles}.search_vector, ${tsQuery})`
				: sql<number>`0`
		})
		.from(coachProfiles)
		.innerJoin(personalProfiles, eq(coachProfiles.profileId, personalProfiles.id))
		.where(
			and(
				tsQuery ? sql`${coachProfiles}.search_vector @@ ${tsQuery}` : undefined,
				...filterConds,
				cursor
					? sql`(ts_rank(${coachProfiles}.search_vector, ${tsQuery ?? sql`''::tsquery`}), ${personalProfiles}.id::text) < (${cursor.rank}, ${cursor.id})`
					: undefined
			)
		)
		.orderBy(sql`rank DESC, ${personalProfiles}.id DESC`)
		.limit(limit + 1);

	const hasMore = rows.length > limit;
	const results = rows.slice(0, limit).map((r) => ({ ...r, rank: Number(r.rank) }));
	const nextCursor =
		hasMore && results.length > 0
			? { rank: results[results.length - 1].rank, id: results[results.length - 1].id }
			: null;

	return { results, nextCursor };
}

export async function searchTeams(
	query: string,
	filters: SearchFilters = {},
	cursor?: SearchCursor,
	limit = PAGE_SIZE
): Promise<{ results: SearchResult[]; nextCursor: SearchCursor | null }> {
	const tsQuery = query.trim() ? sql`websearch_to_tsquery('english', ${query})` : null;

	// For stubs: only include if they have approved members
	const stubIds = await db
		.select({ teamId: teamMembers.teamId })
		.from(teamMembers)
		.where(eq(teamMembers.approvalStatus, 'approved'));
	const stubsWithMembers = [...new Set(stubIds.map((s) => s.teamId))];

	const filterConds = [];
	if (filters.openToNewMembers) filterConds.push(eq(teams.openToNewMembers, true));
	if (filters.seekingCoach) filterConds.push(eq(teams.seekingCoach, true));

	const rows = await db
		.select({
			id: teams.id,
			name: teams.name,
			slug: teams.slug,
			photoUrl: teams.photoUrl,
			bio: teams.description,
			form: teams.form,
			status: teams.status,
			openToNewMembers: teams.openToNewMembers,
			seekingCoach: teams.seekingCoach,
			rank: tsQuery ? sql<number>`ts_rank(${teams}.search_vector, ${tsQuery})` : sql<number>`0`
		})
		.from(teams)
		.where(
			and(
				// Active OR stub with approved members
				stubsWithMembers.length > 0
					? sql`(${teams}.status = 'active' OR ${teams}.id = ANY(ARRAY[${sql.join(stubsWithMembers.map((id) => sql`${id}::uuid`), sql`, `)}]))`
					: eq(teams.status, 'active'),
				tsQuery ? sql`${teams}.search_vector @@ ${tsQuery}` : undefined,
				...filterConds,
				cursor
					? sql`(ts_rank(${teams}.search_vector, ${tsQuery ?? sql`''::tsquery`}), ${teams}.id::text) < (${cursor.rank}, ${cursor.id})`
					: undefined
			)
		)
		.orderBy(sql`rank DESC, ${teams}.id DESC`)
		.limit(limit + 1);

	const hasMore = rows.length > limit;
	const results = rows.slice(0, limit).map((r) => ({ ...r, rank: Number(r.rank) }));
	const nextCursor =
		hasMore && results.length > 0
			? { rank: results[results.length - 1].rank, id: results[results.length - 1].id }
			: null;

	return { results, nextCursor };
}

import { db } from '$server/db';
import { personalProfiles, performerProfiles, coachProfiles, teams, teamMembers } from '$server/db/schema';
import { sql, eq, and, desc } from 'drizzle-orm';

export interface SearchResult {
	id: string;
	name: string;
	slug: string;
	photoUrl: string | null;
	bio: string | null;
	rank: number;
	// Flags (performer)
	lookingForPracticeGroup?: boolean;
	lookingForSmallGroup?: boolean;
	lookingForIndieTeam?: boolean;
	// Flags (coach)
	availableForPrivate?: boolean;
	availableForTeams?: boolean;
	availableForPracticeGroup?: boolean;
	// Flags (team)
	openToNewMembers?: boolean;
	seekingCoach?: boolean;
	form?: string | null;
	status?: string;
}

export interface SearchFilters {
	lookingForPracticeGroup?: boolean;
	lookingForSmallGroup?: boolean;
	lookingForIndieTeam?: boolean;
	availableForPrivate?: boolean;
	availableForTeams?: boolean;
	availableForPracticeGroup?: boolean;
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
	if (filters.lookingForPracticeGroup) filterConds.push(eq(performerProfiles.lookingForPracticeGroup, true));
	if (filters.lookingForSmallGroup) filterConds.push(eq(performerProfiles.lookingForSmallGroup, true));
	if (filters.lookingForIndieTeam) filterConds.push(eq(performerProfiles.lookingForIndieTeam, true));

	const rows = await db
		.select({
			id: personalProfiles.id,
			name: personalProfiles.name,
			slug: personalProfiles.slug,
			photoUrl: personalProfiles.photoUrl,
			bio: personalProfiles.bio,
			lookingForPracticeGroup: performerProfiles.lookingForPracticeGroup,
			lookingForSmallGroup: performerProfiles.lookingForSmallGroup,
			lookingForIndieTeam: performerProfiles.lookingForIndieTeam,
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
		.orderBy(
			...(tsQuery ? [sql`ts_rank(${personalProfiles}.search_vector, ${tsQuery}) DESC`] : []),
			desc(personalProfiles.id)
		)
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
	if (filters.availableForPracticeGroup) filterConds.push(eq(coachProfiles.availableForPracticeGroup, true));

	const rows = await db
		.select({
			id: personalProfiles.id,
			name: personalProfiles.name,
			slug: personalProfiles.slug,
			photoUrl: personalProfiles.photoUrl,
			bio: coachProfiles.coachingBio,
			availableForPrivate: coachProfiles.availableForPrivate,
			availableForTeams: coachProfiles.availableForTeams,
			availableForPracticeGroup: coachProfiles.availableForPracticeGroup,
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
		.orderBy(
			...(tsQuery ? [sql`ts_rank(${coachProfiles}.search_vector, ${tsQuery}) DESC`] : []),
			desc(personalProfiles.id)
		)
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
		.orderBy(
			...(tsQuery ? [sql`ts_rank(${teams}.search_vector, ${tsQuery}) DESC`] : []),
			desc(teams.id)
		)
		.limit(limit + 1);

	const hasMore = rows.length > limit;
	const results = rows.slice(0, limit).map((r) => ({ ...r, rank: Number(r.rank) }));
	const nextCursor =
		hasMore && results.length > 0
			? { rank: results[results.length - 1].rank, id: results[results.length - 1].id }
			: null;

	return { results, nextCursor };
}

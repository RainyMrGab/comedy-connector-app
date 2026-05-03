import { db } from '$server/db';
import {
	personalProfiles,
	performerProfiles,
	coachProfiles,
	teams,
	teamMembers,
	entityTags,
	tags
} from '$server/db/schema';
import { sql, eq, and, desc, inArray } from 'drizzle-orm';

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
	openToBookOpeners?: boolean;
	openToNewMembers?: boolean;
	seekingCoach?: boolean;
	form?: string | null;
	status?: string;
	tags?: SearchResultTag[];
}

export interface SearchResultTag {
	id: string;
	name: string;
}

export interface SearchFilters {
	lookingForPracticeGroup?: boolean;
	lookingForSmallGroup?: boolean;
	lookingForIndieTeam?: boolean;
	availableForPrivate?: boolean;
	availableForTeams?: boolean;
	availableForPracticeGroup?: boolean;
	openToBookOpeners?: boolean;
	openToNewMembers?: boolean;
	seekingCoach?: boolean;
	tags?: string[]; // array of tag IDs, AND semantics
}

export interface SearchCursor {
	rank: number;
	id: string;
}

const PAGE_SIZE = 20;

async function loadApprovedTags(
	domain: 'performer' | 'coach' | 'team',
	entityIds: string[]
): Promise<Map<string, SearchResultTag[]>> {
	if (entityIds.length === 0) return new Map();

	const rows = await db
		.select({
			entityId: entityTags.entityId,
			id: tags.id,
			name: tags.name
		})
		.from(entityTags)
		.innerJoin(tags, eq(entityTags.tagId, tags.id))
		.where(
			and(
				eq(entityTags.domain, domain),
				eq(tags.status, 'approved'),
				inArray(entityTags.entityId, entityIds)
			)
		)
		.orderBy(tags.name);

	const byEntity = new Map<string, SearchResultTag[]>();
	for (const row of rows) {
		const current = byEntity.get(row.entityId) ?? [];
		current.push({ id: row.id, name: row.name });
		byEntity.set(row.entityId, current);
	}
	return byEntity;
}

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
	for (const tagId of filters.tags ?? []) {
		filterConds.push(sql`EXISTS (
			SELECT 1
			FROM entity_tags et
			INNER JOIN tags t ON t.id = et.tag_id
			WHERE et.entity_id = ${performerProfiles.id}
				AND et.tag_id = ${tagId}::uuid
				AND et.domain = 'performer'
				AND t.status = 'approved'
		)`);
	}

	const rows = await db
		.select({
			id: personalProfiles.id,
			tagEntityId: performerProfiles.id,
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
	const pageRows = rows.slice(0, limit);
	const tagsByEntity = await loadApprovedTags(
		'performer',
		pageRows.map((row) => row.tagEntityId)
	);
	const results = pageRows.map(({ tagEntityId, ...r }) => ({
		...r,
		rank: Number(r.rank),
		tags: tagsByEntity.get(tagEntityId) ?? []
	}));
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
	for (const tagId of filters.tags ?? []) {
		filterConds.push(sql`EXISTS (
			SELECT 1
			FROM entity_tags et
			INNER JOIN tags t ON t.id = et.tag_id
			WHERE et.entity_id = ${coachProfiles.id}
				AND et.tag_id = ${tagId}::uuid
				AND et.domain = 'coach'
				AND t.status = 'approved'
		)`);
	}

	const rows = await db
		.select({
			id: personalProfiles.id,
			tagEntityId: coachProfiles.id,
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
	const pageRows = rows.slice(0, limit);
	const tagsByEntity = await loadApprovedTags(
		'coach',
		pageRows.map((row) => row.tagEntityId)
	);
	const results = pageRows.map(({ tagEntityId, ...r }) => ({
		...r,
		rank: Number(r.rank),
		tags: tagsByEntity.get(tagEntityId) ?? []
	}));
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
	if (filters.openToBookOpeners) filterConds.push(eq(teams.openToBookOpeners, true));
	if (filters.openToNewMembers) filterConds.push(eq(teams.openToNewMembers, true));
	if (filters.seekingCoach) filterConds.push(eq(teams.seekingCoach, true));
	for (const tagId of filters.tags ?? []) {
		filterConds.push(sql`EXISTS (
			SELECT 1
			FROM entity_tags et
			INNER JOIN tags t ON t.id = et.tag_id
			WHERE et.entity_id = ${teams.id}
				AND et.tag_id = ${tagId}::uuid
				AND et.domain = 'team'
				AND t.status = 'approved'
		)`);
	}

	const rows = await db
		.select({
			id: teams.id,
			name: teams.name,
			slug: teams.slug,
			photoUrl: teams.photoUrl,
			bio: teams.description,
			form: teams.form,
			status: teams.status,
			openToBookOpeners: teams.openToBookOpeners,
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
	const pageRows = rows.slice(0, limit);
	const tagsByEntity = await loadApprovedTags(
		'team',
		pageRows.map((row) => row.id)
	);
	const results = pageRows.map((r) => ({
		...r,
		rank: Number(r.rank),
		tags: tagsByEntity.get(r.id) ?? []
	}));
	const nextCursor =
		hasMore && results.length > 0
			? { rank: results[results.length - 1].rank, id: results[results.length - 1].id }
			: null;

	return { results, nextCursor };
}

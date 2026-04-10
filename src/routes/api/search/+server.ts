import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { searchPerformers, searchCoaches, searchTeams } from '$server/search';
import type { SearchFilters, SearchCursor } from '$server/search';

/**
 * GET /api/search?type=performers|coaches|teams&q=<query>&cursor=<json>&<filter>=true
 * Public search endpoint using Postgres full-text search with cursor-based pagination.
 */
export const GET: RequestHandler = async ({ url }) => {
	const q = url.searchParams.get('q') ?? '';
	const type = url.searchParams.get('type') ?? 'performers';

	const cursorParam = url.searchParams.get('cursor');
	let cursor: SearchCursor | undefined;
	if (cursorParam) {
		try {
			cursor = JSON.parse(cursorParam);
		} catch {
			error(400, 'Invalid cursor');
		}
	}

	const filters: SearchFilters = {};
	if (url.searchParams.get('lookingForPracticeGroup') === 'true') filters.lookingForPracticeGroup = true;
	if (url.searchParams.get('lookingForSmallGroup') === 'true') filters.lookingForSmallGroup = true;
	if (url.searchParams.get('lookingForIndieTeam') === 'true') filters.lookingForIndieTeam = true;
	if (url.searchParams.get('availableForPrivate') === 'true') filters.availableForPrivate = true;
	if (url.searchParams.get('availableForTeams') === 'true') filters.availableForTeams = true;
	if (url.searchParams.get('availableForPracticeGroup') === 'true') filters.availableForPracticeGroup = true;
	if (url.searchParams.get('openToNewMembers') === 'true') filters.openToNewMembers = true;
	if (url.searchParams.get('seekingCoach') === 'true') filters.seekingCoach = true;

	try {
		if (type === 'coaches') {
			return json(await searchCoaches(q, filters, cursor));
		} else if (type === 'teams') {
			return json(await searchTeams(q, filters, cursor));
		} else {
			return json(await searchPerformers(q, filters, cursor));
		}
	} catch (e) {
		console.error('Search error:', e);
		error(500, 'Search failed');
	}
};

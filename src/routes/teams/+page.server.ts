import { searchTeams } from '$server/search';
import type { PageServerLoad } from './$types';
import type { SearchFilters } from '$server/search';

export const load: PageServerLoad = async ({ url }) => {
	const initialFilters: SearchFilters = {};
	if (url.searchParams.get('openToBookOpeners') === 'true') initialFilters.openToBookOpeners = true;
	if (url.searchParams.get('openToNewMembers') === 'true') initialFilters.openToNewMembers = true;
	if (url.searchParams.get('seekingCoach') === 'true') initialFilters.seekingCoach = true;

	const { results, nextCursor } = await searchTeams('', initialFilters);
	return { initialResults: results, initialNextCursor: nextCursor, initialFilters };
};

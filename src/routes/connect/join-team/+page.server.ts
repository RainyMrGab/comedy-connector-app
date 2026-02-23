import { searchTeams } from '$server/search';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const { results, nextCursor } = await searchTeams('', { openToNewMembers: true });
	return { initialResults: results, initialNextCursor: nextCursor };
};

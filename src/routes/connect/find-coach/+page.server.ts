import { searchCoaches } from '$server/search';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const { results, nextCursor } = await searchCoaches('', {});
	return { initialResults: results, initialNextCursor: nextCursor };
};

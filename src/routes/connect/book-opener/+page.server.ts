import { searchPerformers } from '$server/search';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const { results, nextCursor } = await searchPerformers('', {});
	return { initialResults: results, initialNextCursor: nextCursor };
};

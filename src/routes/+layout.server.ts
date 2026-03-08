import type { LayoutServerLoad } from './$types';
import { IS_LOCAL } from '$server/db';

export const load: LayoutServerLoad = ({ locals }) => {
	return {
		user: locals.user,
		isLocal: IS_LOCAL
	};
};

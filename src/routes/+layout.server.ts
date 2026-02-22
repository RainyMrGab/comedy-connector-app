import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => {
	// Pass the resolved DB user to all pages via PageData
	return {
		user: locals.user
	};
};

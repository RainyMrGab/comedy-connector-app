import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/public';

export const load: PageServerLoad = ({ locals }) => {
	return {
		user: locals.user,
		deployContext: env.PUBLIC_DEPLOY_CONTEXT || 'unknown'
	};
};


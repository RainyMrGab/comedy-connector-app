import type { LayoutServerLoad } from './$types';
import { PUBLIC_DEPLOY_CONTEXT } from '$env/static/public';

// Set by netlify.toml [context.*.environment] at build time — baked into the bundle.
// Empty string locally; 'production' | 'deploy-preview' | 'branch-deploy' on Netlify.
const IS_LOCAL = !PUBLIC_DEPLOY_CONTEXT;

export const load: LayoutServerLoad = ({ locals }) => {
	return {
		user: locals.user,
		isLocal: IS_LOCAL,
		deployContext: PUBLIC_DEPLOY_CONTEXT
	};
};

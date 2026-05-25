import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';
import { PUBLIC_DEPLOY_CONTEXT } from '$env/static/public';
import { DEV_USERS } from '$config/devUsers.js';

// Set by netlify.toml [context.*.environment] at build time — baked into the bundle.
// Empty string locally; 'production' | 'deploy-preview' | 'branch-deploy' on Netlify.
const IS_LOCAL = !PUBLIC_DEPLOY_CONTEXT;

export const load: PageServerLoad = async ({ url }) => {
	if (!IS_LOCAL) redirect(302, '/');
	const returnTo = url.searchParams.get('returnTo') ?? '/profile';
	// Security: only allow relative paths
	const safeReturnTo = returnTo.startsWith('/') ? returnTo : '/profile';
	return { users: DEV_USERS, returnTo: safeReturnTo };
};

export const actions: Actions = {
	login: async ({ request, locals }) => {
		if (!IS_LOCAL) return fail(403, { error: 'Not available in production' });

		const formData = await request.formData();
		const userId = String(formData.get('userId') ?? '');
		const returnTo = String(formData.get('returnTo') ?? '/profile');
		// Security: only allow relative paths
		const safeReturnTo = returnTo.startsWith('/') ? returnTo : '/profile';

		// Only allow the known seeded dev user IDs — reject arbitrary UUIDs
		const validUser = DEV_USERS.find((u) => u.id === userId);
		if (!validUser) return fail(400, { error: 'Invalid user selection' });

		const password = env.DEV_USER_PASSWORD;
		if (!password) {
			return fail(500, {
				error: 'DEV_USER_PASSWORD is not set in .env. Run pnpm db:seed:staging first.'
			});
		}

		const { error } = await locals.supabase.auth.signInWithPassword({
			email: validUser.email,
			password
		});

		if (error) {
			return fail(400, {
				error: `Sign-in failed: ${error.message}. Make sure pnpm db:seed:staging has been run.`
			});
		}

		redirect(302, safeReturnTo);
	},

	logout: async ({ locals }) => {
		await locals.supabase.auth.signOut();
		redirect(302, '/dev-login');
	}
};

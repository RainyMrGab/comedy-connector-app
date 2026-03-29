import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { IS_LOCAL } from '$server/db';
import { DEV_USERS } from '$server/db/seed.js';

export const load: PageServerLoad = async ({ url }) => {
	if (!IS_LOCAL) redirect(302, '/');
	const returnTo = url.searchParams.get('returnTo') ?? '/profile';
	// Security: only allow relative paths
	const safeReturnTo = returnTo.startsWith('/') ? returnTo : '/profile';
	return { users: DEV_USERS, returnTo: safeReturnTo };
};

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		if (!IS_LOCAL) return fail(403, { error: 'Not available in production' });

		const formData = await request.formData();
		const userId = String(formData.get('userId') ?? '');
		const returnTo = String(formData.get('returnTo') ?? '/profile');
		// Security: only allow relative paths
		const safeReturnTo = returnTo.startsWith('/') ? returnTo : '/profile';

		// Only allow the known seeded dev user IDs — reject arbitrary UUIDs
		const validUser = DEV_USERS.find((u) => u.id === userId);
		if (!validUser) return fail(400, { error: 'Invalid user selection' });

		cookies.set('dev_session', userId, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: false,
			maxAge: 60 * 60 * 24 * 7 // 1 week
		});

		redirect(302, safeReturnTo);
	},

	logout: async ({ cookies }) => {
		cookies.delete('dev_session', { path: '/' });
		redirect(302, '/dev-login');
	}
};

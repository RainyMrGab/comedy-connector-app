import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

/**
 * /auth/set-password
 *
 * Users arrive here in two cases:
 *   1. After clicking an invite link — they're signed in but have no password yet.
 *   2. After clicking a "forgot password" reset link — they're signed in and need to set a new one.
 *
 * In both cases the callback route already exchanged the one-time code for a session,
 * so locals.user is populated and locals.supabase.auth.updateUser() will succeed.
 */
export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		const returnTo = encodeURIComponent(url.pathname);
		redirect(302, `/login?returnTo=${returnTo}`);
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { error: 'Not authenticated' });

		const formData = await request.formData();
		const password = String(formData.get('password') ?? '');
		const confirm = String(formData.get('confirm') ?? '');

		if (password.length < 8) {
			return fail(400, { error: 'Password must be at least 8 characters' });
		}
		if (password !== confirm) {
			return fail(400, { error: 'Passwords do not match' });
		}

		const { error } = await locals.supabase.auth.updateUser({ password });
		if (error) return fail(400, { error: error.message });

		redirect(302, '/profile');
	}
};

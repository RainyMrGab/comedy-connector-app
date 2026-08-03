import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * GET /auth/callback
 * Handles Supabase auth redirects: OAuth sign-in (Google and other providers),
 * email confirmation links, and password-reset links.
 * Supabase sends a `code` query param which we exchange for a session.
 * The session cookies are written by the Supabase client in locals.supabase.
 */
export const GET: RequestHandler = async ({ url, locals }) => {
	const code = url.searchParams.get('code');
	const returnTo = url.searchParams.get('returnTo') ?? '/profile';
	// Security: only allow relative paths
	const safeReturnTo = returnTo.startsWith('/') ? returnTo : '/profile';

	if (code) {
		const { error } = await locals.supabase.auth.exchangeCodeForSession(code);
		if (error) {
			console.error('OAuth callback error:', error.message);
			redirect(302, `/login?error=${encodeURIComponent(error.message)}`);
		}
	}

	redirect(302, safeReturnTo);
};

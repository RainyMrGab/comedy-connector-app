import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * POST /api/auth/logout
 * Clears the nf_jwt session cookie and redirects to the home page.
 * Works regardless of whether the user signed in via the identity widget
 * or via the embedded email/password form.
 */
export const POST: RequestHandler = async ({ cookies }) => {
	cookies.delete('nf_jwt', { path: '/' });
	redirect(302, '/');
};

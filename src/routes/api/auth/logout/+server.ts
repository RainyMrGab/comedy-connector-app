import type { RequestHandler } from './$types';

/**
 * POST /api/auth/logout
 * Signs the user out of Supabase Auth (clears session cookies).
 * Returns 204 so the caller can handle navigation client-side.
 * Not using redirect() here because use:enhance + a +server.ts redirect causes
 * the client to follow the redirect, receive HTML, and try to parse it as JSON.
 */
export const POST: RequestHandler = async ({ locals }) => {
	await locals.supabase.auth.signOut();
	return new Response(null, { status: 204 });
};

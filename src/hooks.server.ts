import type { Handle } from '@sveltejs/kit';
import { resolveUser } from '$server/auth';
import { env } from '$env/dynamic/private';

export const handle: Handle = async ({ event, resolve }) => {
	// DEV MODE AUTH BYPASS: For local development only
	// Set DEV_BYPASS_AUTH=true in .env to use a mock user
	// ⚠️ NEVER enable this in production!
	if (env.DEV_BYPASS_AUTH === 'true' && process.env.NODE_ENV === 'development') {
		console.log('[hooks] 🔓 DEV MODE: Using bypass auth');

		// Check if a real user exists with this Identity ID in your identity database
		// If not, you'll need to create one manually or via the identity-signup function
		event.locals.user = {
			id: '04a39e49-1a45-4041-89cf-db6d51a29897', // This should match a real user ID in your database
			email: 'test@user.com',
			identityId: 'dev-identity-id',
			createdAt: new Date(),
			updatedAt: new Date()
		};

		return resolve(event);
	}

	// Normal auth flow: Resolve user from nf_jwt cookie or Authorization header
	const cookieToken = event.cookies.get('nf_jwt');
	const authHeader = event.request.headers.get('authorization');

	event.locals.user = await resolveUser(cookieToken, authHeader);

	return resolve(event);
};

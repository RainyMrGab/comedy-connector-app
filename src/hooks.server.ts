import type { Handle } from '@sveltejs/kit';
import { resolveUser } from '$server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	// Resolve user from nf_jwt cookie (set by Netlify Identity widget)
	// or Authorization: Bearer <token> header (for API/form action requests)
	const cookieToken = event.cookies.get('nf_jwt');
	const authHeader = event.request.headers.get('authorization');

	event.locals.user = await resolveUser(cookieToken, authHeader);

	return resolve(event);
};

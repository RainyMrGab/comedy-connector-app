import type { Handle } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { resolveUser } from '$server/auth';
import { db, IS_LOCAL, ensureLocalDbReady } from '$server/db';
import { users } from '$server/db/schema';

export const handle: Handle = async ({ event, resolve }) => {
	// Initialize local PGLite DB on first request (no-op in production)
	await ensureLocalDbReady();

	if (IS_LOCAL) {
		// Local dev: auth via dev_session cookie set by /dev-login
		const userId = event.cookies.get('dev_session');
		if (userId) {
			const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
			event.locals.user = user ?? null;
		} else {
			event.locals.user = null;
		}
		return resolve(event);
	}

	// Production: resolve user from Netlify Identity JWT
	// (nf_jwt cookie set by the Identity widget, or Authorization: Bearer header)
	const cookieToken = event.cookies.get('nf_jwt');
	const authHeader = event.request.headers.get('authorization');
	event.locals.user = await resolveUser(cookieToken, authHeader);

	return resolve(event);
};

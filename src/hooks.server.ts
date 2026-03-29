import type { Handle } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { resolveUser } from '$server/auth';
import { db, IS_LOCAL, ensureLocalDbReady } from '$server/db';
import { users } from '$server/db/schema';

/**
 * Fire-and-forget update of lastSeenAt for freshness poll eligibility.
 * Debounced: only writes if lastSeenAt is null or older than 24 hours,
 * to avoid excessive DB writes on every request.
 */
function touchLastSeen(userId: string, lastSeenAt: Date | null): void {
	const oneDayAgo = new Date(Date.now() - 86_400_000);
	if (lastSeenAt && lastSeenAt > oneDayAgo) return; // already updated today
	db.update(users)
		.set({ lastSeenAt: new Date() })
		.where(eq(users.id, userId))
		.catch((err) => console.error('Failed to update lastSeenAt:', err));
}

export const handle: Handle = async ({ event, resolve }) => {
	// Initialize local PGLite DB on first request (no-op in production)
	await ensureLocalDbReady();

	if (IS_LOCAL) {
		// Local dev: auth via dev_session cookie set by /dev-login
		const userId = event.cookies.get('dev_session');
		if (userId) {
			const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
			event.locals.user = user ?? null;
			if (user) touchLastSeen(user.id, user.lastSeenAt ?? null);
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
	if (event.locals.user) touchLastSeen(event.locals.user.id, event.locals.user.lastSeenAt ?? null);

	return resolve(event);
};

import type { Handle } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { resolveUser } from '$server/auth';
import { db, IS_LOCAL, ensureDatabaseReady } from '$server/db';
import { users } from '$server/db/schema';

/**
 * If INITIAL_ADMIN_EMAIL is set and matches the logged-in user who isn't yet an admin,
 * promote them. Allows first-deploy bootstrap without a DB GUI.
 */
async function bootstrapAdminIfNeeded(user: (typeof users.$inferSelect) | null): Promise<void> {
	if (!user || user.admin || !env.INITIAL_ADMIN_EMAIL) return;
	if (user.email !== env.INITIAL_ADMIN_EMAIL) return;
	await db.update(users).set({ admin: true }).where(eq(users.id, user.id));
	user.admin = true;
}

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
	// Initialize database on first request (PGLite locally, Neon in production)
	// This ensures proper synchronization to prevent race conditions
	await ensureDatabaseReady();

	if (IS_LOCAL) {
		// Local dev: auth via dev_session cookie set by /dev-login
		const userId = event.cookies.get('dev_session');
		if (userId) {
			const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
			event.locals.user = user ?? null;
			if (user) {
				await bootstrapAdminIfNeeded(user);
				touchLastSeen(user.id, user.lastSeenAt ?? null);
			}
		} else {
			event.locals.user = null;
		}
	} else {
		// Production: resolve user from Netlify Identity JWT
		// (nf_jwt cookie set by the Identity widget, or Authorization: Bearer header)
		const cookieToken = event.cookies.get('nf_jwt');
		const authHeader = event.request.headers.get('authorization');
		event.locals.user = await resolveUser(cookieToken, authHeader);
		if (event.locals.user) {
			await bootstrapAdminIfNeeded(event.locals.user);
			touchLastSeen(event.locals.user.id, event.locals.user.lastSeenAt ?? null);
		}
	}

	try {
		return await resolve(event);
	} catch (err) {
		console.error(`Error handling ${event.request.method} ${event.url.pathname}:`, err);
		throw err;
	}
};

import type { Handle } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { db } from '$server/db';
import { users } from '$server/db/schema';
import { getUserByIdentityId } from '$server/auth';
import { createSupabaseServerClient } from '$server/supabase';

async function bootstrapAdminIfNeeded(user: (typeof users.$inferSelect) | null): Promise<void> {
	if (!user || user.admin || !env.INITIAL_ADMIN_EMAIL) return;
	if (user.email !== env.INITIAL_ADMIN_EMAIL) return;
	await db.update(users).set({ admin: true }).where(eq(users.id, user.id));
	user.admin = true;
}

function touchLastSeen(userId: string, lastSeenAt: Date | null): void {
	const oneDayAgo = new Date(Date.now() - 86_400_000);
	if (lastSeenAt && lastSeenAt > oneDayAgo) return;
	db.update(users)
		.set({ lastSeenAt: new Date() })
		.where(eq(users.id, userId))
		.catch((err) => console.error('Failed to update lastSeenAt:', err));
}

export const handle: Handle = async ({ event, resolve }) => {
	// Create a per-request Supabase client that reads/writes session cookies.
	const supabase = createSupabaseServerClient(event.cookies);
	event.locals.supabase = supabase;

	// getUser() validates the JWT server-side against Supabase — safe against
	// stale or tampered sessions (unlike getSession() which only reads the cookie).
	const {
		data: { user: authUser }
	} = await supabase.auth.getUser();

	if (authUser) {
		const dbUser = await getUserByIdentityId(authUser.id);
		event.locals.user = dbUser;
		if (dbUser) {
			await bootstrapAdminIfNeeded(dbUser);
			touchLastSeen(dbUser.id, dbUser.lastSeenAt ?? null);
		}
	} else {
		event.locals.user = null;
	}

	try {
		return await resolve(event);
	} catch (err) {
		console.error(`Error handling ${event.request.method} ${event.url.pathname}:`, err);
		// Log the underlying cause if present (e.g. the real Postgres error wrapped by Drizzle).
		if (err instanceof Error && err.cause) {
			console.error('Caused by:', err.cause);
		}
		throw err;
	}
};

import type { Handler } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users } from '../../src/lib/server/db/schema/users.js';
import { eq, or } from 'drizzle-orm';

/**
 * Netlify Identity event trigger — fires after email confirmation.
 * Creates (or merges) a users row linking Netlify Identity to the app database.
 *
 * Merge logic: if a user with the same email already exists (e.g. they previously
 * signed up with email/password and are now using Google), we update the existing
 * row with the new identityId and authProvider rather than creating a duplicate.
 *
 * https://docs.netlify.com/visitor-access/identity/registration-login/#registration
 */
export const handler: Handler = async (event) => {
	if (event.httpMethod !== 'POST') {
		return { statusCode: 405, body: 'Method Not Allowed' };
	}

	let payload: { user?: { id: string; email: string; app_metadata?: { provider?: string } } };
	try {
		payload = JSON.parse(event.body ?? '{}');
	} catch {
		return { statusCode: 400, body: 'Invalid JSON' };
	}

	const { user } = payload;
	if (!user?.id || !user?.email) {
		return { statusCode: 400, body: 'Missing user data in payload' };
	}

	const authProvider = user.app_metadata?.provider ?? 'email';

	try {
		const sql = neon(process.env.NETLIFY_DATABASE_URL!);
		const db = drizzle(sql);

		// Look up by identityId OR email — handles both idempotent re-fires and
		// account merges where the same email was previously registered via a
		// different auth provider.
		const existing = await db
			.select()
			.from(users)
			.where(or(eq(users.identityId, user.id), eq(users.email, user.email)))
			.limit(1);

		if (existing.length === 0) {
			// New user — create
			await db.insert(users).values({
				identityId: user.id,
				email: user.email,
				authProvider
			});
		} else if (existing[0].identityId !== user.id) {
			// Existing email, new identityId — merge: update to the new identity
			// (e.g. email/password user is now signing in via Google)
			await db
				.update(users)
				.set({ identityId: user.id, authProvider, updatedAt: new Date() })
				.where(eq(users.id, existing[0].id));
		}
		// else: exact match on identityId — already exists, nothing to do

		return {
			statusCode: 200,
			body: JSON.stringify({ app_metadata: {} })
		};
	} catch (err) {
		console.error('identity-signup error:', err);
		return {
			statusCode: 500,
			body: JSON.stringify({ error: 'Failed to create user record' })
		};
	}
};

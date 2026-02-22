import type { Handler } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users } from '../../src/lib/server/db/schema/users.js';
import { eq } from 'drizzle-orm';

/**
 * Netlify Identity event trigger — fires after email confirmation.
 * Creates a users row linking Netlify Identity to the app database.
 *
 * https://docs.netlify.com/visitor-access/identity/registration-login/#registration
 */
export const handler: Handler = async (event) => {
	if (event.httpMethod !== 'POST') {
		return { statusCode: 405, body: 'Method Not Allowed' };
	}

	let payload: { user?: { id: string; email: string } };
	try {
		payload = JSON.parse(event.body ?? '{}');
	} catch {
		return { statusCode: 400, body: 'Invalid JSON' };
	}

	const { user } = payload;
	if (!user?.id || !user?.email) {
		return { statusCode: 400, body: 'Missing user data in payload' };
	}

	try {
		const sql = neon(process.env.NETLIFY_DATABASE_URL!);
		const db = drizzle(sql);

		// Upsert — idempotent in case the function fires more than once
		const existing = await db.select().from(users).where(eq(users.identityId, user.id)).limit(1);

		if (existing.length === 0) {
			await db.insert(users).values({
				identityId: user.id,
				email: user.email
			});
		}

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

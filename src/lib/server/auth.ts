import { db } from '$server/db';
import { users } from '$server/db/schema';
import { eq } from 'drizzle-orm';
import type { DbUser } from '$types/auth';

/**
 * Look up the DB user by their Supabase Auth UUID (stored as identity_id).
 * Used by hooks.server.ts after validating the Supabase session.
 */
export async function getUserByIdentityId(identityId: string): Promise<DbUser | null> {
	const result = await db
		.select()
		.from(users)
		.where(eq(users.identityId, identityId))
		.limit(1);
	return result[0] ?? null;
}

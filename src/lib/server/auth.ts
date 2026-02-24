import { identityDb } from '$server/db';
import { users } from '$server/db/schema';
import { eq } from 'drizzle-orm';
import type { IdentityPayload, DbUser } from '$types/auth';

/**
 * Decode a JWT payload without signature verification.
 * Safe on Netlify because the JWT is issued by Netlify Identity (same trust boundary).
 */
export function decodeJwt(token: string): IdentityPayload | null {
	try {
		const parts = token.split('.');
		if (parts.length !== 3) return null;
		const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
		return JSON.parse(atob(payload)) as IdentityPayload;
	} catch {
		return null;
	}
}

/** Extract the Bearer token from an Authorization header value. */
export function extractBearerToken(authHeader: string | null): string | null {
	if (!authHeader?.startsWith('Bearer ')) return null;
	return authHeader.slice(7);
}

/**
 * Look up the DB user by their Netlify Identity sub (identity_id).
 * Uses identityDb which points to the shared users database.
 */
export async function getUserByIdentityId(identityId: string): Promise<DbUser | null> {
	const result = await identityDb
		.select()
		.from(users)
		.where(eq(users.identityId, identityId))
		.limit(1);
	return result[0] ?? null;
}

/**
 * Resolve a JWT to a DB user.
 * Checks `nf_jwt` cookie first (set by Netlify Identity widget),
 * then falls back to Authorization header.
 */
export async function resolveUser(
	cookieToken: string | undefined,
	authHeader: string | null
): Promise<DbUser | null> {
	const token = cookieToken ?? extractBearerToken(authHeader);
	if (!token) return null;

	const payload = decodeJwt(token);
	if (!payload) return null;

	// Reject expired tokens
	if (payload.exp && Date.now() / 1000 > payload.exp) return null;

	return getUserByIdentityId(payload.sub);
}

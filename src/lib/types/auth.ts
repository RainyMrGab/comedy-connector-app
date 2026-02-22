import type { User } from '$server/db/schema';

/** User row from the database */
export type DbUser = User;

/** Netlify Identity JWT payload fields we care about */
export interface IdentityPayload {
	sub: string; // identity_id
	email: string;
	exp: number;
	iat: number;
	app_metadata?: Record<string, unknown>;
	user_metadata?: Record<string, unknown>;
}

/** Shape exposed to client-side auth store */
export interface AuthUser {
	id: string;
	email: string;
	name?: string;
}

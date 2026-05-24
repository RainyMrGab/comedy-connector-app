import type { User } from '$server/db/schema';

/** User row from the database */
export type DbUser = User;

/** Shape exposed to client-side auth store */
export interface AuthUser {
	id: string;
	email: string;
	name?: string;
}

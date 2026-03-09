import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Both guards required for defense in depth:
// - NETLIFY_DATABASE_URL is auto-provisioned on Netlify (always set in production)
// - NODE_ENV is set to 'production' by Netlify on build/serve
export const IS_LOCAL =
	!process.env.NETLIFY_DATABASE_URL && process.env.NODE_ENV !== 'production';

let _db: ReturnType<typeof drizzle> | null = null;
let _initPromise: Promise<void> | null = null;

/**
 * Initializes the local PGLite database on first call. No-op in production.
 * Must be awaited in hooks.server.ts before any DB access.
 */
export async function ensureLocalDbReady(): Promise<void> {
	if (!IS_LOCAL || _db) return;
	if (!_initPromise) {
		_initPromise = (async () => {
			const { createLocalDb } = await import('./local.js');
			_db = (await createLocalDb()) as unknown as ReturnType<typeof drizzle>;
		})().catch((err) => {
			_initPromise = null; // allow retry on next request
			throw err;
		});
	}
	await _initPromise;
}

/**
 * Drizzle database instance. In production, lazily initializes the Neon connection.
 * In local dev, populated by ensureLocalDbReady() before first use.
 */
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
	get(_, prop) {
		if (!_db) {
			if (IS_LOCAL) {
				throw new Error('Local DB not ready — ensureLocalDbReady() must be awaited first');
			}
			const url = process.env.NETLIFY_DATABASE_URL!;
			const sql = neon(url);
			_db = drizzle(sql, { schema });
		}
		return Reflect.get(_db!, prop);
	}
});

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
 * Initializes the production Neon connection on first call.
 * Uses _initPromise to prevent race conditions from concurrent requests.
 */
async function ensureProductionDbReady(): Promise<void> {
	if (_db) return;
	if (!_initPromise) {
		_initPromise = (async () => {
			const url = process.env.NETLIFY_DATABASE_URL;
			if (!url) {
				throw new Error(
					'NETLIFY_DATABASE_URL is not set. Set it in Netlify dashboard under Site settings → Environment.'
				);
			}
			const sql = neon(url);
			_db = drizzle(sql, { schema });
		})().catch((err) => {
			_initPromise = null; // allow retry on next request
			throw err;
		});
	}
	await _initPromise;
}

/**
 * Drizzle database instance. In production, lazily initializes the Neon connection
 * with proper synchronization to prevent race conditions.
 * In local dev, populated by ensureLocalDbReady() before first use.
 */
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
	get(_, prop) {
		if (!_db) {
			if (IS_LOCAL) {
				throw new Error('Local DB not ready — ensureLocalDbReady() must be awaited first');
			}
			// Production: synchronously trigger async init, but accessing db._someMethod
			// during initialization window will throw. This is safer than silently failing.
			// In practice, ensureDatabaseReady() should be called in hooks.server.ts
			throw new Error(
				'Database not initialized. This should not happen if ensureDatabaseReady() was awaited in hooks.server.ts'
			);
		}
		return Reflect.get(_db!, prop);
	}
});

/**
 * Ensures database is ready before first use.
 * In local dev: initializes PGLite
 * In production: initializes Neon connection with proper sync to prevent race conditions
 * Must be awaited in hooks.server.ts before any DB access.
 */
export async function ensureDatabaseReady(): Promise<void> {
	if (IS_LOCAL) {
		await ensureLocalDbReady();
	} else {
		await ensureProductionDbReady();
	}
}

import { env } from '$env/dynamic/private';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

let _db: DrizzleDb | null = null;

function getDb(): DrizzleDb {
	if (!_db) {
		const url = env.SUPABASE_DATABASE_URL;
		if (!url) throw new Error('SUPABASE_DATABASE_URL is not set. Add it to your .env file.');
		// prepare: false is required for Supabase Transaction Pooler (pgBouncer).
		// max: 1 prevents connection exhaustion in serverless environments.
		const client = postgres(url, { max: 1, prepare: false });
		_db = drizzle(client, { schema });
	}
	return _db;
}

// Lazy proxy — DB client is only initialized on first query, not at module import time.
// This allows the module to be imported during build without SUPABASE_DATABASE_URL.
export const db = new Proxy({} as DrizzleDb, {
	get(_, prop) {
		return Reflect.get(getDb(), prop);
	}
});

// No-op kept for call sites in hooks.server.ts — previously needed for PGLite async init.
export async function ensureDatabaseReady(): Promise<void> {}

// True when running in local development (pnpm dev). Used to gate /dev-login
// and route auth to the dev_session cookie instead of Netlify Identity.
export const IS_LOCAL = process.env.NODE_ENV !== 'production';

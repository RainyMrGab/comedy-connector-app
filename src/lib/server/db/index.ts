import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Lazy initialization to avoid requiring DB URL at build time
let _db: NeonHttpDatabase<typeof schema> | null = null;
let _identityDb: NeonHttpDatabase<typeof schema> | null = null;

function getDb() {
	if (!_db) {
		const NETLIFY_DATABASE_URL = process.env.NETLIFY_DATABASE_URL;
		if (!NETLIFY_DATABASE_URL) {
			throw new Error('NETLIFY_DATABASE_URL environment variable is not set');
		}
		const sql = neon(NETLIFY_DATABASE_URL);
		_db = drizzle(sql, { schema });
	}
	return _db;
}

function getIdentityDb() {
	if (!_identityDb) {
		const NETLIFY_DATABASE_URL_IDENTITY = process.env.NETLIFY_DATABASE_URL_IDENTITY || process.env.NETLIFY_DATABASE_URL;
		if (!NETLIFY_DATABASE_URL_IDENTITY) {
			throw new Error('NETLIFY_DATABASE_URL_IDENTITY environment variable is not set');
		}
		const sql = neon(NETLIFY_DATABASE_URL_IDENTITY);
		_identityDb = drizzle(sql, { schema });
	}
	return _identityDb;
}

export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
	get(_, prop) {
		return (getDb() as any)[prop];
	}
});

export const identityDb = new Proxy({} as NeonHttpDatabase<typeof schema>, {
	get(_, prop) {
		return (getIdentityDb() as any)[prop];
	}
});


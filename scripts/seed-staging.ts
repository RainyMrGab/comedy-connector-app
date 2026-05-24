/**
 * Seed the Supabase staging database with Muppets test data.
 *
 * Usage:
 *   pnpm db:seed:staging
 *
 * Requires SUPABASE_DATABASE_URL in .env pointing to the Supabase staging project.
 * Idempotent — safe to run multiple times.
 */
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../src/lib/server/db/schema/index.js';
import { seedDb } from '../src/lib/server/db/seed.js';

const url = process.env.SUPABASE_DATABASE_URL;
if (!url) {
	console.error('ERROR: SUPABASE_DATABASE_URL is not set. Add it to your .env file.');
	process.exit(1);
}

const client = postgres(url, { max: 1, prepare: false });
const db = drizzle(client, { schema });

console.log('Seeding staging database...');
try {
	await seedDb(db);
	console.log('Done.');
} finally {
	await client.end();
}

import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import * as schema from './schema/index.js';
import { seedLocalDb } from './seed.js';

/**
 * Bootstraps the initial schema from the SQL file generated via drizzle-kit.
 * The prod DB was created via `db:push` so this file isn't in the migration journal,
 * but PGLite needs it to create tables from scratch. "Already exists" errors are
 * silently skipped so this is safe to run against a partially-initialized DB.
 */
async function bootstrapSchema(client: PGlite): Promise<void> {
	const sql = await readFile('src/lib/server/db/migrations/0000_initial_schema.sql', 'utf-8');
	const statements = sql
		.split('--> statement-breakpoint')
		.map((s) => s.trim())
		.filter(Boolean);
	for (const statement of statements) {
		try {
			await client.exec(statement);
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			if (/already exists/i.test(msg)) continue;
			throw err;
		}
	}
}

/**
 * Creates and initializes a local PGLite database instance.
 * Bootstraps the initial schema, then applies incremental migrations via
 * Drizzle's official migrator, then seeds test data.
 * The DB persists to .local-db/ (gitignored).
 */
export async function createLocalDb() {
	const client = new PGlite('.local-db');
	await client.ready;

	const db = drizzle({ client, schema });

	await bootstrapSchema(client);
	await migrate(db, { migrationsFolder: 'src/lib/server/db/migrations' });
	await seedLocalDb(db);

	return db;
}

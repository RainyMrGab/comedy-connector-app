import { defineConfig } from 'drizzle-kit';

// Used for local dev tooling (db:studio:local) against the PGLite file DB.
// The main drizzle.config.ts is used for production (Neon Postgres).
export default defineConfig({
	schema: './src/lib/server/db/schema',
	out: './src/lib/server/db/migrations',
	dialect: 'postgresql',
	driver: 'pglite',
	dbCredentials: {
		url: '.local-db'
	}
});

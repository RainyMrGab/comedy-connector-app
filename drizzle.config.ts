import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './src/lib/server/db/schema',
	out: './src/lib/server/db/migrations',
	dialect: 'postgresql',
	dbCredentials: {
		// Use the direct connection URL (port 5432) for schema operations — the Transaction
		// Pooler (port 6543) doesn't support the DDL queries drizzle-kit runs.
		// Get it from: Supabase → Project Settings → Database → Direct connection.
		url: (process.env.SUPABASE_DIRECT_URL ?? process.env.SUPABASE_DATABASE_URL)!
	}
});

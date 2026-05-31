import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './src/lib/server/db/schema',
	out: './src/lib/server/db/migrations',
	dialect: 'postgresql',
	dbCredentials: {
		// Use Session Pooler URL (port 5432)
		// Get it from: Supabase → Project Settings → Database → Connection string → Session pooler.
		url: (process.env.SUPABASE_DIRECT_URL ?? process.env.SUPABASE_DATABASE_URL)!
	}
});

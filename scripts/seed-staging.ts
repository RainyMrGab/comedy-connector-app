/**
 * Seed the Supabase staging database with Muppets test data.
 *
 * Usage:
 *   pnpm db:seed:staging
 *   DEV_USER_PASSWORD=mypassword pnpm db:seed:staging   # also creates Supabase Auth users
 *
 * Requires in .env:
 *   SUPABASE_DATABASE_URL  — staging Transaction Pooler URL (port 6543)
 *   SUPABASE_URL           — staging project API URL (https://xxxx.supabase.co)
 *   SUPABASE_SERVICE_ROLE_KEY — staging service role key (for admin user creation)
 *   DEV_USER_PASSWORD      — shared password for all test Supabase Auth users
 *
 * Idempotent — safe to run multiple times.
 */
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { createClient } from '@supabase/supabase-js';
import * as schema from '../src/lib/server/db/schema/index.js';
import { seedDb } from '../src/lib/server/db/seed.js';
import { DEV_USERS } from '../src/lib/config/devUsers.js';

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
	console.log('  ✓ App data seeded');
} finally {
	await client.end();
}

// Create Supabase Auth users if credentials are provided
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const devPassword = process.env.DEV_USER_PASSWORD;

if (!supabaseUrl || !supabaseKey || !devPassword) {
	console.log(
		'\nSkipping Supabase Auth user creation — set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,\n' +
		'and DEV_USER_PASSWORD in .env to create test auth users for /dev-login.'
	);
	console.log('Done.');
	process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
	auth: { autoRefreshToken: false, persistSession: false }
});

console.log('\nCreating Supabase Auth users...');
for (const user of DEV_USERS) {
	const { error } = await supabase.auth.admin.createUser({
		email: user.email,
		password: devPassword,
		email_confirm: true
	});

	if (error) {
		if (error.message.toLowerCase().includes('already been registered') || error.message.toLowerCase().includes('already exists')) {
			console.log(`  ✓ ${user.email} (already exists)`);
		} else {
			console.warn(`  ⚠ ${user.email}: ${error.message}`);
		}
	} else {
		console.log(`  ✓ ${user.email}`);
	}
}

console.log('Done.');

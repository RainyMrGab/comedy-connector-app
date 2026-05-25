import { env } from '$env/dynamic/private';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { Cookies } from '@sveltejs/kit';

/**
 * Create a Supabase admin client using the service role key.
 * Bypasses RLS — use only in server-side code after verifying the user is authenticated.
 * Use for storage uploads, admin queries, and seeding.
 */
export function createSupabaseAdminClient() {
	const supabaseUrl = env.SUPABASE_URL;
	const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

	if (!supabaseUrl || !serviceRoleKey) {
		throw new Error(
			'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for admin operations.'
		);
	}

	return createClient(supabaseUrl, serviceRoleKey, {
		auth: { autoRefreshToken: false, persistSession: false }
	});
}

/**
 * Create a Supabase server client that reads/writes session cookies via the
 * SvelteKit `Cookies` interface. Call once per request in hooks.server.ts
 * and attach the result to `event.locals.supabase`.
 */
export function createSupabaseServerClient(cookies: Cookies) {
	const supabaseUrl = env.SUPABASE_URL;
	const supabaseAnonKey = env.SUPABASE_ANON_KEY;

	if (!supabaseUrl || !supabaseAnonKey) {
		throw new Error(
			'SUPABASE_URL and SUPABASE_ANON_KEY must be set. Add them to your .env file.'
		);
	}

	return createServerClient(supabaseUrl, supabaseAnonKey, {
		cookies: {
			getAll() {
				return cookies.getAll();
			},
			setAll(cookiesToSet) {
				cookiesToSet.forEach(({ name, value, options }) =>
					cookies.set(name, value, { ...options, path: '/' })
				);
			}
		}
	});
}

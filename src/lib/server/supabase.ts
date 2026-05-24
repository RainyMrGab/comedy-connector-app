import { env } from '$env/dynamic/private';
import { createServerClient } from '@supabase/ssr';
import type { Cookies } from '@sveltejs/kit';

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

import type { DbUser } from '$lib/types/auth';
import type { SupabaseClient } from '@supabase/supabase-js';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: DbUser | null;
			supabase: SupabaseClient;
		}
		interface PageData {
			user?: DbUser | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};

import type { DbUser } from '$lib/types/auth';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: DbUser | null;
		}
		interface PageData {
			user?: DbUser | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};

import type { AuthUser } from '$types/auth';

// Svelte 5 rune-based auth state — shared across all components.
// The server is the source of truth; this store reflects the SSR-resolved user.
let _user = $state<AuthUser | null>(null);
let _loading = $state(true);

export const authStore = {
	get user() {
		return _user;
	},
	get loading() {
		return _loading;
	},
	get isAuthenticated() {
		return _user !== null;
	},

	setUser(user: AuthUser | null) {
		_user = user;
		_loading = false;
	},

	clearUser() {
		_user = null;
		_loading = false;
	},

	setLoading(loading: boolean) {
		_loading = loading;
	}
};

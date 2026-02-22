import type { AuthUser } from '$types/auth';

// Svelte 5 rune-based auth state — shared across all components
let _user = $state<AuthUser | null>(null);
let _token = $state<string | null>(null);
let _loading = $state(true);

export const authStore = {
	get user() {
		return _user;
	},
	get token() {
		return _token;
	},
	get loading() {
		return _loading;
	},
	get isAuthenticated() {
		return _user !== null;
	},

	setUser(user: AuthUser | null, token: string | null) {
		_user = user;
		_token = token;
		_loading = false;
	},

	clearUser() {
		_user = null;
		_token = null;
		_loading = false;
	},

	setLoading(loading: boolean) {
		_loading = loading;
	}
};

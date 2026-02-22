/**
 * Type declarations for netlify-identity-widget (no @types package available).
 */
declare module 'netlify-identity-widget' {
	export interface User {
		id: string;
		email: string;
		user_metadata?: {
			full_name?: string;
			avatar_url?: string;
			[key: string]: unknown;
		};
		app_metadata?: Record<string, unknown>;
		token?: {
			access_token: string;
			token_type: string;
			expires_in: number;
			refresh_token: string;
			expires_at: number;
		};
		created_at?: string;
		updated_at?: string;
	}

	export type EventName = 'init' | 'login' | 'logout' | 'error' | 'open' | 'close';

	export interface InitOptions {
		container?: string | HTMLElement;
		APIUrl?: string;
		logo?: boolean;
	}

	export function init(options?: InitOptions): void;
	export function open(tab?: 'login' | 'signup'): void;
	export function close(): void;
	export function logout(): void;
	export function currentUser(): User | null;
	export function refresh(force?: boolean): Promise<string>;
	export function on(event: 'init', cb: (user: User | null) => void): void;
	export function on(event: 'login', cb: (user: User) => void): void;
	export function on(event: 'logout', cb: () => void): void;
	export function on(event: 'error', cb: (err: Error) => void): void;
	export function on(event: 'open', cb: () => void): void;
	export function on(event: 'close', cb: () => void): void;
	export function off(event: EventName, cb?: Function): void;

	const _default: {
		init: typeof init;
		open: typeof open;
		close: typeof close;
		logout: typeof logout;
		currentUser: typeof currentUser;
		refresh: typeof refresh;
		on: typeof on;
		off: typeof off;
	};
	export default _default;
}

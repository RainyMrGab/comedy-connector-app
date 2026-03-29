import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { IS_LOCAL } from '$server/db';

export const load: PageServerLoad = async ({ locals, url }) => {
	const returnTo = url.searchParams.get('returnTo') ?? '/profile';
	// Security: only allow relative paths
	const safeReturnTo = returnTo.startsWith('/') ? returnTo : '/profile';

	// Already authenticated — skip login
	if (locals.user) redirect(302, safeReturnTo);

	// Local dev — delegate to /dev-login (which has the test user picker)
	if (IS_LOCAL) redirect(302, `/dev-login?returnTo=${encodeURIComponent(safeReturnTo)}`);

	return { returnTo: safeReturnTo };
};

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const formData = await request.formData();
		const email = String(formData.get('email') ?? '').trim();
		const password = String(formData.get('password') ?? '');
		const returnTo = String(formData.get('returnTo') ?? '/profile');
		const safeReturnTo = returnTo.startsWith('/') ? returnTo : '/profile';

		if (!email || !password) {
			return fail(400, { error: 'Email and password are required', returnTo: safeReturnTo });
		}

		// Call GoTrue token endpoint using the current request's origin so this
		// works correctly on preview deploys as well as production.
		const origin = new URL(request.url).origin;
		let response: Response;
		try {
			response = await fetch(`${origin}/.netlify/identity/token`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: new URLSearchParams({ grant_type: 'password', username: email, password })
			});
		} catch {
			return fail(500, { error: 'Unable to reach the authentication service. Try again.', returnTo: safeReturnTo });
		}

		if (!response.ok) {
			const err = (await response.json().catch(() => ({}))) as Record<string, unknown>;
			const message =
				typeof err.error_description === 'string' ? err.error_description : 'Invalid email or password';
			return fail(400, { error: message, returnTo: safeReturnTo });
		}

		const data = (await response.json()) as { access_token: string; expires_in: number };

		// Set the nf_jwt cookie — must NOT be httpOnly so the identity widget can
		// read it for token refresh. This mirrors how the widget itself sets it.
		cookies.set('nf_jwt', data.access_token, {
			path: '/',
			httpOnly: false,
			sameSite: 'lax',
			maxAge: data.expires_in,
			secure: true // HTTPS only in prod; Netlify always uses HTTPS
		});

		redirect(302, safeReturnTo);
	}
};

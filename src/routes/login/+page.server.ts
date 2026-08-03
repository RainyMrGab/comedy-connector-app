import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { PUBLIC_DEPLOY_CONTEXT } from '$env/static/public';

// Set by netlify.toml [context.*.environment] at build time — baked into the bundle.
// Empty string locally; 'production' | 'deploy-preview' | 'branch-deploy' on Netlify.
const IS_LOCAL = !PUBLIC_DEPLOY_CONTEXT;

export const load: PageServerLoad = async ({ locals, url }) => {
	const returnTo = url.searchParams.get('returnTo') ?? '/profile';
	// Security: only allow relative paths
	const safeReturnTo = returnTo.startsWith('/') ? returnTo : '/profile';
	const authError = url.searchParams.get('error');

	// Already authenticated — skip login
	if (locals.user) redirect(302, safeReturnTo);

	// Local dev — delegate to /dev-login (which has the test user picker).
	if (IS_LOCAL) redirect(302, `/dev-login?returnTo=${encodeURIComponent(safeReturnTo)}`);

	return { returnTo: safeReturnTo, error: authError };
};

export const actions: Actions = {
	login: async ({ request, locals }) => {
		const formData = await request.formData();
		const email = String(formData.get('email') ?? '').trim();
		const password = String(formData.get('password') ?? '');
		const returnTo = String(formData.get('returnTo') ?? '/profile');
		const safeReturnTo = returnTo.startsWith('/') ? returnTo : '/profile';

		if (!email || !password) {
			return fail(400, { error: 'Email and password are required', returnTo: safeReturnTo, mode: 'signin' });
		}

		const { error } = await locals.supabase.auth.signInWithPassword({ email, password });
		if (error) {
			return fail(400, { error: error.message, returnTo: safeReturnTo, mode: 'signin' });
		}

		redirect(302, safeReturnTo);
	},

	signup: async ({ request, locals, url }) => {
		const formData = await request.formData();
		const email = String(formData.get('email') ?? '').trim();
		const password = String(formData.get('password') ?? '');
		const returnTo = String(formData.get('returnTo') ?? '/profile');
		const safeReturnTo = returnTo.startsWith('/') ? returnTo : '/profile';

		if (!email || !password) {
			return fail(400, { error: 'Email and password are required', returnTo: safeReturnTo, mode: 'signup' });
		}
		if (password.length < 8) {
			return fail(400, { error: 'Password must be at least 8 characters', returnTo: safeReturnTo, mode: 'signup' });
		}

		const { data, error } = await locals.supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: `${url.origin}/auth/callback?returnTo=${encodeURIComponent(safeReturnTo)}`
			}
		});
		if (error) {
			return fail(400, { error: error.message, returnTo: safeReturnTo, mode: 'signup' });
		}

		// No session means email confirmation is required — Supabase already sent the
		// confirmation email. Show a "check your email" state instead of redirecting.
		if (!data.session) {
			return { signupSent: true, mode: 'signup' as const, email };
		}

		redirect(302, safeReturnTo);
	},

	forgotPassword: async ({ request, url, locals }) => {
		const formData = await request.formData();
		const email = String(formData.get('email') ?? '').trim();

		if (!email) return fail(400, { error: 'Email is required', mode: 'forgot' as const });

		// Redirect back through our callback so the session cookie is written,
		// then on to the set-password page where they call updateUser({ password }).
		const redirectTo = `${url.origin}/auth/callback?returnTo=${encodeURIComponent('/auth/set-password')}`;

		// Supabase intentionally returns success even for unknown emails
		// (prevents email-enumeration attacks), so we don't branch on the result.
		await locals.supabase.auth.resetPasswordForEmail(email, { redirectTo });

		return { forgotSent: true };
	},

	loginWithGoogle: async ({ request, locals, url }) => {
		const formData = await request.formData();
		const returnTo = String(formData.get('returnTo') ?? '/profile');
		const safeReturnTo = returnTo.startsWith('/') ? returnTo : '/profile';

		const { data, error } = await locals.supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				// Pass returnTo through the OAuth round-trip so the callback can redirect correctly.
				redirectTo: `${url.origin}/auth/callback?returnTo=${encodeURIComponent(safeReturnTo)}`
			}
		});

		if (error || !data.url) {
			return fail(500, { error: 'Could not initiate Google sign-in. Please try again.', returnTo: safeReturnTo, mode: 'signin' });
		}

		redirect(302, data.url);
	}
};

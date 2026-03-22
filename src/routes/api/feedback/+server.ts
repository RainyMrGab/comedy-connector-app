import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sendFeedback } from '$server/email';
import { env as publicEnv } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

/**
 * POST /api/feedback
 * Accepts anonymous feedback and sends it via Resend to the configured FEEDBACK_EMAIL.
 * Spam protections: honeypot field + minimum time-on-page check.
 */
export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => error(400, 'Invalid JSON'));
	const { message, name, email, website, loadedAt } = body as {
		message?: string;
		name?: string;
		email?: string;
		website?: string;
		loadedAt?: number;
	};

	// Honeypot — bots fill hidden fields, humans don't
	if (website) return json({ ok: true }); // silently accept to avoid tipping off bots

	// Time check — reject if form was submitted less than 3 seconds after page load
	if (typeof loadedAt === 'number' && Date.now() - loadedAt < 3000) {
		return json({ ok: true }); // same silent accept
	}

	if (!message?.trim()) error(400, 'Message is required');
	if (message.length > 5000) error(400, 'Message too long');
	if (name && name.length > 200) error(400, 'Name too long');
	if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) error(400, 'Invalid email address');

	const to = privateEnv.FEEDBACK_EMAIL;
	if (!to) {
		console.error('FEEDBACK_EMAIL is not configured');
		error(500, 'Feedback is not configured');
	}

	const siteUrl = publicEnv.PUBLIC_SITE_URL ?? 'https://comedyconnector.app';

	try {
		await sendFeedback({
			to,
			message: message.trim(),
			name: name?.trim() || undefined,
			email: email?.trim() || undefined,
			siteUrl
		});
	} catch (err) {
		console.error('Failed to send feedback email:', err);
		error(500, 'Failed to send feedback');
	}

	return json({ ok: true });
};

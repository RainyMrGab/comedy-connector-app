import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$server/db';
import { personalProfiles, teams, users, contactMessages } from '$server/db/schema';
import { eq } from 'drizzle-orm';
import { sendContactMessage } from '$server/email';
import { env } from '$env/dynamic/public';

/**
 * POST /api/contact
 * Sends a contact message from an authenticated user to a performer, coach, or team.
 * Logs the message in the DB and sends it via Resend.
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) error(401, 'You must be logged in to send messages');

	const body = await request.json().catch(() => error(400, 'Invalid JSON'));
	const { recipientId, recipientType, subject, message } = body as {
		recipientId?: string;
		recipientType?: string;
		subject?: string;
		message?: string;
	};

	if (!recipientId || !recipientType) error(400, 'recipientId and recipientType are required');
	if (!subject?.trim()) error(400, 'Subject is required');
	if (!message?.trim()) error(400, 'Message is required');
	if (subject.length > 200) error(400, 'Subject too long');
	if (message.length > 5000) error(400, 'Message too long');
	if (recipientType !== 'personal_profile' && recipientType !== 'team') {
		error(400, 'Invalid recipientType');
	}

	// Resolve recipient email and name
	let recipientEmail: string | null = null;
	let recipientName: string;

	if (recipientType === 'personal_profile') {
		const [profile] = await db
			.select({
				name: personalProfiles.name,
				contactEmail: personalProfiles.contactEmail,
				userEmail: users.email
			})
			.from(personalProfiles)
			.innerJoin(users, eq(personalProfiles.userId, users.id))
			.where(eq(personalProfiles.id, recipientId))
			.limit(1);

		if (!profile) error(404, 'Recipient not found');
		recipientEmail = profile.contactEmail ?? profile.userEmail;
		recipientName = profile.name;
	} else {
		// team — send to primary contact
		const [team] = await db
			.select({
				name: teams.name,
				primaryContactProfileId: teams.primaryContactProfileId
			})
			.from(teams)
			.where(eq(teams.id, recipientId))
			.limit(1);

		if (!team) error(404, 'Team not found');
		if (!team.primaryContactProfileId) error(422, 'This team has no primary contact set');

		const [contact] = await db
			.select({
				contactEmail: personalProfiles.contactEmail,
				userEmail: users.email
			})
			.from(personalProfiles)
			.innerJoin(users, eq(personalProfiles.userId, users.id))
			.where(eq(personalProfiles.id, team.primaryContactProfileId))
			.limit(1);

		if (!contact) error(404, 'Team contact not found');
		recipientEmail = contact.contactEmail ?? contact.userEmail;
		recipientName = team.name;
	}

	if (!recipientEmail) error(422, 'Recipient has no email address');

	const siteUrl = env.PUBLIC_SITE_URL ?? 'https://comedyconnector.app';

	// Log the message first
	await db.insert(contactMessages).values({
		recipientType: recipientType as 'personal_profile' | 'team',
		recipientId,
		senderUserId: locals.user.id,
		subject: subject.trim(),
		message: message.trim()
	});

	// Send the email (fire after DB insert so the log is always written)
	try {
		await sendContactMessage({
			to: recipientEmail,
			replyTo: locals.user.email,
			senderName: locals.user.email, // sender name resolved below if they have a profile
			recipientName,
			subject: subject.trim(),
			message: message.trim(),
			siteUrl
		});
	} catch (emailErr) {
		console.error('Failed to send contact email:', emailErr);
		// Still return success — message is logged, email delivery is best-effort
	}

	return json({ ok: true });
};

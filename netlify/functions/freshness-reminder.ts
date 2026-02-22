import type { Handler } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, and } from 'drizzle-orm';
import { personalProfiles } from '../../src/lib/server/db/schema/personal_profiles.js';
import { teams } from '../../src/lib/server/db/schema/teams.js';

/**
 * Scheduled function — runs on the 1st of each month at 9am EST (14:00 UTC).
 * Sends freshness reminder emails to performers and team primary contacts.
 * Schedule configured in netlify.toml.
 *
 * Phase 8 implementation: email sending via Resend.
 */
export const handler: Handler = async () => {
	const sql = neon(process.env.NETLIFY_DATABASE_URL!);
	const db = drizzle(sql);

	// Gather recipients who have reminders enabled
	const performerRecipients = await db
		.select({
			id: personalProfiles.id,
			name: personalProfiles.name,
			contactEmail: personalProfiles.contactEmail,
			slug: personalProfiles.slug
		})
		.from(personalProfiles)
		.where(eq(personalProfiles.freshnessRemindersEnabled, true));

	const teamRecipients = await db
		.select({
			id: teams.id,
			name: teams.name,
			slug: teams.slug,
			primaryContactProfileId: teams.primaryContactProfileId
		})
		.from(teams)
		.where(and(eq(teams.freshnessRemindersEnabled, true), eq(teams.status, 'active')));

	// TODO (Phase 8): Send emails via Resend
	// For now, just log recipients
	console.log(
		`Freshness reminder: ${performerRecipients.length} performers, ${teamRecipients.length} teams`
	);

	return {
		statusCode: 200,
		body: JSON.stringify({
			sent: {
				performers: performerRecipients.length,
				teams: teamRecipients.length
			}
		})
	};
};

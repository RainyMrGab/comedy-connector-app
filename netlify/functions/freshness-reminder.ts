import type { Handler } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, and } from 'drizzle-orm';
import { Resend } from 'resend';
import { personalProfiles } from '../../src/lib/server/db/schema/personal_profiles.js';
import { teams } from '../../src/lib/server/db/schema/teams.js';
import { users } from '../../src/lib/server/db/schema/users.js';

/**
 * Scheduled function — runs on the 1st of each month at 14:00 UTC (9am EST).
 * Sends freshness reminder emails to performers and active team primary contacts.
 * Schedule configured in netlify.toml: [functions."freshness-reminder"] schedule = "0 14 1 * *"
 */
export const handler: Handler = async () => {
	const dbUrl = process.env.NETLIFY_DATABASE_URL;
	const resendKey = process.env.RESEND_API_KEY;
	const siteUrl = process.env.PUBLIC_SITE_URL ?? 'https://comedyconnector.app';

	if (!dbUrl) return { statusCode: 500, body: 'NETLIFY_DATABASE_URL not set' };
	if (!resendKey) return { statusCode: 500, body: 'RESEND_API_KEY not set' };

	const sql = neon(dbUrl);
	const db = drizzle(sql);
	const resend = new Resend(resendKey);
	const hostname = new URL(siteUrl).hostname;

	let sent = 0;
	let errors = 0;

	// ---- Performer reminders ----
	const performers = await db
		.select({
			name: personalProfiles.name,
			slug: personalProfiles.slug,
			contactEmail: personalProfiles.contactEmail,
			userEmail: users.email
		})
		.from(personalProfiles)
		.innerJoin(users, eq(personalProfiles.userId, users.id))
		.where(eq(personalProfiles.freshnessRemindersEnabled, true));

	for (const p of performers) {
		const to = p.contactEmail ?? p.userEmail;
		try {
			await resend.emails.send({
				from: `Comedy Connector <noreply@${hostname}>`,
				to,
				subject: `Keep your Comedy Connector profile fresh!`,
				html: buildReminderHtml(p.name, `${siteUrl}/performers/${p.slug}`, siteUrl),
				text: `Hey ${p.name}!\n\nUpdate your profile: ${siteUrl}/performers/${p.slug}`
			});
			sent++;
		} catch (e) {
			console.error(`Performer reminder failed for ${to}:`, e);
			errors++;
		}
	}

	// ---- Team reminders ----
	const activeTeams = await db
		.select({
			name: teams.name,
			slug: teams.slug,
			primaryContactProfileId: teams.primaryContactProfileId
		})
		.from(teams)
		.where(and(eq(teams.freshnessRemindersEnabled, true), eq(teams.status, 'active')));

	for (const team of activeTeams) {
		if (!team.primaryContactProfileId) continue;

		const [contact] = await db
			.select({
				name: personalProfiles.name,
				contactEmail: personalProfiles.contactEmail,
				userEmail: users.email
			})
			.from(personalProfiles)
			.innerJoin(users, eq(personalProfiles.userId, users.id))
			.where(eq(personalProfiles.id, team.primaryContactProfileId))
			.limit(1);

		if (!contact) continue;

		const to = contact.contactEmail ?? contact.userEmail;
		try {
			await resend.emails.send({
				from: `Comedy Connector <noreply@${hostname}>`,
				to,
				subject: `Keep your ${team.name} team profile fresh!`,
				html: buildTeamReminderHtml(
					contact.name,
					team.name,
					`${siteUrl}/teams/${team.slug}`,
					siteUrl
				),
				text: `Hey ${contact.name}!\n\nUpdate the ${team.name} profile: ${siteUrl}/teams/${team.slug}`
			});
			sent++;
		} catch (e) {
			console.error(`Team reminder failed for ${to} (${team.name}):`, e);
			errors++;
		}
	}

	console.log(`Freshness reminders: ${sent} sent, ${errors} errors`);
	return {
		statusCode: 200,
		body: JSON.stringify({ sent, errors, performers: performers.length, teams: activeTeams.length })
	};
};

function buildReminderHtml(name: string, profileUrl: string, siteUrl: string): string {
	return `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
<h2 style="color:#7c3aed">Hey ${name}!</h2>
<p>It's been a while — take a moment to make sure your Comedy Connector profile is up to date.</p>
<p>Updated profiles help the community find and connect with the right people.</p>
<a href="${profileUrl}" style="display:inline-block;background:#7c3aed;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">Update My Profile</a>
<p style="color:#9ca3af;font-size:12px;margin-top:24px">
  Sent via <a href="${siteUrl}">${siteUrl}</a>. <a href="${profileUrl}/edit">Manage preferences</a>
</p></div>`;
}

function buildTeamReminderHtml(
	contactName: string,
	teamName: string,
	teamUrl: string,
	siteUrl: string
): string {
	return `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
<h2 style="color:#7c3aed">Hey ${contactName}!</h2>
<p>Just a reminder to keep the <strong>${teamName}</strong> profile on Comedy Connector up to date.</p>
<a href="${teamUrl}" style="display:inline-block;background:#7c3aed;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">Update Team Profile</a>
<p style="color:#9ca3af;font-size:12px;margin-top:24px">
  Sent via <a href="${siteUrl}">${siteUrl}</a>. <a href="${teamUrl}/edit">Manage team preferences</a>
</p></div>`;
}

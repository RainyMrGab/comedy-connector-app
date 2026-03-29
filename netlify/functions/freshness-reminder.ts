import type { Handler } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { Resend } from 'resend';
import { reminderConfig } from '../../src/lib/config/reminders.js';
import {
	getFreshnessRecipients,
	countRemainingRecipients,
	buildFreshnessEmailHtml,
	buildFreshnessEmailText,
	getInactiveSinceCutoff,
	FRESHNESS_EMAIL_SUBJECT
} from '../../src/lib/server/reminders.js';

/**
 * Scheduled function — runs daily on the 1st–7th of each month at 10am EST (15:00 UTC).
 * Sends consolidated freshness reminder emails to inactive users, 50 per day.
 * Schedule configured in netlify.toml: [functions."freshness-reminder"] schedule = "0 15 1-7 * *"
 *
 * Offset-based batching (no extra DB state):
 *   Day 1 → users 0–49, Day 2 → 50–99, ..., Day 7 → 300–349
 * On day 7 (last day of window), sends an admin alert if any eligible users were not reached.
 */
export const handler: Handler = async () => {
	const dbUrl = process.env.NETLIFY_DATABASE_URL;
	const resendKey = process.env.RESEND_API_KEY;
	const siteUrl = process.env.PUBLIC_SITE_URL ?? 'https://pgh.comedyconnector.app';
	const feedbackEmail = process.env.FEEDBACK_EMAIL;

	if (!dbUrl) return { statusCode: 500, body: 'NETLIFY_DATABASE_URL not set' };
	if (!resendKey) return { statusCode: 500, body: 'RESEND_API_KEY not set' };

	const sql = neon(dbUrl);
	const db = drizzle(sql);
	const resend = new Resend(resendKey);
	const hostname = new URL(siteUrl).hostname;
	const fromAddress = `Comedy Connector <noreply@${hostname}>`;

	const { dailyEmailLimit, pollingWindowDays } = reminderConfig;
	const dayOfMonth = new Date().getDate(); // 1–7
	const offset = (dayOfMonth - 1) * dailyEmailLimit;
	const inactiveSince = getInactiveSinceCutoff();

	let sent = 0;
	let errors = 0;

	// ---- Fetch batch ----
	const recipients = await getFreshnessRecipients(db, offset, dailyEmailLimit, inactiveSince);

	// ---- Send emails ----
	for (const recipient of recipients) {
		try {
			await resend.emails.send({
				from: fromAddress,
				to: recipient.email,
				subject: FRESHNESS_EMAIL_SUBJECT,
				html: buildFreshnessEmailHtml(recipient, siteUrl),
				text: buildFreshnessEmailText(recipient, siteUrl)
			});
			sent++;
		} catch (e) {
			console.error(`Freshness reminder failed for ${recipient.email}:`, e);
			errors++;
		}
	}

	console.log(
		`Freshness reminders day ${dayOfMonth}: ${sent} sent, ${errors} errors, offset ${offset}`
	);

	// ---- Backstop: alert admin if eligible users remain after the last polling day ----
	if (dayOfMonth === pollingWindowDays && feedbackEmail) {
		try {
			const remaining = await countRemainingRecipients(db, offset + dailyEmailLimit, inactiveSince);
			if (remaining > 0) {
				await resend.emails.send({
					from: fromAddress,
					to: feedbackEmail,
					subject: `⚠️ Comedy Connector: ${remaining} users not reached in freshness poll`,
					html: `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
  <h2 style="color:#7c3aed;">Freshness Poll Capacity Alert</h2>
  <p><strong>${remaining}</strong> eligible user(s) were not reached during this month's polling window
  (${pollingWindowDays} days × ${dailyEmailLimit} emails/day = ${pollingWindowDays * dailyEmailLimit} max).</p>
  <p>To fix this, increase <code>dailyEmailLimit</code> or <code>pollingWindowDays</code>
  in <code>src/lib/config/reminders.ts</code> and update the cron schedule in <code>netlify.toml</code> accordingly.</p>
  <p style="color:#9ca3af;font-size:12px;">Sent by the Comedy Connector freshness-reminder function.</p>
</div>`,
					text: `Freshness Poll Capacity Alert\n\n${remaining} user(s) were not reached during this month's polling window (${pollingWindowDays} days × ${dailyEmailLimit}/day = ${pollingWindowDays * dailyEmailLimit} max).\n\nIncrease dailyEmailLimit or pollingWindowDays in src/lib/config/reminders.ts.`
				});
				console.log(`Backstop alert sent: ${remaining} users not reached`);
			}
		} catch (e) {
			console.error('Failed to send backstop alert:', e);
		}
	}

	return {
		statusCode: 200,
		body: JSON.stringify({
			day: dayOfMonth,
			offset,
			batchSize: recipients.length,
			sent,
			errors
		})
	};
};

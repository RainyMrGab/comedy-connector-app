import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { env } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';
import { db } from '$server/db';
import { reminderConfig } from '$config/reminders';
import {
	getFreshnessRecipients,
	buildFreshnessEmailHtml,
	buildFreshnessEmailText,
	getInactiveSinceCutoff,
	FRESHNESS_EMAIL_SUBJECT,
	type FreshnessRecipient
} from '$server/reminders';

// Only available outside production
export const load: PageServerLoad = async ({ locals, url }) => {
	if (env.PUBLIC_DEPLOY_CONTEXT === 'production') redirect(302, '/');
	if (!locals.user) redirect(302, `/login?returnTo=${encodeURIComponent(url.pathname)}`);
	return {};
};

export interface SimulateResult {
	sent: number;
	dryRun: boolean;
	errors: string[];
	recipients: Array<{ name: string; email: string; sections: string[] }>;
	firstEmailSubject?: string;
	firstEmailHtml?: string;
}

export const actions: Actions = {
	default: async ({ locals }) => {
		if (env.PUBLIC_DEPLOY_CONTEXT === 'production') return fail(403, { error: 'Not available in production' });
		if (!locals.user) return fail(401, { error: 'Not authenticated' });

		const { dailyEmailLimit } = reminderConfig;
		const inactiveSince = getInactiveSinceCutoff();

		// Always use day-1 batch (offset 0) for simulation
		const recipients = await getFreshnessRecipients(db, 0, dailyEmailLimit, inactiveSince);

		const dryRun = !privateEnv.RESEND_API_KEY;
		const siteUrl = env.PUBLIC_SITE_URL ?? 'https://pgh.comedyconnector.app';
		const errors: string[] = [];
		let sent = 0;

		if (!dryRun) {
			const { Resend } = await import('resend');
			const resend = new Resend(privateEnv.RESEND_API_KEY);
			const hostname = new URL(siteUrl).hostname;
			const fromAddress = `Comedy Connector <noreply@${hostname}>`;

			for (const recipient of recipients) {
				try {
					await resend.emails.send({
						from: fromAddress,
						to: recipient.email,
						subject: `[Comedy Connector] Is your profile still accurate? (1 min check)`,
						html: buildFreshnessEmailHtml(recipient, siteUrl),
						text: buildFreshnessEmailText(recipient, siteUrl)
					});
					sent++;
				} catch (e) {
					const msg = e instanceof Error ? e.message : String(e);
					errors.push(`${recipient.email}: ${msg}`);
				}
			}
		}

		const summaryRecipients = recipients.map((r: FreshnessRecipient) => ({
			name: r.name,
			email: r.email,
			sections: [
				'Personal',
				...(r.performer ? ['Performer'] : []),
				...(r.coach ? ['Coach'] : []),
				...r.ownedTeams.map((t) => `Team: ${t.name}`)
			]
		}));

		const firstEmailSubject = recipients.length > 0 ? FRESHNESS_EMAIL_SUBJECT : undefined;
		const firstEmailHtml =
			recipients.length > 0 ? buildFreshnessEmailHtml(recipients[0], siteUrl) : undefined;

		return {
			result: {
				sent: dryRun ? 0 : sent,
				dryRun,
				errors,
				recipients: summaryRecipients,
				firstEmailSubject,
				firstEmailHtml
			} satisfies SimulateResult
		};
	}
};

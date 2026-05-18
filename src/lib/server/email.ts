import { emailService } from '$lib/services/email';
import * as contactTemplate from './email-templates/contact';
import * as feedbackTemplate from './email-templates/feedback';
import * as teamInviteTemplate from './email-templates/team-invite';

export interface ContactEmailParams {
	to: string;
	replyTo: string;
	senderName: string;
	recipientName: string;
	subject: string;
	message: string;
	siteUrl: string;
}

export async function sendContactMessage(params: ContactEmailParams): Promise<void> {
	const { to, replyTo } = params;

	const { success, error } = await emailService.send({
		to,
		replyTo,
		subject: contactTemplate.subject(params),
		html: contactTemplate.html(params),
		text: contactTemplate.text(params)
	});

	if (!success) throw new Error(error || 'Failed to send contact email');
}

export interface FeedbackEmailParams {
	to: string;
	message: string;
	name?: string;
	email?: string;
	siteUrl: string;
}

export async function sendFeedback(params: FeedbackEmailParams): Promise<void> {
	const { to, email } = params;
	const replyTo = email ?? undefined;

	const { success, error } = await emailService.send({
		to,
		replyTo,
		subject: feedbackTemplate.subject(params),
		html: feedbackTemplate.html(params),
		text: feedbackTemplate.text(params)
	});

	if (!success) throw new Error(error || 'Failed to send feedback email');
}

export interface TeamInviteEmailParams {
	to: string;
	inviteeName: string;
	teamName: string;
	role: 'performer' | 'coach';
	// roleLabel?: string;
	inviterName: string;
	siteUrl: string;
	inviteToken?: string;
}

export async function sendTeamInvite(params: TeamInviteEmailParams): Promise<void> {
	const { to, siteUrl, inviteToken } = params;
	const approvalsUrl = `${siteUrl.replace(/\/$/, '')}/approvals${inviteToken ? `?invite=${encodeURIComponent(inviteToken)}` : ''}`;

	const templateParams = {
		...params,
		approvalsUrl
	};

	const { success, error } = await emailService.send({
		to,
		subject: teamInviteTemplate.subject(templateParams),
		html: teamInviteTemplate.html(templateParams),
		text: teamInviteTemplate.text(templateParams)
	});

	if (!success) throw new Error(error || 'Failed to send team invite email');
}

// Freshness reminder emails are now sent via src/lib/server/reminders.ts
// and the netlify/functions/freshness-reminder.ts scheduled function.

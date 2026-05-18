import { Resend } from 'resend';
import { env } from '$env/dynamic/private';
import * as contactTemplate from './email-templates/contact';
import * as feedbackTemplate from './email-templates/feedback';
import * as teamInviteTemplate from './email-templates/team-invite';

function getResend() {
	if (!env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is not set');
	return new Resend(env.RESEND_API_KEY);
}

function getFromAddress(siteUrl: string) {
	const url = new URL(siteUrl);
	return `Comedy Connector <noreply@${url.hostname}>`;
}

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
	const resend = getResend();
	const { to, replyTo, siteUrl } = params;

	await resend.emails.send({
		from: getFromAddress(siteUrl),
		to,
		replyTo,
		subject: contactTemplate.subject(params),
		html: contactTemplate.html(params),
		text: contactTemplate.text(params)
	});
}

export interface FeedbackEmailParams {
	to: string;
	message: string;
	name?: string;
	email?: string;
	siteUrl: string;
}

export async function sendFeedback(params: FeedbackEmailParams): Promise<void> {
	const resend = getResend();
	const { to, email, siteUrl } = params;
	const replyTo = email ?? undefined;

	const { error } = await resend.emails.send({
		from: getFromAddress(siteUrl),
		to,
		...(replyTo ? { replyTo } : {}),
		subject: feedbackTemplate.subject(params),
		html: feedbackTemplate.html(params),
		text: feedbackTemplate.text(params)
	});

	if (error) throw new Error(`Resend error: ${error.message}`);
}

export interface TeamInviteEmailParams {
	to: string;
	inviteeName: string;
	teamName: string;
	role: 'performer' | 'coach';
	inviterName: string;
	siteUrl: string;
	inviteToken?: string;
}

export async function sendTeamInvite(params: TeamInviteEmailParams): Promise<void> {
	const resend = getResend();
	const { to, siteUrl, inviteToken } = params;
	const approvalsUrl = `${siteUrl.replace(/\/$/, '')}/approvals${inviteToken ? `?invite=${encodeURIComponent(inviteToken)}` : ''}`;

	const templateParams = {
		...params,
		approvalsUrl
	};

	const { error } = await resend.emails.send({
		from: getFromAddress(siteUrl),
		to,
		subject: teamInviteTemplate.subject(templateParams),
		html: teamInviteTemplate.html(templateParams),
		text: teamInviteTemplate.text(templateParams)
	});

	if (error) throw new Error(`Resend error: ${error.message}`);
}

// Freshness reminder emails are now sent via src/lib/server/reminders.ts
// and the netlify/functions/freshness-reminder.ts scheduled function.

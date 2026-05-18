import { Resend } from 'resend';
import { env } from '$env/dynamic/private';

function getResend() {
	if (!env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is not set');
	return new Resend(env.RESEND_API_KEY);
}

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
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
	const { to, replyTo, senderName, recipientName, subject, message, siteUrl } = params;

	await resend.emails.send({
		from: `${siteUrl.replace(/https?:\/\//, '')} <noreply@${new URL(siteUrl).hostname}>`,
		to,
		replyTo,
		subject: `[Comedy Connector] ${subject}`,
		html: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <p style="color: #6b7280; font-size: 14px;">
    Message via Comedy Connector — reply directly to respond to ${senderName}.
  </p>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
  <p><strong>To:</strong> ${recipientName}</p>
  <p><strong>From:</strong> ${senderName}</p>
  <p><strong>Subject:</strong> ${subject}</p>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
  <div style="white-space: pre-line; line-height: 1.6;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
  <p style="color: #9ca3af; font-size: 12px;">
    This message was sent via <a href="${siteUrl}" style="color: #7c3aed;">${siteUrl}</a>.
    Reply to this email to respond directly to ${senderName}.
  </p>
</div>`,
		text: `Message via Comedy Connector — reply directly to respond to ${senderName}.\n\nTo: ${recipientName}\nFrom: ${senderName}\nSubject: ${subject}\n\n${message}\n\n---\nSent via ${siteUrl}`
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
	const { to, message, name, email, siteUrl } = params;

	const fromLabel = name ?? email ?? 'Anonymous';
	const replyTo = email ?? undefined;

	const { error } = await resend.emails.send({
		from: `Comedy Connector <noreply@${new URL(siteUrl).hostname}>`,
		to,
		...(replyTo ? { replyTo } : {}),
		subject: `[Comedy Connector] Feedback from ${fromLabel}`,
		html: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <p style="color: #6b7280; font-size: 14px;">Feedback submitted via Comedy Connector.</p>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
  ${name ? `<p><strong>Name:</strong> ${name}</p>` : ''}
  ${email ? `<p><strong>Email:</strong> ${email}</p>` : ''}
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
  <div style="white-space: pre-line; line-height: 1.6;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
  <p style="color: #9ca3af; font-size: 12px;">Sent via <a href="${siteUrl}" style="color: #7c3aed;">${siteUrl}</a></p>
</div>`,
		text: `Feedback via Comedy Connector\n\n${name ? `Name: ${name}\n` : ''}${email ? `Email: ${email}\n` : ''}\n${message}\n\n---\nSent via ${siteUrl}`
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
	const { to, inviteeName, teamName, role, inviterName, siteUrl, inviteToken } = params;
	const approvalsUrl = `${siteUrl.replace(/\/$/, '')}/approvals${inviteToken ? `?invite=${encodeURIComponent(inviteToken)}` : ''}`;
	const hostname = new URL(siteUrl).hostname;
	const safeInviteeName = escapeHtml(inviteeName);
	const safeTeamName = escapeHtml(teamName);
	const safeInviterName = escapeHtml(inviterName);
	const roleLabel = role === 'coach' ? 'coach' : 'performer';

	const { error } = await resend.emails.send({
		from: `Comedy Connector <noreply@${hostname}>`,
		to,
		subject: `${safeInviterName} invited you to join ${safeTeamName} on Comedy Connector`,
		html: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <p>Hi ${safeInviteeName},</p>
  <p>${safeInviterName} invited you to use Comedy Connector and confirm your ${roleLabel} listing with <strong>${safeTeamName}</strong>.</p>
  <p style="margin: 28px 0;">
    <a href="${approvalsUrl}" style="background: #1c1c1c; color: #fff; padding: 12px 18px; text-decoration: none; font-weight: 700;">Join the Scene</a>
  </p>
  <p>If you already have an account under another email, log in with that account and visit your approvals page.</p>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
  <p style="color: #9ca3af; font-size: 12px;">Sent via <a href="${siteUrl}" style="color: #7c3aed;">Comedy Connector</a>.</p>
</div>`,
		text: `Hi ${inviteeName},\n\n${inviterName} invited you to use Comedy Connector and confirm your ${roleLabel} listing with ${teamName}.\n\nJoin the Scene: ${approvalsUrl}\n\nIf you already have an account under another email, log in with that account and visit your approvals page.\n\nSent via Comedy Connector.`
	});

	if (error) throw new Error(`Resend error: ${error.message}`);
}

// Freshness reminder emails are now sent via src/lib/server/reminders.ts
// and the netlify/functions/freshness-reminder.ts scheduled function.

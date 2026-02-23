import { Resend } from 'resend';
import { env } from '$env/dynamic/private';

function getResend() {
	if (!env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is not set');
	return new Resend(env.RESEND_API_KEY);
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

export interface FreshnessReminderParams {
	to: string;
	name: string;
	profileUrl: string;
	siteUrl: string;
}

export async function sendFreshnessReminder(params: FreshnessReminderParams): Promise<void> {
	const resend = getResend();
	const { to, name, profileUrl, siteUrl } = params;

	await resend.emails.send({
		from: `Comedy Connector <noreply@${new URL(siteUrl).hostname}>`,
		to,
		subject: `Keep your Comedy Connector profile fresh!`,
		html: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #7c3aed;">Hey ${name}!</h2>
  <p>It's been a while — take a moment to make sure your Comedy Connector profile is up to date.</p>
  <p>Updated profiles help the community find and connect with the right people.</p>
  <a href="${profileUrl}" style="display:inline-block; background:#7c3aed; color:white; padding:12px 24px; border-radius:8px; text-decoration:none; margin:16px 0;">
    Update My Profile
  </a>
  <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
    You're receiving this because you have freshness reminders enabled.
    <a href="${profileUrl}/edit">Manage preferences</a>
  </p>
</div>`,
		text: `Hey ${name}!\n\nIt's been a while — update your Comedy Connector profile to stay fresh:\n${profileUrl}\n\nTo stop these reminders, visit: ${profileUrl}/edit`
	});
}

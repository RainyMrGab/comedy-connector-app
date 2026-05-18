interface FeedbackEmailParams {
	message: string;
	name?: string;
	email?: string;
	siteUrl: string;
}

export function subject(params: FeedbackEmailParams): string {
	const fromLabel = params.name ?? params.email ?? 'Anonymous';
	return `[Comedy Connector] Feedback from ${fromLabel}`;
}

export function html(params: FeedbackEmailParams): string {
	const { message, name, email, siteUrl } = params;
	return `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <p style="color: #6b7280; font-size: 14px;">Feedback submitted via Comedy Connector.</p>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
  ${name ? `<p><strong>Name:</strong> ${name}</p>` : ''}
  ${email ? `<p><strong>Email:</strong> ${email}</p>` : ''}
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
  <div style="white-space: pre-line; line-height: 1.6;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
  <p style="color: #9ca3af; font-size: 12px;">Sent via <a href="${siteUrl}" style="color: #7c3aed;">${siteUrl}</a></p>
</div>`;
}

export function text(params: FeedbackEmailParams): string {
	const { message, name, email, siteUrl } = params;
	return `Feedback via Comedy Connector\n\n${name ? `Name: ${name}\n` : ''}${email ? `Email: ${email}\n` : ''}\n${message}\n\n---\nSent via ${siteUrl}`;
}

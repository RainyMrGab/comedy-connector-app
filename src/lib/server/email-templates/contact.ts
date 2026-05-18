interface ContactEmailParams {
	senderName: string;
	recipientName: string;
	subject: string;
	message: string;
	siteUrl: string;
}

export function subject(params: ContactEmailParams): string {
	return `[Comedy Connector] ${params.subject}`;
}

export function html(params: ContactEmailParams): string {
	const { senderName, recipientName, subject, message, siteUrl } = params;
	return `
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
</div>`;
}

export function text(params: ContactEmailParams): string {
	const { senderName, recipientName, subject, message, siteUrl } = params;
	return `Message via Comedy Connector — reply directly to respond to ${senderName}.\n\nTo: ${recipientName}\nFrom: ${senderName}\nSubject: ${subject}\n\n${message}\n\n---\nSent via ${siteUrl}`;
}

interface TeamInviteEmailParams {
	inviteeName: string;
	teamName: string;
	role: 'performer' | 'coach';
	inviterName: string;
	approvalsUrl: string;
	siteUrl: string;
}

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

export function subject(params: TeamInviteEmailParams): string {
	const safeInviterName = escapeHtml(params.inviterName);
	const safeTeamName = escapeHtml(params.teamName);
	return `${safeInviterName} invited you to join ${safeTeamName} on Comedy Connector`;
}

export function html(params: TeamInviteEmailParams): string {
	const { inviteeName, teamName, role, inviterName, approvalsUrl, siteUrl } = params;
	const safeInviteeName = escapeHtml(inviteeName);
	const safeTeamName = escapeHtml(teamName);
	const safeInviterName = escapeHtml(inviterName);
	const roleLabel = role === 'coach' ? 'coach' : 'performer';

	return `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <p>Hi ${safeInviteeName},</p>
  <p>${safeInviterName} invited you to use Comedy Connector and confirm your ${roleLabel} listing with <strong>${safeTeamName}</strong>.</p>
  <p style="margin: 28px 0;">
    <a href="${approvalsUrl}" style="background: #1c1c1c; color: #fff; padding: 12px 18px; text-decoration: none; font-weight: 700;">Join the Scene</a>
  </p>
  <p>If you already have an account under another email, log in with that account and visit your approvals page.</p>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
  <p style="color: #9ca3af; font-size: 12px;">Sent via <a href="${siteUrl}" style="color: #7c3aed;">Comedy Connector</a>.</p>
</div>`;
}

export function text(params: TeamInviteEmailParams): string {
	const { inviteeName, teamName, role, inviterName, approvalsUrl } = params;
	const roleLabel = role === 'coach' ? 'coach' : 'performer';
	return `Hi ${inviteeName},\n\n${inviterName} invited you to use Comedy Connector and confirm your ${roleLabel} listing with ${teamName}.\n\nJoin the Scene: ${approvalsUrl}\n\nIf you already have an account under another email, log in with that account and visit your approvals page.\n\nSent via Comedy Connector.`;
}

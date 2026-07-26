interface TeamRoleAddedEmailParams {
	name: string;
	inviterName: string;
	teamName: string;
	role: 'performer' | 'coach';
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

export function subject(params: TeamRoleAddedEmailParams): string {
	const safeInviterName = escapeHtml(params.inviterName);
	const safeTeamName = escapeHtml(params.teamName);
	const roleLabel = params.role === 'coach' ? 'coach' : 'performer';
	return `${safeInviterName} added you as a ${roleLabel} on ${safeTeamName}`;
}

export function html(params: TeamRoleAddedEmailParams): string {
	const { name, teamName, role, inviterName, approvalsUrl, siteUrl } = params;
	const safeName = escapeHtml(name);
	const safeTeamName = escapeHtml(teamName);
	const safeInviterName = escapeHtml(inviterName);
	const roleLabel = role === 'coach' ? 'coach' : 'performer';

	return `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <p>Hi ${safeName},</p>
  <p>${safeInviterName} added you as a ${roleLabel} on <strong>${safeTeamName}</strong> on Comedy Connector. It's sitting in your approvals queue — just needs a thumbs up before it shows on your profile.</p>
  <p style="margin: 28px 0;">
    <a href="${approvalsUrl}" style="background: #1c1c1c; color: #fff; padding: 12px 18px; text-decoration: none; font-weight: 700;">Review &amp; Approve</a>
  </p>
  <p>If this doesn't look right, you can reject it from the same page.</p>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
  <p style="color: #9ca3af; font-size: 12px;">Sent via <a href="${siteUrl}" style="color: #7c3aed;">Comedy Connector</a>. You can turn these emails off anytime from your profile's Notifications settings.</p>
</div>`;
}

export function text(params: TeamRoleAddedEmailParams): string {
	const { name, teamName, role, inviterName, approvalsUrl } = params;
	const roleLabel = role === 'coach' ? 'coach' : 'performer';
	return `Hi ${name},\n\n${inviterName} added you as a ${roleLabel} on ${teamName} on Comedy Connector. It's sitting in your approvals queue — just needs a thumbs up before it shows on your profile.\n\nReview & Approve: ${approvalsUrl}\n\nIf this doesn't look right, you can reject it from the same page.\n\nSent via Comedy Connector. You can turn these emails off anytime from your profile's Notifications settings.`;
}

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$server/db';
import { teamMembers, teamCoaches, personalProfiles } from '$server/db/schema';
import { eq, and } from 'drizzle-orm';
import { getProfileByUserId } from '$server/profiles';

/**
 * POST /api/approvals/[id]?type=membership|coach
 * Body: action=approve|reject
 *
 * Only the target performer/coach (whose profileId is on the row) can approve/reject.
 */
export const POST: RequestHandler = async ({ params, url, request, locals }) => {
	if (!locals.user) error(401, 'Not authenticated');

	const type = url.searchParams.get('type');
	if (type !== 'membership' && type !== 'coach') error(400, 'Invalid type');

	const userProfile = await getProfileByUserId(locals.user.id);
	if (!userProfile) error(404, 'Profile not found');

	const formData = await request.formData();
	const action = formData.get('action');
	if (action !== 'approve' && action !== 'reject') error(400, 'Invalid action');

	const approvalStatus = action === 'approve' ? 'approved' : 'rejected';

	if (type === 'membership') {
		// Verify this user owns the row
		const row = await db
			.select()
			.from(teamMembers)
			.where(and(eq(teamMembers.id, params.id), eq(teamMembers.profileId, userProfile.id)))
			.limit(1);
		if (!row[0]) error(403, 'Not authorized');

		await db.update(teamMembers).set({ approvalStatus, updatedAt: new Date() }).where(eq(teamMembers.id, params.id));
	} else {
		const row = await db
			.select()
			.from(teamCoaches)
			.where(and(eq(teamCoaches.id, params.id), eq(teamCoaches.profileId, userProfile.id)))
			.limit(1);
		if (!row[0]) error(403, 'Not authorized');

		await db.update(teamCoaches).set({ approvalStatus, updatedAt: new Date() }).where(eq(teamCoaches.id, params.id));
	}

	return json({ success: true, approvalStatus });
};

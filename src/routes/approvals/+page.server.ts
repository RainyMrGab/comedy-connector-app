import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$server/db';
import { teamMembers, teamCoaches, teams, tags, entityTags, users, personalProfiles, performerProfiles, coachProfiles } from '$server/db/schema';
import { eq, and, inArray, or, type SQL } from 'drizzle-orm';
import { getProfileByUserId, resolveProfileSlug } from '$server/profiles';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) redirect(302, `/login?returnTo=${encodeURIComponent(url.pathname + url.search)}`);

	const userProfile = await getProfileByUserId(locals.user.id);
	const inviteToken = url.searchParams.get('invite')?.trim();
	const inviteEmails = [locals.user.email, userProfile?.contactEmail]
		.filter((email): email is string => Boolean(email))
		.map((email) => email.toLowerCase());

	const membershipConditions: SQL[] = [];
	if (userProfile) membershipConditions.push(eq(teamMembers.profileId, userProfile.id));
	for (const email of inviteEmails) membershipConditions.push(eq(teamMembers.inviteEmail, email));
	if (inviteToken) membershipConditions.push(eq(teamMembers.inviteToken, inviteToken));

	const coachConditions: SQL[] = [];
	if (userProfile) coachConditions.push(eq(teamCoaches.profileId, userProfile.id));
	for (const email of inviteEmails) coachConditions.push(eq(teamCoaches.inviteEmail, email));
	if (inviteToken) coachConditions.push(eq(teamCoaches.inviteToken, inviteToken));

	const [pendingMemberships, pendingCoachRoles] = await Promise.all([
		// Team membership requests pending approval from this user
		membershipConditions.length > 0
			? db
					.select({
						id: teamMembers.id,
						teamId: teams.id,
						teamName: teams.name,
						teamSlug: teams.slug,
						isCurrent: teamMembers.isCurrent,
						inviteEmail: teamMembers.inviteEmail,
						inviteToken: teamMembers.inviteToken,
						createdAt: teamMembers.createdAt
					})
					.from(teamMembers)
					.innerJoin(teams, eq(teamMembers.teamId, teams.id))
					.where(
						and(
							or(...membershipConditions),
							eq(teamMembers.approvalStatus, 'pending')
						)
					)
			: [],
		// Coach role requests pending approval from this user
		coachConditions.length > 0
			? db
					.select({
						id: teamCoaches.id,
						teamId: teams.id,
						teamName: teams.name,
						teamSlug: teams.slug,
						isCurrent: teamCoaches.isCurrent,
						inviteEmail: teamCoaches.inviteEmail,
						inviteToken: teamCoaches.inviteToken,
						createdAt: teamCoaches.createdAt
					})
					.from(teamCoaches)
					.innerJoin(teams, eq(teamCoaches.teamId, teams.id))
					.where(
						and(
							or(...coachConditions),
							eq(teamCoaches.approvalStatus, 'pending')
						)
					)
			: []
	]);

	// Admin-only: load pending tags with entity context
	let pendingTags: PendingTag[] | null = null;
	if (locals.user.admin) {
		pendingTags = await loadPendingTags();
	}

	return { pendingMemberships, pendingCoachRoles, pendingTags };
};

interface PendingTag {
	id: string;
	name: string;
	domain: 'performer' | 'coach' | 'team';
	suggestedByEmail: string | null;
	entityName: string | null;
	entitySlug: string | null;
	createdAt: Date;
}

async function loadPendingTags(): Promise<PendingTag[]> {
	const rawTags = await db
		.select({
			id: tags.id,
			name: tags.name,
			domain: tags.domain,
			suggestedOnEntityId: tags.suggestedOnEntityId,
			suggestedByEmail: users.email,
			createdAt: tags.createdAt
		})
		.from(tags)
		.leftJoin(users, eq(tags.suggestedByUserId, users.id))
		.where(eq(tags.status, 'pending'))
		.orderBy(tags.createdAt);

	if (rawTags.length === 0) return [];

	// Look up entity names grouped by domain
	const performerIds = rawTags.filter((t) => t.domain === 'performer' && t.suggestedOnEntityId).map((t) => t.suggestedOnEntityId!);
	const coachIds = rawTags.filter((t) => t.domain === 'coach' && t.suggestedOnEntityId).map((t) => t.suggestedOnEntityId!);
	const teamIds = rawTags.filter((t) => t.domain === 'team' && t.suggestedOnEntityId).map((t) => t.suggestedOnEntityId!);

	const [performerEntities, coachEntities, teamEntities] = await Promise.all([
		performerIds.length
			? db
					.select({ id: performerProfiles.id, name: personalProfiles.name, slug: personalProfiles.slug })
					.from(performerProfiles)
					.innerJoin(personalProfiles, eq(personalProfiles.id, performerProfiles.profileId))
					.where(inArray(performerProfiles.id, performerIds))
			: [],
		coachIds.length
			? db
					.select({ id: coachProfiles.id, name: personalProfiles.name, slug: personalProfiles.slug })
					.from(coachProfiles)
					.innerJoin(personalProfiles, eq(personalProfiles.id, coachProfiles.profileId))
					.where(inArray(coachProfiles.id, coachIds))
			: [],
		teamIds.length
			? db
					.select({ id: teams.id, name: teams.name, slug: teams.slug })
					.from(teams)
					.where(inArray(teams.id, teamIds))
			: []
	]);

	const performerMap = new Map(performerEntities.map((e) => [e.id, e]));
	const coachMap = new Map(coachEntities.map((e) => [e.id, e]));
	const teamMap = new Map(teamEntities.map((e) => [e.id, e]));

	return rawTags.map((t) => {
		let entity: { name: string; slug: string } | undefined;
		if (t.domain === 'performer' && t.suggestedOnEntityId) entity = performerMap.get(t.suggestedOnEntityId);
		else if (t.domain === 'coach' && t.suggestedOnEntityId) entity = coachMap.get(t.suggestedOnEntityId);
		else if (t.domain === 'team' && t.suggestedOnEntityId) entity = teamMap.get(t.suggestedOnEntityId);

		return {
			id: t.id,
			name: t.name,
			domain: t.domain,
			suggestedByEmail: t.suggestedByEmail ?? null,
			entityName: entity?.name ?? null,
			entitySlug: entity?.slug ?? null,
			createdAt: t.createdAt
		};
	});
}

export const actions: Actions = {
	respond: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { error: 'Not authenticated' });

		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const type = formData.get('type')?.toString();
		const action = formData.get('action')?.toString();
		const inviteToken = formData.get('inviteToken')?.toString() || null;

		if (!id || (type !== 'membership' && type !== 'coach') || (action !== 'approve' && action !== 'reject')) {
			return fail(400, { error: 'Invalid request' });
		}

		const approvalStatus = action === 'approve' ? 'approved' : 'rejected';
		let userProfile = await getProfileByUserId(locals.user.id);

		async function ensureProfile(fallbackName: string | null): Promise<string> {
			if (userProfile) return userProfile.id;
			const name = fallbackName?.trim() || locals.user!.email.split('@')[0];
			const slug = await resolveProfileSlug(name);
			const inserted = await db
				.insert(personalProfiles)
				.values({ userId: locals.user!.id, name, slug })
				.returning({ id: personalProfiles.id });
			userProfile = await getProfileByUserId(locals.user!.id);
			return inserted[0].id;
		}

		if (type === 'membership') {
			const row = await db
				.select({
					id: teamMembers.id,
					profileId: teamMembers.profileId,
					memberName: teamMembers.memberName,
					inviteEmail: teamMembers.inviteEmail,
					inviteToken: teamMembers.inviteToken
				})
				.from(teamMembers)
				.where(eq(teamMembers.id, id))
				.limit(1);
			if (!row[0]) return fail(404, { error: 'Request not found' });

			const isAuthorized =
				(userProfile && row[0].profileId === userProfile.id) ||
				row[0].inviteEmail === locals.user.email.toLowerCase() ||
				(userProfile?.contactEmail ? row[0].inviteEmail === userProfile.contactEmail.toLowerCase() : false) ||
				(inviteToken && row[0].inviteToken === inviteToken);
			if (!isAuthorized) return fail(403, { error: 'Not authorized' });

			const profileId =
				action === 'approve' ? await ensureProfile(row[0].memberName) : row[0].profileId;

			await db
				.update(teamMembers)
				.set({ approvalStatus, profileId: profileId ?? undefined, updatedAt: new Date() })
				.where(eq(teamMembers.id, id));
		} else {
			const row = await db
				.select({
					id: teamCoaches.id,
					profileId: teamCoaches.profileId,
					coachName: teamCoaches.coachName,
					inviteEmail: teamCoaches.inviteEmail,
					inviteToken: teamCoaches.inviteToken
				})
				.from(teamCoaches)
				.where(eq(teamCoaches.id, id))
				.limit(1);
			if (!row[0]) return fail(404, { error: 'Request not found' });

			const isAuthorized =
				(userProfile && row[0].profileId === userProfile.id) ||
				row[0].inviteEmail === locals.user.email.toLowerCase() ||
				(userProfile?.contactEmail ? row[0].inviteEmail === userProfile.contactEmail.toLowerCase() : false) ||
				(inviteToken && row[0].inviteToken === inviteToken);
			if (!isAuthorized) return fail(403, { error: 'Not authorized' });

			const profileId =
				action === 'approve' ? await ensureProfile(row[0].coachName) : row[0].profileId;

			await db
				.update(teamCoaches)
				.set({ approvalStatus, profileId: profileId ?? undefined, updatedAt: new Date() })
				.where(eq(teamCoaches.id, id));
		}

		const verb = action === 'approve' ? 'approved' : 'rejected';
		return { success: true, message: `Request ${verb}.` };
	},

	approveTag: async ({ request, locals }) => {
		if (!locals.user?.admin) return fail(403, { error: 'Forbidden' });

		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		if (!id) return fail(400, { error: 'Missing id' });

		await db.update(tags).set({ status: 'approved', updatedAt: new Date() }).where(eq(tags.id, id));
		return { success: true, message: 'Tag approved.' };
	},

	rejectTag: async ({ request, locals }) => {
		if (!locals.user?.admin) return fail(403, { error: 'Forbidden' });

		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		if (!id) return fail(400, { error: 'Missing id' });

		await db.update(tags).set({ status: 'rejected', updatedAt: new Date() }).where(eq(tags.id, id));
		return { success: true, message: 'Tag rejected.' };
	},

	deleteEntityTag: async ({ request, locals }) => {
		if (!locals.user?.admin) return fail(403, { error: 'Forbidden' });

		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		if (!id) return fail(400, { error: 'Missing id' });

		await db.delete(entityTags).where(eq(entityTags.id, id));
		return { success: true, message: 'Tag assignment removed.' };
	}
};

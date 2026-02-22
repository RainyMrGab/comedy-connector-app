import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$server/db';
import { teams, teamMembers } from '$server/db/schema';
import { eq } from 'drizzle-orm';
import { getProfileByUserId } from '$server/profiles';
import { resolveTeamSlug, findTeamByName } from '$server/teams';
import { teamSchema } from '$utils/validation';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/');
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { error: 'Not authenticated' });

		const formData = await request.formData();
		const raw = {
			name: String(formData.get('name') ?? ''),
			description: String(formData.get('description') ?? ''),
			videoUrl: String(formData.get('videoUrl') ?? ''),
			form: String(formData.get('form') ?? ''),
			isPracticeGroup: formData.get('isPracticeGroup') === 'true',
			openToNewMembers: formData.get('openToNewMembers') === 'true',
			openToBookOpeners: formData.get('openToBookOpeners') === 'true',
			seekingCoach: formData.get('seekingCoach') === 'true',
			lookingFor: String(formData.get('lookingFor') ?? ''),
			freshnessRemindersEnabled: formData.get('freshnessRemindersEnabled') !== 'false'
		};

		const result = teamSchema.safeParse(raw);
		if (!result.success) {
			return fail(400, { errors: result.error.flatten().fieldErrors, values: raw });
		}

		// Check for existing stub team with the same name to claim it
		const existingStub = await findTeamByName(raw.name);
		if (existingStub && existingStub.status === 'stub') {
			// Claim the stub
			await db
				.update(teams)
				.set({
					...result.data,
					status: 'active',
					createdByUserId: locals.user.id,
					updatedAt: new Date()
				})
				.where(eq(teams.id, existingStub.id));
			redirect(302, `/teams/${existingStub.slug}`);
		}

		// Create new active team
		const slug = await resolveTeamSlug(raw.name);
		const userProfile = await getProfileByUserId(locals.user.id);

		const [team] = await db
			.insert(teams)
			.values({
				...result.data,
				slug,
				status: 'active',
				createdByUserId: locals.user.id,
				// Creator is auto-added as a current member (approved)
				primaryContactProfileId: userProfile?.id ?? null
			})
			.returning();

		// Auto-add creator as an approved current member
		if (userProfile) {
			await db.insert(teamMembers).values({
				teamId: team.id,
				profileId: userProfile.id,
				memberName: userProfile.name,
				isCurrent: true,
				approvalStatus: 'approved'
			});
		}

		redirect(302, `/teams/${team.slug}`);
	}
};

import { redirect, fail, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$server/db';
import { teams } from '$server/db/schema';
import { eq } from 'drizzle-orm';
import { getTeamBySlug, resolveTeamSlug } from '$server/teams';
import { teamSchema } from '$utils/validation';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) redirect(302, '/');
	const team = await getTeamBySlug(params.slug);
	if (!team) error(404, 'Team not found');
	if (team.status !== 'stub') redirect(302, `/teams/${params.slug}`);
	return { team };
};

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		if (!locals.user) return fail(401, { error: 'Not authenticated' });

		const team = await getTeamBySlug(params.slug);
		if (!team) return fail(404, { error: 'Team not found' });
		if (team.status !== 'stub') return fail(400, { error: 'Team is already claimed' });

		const formData = await request.formData();
		const raw = {
			name: team.name, // name is locked when claiming
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
			return fail(400, { errors: result.error.flatten().fieldErrors });
		}

		await db
			.update(teams)
			.set({
				...result.data,
				status: 'active',
				createdByUserId: locals.user.id,
				updatedAt: new Date()
			})
			.where(eq(teams.id, team.id));

		redirect(302, `/teams/${team.slug}`);
	}
};

import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$server/db';
import { users } from '$server/db/schema';
import { eq } from 'drizzle-orm';
import { getNotificationPreferences, DEFAULT_NOTIFICATION_PREFERENCES } from '$server/notifications';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		redirect(302, `/login?returnTo=${encodeURIComponent(url.pathname)}`);
	}

	const [user] = await db.select().from(users).where(eq(users.id, locals.user.id)).limit(1);
	const preferences = user ? getNotificationPreferences(user) : DEFAULT_NOTIFICATION_PREFERENCES;
	return { preferences };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Not authenticated' });
		}

		const formData = await request.formData();
		const preferences = {
			emailOnMemberAdded: formData.get('emailOnMemberAdded') === 'true',
			emailOnCoachAdded: formData.get('emailOnCoachAdded') === 'true'
		};

		await db
			.update(users)
			.set({ notificationPreferences: preferences, updatedAt: new Date() })
			.where(eq(users.id, locals.user.id));

		return { success: true, message: 'Notification preferences saved.' };
	}
};

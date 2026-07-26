import type { User } from '$server/db/schema';

export interface NotificationPreferences {
	/** Email me when a team adds me as a performer (pending approval). */
	emailOnMemberAdded: boolean;
	/** Email me when a team adds me as a coach (pending approval). */
	emailOnCoachAdded: boolean;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
	emailOnMemberAdded: true,
	emailOnCoachAdded: true
};

/** Merges a user's stored (possibly sparse) preferences JSON over the defaults. */
export function getNotificationPreferences(user: Pick<User, 'notificationPreferences'>): NotificationPreferences {
	const stored = (user.notificationPreferences ?? {}) as Partial<NotificationPreferences>;
	return { ...DEFAULT_NOTIFICATION_PREFERENCES, ...stored };
}

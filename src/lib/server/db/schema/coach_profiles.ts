import { pgTable, text, uuid, timestamp, boolean } from 'drizzle-orm/pg-core';
import { personalProfiles } from './personal_profiles';

export const coachProfiles = pgTable('coach_profiles', {
	id: uuid('id').primaryKey().defaultRandom(),
	// One-to-one with personal_profiles
	profileId: uuid('profile_id')
		.notNull()
		.unique()
		.references(() => personalProfiles.id, { onDelete: 'cascade' }),
	coachingBio: text('coaching_bio'),
	// Interest flags
	availableForPrivate: boolean('available_for_private').notNull().default(false),
	availableForTeams: boolean('available_for_teams').notNull().default(false),
	availableForWorkshops: boolean('available_for_workshops').notNull().default(false),
	availability: text('availability'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export type CoachProfile = typeof coachProfiles.$inferSelect;
export type NewCoachProfile = typeof coachProfiles.$inferInsert;

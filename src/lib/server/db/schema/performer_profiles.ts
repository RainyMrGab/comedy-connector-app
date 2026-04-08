import { pgTable, text, uuid, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { personalProfiles } from './personal_profiles';

export const performerProfiles = pgTable('performer_profiles', {
	id: uuid('id').primaryKey().defaultRandom(),
	// One-to-one with personal_profiles
	profileId: uuid('profile_id')
		.notNull()
		.unique()
		.references(() => personalProfiles.id, { onDelete: 'cascade' }),
	// Array of highlight URLs (video, image, or article links)
	videoHighlights: jsonb('video_highlights').$type<string[]>().default([]),
	// Interest flags
	lookingForPracticeGroup: boolean('looking_for_practice_group').notNull().default(false),
	lookingForSmallGroup: boolean('looking_for_small_group').notNull().default(false),
	lookingForIndieTeam: boolean('looking_for_indie_team').notNull().default(false),
	lookingFor: text('looking_for'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export type PerformerProfile = typeof performerProfiles.$inferSelect;
export type NewPerformerProfile = typeof performerProfiles.$inferInsert;

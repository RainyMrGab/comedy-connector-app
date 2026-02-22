import { pgTable, text, uuid, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { personalProfiles } from './personal_profiles';

export const performerProfiles = pgTable('performer_profiles', {
	id: uuid('id').primaryKey().defaultRandom(),
	// One-to-one with personal_profiles
	profileId: uuid('profile_id')
		.notNull()
		.unique()
		.references(() => personalProfiles.id, { onDelete: 'cascade' }),
	// Array of YouTube/video URLs
	videoHighlights: jsonb('video_highlights').$type<string[]>().default([]),
	// Interest flags
	openToBookOpeners: boolean('open_to_book_openers').notNull().default(false),
	lookingForTeam: boolean('looking_for_team').notNull().default(false),
	lookingForCoach: boolean('looking_for_coach').notNull().default(false),
	lookingFor: text('looking_for'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export type PerformerProfile = typeof performerProfiles.$inferSelect;
export type NewPerformerProfile = typeof performerProfiles.$inferInsert;

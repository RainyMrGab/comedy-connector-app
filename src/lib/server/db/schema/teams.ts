import { pgTable, text, uuid, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';
import { personalProfiles } from './personal_profiles';

export const teamStatusEnum = pgEnum('team_status', ['stub', 'active']);

export const teams = pgTable('teams', {
	id: uuid('id').primaryKey().defaultRandom(),
	// null for stub teams (not yet claimed)
	createdByUserId: uuid('created_by_user_id').references(() => users.id, {
		onDelete: 'set null'
	}),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	status: teamStatusEnum('status').notNull().default('stub'),
	photoUrl: text('photo_url'),
	description: text('description'),
	videoUrl: text('video_url'),
	// e.g. "Harold", "Montage", "Longform", "Shortform"
	form: text('form'),
	isPracticeGroup: boolean('is_practice_group').notNull().default(false),
	// Interest flags
	openToNewMembers: boolean('open_to_new_members').notNull().default(false),
	openToBookOpeners: boolean('open_to_book_openers').notNull().default(false),
	seekingCoach: boolean('seeking_coach').notNull().default(false),
	lookingFor: text('looking_for'),
	// Primary contact for the team (receives contact form messages)
	primaryContactProfileId: uuid('primary_contact_profile_id').references(
		() => personalProfiles.id,
		{ onDelete: 'set null' }
	),
	freshnessRemindersEnabled: boolean('freshness_reminders_enabled').notNull().default(true),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;

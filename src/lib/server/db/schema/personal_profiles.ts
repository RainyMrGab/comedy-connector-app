import { pgTable, text, uuid, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users';

export const personalProfiles = pgTable('personal_profiles', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.notNull()
		.unique()
		.references(() => users.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	photoUrl: text('photo_url'),
	// { instagram, tiktok, facebook, twitter, youtube, website }
	socialLinks: jsonb('social_links').$type<Record<string, string>>().default({}),
	bio: text('bio'),
	training: text('training'),
	lookingFor: text('looking_for'),
	// Stored separately from Netlify Identity email so users can use a different contact email
	contactEmail: text('contact_email'),
	freshnessRemindersEnabled: boolean('freshness_reminders_enabled').notNull().default(true),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export type PersonalProfile = typeof personalProfiles.$inferSelect;
export type NewPersonalProfile = typeof personalProfiles.$inferInsert;

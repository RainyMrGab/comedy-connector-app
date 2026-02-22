import { pgTable, uuid, timestamp, boolean, integer, text } from 'drizzle-orm/pg-core';
import { teams } from './teams';
import { personalProfiles } from './personal_profiles';
import { approvalStatusEnum } from './team_members';

export const teamCoaches = pgTable('team_coaches', {
	id: uuid('id').primaryKey().defaultRandom(),
	teamId: uuid('team_id')
		.notNull()
		.references(() => teams.id, { onDelete: 'cascade' }),
	// null when coach is listed by name only (non-app user)
	profileId: uuid('profile_id').references(() => personalProfiles.id, { onDelete: 'set null' }),
	// Used when profileId is null (non-app coach)
	coachName: text('coach_name'),
	startYear: integer('start_year'),
	startMonth: integer('start_month'),
	endYear: integer('end_year'),
	endMonth: integer('end_month'),
	isCurrent: boolean('is_current').notNull().default(true),
	approvalStatus: approvalStatusEnum('approval_status').notNull().default('pending'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export type TeamCoach = typeof teamCoaches.$inferSelect;
export type NewTeamCoach = typeof teamCoaches.$inferInsert;

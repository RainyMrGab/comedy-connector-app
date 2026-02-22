import { pgTable, text, uuid, timestamp, boolean, integer, pgEnum } from 'drizzle-orm/pg-core';
import { teams } from './teams';
import { personalProfiles } from './personal_profiles';

export const approvalStatusEnum = pgEnum('approval_status', ['pending', 'approved', 'rejected']);

export const teamMembers = pgTable('team_members', {
	id: uuid('id').primaryKey().defaultRandom(),
	teamId: uuid('team_id')
		.notNull()
		.references(() => teams.id, { onDelete: 'cascade' }),
	// null when member is listed by name only (non-app user)
	profileId: uuid('profile_id').references(() => personalProfiles.id, { onDelete: 'set null' }),
	// Used when profileId is null (non-app member) or as display name override
	memberName: text('member_name'),
	// Date range — year/month as integers, is_current for "to present"
	startYear: integer('start_year'),
	startMonth: integer('start_month'),
	endYear: integer('end_year'),
	endMonth: integer('end_month'),
	isCurrent: boolean('is_current').notNull().default(true),
	// Pending until the linked performer approves being on the team
	approvalStatus: approvalStatusEnum('approval_status').notNull().default('pending'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;

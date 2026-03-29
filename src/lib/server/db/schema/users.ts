import { pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
	id: uuid('id').primaryKey().defaultRandom(),
	identityId: text('identity_id').notNull().unique(),
	email: text('email').notNull(),
	// Set on each login (debounced to once/day). Used to exclude recently-active users from freshness polls.
	lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

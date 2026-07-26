import { pgTable, text, uuid, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
	id: uuid('id').primaryKey().defaultRandom(),
	identityId: text('identity_id').notNull().unique(),
	email: text('email').notNull(),
	// 'email', 'google', etc. — set on signup via identity-signup webhook.
	authProvider: text('auth_provider').default('email'),
	admin: boolean('admin').notNull().default(false),
	// Set on each login (debounced to once/day). Used to exclude recently-active users from freshness polls.
	lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
	// Sparse map of togglable notification preferences (see src/lib/server/notifications.ts for defaults/shape).
	notificationPreferences: jsonb('notification_preferences').notNull().default({}),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

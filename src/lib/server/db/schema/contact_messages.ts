import { pgTable, text, uuid, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';

export const recipientTypeEnum = pgEnum('recipient_type', ['personal_profile', 'team']);

export const contactMessages = pgTable('contact_messages', {
	id: uuid('id').primaryKey().defaultRandom(),
	recipientType: recipientTypeEnum('recipient_type').notNull(),
	// UUID of the personal_profile or team being contacted
	recipientId: uuid('recipient_id').notNull(),
	// Sender must be logged in (prevents spam)
	senderUserId: uuid('sender_user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	subject: text('subject').notNull(),
	message: text('message').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export type ContactMessage = typeof contactMessages.$inferSelect;
export type NewContactMessage = typeof contactMessages.$inferInsert;

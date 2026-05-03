import { pgTable, text, uuid, timestamp, pgEnum, unique } from 'drizzle-orm/pg-core';
import { users } from './users';

export const tagDomainEnum = pgEnum('tag_domain', ['performer', 'coach', 'team']);
export const tagStatusEnum = pgEnum('tag_status', ['pending', 'approved', 'rejected']);

export const tags = pgTable(
	'tags',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		name: text('name').notNull(),
		domain: tagDomainEnum('domain').notNull(),
		status: tagStatusEnum('status').notNull().default('pending'),
		suggestedByUserId: uuid('suggested_by_user_id').references(() => users.id, {
			onDelete: 'set null'
		}),
		// The entity (performer/coach/team) this tag was first suggested for — shown as approval context
		suggestedOnEntityId: uuid('suggested_on_entity_id'),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [unique('tags_name_domain_unique').on(table.name, table.domain)]
);

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;

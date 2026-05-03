import { pgTable, uuid, timestamp, unique } from 'drizzle-orm/pg-core';
import { tags, tagDomainEnum } from './tags';
import { users } from './users';

export const entityTags = pgTable(
	'entity_tags',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		tagId: uuid('tag_id')
			.notNull()
			.references(() => tags.id, { onDelete: 'cascade' }),
		// performer_profiles.id | coach_profiles.id | teams.id
		entityId: uuid('entity_id').notNull(),
		domain: tagDomainEnum('domain').notNull(),
		addedByUserId: uuid('added_by_user_id').references(() => users.id, { onDelete: 'set null' }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [unique('entity_tags_tag_entity_unique').on(table.tagId, table.entityId)]
);

export type EntityTag = typeof entityTags.$inferSelect;
export type NewEntityTag = typeof entityTags.$inferInsert;

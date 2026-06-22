import { pgTable, uuid, timestamp, pgEnum, unique } from 'drizzle-orm/pg-core';
import { users } from './users';

export const reactionEntityTypeEnum = pgEnum('reaction_entity_type', ['performer', 'coach', 'team']);
export const reactionTypeEnum = pgEnum('reaction_type', ['like', 'love', 'celebrate']);

export const reactions = pgTable(
	'reactions',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		entityId: uuid('entity_id').notNull(),
		entityType: reactionEntityTypeEnum('entity_type').notNull(),
		reactionType: reactionTypeEnum('reaction_type').notNull(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [unique('reactions_entity_type_user_unique').on(table.entityId, table.reactionType, table.userId)]
);

export type Reaction = typeof reactions.$inferSelect;
export type NewReaction = typeof reactions.$inferInsert;

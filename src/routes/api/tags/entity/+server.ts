import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$server/db';
import { tags, entityTags } from '$server/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import type { TagDomain } from '$lib/types/tags';

const KEBAB_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) error(401, 'Unauthorized');

	const body = await request.json();
	const { tagName, domain, entityId } = body as {
		tagName: string;
		domain: TagDomain;
		entityId: string;
	};

	if (!tagName || !domain || !entityId) {
		error(400, 'tagName, domain, and entityId are required');
	}
	if (!['performer', 'coach', 'team'].includes(domain)) {
		error(400, 'Invalid domain');
	}

	const normalized = tagName.trim().toLowerCase();
	if (!KEBAB_RE.test(normalized)) {
		error(400, 'Tags must use kebab-case (e.g. long-form)');
	}

	// Find existing tag or create one
	const [existing] = await db
		.select()
		.from(tags)
		.where(and(eq(sql`lower(${tags.name})`, normalized), eq(tags.domain, domain)))
		.limit(1);

	let tagId: string;
	let tagStatus: string;

	if (existing) {
		tagId = existing.id;
		if (existing.status === 'rejected') {
			// Re-suggest a rejected tag
			await db
				.update(tags)
				.set({ status: 'pending', suggestedByUserId: locals.user.id, suggestedOnEntityId: entityId, updatedAt: new Date() })
				.where(eq(tags.id, existing.id));
			tagStatus = 'pending';
		} else {
			tagStatus = existing.status;
		}
	} else {
		// Insert new pending tag
		const [inserted] = await db
			.insert(tags)
			.values({
				name: normalized,
				domain,
				status: 'pending',
				suggestedByUserId: locals.user.id,
				suggestedOnEntityId: entityId
			})
			.returning({ id: tags.id });
		tagId = inserted.id;
		tagStatus = 'pending';
	}

	// Upsert entity_tag (ignore duplicate)
	const [entityTag] = await db
		.insert(entityTags)
		.values({ tagId, entityId, domain, addedByUserId: locals.user.id })
		.onConflictDoNothing()
		.returning();

	return json({
		entityTag: {
			id: entityTag?.id ?? null,
			tagId,
			name: normalized,
			status: tagStatus
		}
	});
};

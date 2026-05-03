import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$server/db';
import { tags } from '$server/db/schema';
import { eq, and, ilike } from 'drizzle-orm';
import type { TagDomain } from '$lib/types/tags';

export const GET: RequestHandler = async ({ url }) => {
	const domain = url.searchParams.get('domain') as TagDomain | null;
	const q = url.searchParams.get('q') ?? '';

	if (!domain || !['performer', 'coach', 'team'].includes(domain)) {
		return json({ error: 'Invalid domain' }, { status: 400 });
	}

	const results = await db
		.select({ id: tags.id, name: tags.name })
		.from(tags)
		.where(
			and(
				eq(tags.domain, domain),
				eq(tags.status, 'approved'),
				q ? ilike(tags.name, `%${q}%`) : undefined
			)
		)
		.orderBy(tags.name)
		.limit(10);

	return json({ tags: results });
};

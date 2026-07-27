import type { RequestHandler } from './$types';
import { db } from '$server/db';
import { teams, personalProfiles, performerProfiles, coachProfiles } from '$server/db/schema';
import { eq } from 'drizzle-orm';
import { cityConfig } from '$config/city';

const STATIC_PATHS = ['/', '/teams', '/coaches', '/performers', '/resources', '/privacy', '/terms', '/feedback'];

function xmlEscape(value: string): string {
	return value.replace(/&/g, '&amp;');
}

function urlEntry(path: string, lastmod?: Date): string {
	const loc = xmlEscape(`${cityConfig.siteUrl}${path}`);
	const lastmodTag = lastmod ? `<lastmod>${lastmod.toISOString()}</lastmod>` : '';
	return `<url><loc>${loc}</loc>${lastmodTag}</url>`;
}

export const GET: RequestHandler = async () => {
	const [teamRows, performerRows, coachRows] = await Promise.all([
		db.select({ slug: teams.slug, updatedAt: teams.updatedAt }).from(teams),
		db
			.select({ slug: personalProfiles.slug, updatedAt: personalProfiles.updatedAt })
			.from(performerProfiles)
			.innerJoin(personalProfiles, eq(performerProfiles.profileId, personalProfiles.id)),
		db
			.select({ slug: personalProfiles.slug, updatedAt: personalProfiles.updatedAt })
			.from(coachProfiles)
			.innerJoin(personalProfiles, eq(coachProfiles.profileId, personalProfiles.id))
	]);

	const entries = [
		...STATIC_PATHS.map((path) => urlEntry(path)),
		...teamRows.map((t) => urlEntry(`/teams/${t.slug}`, t.updatedAt)),
		...performerRows.map((p) => urlEntry(`/performers/${p.slug}`, p.updatedAt)),
		...coachRows.map((c) => urlEntry(`/coaches/${c.slug}`, c.updatedAt))
	];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};

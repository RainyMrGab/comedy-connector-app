import { db } from '$server/db';
import { personalProfiles, performerProfiles } from '$server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Browse all performers — Phase 6 adds full search/filter
	const performers = await db
		.select({
			id: personalProfiles.id,
			name: personalProfiles.name,
			slug: personalProfiles.slug,
			photoUrl: personalProfiles.photoUrl,
			bio: personalProfiles.bio,
			lookingFor: personalProfiles.lookingFor,
			openToBookOpeners: performerProfiles.openToBookOpeners,
			lookingForTeam: performerProfiles.lookingForTeam,
			lookingForCoach: performerProfiles.lookingForCoach
		})
		.from(performerProfiles)
		.innerJoin(personalProfiles, eq(performerProfiles.profileId, personalProfiles.id))
		.limit(50);

	return { performers };
};

import { db } from '$server/db';
import { personalProfiles, coachProfiles } from '$server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const coaches = await db
		.select({
			id: personalProfiles.id,
			name: personalProfiles.name,
			slug: personalProfiles.slug,
			photoUrl: personalProfiles.photoUrl,
			bio: personalProfiles.bio,
			coachingBio: coachProfiles.coachingBio,
			availability: coachProfiles.availability,
			availableForPrivate: coachProfiles.availableForPrivate,
			availableForTeams: coachProfiles.availableForTeams,
			availableForWorkshops: coachProfiles.availableForWorkshops
		})
		.from(coachProfiles)
		.innerJoin(personalProfiles, eq(coachProfiles.profileId, personalProfiles.id))
		.limit(50);

	return { coaches };
};

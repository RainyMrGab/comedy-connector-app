import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/pglite';
import * as schema from './schema/index.js';
import { users, personalProfiles, performerProfiles, coachProfiles } from './schema/index.js';

type LocalDb = ReturnType<typeof drizzle<typeof schema>>;

// Fixed UUIDs so dev sessions survive DB resets (deleting .local-db/ and restarting)
const PERFORMER_USER_ID = '00000000-0000-0000-0000-000000000001';
const COACH_USER_ID = '00000000-0000-0000-0000-000000000002';
const NEWUSER_USER_ID = '00000000-0000-0000-0000-000000000003';
const PERFORMER_PROFILE_ID = '00000000-0000-0000-0000-000000000011';
const COACH_PROFILE_ID = '00000000-0000-0000-0000-000000000012';

// Muppet users (IDs 4-13, skipping 11-12 which are profile IDs above)
const KERMIT_USER_ID = '00000000-0000-0000-0000-000000000004';
const MISSPIGGY_USER_ID = '00000000-0000-0000-0000-000000000005';
const FOZZIE_USER_ID = '00000000-0000-0000-0000-000000000006';
const STATLER_USER_ID = '00000000-0000-0000-0000-000000000007';
const WALDORF_USER_ID = '00000000-0000-0000-0000-000000000008';
const GONZO_USER_ID = '00000000-0000-0000-0000-000000000009';
const ANIMAL_USER_ID = '00000000-0000-0000-0000-000000000010';
const SCOOTER_USER_ID = '00000000-0000-0000-0000-000000000013';

// Profile IDs for muppets with profiles (14-17)
const KERMIT_PROFILE_ID = '00000000-0000-0000-0000-000000000014';
const MISSPIGGY_PROFILE_ID = '00000000-0000-0000-0000-000000000015';
const FOZZIE_PROFILE_ID = '00000000-0000-0000-0000-000000000016';
const STATLER_PROFILE_ID = '00000000-0000-0000-0000-000000000017';

/**
 * Seeded test users available on the /dev-login page.
 */
export const DEV_USERS = [
	{
		id: PERFORMER_USER_ID,
		email: 'performer@dev.local',
		label: 'Dev Performer — has performer profile'
	},
	{
		id: COACH_USER_ID,
		email: 'coach@dev.local',
		label: 'Dev Coach — has coach profile'
	},
	{
		id: NEWUSER_USER_ID,
		email: 'newuser@dev.local',
		label: 'New User — no profile (tests onboarding)'
	},
	{
		id: KERMIT_USER_ID,
		email: 'kermit@dev.local',
		label: 'Kermit the Frog — performer profile'
	},
	{
		id: MISSPIGGY_USER_ID,
		email: 'misspiggy@dev.local',
		label: 'Miss Piggy — performer profile'
	},
	{
		id: FOZZIE_USER_ID,
		email: 'fozzie@dev.local',
		label: 'Fozzie Bear — performer profile'
	},
	{
		id: STATLER_USER_ID,
		email: 'statler@dev.local',
		label: 'Statler — coach profile'
	},
	{
		id: WALDORF_USER_ID,
		email: 'waldorf@dev.local',
		label: 'Waldorf — no profile'
	},
	{
		id: GONZO_USER_ID,
		email: 'gonzo@dev.local',
		label: 'Gonzo — no profile'
	},
	{
		id: ANIMAL_USER_ID,
		email: 'animal@dev.local',
		label: 'Animal — no profile'
	},
	{
		id: SCOOTER_USER_ID,
		email: 'scooter@dev.local',
		label: 'Scooter — no profile'
	}
] as const;

/**
 * Seeds the local PGLite DB with test users.
 * Idempotent: checks for existing data before inserting each group.
 */
export async function seedLocalDb(db: LocalDb): Promise<void> {
	// Seed base 3 users (original dev accounts)
	const existingBase = await db
		.select({ id: users.id })
		.from(users)
		.where(eq(users.id, PERFORMER_USER_ID))
		.limit(1);

	if (existingBase.length === 0) {
		// User 1: performer with full profile
		await db.insert(users).values({
			id: PERFORMER_USER_ID,
			identityId: 'dev-performer-identity',
			email: 'performer@dev.local'
		});
		await db.insert(personalProfiles).values({
			id: PERFORMER_PROFILE_ID,
			userId: PERFORMER_USER_ID,
			name: 'Dev Performer',
			slug: 'dev-performer',
			bio: 'A local dev test user with a performer profile.',
			training: 'Arcade Comedy School, Levels 1–5'
		});
		await db.insert(performerProfiles).values({
			profileId: PERFORMER_PROFILE_ID,
			lookingForPracticeGroup: true,
			lookingForSmallGroup: false,
			lookingForIndieTeam: true
		});

		// User 2: coach with full profile
		await db.insert(users).values({
			id: COACH_USER_ID,
			identityId: 'dev-coach-identity',
			email: 'coach@dev.local'
		});
		await db.insert(personalProfiles).values({
			id: COACH_PROFILE_ID,
			userId: COACH_USER_ID,
			name: 'Dev Coach',
			slug: 'dev-coach',
			bio: 'A local dev test user with a coach profile.'
		});
		await db.insert(coachProfiles).values({
			profileId: COACH_PROFILE_ID,
			coachingBio: 'Long-form improv specialist. Available for private sessions and team coaching.',
			availableForPrivate: true,
			availableForTeams: true,
			availableForPracticeGroup: false,
			availability: 'Weekends preferred'
		});

		// User 3: new user with no profile (tests onboarding flow)
		await db.insert(users).values({
			id: NEWUSER_USER_ID,
			identityId: 'dev-newuser-identity',
			email: 'newuser@dev.local'
		});
	}

	// Seed muppet users (separate idempotency check so existing DBs get them without a full reset)
	const existingMuppets = await db
		.select({ id: users.id })
		.from(users)
		.where(eq(users.id, KERMIT_USER_ID))
		.limit(1);

	if (existingMuppets.length === 0) {
		// Kermit the Frog — performer
		await db.insert(users).values({
			id: KERMIT_USER_ID,
			identityId: 'dev-kermit-identity',
			email: 'kermit@dev.local'
		});
		await db.insert(personalProfiles).values({
			id: KERMIT_PROFILE_ID,
			userId: KERMIT_USER_ID,
			name: 'Kermit the Frog',
			slug: 'kermit-the-frog',
			bio: 'Host, performer, and all-around MC. Comfortable on any stage.',
			training: 'Muppet Studios, Advanced Scene Work'
		});
		await db.insert(performerProfiles).values({
			profileId: KERMIT_PROFILE_ID,
			lookingForPracticeGroup: false,
			lookingForSmallGroup: false,
			lookingForIndieTeam: true
		});

		// Miss Piggy — performer
		await db.insert(users).values({
			id: MISSPIGGY_USER_ID,
			identityId: 'dev-misspiggy-identity',
			email: 'misspiggy@dev.local'
		});
		await db.insert(personalProfiles).values({
			id: MISSPIGGY_PROFILE_ID,
			userId: MISSPIGGY_USER_ID,
			name: 'Miss Piggy',
			slug: 'miss-piggy',
			bio: 'Leading performer and scene partner extraordinaire. She gets the best lines.',
			training: 'Advanced Character Work, Musical Improv'
		});
		await db.insert(performerProfiles).values({
			profileId: MISSPIGGY_PROFILE_ID,
			lookingForPracticeGroup: true,
			lookingForSmallGroup: false,
			lookingForIndieTeam: true
		});

		// Fozzie Bear — performer
		await db.insert(users).values({
			id: FOZZIE_USER_ID,
			identityId: 'dev-fozzie-identity',
			email: 'fozzie@dev.local'
		});
		await db.insert(personalProfiles).values({
			id: FOZZIE_PROFILE_ID,
			userId: FOZZIE_USER_ID,
			name: 'Fozzie Bear',
			slug: 'fozzie-bear',
			bio: 'Comedy in my blood. Wocka wocka!',
			training: 'Stand-Up to Improv Intensive'
		});
		await db.insert(performerProfiles).values({
			profileId: FOZZIE_PROFILE_ID,
			lookingForPracticeGroup: true,
			lookingForSmallGroup: false,
			lookingForIndieTeam: false
		});

		// Statler — coach
		await db.insert(users).values({
			id: STATLER_USER_ID,
			identityId: 'dev-statler-identity',
			email: 'statler@dev.local'
		});
		await db.insert(personalProfiles).values({
			id: STATLER_PROFILE_ID,
			userId: STATLER_USER_ID,
			name: 'Statler',
			slug: 'statler',
			bio: 'Experienced critic and coach. Will tell it like it is.'
		});
		await db.insert(coachProfiles).values({
			profileId: STATLER_PROFILE_ID,
			coachingBio:
				'Long-form coach with years of watching from the balcony. Known for honest, direct feedback.',
			availableForPrivate: true,
			availableForTeams: true,
			availableForPracticeGroup: false,
			availability: 'Thursday evenings'
		});

		// Waldorf — no profile
		await db.insert(users).values({
			id: WALDORF_USER_ID,
			identityId: 'dev-waldorf-identity',
			email: 'waldorf@dev.local'
		});

		// Gonzo — no profile
		await db.insert(users).values({
			id: GONZO_USER_ID,
			identityId: 'dev-gonzo-identity',
			email: 'gonzo@dev.local'
		});

		// Animal — no profile
		await db.insert(users).values({
			id: ANIMAL_USER_ID,
			identityId: 'dev-animal-identity',
			email: 'animal@dev.local'
		});

		// Scooter — no profile
		await db.insert(users).values({
			id: SCOOTER_USER_ID,
			identityId: 'dev-scooter-identity',
			email: 'scooter@dev.local'
		});
	}
}

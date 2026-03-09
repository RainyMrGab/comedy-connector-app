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

/**
 * Seeded test users available on the /dev-login page.
 * Three users cover the most important states: performer, coach, new user (no profile).
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
	}
] as const;

/**
 * Seeds the local PGLite DB with 3 test users.
 * Idempotent: checks for existing data before inserting.
 */
export async function seedLocalDb(db: LocalDb): Promise<void> {
	const existing = await db
		.select({ id: users.id })
		.from(users)
		.where(eq(users.id, PERFORMER_USER_ID))
		.limit(1);

	if (existing.length > 0) return;

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
		openToBookOpeners: true,
		lookingForTeam: true,
		lookingForCoach: false
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
		availableForWorkshops: false,
		availability: 'Weekends preferred'
	});

	// User 3: new user with no profile (tests onboarding flow)
	await db.insert(users).values({
		id: NEWUSER_USER_ID,
		identityId: 'dev-newuser-identity',
		email: 'newuser@dev.local'
	});
}

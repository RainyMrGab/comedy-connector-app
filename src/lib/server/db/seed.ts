import { and, eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from './schema/index.js';
import {
	users,
	personalProfiles,
	performerProfiles,
	coachProfiles,
	teams,
	teamMembers,
	teamCoaches,
	tags,
	entityTags
} from './schema/index.js';

type Db = PostgresJsDatabase<typeof schema>;

// Fixed UUIDs so dev sessions survive DB resets.
// These match the IDs in src/lib/config/devUsers.ts.
const PERFORMER_USER_ID = '00000000-0000-0000-0000-000000000001';
const COACH_USER_ID = '00000000-0000-0000-0000-000000000002';
const NEWUSER_USER_ID = '00000000-0000-0000-0000-000000000003';
const PERFORMER_PROFILE_ID = '00000000-0000-0000-0000-000000000011';
const COACH_PROFILE_ID = '00000000-0000-0000-0000-000000000012';
const MUPPET_ALL_STARS_TEAM_ID = '00000000-0000-0000-0000-000000000021';
const RAINBOW_CONNECTION_TEAM_ID = '00000000-0000-0000-0000-000000000022';

const KERMIT_USER_ID = '00000000-0000-0000-0000-000000000004';
const MISSPIGGY_USER_ID = '00000000-0000-0000-0000-000000000005';
const FOZZIE_USER_ID = '00000000-0000-0000-0000-000000000006';
const STATLER_USER_ID = '00000000-0000-0000-0000-000000000007';
const WALDORF_USER_ID = '00000000-0000-0000-0000-000000000008';
const GONZO_USER_ID = '00000000-0000-0000-0000-000000000009';
const ANIMAL_USER_ID = '00000000-0000-0000-0000-000000000010';
const SCOOTER_USER_ID = '00000000-0000-0000-0000-000000000013';

const KERMIT_PROFILE_ID = '00000000-0000-0000-0000-000000000014';
const MISSPIGGY_PROFILE_ID = '00000000-0000-0000-0000-000000000015';
const FOZZIE_PROFILE_ID = '00000000-0000-0000-0000-000000000016';
const STATLER_PROFILE_ID = '00000000-0000-0000-0000-000000000017';

const IMAGE_URLS = {
	devPerformer:
		'https://commons.wikimedia.org/wiki/Special:FilePath/Improv_austin_2009.jpg?width=800',
	devCoach:
		'https://commons.wikimedia.org/wiki/Special:FilePath/Theatre_of_the_Oppressed1.jpg?width=800',
	kermit:
		'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Kermit_puppet.jpg/960px-Kermit_puppet.jpg',
	missPiggy:
		'https://commons.wikimedia.org/wiki/Special:FilePath/Miss_Piggy_puppet_1979.jpg?width=800',
	fozzie:
		'https://commons.wikimedia.org/wiki/Special:FilePath/Fozzie_Bear_puppet.jpg?width=800',
	statler:
		'https://commons.wikimedia.org/wiki/Special:FilePath/Statler_and_waldorf_muppet.png?width=800',
	muppetAllStars:
		'https://commons.wikimedia.org/wiki/Special:FilePath/Kermit_and_Miss_Piggy_(19001749693).jpg?width=800',
	rainbowConnection:
		'https://commons.wikimedia.org/wiki/Special:FilePath/Kermit_the_Frog_Puppet_in_2010.jpg?width=800'
} as const;

/**
 * Seeds the staging Supabase DB with Muppets test data.
 * Idempotent: uses onConflictDoNothing or existence checks throughout.
 * Called by scripts/seed-staging.ts.
 */
export async function seedDb(db: Db): Promise<void> {
	// Seed base 3 users (original dev accounts)
	const existingBase = await db
		.select({ id: users.id })
		.from(users)
		.where(eq(users.id, PERFORMER_USER_ID))
		.limit(1);

	if (existingBase.length === 0) {
		await db.insert(users).values({
			id: PERFORMER_USER_ID,
			identityId: 'dev-performer-identity',
			email: 'performer@dev.local',
			admin: true
		});
		await db.insert(personalProfiles).values({
			id: PERFORMER_PROFILE_ID,
			userId: PERFORMER_USER_ID,
			name: 'Dev Performer',
			slug: 'dev-performer',
			bio: 'A local dev test user with a performer profile.',
			training: 'Arcade Comedy School, Levels 1–5',
			photoUrl: IMAGE_URLS.devPerformer
		});
		await db.insert(performerProfiles).values({
			profileId: PERFORMER_PROFILE_ID,
			lookingForPracticeGroup: true,
			lookingForSmallGroup: false,
			lookingForIndieTeam: true
		});

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
			bio: 'A local dev test user with a coach profile.',
			photoUrl: IMAGE_URLS.devCoach
		});
		await db.insert(coachProfiles).values({
			profileId: COACH_PROFILE_ID,
			coachingBio: 'Long-form improv specialist. Available for private sessions and team coaching.',
			availableForPrivate: true,
			availableForTeams: true,
			availableForPracticeGroup: false,
			availability: 'Weekends preferred'
		});

		await db.insert(users).values({
			id: NEWUSER_USER_ID,
			identityId: 'dev-newuser-identity',
			email: 'newuser@dev.local'
		});
	}

	// Keep existing staging DBs aligned as demo data evolves.
	await db.update(users).set({ admin: true }).where(eq(users.id, PERFORMER_USER_ID));
	await db.update(users).set({ admin: true }).where(eq(users.id, KERMIT_USER_ID));
	await db
		.update(personalProfiles)
		.set({ photoUrl: IMAGE_URLS.devPerformer })
		.where(eq(personalProfiles.id, PERFORMER_PROFILE_ID));
	await db
		.update(personalProfiles)
		.set({ photoUrl: IMAGE_URLS.devCoach })
		.where(eq(personalProfiles.id, COACH_PROFILE_ID));
	await db
		.update(personalProfiles)
		.set({ photoUrl: IMAGE_URLS.kermit })
		.where(eq(personalProfiles.id, KERMIT_PROFILE_ID));
	await db
		.update(personalProfiles)
		.set({ photoUrl: IMAGE_URLS.missPiggy })
		.where(eq(personalProfiles.id, MISSPIGGY_PROFILE_ID));
	await db
		.update(personalProfiles)
		.set({ photoUrl: IMAGE_URLS.fozzie })
		.where(eq(personalProfiles.id, FOZZIE_PROFILE_ID));
	await db
		.update(personalProfiles)
		.set({ photoUrl: IMAGE_URLS.statler })
		.where(eq(personalProfiles.id, STATLER_PROFILE_ID));

	// Seed muppet users
	const existingMuppets = await db
		.select({ id: users.id })
		.from(users)
		.where(eq(users.id, KERMIT_USER_ID))
		.limit(1);

	if (existingMuppets.length === 0) {
		await db.insert(users).values({
			id: KERMIT_USER_ID,
			identityId: 'dev-kermit-identity',
			email: 'kermit@dev.local',
			admin: true
		});
		await db.insert(personalProfiles).values({
			id: KERMIT_PROFILE_ID,
			userId: KERMIT_USER_ID,
			name: 'Kermit the Frog',
			slug: 'kermit-the-frog',
			bio: 'Host, performer, and all-around MC. Comfortable on any stage.',
			training: 'Muppet Studios, Advanced Scene Work',
			photoUrl: IMAGE_URLS.kermit
		});
		await db.insert(performerProfiles).values({
			profileId: KERMIT_PROFILE_ID,
			lookingForPracticeGroup: false,
			lookingForSmallGroup: false,
			lookingForIndieTeam: true
		});

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
			training: 'Advanced Character Work, Musical Improv',
			photoUrl: IMAGE_URLS.missPiggy
		});
		await db.insert(performerProfiles).values({
			profileId: MISSPIGGY_PROFILE_ID,
			lookingForPracticeGroup: true,
			lookingForSmallGroup: false,
			lookingForIndieTeam: true
		});

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
			training: 'Stand-Up to Improv Intensive',
			photoUrl: IMAGE_URLS.fozzie
		});
		await db.insert(performerProfiles).values({
			profileId: FOZZIE_PROFILE_ID,
			lookingForPracticeGroup: true,
			lookingForSmallGroup: false,
			lookingForIndieTeam: false
		});

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
			bio: 'Experienced critic and coach. Will tell it like it is.',
			photoUrl: IMAGE_URLS.statler
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

		await db.insert(users).values({
			id: WALDORF_USER_ID,
			identityId: 'dev-waldorf-identity',
			email: 'waldorf@dev.local'
		});
		await db.insert(users).values({
			id: GONZO_USER_ID,
			identityId: 'dev-gonzo-identity',
			email: 'gonzo@dev.local'
		});
		await db.insert(users).values({
			id: ANIMAL_USER_ID,
			identityId: 'dev-animal-identity',
			email: 'animal@dev.local'
		});
		await db.insert(users).values({
			id: SCOOTER_USER_ID,
			identityId: 'dev-scooter-identity',
			email: 'scooter@dev.local'
		});
	}

	// Seed approved tags
	const performerTagNames = ['long-form', 'short-form', 'arcade', 'ucb', '5-years', '10-years', '15-years', '20-years'];
	const coachTagNames = ['long-form', 'short-form', 'harold'];
	const teamTagNames = ['long-form', 'short-form', 'arcade', 'ucb', 'house-team', 'indie', 'city-paper-best-of-pgh'];

	for (const name of performerTagNames) {
		await db.insert(tags).values({ name, domain: 'performer', status: 'approved' }).onConflictDoNothing();
	}
	for (const name of coachTagNames) {
		await db.insert(tags).values({ name, domain: 'coach', status: 'approved' }).onConflictDoNothing();
	}
	for (const name of teamTagNames) {
		await db.insert(tags).values({ name, domain: 'team', status: 'approved' }).onConflictDoNothing();
	}

	// Seed teams
	const [muppetAllStars] = await db
		.select({ id: teams.id })
		.from(teams)
		.where(eq(teams.id, MUPPET_ALL_STARS_TEAM_ID))
		.limit(1);
	if (!muppetAllStars) {
		await db.insert(teams).values({
			id: MUPPET_ALL_STARS_TEAM_ID,
			createdByUserId: KERMIT_USER_ID,
			name: 'Muppet All Stars',
			slug: 'muppet-all-stars',
			status: 'active',
			photoUrl: IMAGE_URLS.muppetAllStars,
			description:
				'A polished ensemble built around big characters, earnest songs, and balcony-tested punchlines.',
			form: 'Longform',
			openToBookOpeners: true,
			openToNewMembers: true,
			primaryContactProfileId: KERMIT_PROFILE_ID
		});
	} else {
		await db
			.update(teams)
			.set({
				photoUrl: IMAGE_URLS.muppetAllStars,
				description:
					'A polished ensemble built around big characters, earnest songs, and balcony-tested punchlines.',
				status: 'active',
				primaryContactProfileId: KERMIT_PROFILE_ID
			})
			.where(eq(teams.id, MUPPET_ALL_STARS_TEAM_ID));
	}

	const [rainbowConnection] = await db
		.select({ id: teams.id })
		.from(teams)
		.where(eq(teams.id, RAINBOW_CONNECTION_TEAM_ID))
		.limit(1);
	if (!rainbowConnection) {
		await db.insert(teams).values({
			id: RAINBOW_CONNECTION_TEAM_ID,
			createdByUserId: KERMIT_USER_ID,
			name: 'Rainbow Connection',
			slug: 'rainbow-connection',
			status: 'active',
			photoUrl: IMAGE_URLS.rainbowConnection,
			description:
				"Kermit's solo improv show: heartfelt audience stories, quick songs, and surprisingly grounded scene work.",
			form: 'Solo show',
			openToBookOpeners: true,
			primaryContactProfileId: KERMIT_PROFILE_ID
		});
	} else {
		await db
			.update(teams)
			.set({
				photoUrl: IMAGE_URLS.rainbowConnection,
				description:
					"Kermit's solo improv show: heartfelt audience stories, quick songs, and surprisingly grounded scene work.",
				status: 'active',
				primaryContactProfileId: KERMIT_PROFILE_ID
			})
			.where(eq(teams.id, RAINBOW_CONNECTION_TEAM_ID));
	}

	async function addTeamMember(teamId: string, profileId: string) {
		const existing = await db
			.select({ id: teamMembers.id })
			.from(teamMembers)
			.where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.profileId, profileId)))
			.limit(1);
		if (existing.length === 0) {
			await db.insert(teamMembers).values({
				teamId,
				profileId,
				isCurrent: true,
				approvalStatus: 'approved'
			});
		}
	}

	async function addTeamCoach(teamId: string, profileId: string, isCurrent: boolean) {
		const existing = await db
			.select({ id: teamCoaches.id })
			.from(teamCoaches)
			.where(and(eq(teamCoaches.teamId, teamId), eq(teamCoaches.profileId, profileId)))
			.limit(1);
		if (existing.length === 0) {
			await db.insert(teamCoaches).values({
				teamId,
				profileId,
				isCurrent,
				approvalStatus: 'approved',
				startYear: isCurrent ? 2025 : 2023,
				endYear: isCurrent ? null : 2024
			});
		} else {
			await db
				.update(teamCoaches)
				.set({ isCurrent, approvalStatus: 'approved' })
				.where(eq(teamCoaches.id, existing[0].id));
		}
	}

	await addTeamMember(MUPPET_ALL_STARS_TEAM_ID, KERMIT_PROFILE_ID);
	await addTeamMember(MUPPET_ALL_STARS_TEAM_ID, MISSPIGGY_PROFILE_ID);
	await addTeamMember(MUPPET_ALL_STARS_TEAM_ID, FOZZIE_PROFILE_ID);
	await addTeamCoach(MUPPET_ALL_STARS_TEAM_ID, STATLER_PROFILE_ID, true);
	await addTeamCoach(MUPPET_ALL_STARS_TEAM_ID, COACH_PROFILE_ID, false);

	await addTeamMember(RAINBOW_CONNECTION_TEAM_ID, KERMIT_PROFILE_ID);
	await addTeamCoach(RAINBOW_CONNECTION_TEAM_ID, MISSPIGGY_PROFILE_ID, true);

	async function addEntityTag(domain: 'performer' | 'coach' | 'team', entityId: string, name: string, userId: string) {
		const [tag] = await db
			.select({ id: tags.id })
			.from(tags)
			.where(and(eq(tags.domain, domain), eq(tags.name, name)))
			.limit(1);
		if (tag) {
			await db
				.insert(entityTags)
				.values({ tagId: tag.id, entityId, domain, addedByUserId: userId })
				.onConflictDoNothing();
		}
	}

	const performerRows = await db
		.select({ id: performerProfiles.id, profileId: performerProfiles.profileId })
		.from(performerProfiles);
	const performerEntityIds = new Map(performerRows.map((row) => [row.profileId, row.id]));
	const coachRows = await db
		.select({ id: coachProfiles.id, profileId: coachProfiles.profileId })
		.from(coachProfiles);
	const coachEntityIds = new Map(coachRows.map((row) => [row.profileId, row.id]));

	const performerTagAssignments = [
		{ profileId: PERFORMER_PROFILE_ID, userId: PERFORMER_USER_ID, names: ['long-form', 'arcade'] },
		{ profileId: KERMIT_PROFILE_ID, userId: KERMIT_USER_ID, names: ['long-form', '10-years'] },
		{ profileId: MISSPIGGY_PROFILE_ID, userId: MISSPIGGY_USER_ID, names: ['short-form', 'ucb'] },
		{ profileId: FOZZIE_PROFILE_ID, userId: FOZZIE_USER_ID, names: ['short-form', '5-years'] }
	];
	for (const assignment of performerTagAssignments) {
		const entityId = performerEntityIds.get(assignment.profileId);
		if (entityId) {
			for (const name of assignment.names) {
				await addEntityTag('performer', entityId, name, assignment.userId);
			}
		}
	}

	const coachTagAssignments = [
		{ profileId: COACH_PROFILE_ID, userId: COACH_USER_ID, names: ['long-form', 'harold'] },
		{ profileId: STATLER_PROFILE_ID, userId: STATLER_USER_ID, names: ['short-form', 'harold'] }
	];
	for (const assignment of coachTagAssignments) {
		const entityId = coachEntityIds.get(assignment.profileId);
		if (entityId) {
			for (const name of assignment.names) {
				await addEntityTag('coach', entityId, name, assignment.userId);
			}
		}
	}

	await addEntityTag('team', MUPPET_ALL_STARS_TEAM_ID, 'long-form', KERMIT_USER_ID);
	await addEntityTag('team', MUPPET_ALL_STARS_TEAM_ID, 'house-team', KERMIT_USER_ID);
	await addEntityTag('team', RAINBOW_CONNECTION_TEAM_ID, 'short-form', KERMIT_USER_ID);
	await addEntityTag('team', RAINBOW_CONNECTION_TEAM_ID, 'indie', KERMIT_USER_ID);
}

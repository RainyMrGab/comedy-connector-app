/**
 * Test users pre-seeded in the Supabase staging project.
 * Used by /dev-login to show the quick-login picker.
 * Run `pnpm db:seed:staging` to populate these users.
 */
export const DEV_USERS = [
	{
		id: '00000000-0000-0000-0000-000000000001',
		email: 'performer@dev.local',
		label: 'Dev Performer (Admin) — has performer profile'
	},
	{
		id: '00000000-0000-0000-0000-000000000002',
		email: 'coach@dev.local',
		label: 'Dev Coach — has coach profile'
	},
	{
		id: '00000000-0000-0000-0000-000000000003',
		email: 'newuser@dev.local',
		label: 'New User — no profile (tests onboarding)'
	},
	{
		id: '00000000-0000-0000-0000-000000000004',
		email: 'kermit@dev.local',
		label: 'Kermit the Frog — performer profile'
	},
	{
		id: '00000000-0000-0000-0000-000000000005',
		email: 'misspiggy@dev.local',
		label: 'Miss Piggy — performer profile'
	},
	{
		id: '00000000-0000-0000-0000-000000000006',
		email: 'fozzie@dev.local',
		label: 'Fozzie Bear — performer profile'
	},
	{
		id: '00000000-0000-0000-0000-000000000007',
		email: 'statler@dev.local',
		label: 'Statler — coach profile'
	},
	{
		id: '00000000-0000-0000-0000-000000000008',
		email: 'waldorf@dev.local',
		label: 'Waldorf — no profile'
	},
	{
		id: '00000000-0000-0000-0000-000000000009',
		email: 'gonzo@dev.local',
		label: 'Gonzo — no profile'
	},
	{
		id: '00000000-0000-0000-0000-000000000010',
		email: 'animal@dev.local',
		label: 'Animal — no profile'
	},
	{
		id: '00000000-0000-0000-0000-000000000013',
		email: 'scooter@dev.local',
		label: 'Scooter — no profile'
	}
] as const;

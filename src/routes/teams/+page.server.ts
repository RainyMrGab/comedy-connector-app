import { db } from '$server/db';
import { teams, teamMembers } from '$server/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Active teams only — stubs only shown if they have approved members
	const allTeams = await db.select().from(teams).limit(100);

	// For stub teams, check if any approved members exist
	const stubIds = allTeams.filter((t) => t.status === 'stub').map((t) => t.id);
	let stubsWithMembers: string[] = [];
	if (stubIds.length > 0) {
		const membersOfStubs = await db
			.select({ teamId: teamMembers.teamId })
			.from(teamMembers)
			.where(
				and(
					inArray(teamMembers.teamId, stubIds),
					eq(teamMembers.approvalStatus, 'approved')
				)
			);
		stubsWithMembers = [...new Set(membersOfStubs.map((m) => m.teamId))];
	}

	const visible = allTeams.filter(
		(t) => t.status === 'active' || stubsWithMembers.includes(t.id)
	);

	return { teams: visible };
};

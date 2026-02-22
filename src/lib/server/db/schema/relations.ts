import { relations } from 'drizzle-orm';
import { users } from './users';
import { personalProfiles } from './personal_profiles';
import { performerProfiles } from './performer_profiles';
import { coachProfiles } from './coach_profiles';
import { teams } from './teams';
import { teamMembers } from './team_members';
import { teamCoaches } from './team_coaches';
import { contactMessages } from './contact_messages';

export const usersRelations = relations(users, ({ one, many }) => ({
	personalProfile: one(personalProfiles, {
		fields: [users.id],
		references: [personalProfiles.userId]
	}),
	createdTeams: many(teams),
	sentMessages: many(contactMessages)
}));

export const personalProfilesRelations = relations(personalProfiles, ({ one, many }) => ({
	user: one(users, {
		fields: [personalProfiles.userId],
		references: [users.id]
	}),
	performerProfile: one(performerProfiles, {
		fields: [personalProfiles.id],
		references: [performerProfiles.profileId]
	}),
	coachProfile: one(coachProfiles, {
		fields: [personalProfiles.id],
		references: [coachProfiles.profileId]
	}),
	teamMemberships: many(teamMembers),
	coachingRoles: many(teamCoaches)
}));

export const performerProfilesRelations = relations(performerProfiles, ({ one }) => ({
	profile: one(personalProfiles, {
		fields: [performerProfiles.profileId],
		references: [personalProfiles.id]
	})
}));

export const coachProfilesRelations = relations(coachProfiles, ({ one }) => ({
	profile: one(personalProfiles, {
		fields: [coachProfiles.profileId],
		references: [personalProfiles.id]
	})
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
	createdBy: one(users, {
		fields: [teams.createdByUserId],
		references: [users.id]
	}),
	primaryContact: one(personalProfiles, {
		fields: [teams.primaryContactProfileId],
		references: [personalProfiles.id]
	}),
	members: many(teamMembers),
	coaches: many(teamCoaches)
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
	team: one(teams, {
		fields: [teamMembers.teamId],
		references: [teams.id]
	}),
	profile: one(personalProfiles, {
		fields: [teamMembers.profileId],
		references: [personalProfiles.id]
	})
}));

export const teamCoachesRelations = relations(teamCoaches, ({ one }) => ({
	team: one(teams, {
		fields: [teamCoaches.teamId],
		references: [teams.id]
	}),
	profile: one(personalProfiles, {
		fields: [teamCoaches.profileId],
		references: [personalProfiles.id]
	})
}));

export const contactMessagesRelations = relations(contactMessages, ({ one }) => ({
	sender: one(users, {
		fields: [contactMessages.senderUserId],
		references: [users.id]
	})
}));

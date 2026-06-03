import { z } from 'zod';

export const socialLinksSchema = z.object({
	instagram: z.string().url().optional().or(z.literal('')),
	tiktok: z.string().url().optional().or(z.literal('')),
	twitter: z.string().url().optional().or(z.literal('')),
	bluesky: z.string().url().optional().or(z.literal('')),
	website: z.string().url().optional().or(z.literal(''))
});

export const personalProfileSchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters').max(100),
	bio: z.string().max(5000).optional(),
	training: z.string().max(2000).optional(),
	lookingFor: z.string().max(500).optional(),
	contactEmail: z.string().email().optional().or(z.literal('')),
	photoUrl: z.string().url().optional().or(z.literal('')),
	socialLinks: socialLinksSchema.optional()
});

export const highlightSchema = z.object({
	type: z.enum(['link', 'image']),
	url: z.string().url('Each highlight must be a valid URL'),
	label: z.string().max(200).optional()
});

export const performerProfileSchema = z.object({
	highlights: z.array(highlightSchema).max(5).optional(),
	lookingForPracticeGroup: z.boolean().optional(),
	lookingForSmallGroup: z.boolean().optional(),
	lookingForIndieTeam: z.boolean().optional(),
	lookingFor: z.string().max(500).optional()
});

export const coachProfileSchema = z.object({
	coachingBio: z.string().max(2000).optional(),
	availableForPrivate: z.boolean().optional(),
	availableForTeams: z.boolean().optional(),
	availableForPracticeGroup: z.boolean().optional(),
	availability: z.string().max(500).optional()
});

export const teamSchema = z.object({
	name: z.string().min(2, 'Team name must be at least 2 characters').max(100),
	description: z.string().max(2000).optional(),
	photoUrl: z.string().url().optional().or(z.literal('')),
	videoUrl: z.string().url().optional().or(z.literal('')),
	form: z.string().max(100).optional(),
	isPracticeGroup: z.boolean().optional(),
	openToNewMembers: z.boolean().optional(),
	openToBookOpeners: z.boolean().optional(),
	seekingCoach: z.boolean().optional(),
	lookingFor: z.string().max(500).optional()
});

export const contactMessageSchema = z.object({
	subject: z.string().min(1, 'Subject is required').max(200),
	message: z.string().min(10, 'Message must be at least 10 characters').max(5000)
});

export type PersonalProfileInput = z.infer<typeof personalProfileSchema>;
export type PerformerProfileInput = z.infer<typeof performerProfileSchema>;
export type HighlightInput = z.infer<typeof highlightSchema>;
export type CoachProfileInput = z.infer<typeof coachProfileSchema>;
export type TeamInput = z.infer<typeof teamSchema>;
export type ContactMessageInput = z.infer<typeof contactMessageSchema>;

ALTER TABLE "performer_profiles" ADD COLUMN "looking_for_practice_group" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "performer_profiles" ADD COLUMN "looking_for_small_group" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "performer_profiles" ADD COLUMN "looking_for_indie_team" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "performer_profiles" DROP COLUMN "open_to_book_openers";--> statement-breakpoint
ALTER TABLE "performer_profiles" DROP COLUMN "looking_for_team";--> statement-breakpoint
ALTER TABLE "performer_profiles" DROP COLUMN "looking_for_coach";
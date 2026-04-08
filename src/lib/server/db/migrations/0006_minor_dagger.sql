ALTER TABLE "coach_profiles" ADD COLUMN "available_for_practice_group" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "coach_profiles" DROP COLUMN "available_for_workshops";
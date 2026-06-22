CREATE TYPE "public"."reaction_entity_type" AS ENUM('performer', 'coach', 'team');--> statement-breakpoint
CREATE TYPE "public"."reaction_type" AS ENUM('like', 'love', 'celebrate');--> statement-breakpoint
CREATE TABLE "reactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_id" uuid NOT NULL,
	"entity_type" "reaction_entity_type" NOT NULL,
	"reaction_type" "reaction_type" NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reactions_entity_type_user_unique" UNIQUE("entity_id","reaction_type","user_id")
);
--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
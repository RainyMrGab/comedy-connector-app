CREATE TYPE "public"."tag_domain" AS ENUM('performer', 'coach', 'team');--> statement-breakpoint
CREATE TYPE "public"."tag_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "entity_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tag_id" uuid NOT NULL,
	"entity_id" uuid NOT NULL,
	"domain" "tag_domain" NOT NULL,
	"added_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "entity_tags_tag_entity_unique" UNIQUE("tag_id","entity_id")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"domain" "tag_domain" NOT NULL,
	"status" "tag_status" DEFAULT 'pending' NOT NULL,
	"suggested_by_user_id" uuid,
	"suggested_on_entity_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tags_name_domain_unique" UNIQUE("name","domain")
);
--> statement-breakpoint
ALTER TABLE "entity_tags" ADD CONSTRAINT "entity_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entity_tags" ADD CONSTRAINT "entity_tags_added_by_user_id_users_id_fk" FOREIGN KEY ("added_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_suggested_by_user_id_users_id_fk" FOREIGN KEY ("suggested_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
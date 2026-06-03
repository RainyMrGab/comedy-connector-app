CREATE TYPE "public"."recipient_type" AS ENUM('personal_profile', 'team');--> statement-breakpoint
CREATE TYPE "public"."team_status" AS ENUM('stub', 'active');--> statement-breakpoint
CREATE TYPE "public"."approval_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."tag_domain" AS ENUM('performer', 'coach', 'team');--> statement-breakpoint
CREATE TYPE "public"."tag_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "coach_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"coaching_bio" text,
	"available_for_private" boolean DEFAULT false NOT NULL,
	"available_for_teams" boolean DEFAULT false NOT NULL,
	"available_for_practice_group" boolean DEFAULT false NOT NULL,
	"availability" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "coach_profiles_profile_id_unique" UNIQUE("profile_id")
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipient_type" "recipient_type" NOT NULL,
	"recipient_id" uuid NOT NULL,
	"sender_user_id" uuid NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identity_id" text NOT NULL,
	"email" text NOT NULL,
	"auth_provider" text DEFAULT 'email',
	"admin" boolean DEFAULT false NOT NULL,
	"last_seen_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_identity_id_unique" UNIQUE("identity_id")
);
--> statement-breakpoint
CREATE TABLE "personal_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"photo_url" text,
	"social_links" jsonb DEFAULT '{}'::jsonb,
	"bio" text,
	"training" text,
	"looking_for" text,
	"contact_email" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "personal_profiles_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "personal_profiles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "performer_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"video_highlights" jsonb DEFAULT '[]'::jsonb,
	"looking_for_practice_group" boolean DEFAULT false NOT NULL,
	"looking_for_small_group" boolean DEFAULT false NOT NULL,
	"looking_for_indie_team" boolean DEFAULT false NOT NULL,
	"looking_for" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "performer_profiles_profile_id_unique" UNIQUE("profile_id")
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_by_user_id" uuid,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"status" "team_status" DEFAULT 'stub' NOT NULL,
	"photo_url" text,
	"description" text,
	"video_url" text,
	"form" text,
	"is_practice_group" boolean DEFAULT false NOT NULL,
	"open_to_new_members" boolean DEFAULT false NOT NULL,
	"open_to_book_openers" boolean DEFAULT false NOT NULL,
	"seeking_coach" boolean DEFAULT false NOT NULL,
	"looking_for" text,
	"primary_contact_profile_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "teams_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"profile_id" uuid,
	"member_name" text,
	"invite_email" text,
	"invite_token" text,
	"start_year" integer,
	"start_month" integer,
	"end_year" integer,
	"end_month" integer,
	"is_current" boolean DEFAULT true NOT NULL,
	"approval_status" "approval_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_coaches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"profile_id" uuid,
	"coach_name" text,
	"invite_email" text,
	"invite_token" text,
	"start_year" integer,
	"start_month" integer,
	"end_year" integer,
	"end_month" integer,
	"is_current" boolean DEFAULT true NOT NULL,
	"approval_status" "approval_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
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
ALTER TABLE "coach_profiles" ADD CONSTRAINT "coach_profiles_profile_id_personal_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."personal_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_messages" ADD CONSTRAINT "contact_messages_sender_user_id_users_id_fk" FOREIGN KEY ("sender_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entity_tags" ADD CONSTRAINT "entity_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entity_tags" ADD CONSTRAINT "entity_tags_added_by_user_id_users_id_fk" FOREIGN KEY ("added_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_profiles" ADD CONSTRAINT "personal_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performer_profiles" ADD CONSTRAINT "performer_profiles_profile_id_personal_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."personal_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_primary_contact_profile_id_personal_profiles_id_fk" FOREIGN KEY ("primary_contact_profile_id") REFERENCES "public"."personal_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_profile_id_personal_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."personal_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_coaches" ADD CONSTRAINT "team_coaches_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_coaches" ADD CONSTRAINT "team_coaches_profile_id_personal_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."personal_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_suggested_by_user_id_users_id_fk" FOREIGN KEY ("suggested_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
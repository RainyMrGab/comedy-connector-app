-- Track user activity for inactivity-based freshness reminder filtering.
-- Users who logged in during the previous calendar month are excluded from polls.
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;
--> statement-breakpoint
-- Freshness reminders are now mandatory (a condition of using the app).
-- Remove the opt-out columns from both profile tables.
ALTER TABLE personal_profiles DROP COLUMN IF EXISTS freshness_reminders_enabled;
--> statement-breakpoint
ALTER TABLE teams DROP COLUMN IF EXISTS freshness_reminders_enabled;

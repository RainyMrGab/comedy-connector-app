-- Full-text search: generated tsvector columns + GIN indexes
-- Run via: pnpm db:migrate (Drizzle Kit) or manually via psql

-- personal_profiles search vector
ALTER TABLE personal_profiles
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(name, '') || ' ' ||
      coalesce(bio, '') || ' ' ||
      coalesce(training, '') || ' ' ||
      coalesce(looking_for, '')
    )
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_personal_profiles_search
  ON personal_profiles USING GIN (search_vector);

-- teams search vector (active teams only filtered at query time)
ALTER TABLE teams
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(name, '') || ' ' ||
      coalesce(description, '') || ' ' ||
      coalesce(form, '') || ' ' ||
      coalesce(looking_for, '')
    )
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_teams_search
  ON teams USING GIN (search_vector);

-- coach_profiles search vector
ALTER TABLE coach_profiles
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(coaching_bio, '') || ' ' ||
      coalesce(availability, '')
    )
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_coach_profiles_search
  ON coach_profiles USING GIN (search_vector);

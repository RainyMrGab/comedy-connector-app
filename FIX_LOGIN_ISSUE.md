# Fix: Login Issues with Shared Users Database

## Problem

After setting up separate databases for production and staging with shared users:
- Users could log in successfully
- But they saw the "logged in as" Netlify Identity popup instead of the "My Profile" navigation bar
- The app wasn't recognizing authenticated users

## Root Cause

The authentication flow had a mismatch:

1. ✅ **User Creation** (identity-signup function): Wrote to production DB via `NETLIFY_DATABASE_URL_IDENTITY`
2. ❌ **User Lookup** (auth.ts): Read from staging DB via `NETLIFY_DATABASE_URL`

When users logged in on a deploy preview, the user existed in production but the app was looking in staging.

## Solution

Created a separate database connection for identity operations:

### Changes Made

**1. src/lib/server/db/index.ts**
- Added `getIdentityDb()` function that connects to `NETLIFY_DATABASE_URL_IDENTITY`
- Exported new `identityDb` Proxy for accessing the identity database
- Existing `db` export unchanged (still uses `NETLIFY_DATABASE_URL`)

**2. src/lib/server/auth.ts**
- Changed import from `db` to `identityDb`
- Updated `getUserByIdentityId()` to query `identityDb` instead of `db`
- Now both user creation and lookup use the same database

### How It Works Now

| Operation | Database Used | Variable |
|-----------|---------------|----------|
| Identity signup (create user) | Identity/Production | `NETLIFY_DATABASE_URL_IDENTITY` |
| Auth lookup (find user) | Identity/Production | `NETLIFY_DATABASE_URL_IDENTITY` |
| Profile data (CRUD) | Context-specific | `NETLIFY_DATABASE_URL` |
| Team data (CRUD) | Context-specific | `NETLIFY_DATABASE_URL` |

### Benefits

✅ Users are created and found in the same database
✅ Authentication works on all deploy contexts  
✅ Profile/team data remains environment-specific
✅ No code changes needed in other parts of the app (uses `db` for everything except user lookup)

## Testing

After deploying these changes:

1. Sign up on a deploy preview
2. You should see "My Profile" in the navigation (not the popup)
3. Clicking "My Profile" takes you to `/profile`
4. You can create profiles in the staging database
5. The same user can log in to production (when you have users there)

## What's Next

Make sure both databases have the same users table structure:

```bash
# Already done during initial setup
NETLIFY_DATABASE_URL="<prod-url>" pnpm db:setup
NETLIFY_DATABASE_URL="<staging-url>" pnpm db:setup
```

If you had existing users in production before this fix, you may want to sync them to staging (optional):

```sql
-- Connect to staging database
INSERT INTO users (id, identity_id, email, created_at, updated_at)
SELECT id, identity_id, email, created_at, updated_at  
FROM production_database.users
ON CONFLICT (identity_id) DO NOTHING;
```

## Files Modified

- ✅ `src/lib/server/db/index.ts`
- ✅ `src/lib/server/auth.ts`

Build tested and passing ✅


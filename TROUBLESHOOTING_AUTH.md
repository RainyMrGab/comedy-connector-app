# Troubleshooting: "My Profile" Link Not Showing

## The Problem

You can log in successfully (Netlify Identity popup appears and you're authenticated), but the "My Profile" link doesn't appear in the navigation. Instead, you might see the Identity widget popup.

## Root Cause

The app requires BOTH conditions to be true:
1. ✅ Netlify Identity has you logged in (JWT cookie exists)
2. ❌ Your user record exists in the database being queried

If #2 fails, you're authenticated with Identity but the app doesn't recognize you.

## Diagnostic Steps

### Step 1: Visit the Debug Page

1. Deploy your changes (or run locally with `pnpm dev:netlify`)
2. Log in
3. Navigate to `/auth-debug`

This page will show you:
- ✅ or ❌ if the server found your user in the database
- ✅ or ❌ if the client auth store has your user
- Your deploy context (production, deploy-preview, etc.)

### Step 2: Check Browser Console

Open your browser's developer console and look for log messages:

**Expected successful flow:**
```
[db] Initializing identity database connection
[db] Using NETLIFY_DATABASE_URL_IDENTITY: postgresql://...
[auth] Resolved JWT for identity_id: abc123, email: you@example.com
[auth] Found user you@example.com (id: def456)
[layout] Server data.user: { id: 'def456', email: 'you@example.com' }
[layout] Setting user from server data: you@example.com
```

**If user not found:**
```
[auth] Resolved JWT for identity_id: abc123, email: you@example.com
[auth] User not found for identity_id: abc123
[auth] Make sure NETLIFY_DATABASE_URL_IDENTITY is set and points to the database where users are created
[layout] Server data.user: null
[layout] No user from server, setting loading to false
```

### Step 3: Check Netlify Function Logs

Go to your Netlify dashboard → Functions → `identity-signup`

**Expected successful signup:**
```
Identity signup in production context
User created: abc123
```

**Common errors:**
- `Database configuration error` - `NETLIFY_DATABASE_URL_IDENTITY` not set
- `Connection error` - Database URL is wrong or database doesn't exist
- No logs at all - Function didn't fire (Identity webhooks not configured)

## Common Issues & Solutions

### Issue 1: `NETLIFY_DATABASE_URL_IDENTITY` Not Set

**Symptoms:**
- `/auth-debug` shows ❌ for server-side user
- Console shows: `[db] NETLIFY_DATABASE_URL_IDENTITY environment variable is not set`

**Solution:**
1. Go to Netlify dashboard → Site settings → Environment variables
2. Click "Add a variable"
3. Name: `NETLIFY_DATABASE_URL_IDENTITY`
4. Value: Your **production** database URL
5. **Important:** Select "Same value for all deploy contexts"
6. Create variable and redeploy

### Issue 2: User Created in Wrong Database

**Symptoms:**
- Identity signup function logs show success
- But `/auth-debug` shows ❌ for server-side user
- Console shows: `[auth] User not found for identity_id: ...`

**Cause:** The `identity-signup` function wrote to one database (e.g., production), but the app is reading from another (e.g., staging).

**Solution:**
Make sure both use the same database:

```env
# In Netlify environment variables (all contexts):
NETLIFY_DATABASE_URL_IDENTITY=postgresql://...your-production-db...
```

The identity-signup function will use this. The app's auth.ts will also use this for lookups.

### Issue 3: User Doesn't Exist Yet

**Symptoms:**
- You signed up before the fix was deployed
- Old signups went to the wrong database

**Solution A - Delete and Re-sign-up:**
1. Log out
2. Go to Netlify dashboard → Identity → Users
3. Delete your user
4. Sign up again (after deploying the fix)

**Solution B - Manually Create User Record:**
```sql
-- Connect to your identity database
INSERT INTO users (identity_id, email, created_at, updated_at)
VALUES (
  '<your-identity-id-from-jwt>',
  'your@email.com',
  NOW(),
  NOW()
);
```

You can find your `identity_id` by:
1. Logging in
2. Opening browser console
3. Looking for: `[auth] Resolved JWT for identity_id: <this-value>`

### Issue 4: Environment Variables Not Reloaded

**Symptoms:**
- You set `NETLIFY_DATABASE_URL_IDENTITY`
- But logs still show it's not set

**Solution:**
1. Make a dummy commit and push (to trigger rebuild)
2. Or manually trigger a redeploy in Netlify dashboard
3. Environment variables are only loaded at build/deploy time

### Issue 5: Local Development

**Symptoms:**
- Works on Netlify but not locally

**Solution:**
Create/update your `.env` file:

```bash
# Use staging for app data
NETLIFY_DATABASE_URL=postgresql://...staging-db...

# Use production for users table
NETLIFY_DATABASE_URL_IDENTITY=postgresql://...production-db...
```

Then restart your dev server:
```bash
pnpm dev:netlify
```

## Expected Behavior After Fix

1. Sign up on any environment (prod, staging, deploy preview)
2. User is created in the identity database (production)
3. On page load, server looks up user in identity database
4. User found → `data.user` is populated
5. Client receives `data.user` → authStore is updated
6. Header shows "My Profile" link

## Still Not Working?

Check all three places where the database URL must be set:

1. **Netlify environment variables:**
   - `NETLIFY_DATABASE_URL_IDENTITY` set for all contexts
   - Value is your production database URL

2. **Local .env file** (if testing locally):
   - `NETLIFY_DATABASE_URL_IDENTITY=<prod-url>`

3. **Database has schema:**
   - Run migrations: `NETLIFY_DATABASE_URL="<prod-url>" pnpm db:setup`

If you've checked all of the above and it still doesn't work, share:
- Screenshots of `/auth-debug` page
- Browser console logs (filter by `[auth]` and `[layout]`)
- Netlify function logs for `identity-signup`


# Google OAuth Consent Screen Setup (Issue #33)

This is a manual checklist for making Google sign-in look trustworthy instead of showing a raw
`*.supabase.co` identity or Google's "unverified app" warning. None of this requires Supabase's
paid Custom Domains add-on — it's entirely Google Cloud Console configuration, and works on
Supabase's free plan.

The current Google sign-in flow (`src/routes/login/+page.server.ts` → `signInWithOAuth({ provider:
'google' })`, handled by `src/routes/auth/callback/+server.ts`) doesn't change. This is dashboard
configuration only.

**Scope decision**: one shared Google Cloud project/OAuth client named "Comedy Connector," reused
across every city deployment (not one project per city). Add each new city's domain to the
authorized-domains list as it launches.

## Steps

1. **Find the existing Google Cloud project.**
   In the Supabase dashboard → Authentication → Providers → Google, note the Client ID currently
   configured. In Google Cloud Console → APIs & Services → Credentials, find the OAuth 2.0 Client
   ID that matches — that's the project already backing sign-in. Don't create a duplicate project.

2. **Configure the OAuth consent screen.**
   Google Cloud Console → APIs & Services → OAuth consent screen:
   - **App name**: `Comedy Connector`
   - **App logo**: `static/assets/brand/google-oauth-logo-120x120.png` (120×120, square, transparent
     background — matches the Comedy Connector mark used in the site header).
   - **App domain → Homepage**: `https://pgh.comedyconnector.app` (or the primary city domain)
   - **App domain → Privacy Policy**: `https://pgh.comedyconnector.app/privacy`
   - **App domain → Terms of Service**: `https://pgh.comedyconnector.app/terms`
   - **Authorized domains**: add `comedyconnector.app` (covers all city subdomains)
   - **Developer contact information**: an email you monitor

3. **Check the redirect URI.**
   Under the OAuth client's "Authorized redirect URIs," confirm Supabase's callback URL is listed
   exactly (Supabase dashboard → Authentication → Providers → Google shows the exact callback URL
   to use, e.g. `https://<project-ref>.supabase.co/auth/v1/callback`).

4. **Publish the app.**
   OAuth consent screen → Publishing status → move from **Testing** to **In production**. The
   scopes used here are just basic profile/email (non-sensitive), so this does not require Google's
   full security review — but Google may still show an "unverified" notice until domain ownership
   is verified (next step).

5. **Verify domain ownership.**
   Add and verify `comedyconnector.app` in
   [Google Search Console](https://search.google.com/search-console), using the same Google account
   that owns the Cloud project. Then submit the OAuth consent screen for verification (free;
   non-sensitive-scope apps typically clear in a few days).

6. **Double check Supabase's Site URL / Redirect URLs.**
   Supabase dashboard → Authentication → URL Configuration: make sure the Site URL and any
   additional Redirect URLs match each deployed environment (staging + each city's production
   domain) exactly, including subdomain.

## Verifying the fix

From an incognito window, on a Google account not already added as a test user on the OAuth
client, go through `/login` → "Continue with Google." The consent screen should show "Comedy
Connector" branding without an unverified-app warning or a raw Supabase project domain.

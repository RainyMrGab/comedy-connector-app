# Login & Authentication

Comedy Connector uses [Netlify Identity](https://docs.netlify.com/visitor-access/identity/) for user authentication.
This document covers the supported sign-in methods, how to configure social login providers, and how the auth flow works
end-to-end.

---

## How It Works

1. **Unauthenticated users** who visit a protected page are redirected to `/login?returnTo=<original-path>`.
2. The `/login` page shows an embedded email/password form and a Google OAuth button.
3. After a successful sign-in, the user is redirected back to their original destination.
4. On the server side, `hooks.server.ts` reads the `nf_jwt` cookie, decodes the JWT, and resolves it to a row in the
   `users` table via `identity_id`.

### Email / password sign-in flow

The `/login` page submits to a SvelteKit server action which calls the GoTrue token endpoint
(`/.netlify/identity/token`) server-to-server, receives the JWT, sets the `nf_jwt` cookie, and redirects to `returnTo`.

### Google OAuth sign-in flow

Clicking "Continue with Google" navigates to
`/.netlify/identity/authorize?provider=google&redirect_to=<current-login-url>`. After OAuth, GoTrue redirects back with
the token in the URL hash (`#access_token=...`). The Netlify Identity widget (initialized in the root layout) processes
the hash, fires the `login` event, and the layout redirects to `returnTo`.

### First-time signup

When a user signs up for the first time, Netlify fires the `identity-signup` webhook at
`netlify/functions/identity-signup.ts`. This function:

- Looks up the user by `identity_id` **or** `email`.
- If neither exists → creates a new `users` row.
- If the same email already exists with a different `identity_id` → **merges** the accounts: updates the existing row to
  the new `identity_id` and `auth_provider`. This handles the case where a user previously signed up with email/password
  and later signs in with Google.

---

## Email / Password

Enabled by default in every Netlify Identity deployment. No additional setup required.

Users can sign up and reset passwords directly from the Identity widget.

---

## Google OAuth

Google is the recommended social sign-in option for non-technical audiences.

### Setup steps

1. **Create OAuth credentials** in the [Google Cloud Console](https://console.cloud.google.com/):
    - Create a new project (or use an existing one).
    - Go to **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
    - Application type: **Web application**.
    - Add your site URL to **Authorized JavaScript origins** (e.g. `https://pgh.comedyconnector.app`).
    - Add `https://<your-netlify-site>.netlify.app/.netlify/identity/callback` to **Authorized redirect URIs**.
        - Also add your custom domain: `https://pgh.comedyconnector.app/.netlify/identity/callback`.
    - Save — note the **Client ID** and **Client Secret**.

2. **Enable Google in Netlify Identity**:
    - Netlify Dashboard → your site → **Identity → Settings → External providers**.
    - Click **Enable Google**.
    - Paste the **Client ID** and **Client Secret** from step 1.
    - Save.

3. **Verify**: Sign out, navigate to `/login`, and confirm the "Continue with Google" button is present. Click it and
   complete the OAuth flow.

---

## Other Providers

Netlify Identity (powered by GoTrue) supports the following OAuth providers natively:

| Provider  | Suitable for this app? |
|-----------|------------------------|
| Google    | ✅ Recommended          |
| GitHub    | ❌ Developer-focused    |
| GitLab    | ❌ Developer-focused    |
| Bitbucket | ❌ Developer-focused    |

**If you need Facebook or Apple sign-in** (table stakes for many consumer apps), you would need to migrate to a
different auth provider such as [Clerk](https://clerk.com), [Auth.js](https://authjs.dev),
or [Supabase Auth](https://supabase.com/docs/guides/auth), as Netlify Identity does not support those providers.

---

## Account Merging

If a user signs up with email/password and later signs in with Google using the same email address, the
`identity-signup` webhook merges them into a single `users` row rather than creating a duplicate. The `auth_provider`
column is updated to reflect the most recently used provider.

> **Note**: After a merge, old email/password sessions will have stale JWTs (the `sub` will no longer match the updated
`identity_id`). The user will be prompted to sign in again, which is expected behavior.

---

## Local Development

Netlify Identity **does not work in local development** — the `nf_jwt` cookie is domain-specific to the deployed Netlify
site.

In local dev (`pnpm dev`):

- The `/login` page automatically redirects to `/dev-login`.
- `/dev-login` lets you pick one of three seeded test users (performer, coach, new user).
- Auth state is stored in a `dev_session` cookie (not a JWT).

To test real Netlify Identity auth (including social login), use `pnpm dev:netlify` which connects to the production
Neon database with real auth, or deploy a preview branch.

---

## Identity Signup Webhook

The `netlify/functions/identity-signup.ts` function is triggered by Netlify after each new signup. It must be enabled in
the Netlify dashboard:

**Netlify Dashboard → Identity → Settings → Registration → Identity signup webhook**

Set the URL to: `https://<your-site>/.netlify/functions/identity-signup`

This is automatically handled when Netlify detects the function file — no manual URL configuration needed.

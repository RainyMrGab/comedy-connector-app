Let's work on issue #10: sign in improvements. 

Currently sign in supports only user/password sign in through Netlify Identity. The flow is also awkward coming to 
an authorized url from an email (e.g. liveness), because it just lands you on the main page and you don't know to 
click sign in. We'll address both of these here.

## Social login in

First, let's add support for social login through Netlify identity.
- Add a docs/login.md to document the login overall including sections on how to setup the various social login 
  providers.
- Add support for:
  - Google
  - Please recommend what social logins are considered table stakes for a non-technical app like this. I think 1-3 
    is sufficient to balance maintenance with user convenience.

- Let's make sure that in the case of social auth, the app is still storing the user info in the user table with 
  some indication that it's a social login.

## Login flow

Let's add a login page vs popup, styled according to our style guide that supports redirects. This allows us to 
support a flow from the freshness poll or other exernal links that can land users on an authorized page.

## Verification

The login flow you can verify yourself. 

- Startup the local app using `pnpm dev`
- Click the login button and verify the login page opens as a standalone page
- Log out and navigate to some of the freshness edit urls, e.g. `http://localhost:3000/profile/edit` and verify you are 
  redirected to the login page. After logging in, verify you are redirected back to the profile edit page.

Once that is working, pause for manual setup of social auth, then I can verify those are working.
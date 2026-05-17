Let's work on issue #26, which is about how people add performers and coaches to teams. 

## Current state

Currently in the app, when I want to add a performer or coach to a team, I get a box with 2 options:
1. Search app users or
2. Add by name only

## Desired state

I would like instead both add boxes to have one input:
- In it, it will automatically search by name or email. If you choose a user, it will select that user.
- It will also always allow 2 static options. Say you have typed "Ethan Gray":
  - [any matches will be at the top with the photo and name of users]
  - Invite Ethan Gray to use Comedy Connector
  - Add Ethan Gray by name only

The invite would then open a dialog which would allow the user to specify a name and email address (it should 
autofill whichever they were typing into the box previously). Once they submit, it should send an email.

The email should invite that performer to use Comedy Connector and indicate what team they are being invited to. 
Then include a "Join the Scene" button, that will allow that user to create an account (or login with an existing 
account in case it is under a different email), upon which they will be redirected to their approvals page to 
(presumably) approve their invite/addition to the aforementioned team. 

If, by chance, they have been invited to multiple teams with the same email, they should all appear on this 
approvals page. 

The add by name functionality should continue to work as today where it simply adds the performers by name with no 
need for them to approve or have a login.

## Verification

Let's run `pnpm dev` and test the various functionality in the built-in browser.

## Open questions

Any design or content suggestions are welcome. 

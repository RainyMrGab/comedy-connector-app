Let's resolve issue #39 with more notifications.

Currently, I can add a user as a coach or a performer on a team and it will send an email to create an account. If I 
add an existing user, it will put the request in their approval queue but requires the user to check. Let's add 
 email templates that will notify the user in those situations.

Let's also update the "My Profile" section with a "Notifications" section where users can turn on or off email or 
desktop notifications for all the places we send notifications:
- Monthly freshness check (show this but don't allow users to disable)
- Someone adds me as a performer 
- Someone adds me as a coach

Can you..
- confirm these scenaros
- propose copy consistent with our tone and vibe

Let's also as part of this add support for desktop notifications if it's not too much work.

For this feature:
- Let's plan out a series of atomic commits with conventional commit messages
- Once the feature is built, let's verify in the browser
- Once it is built and verified, create a draft PR via the github CLI and make a PR description summarizing the change
- Let me manually confirm the changes and merge the PR

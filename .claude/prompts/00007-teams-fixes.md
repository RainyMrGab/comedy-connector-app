We need to fix the way teams profiles work.

Fixes:

- Make the team name editable when editing the team profile
- We need to allow photo when creating a team, not just on edit.
- When I added a member by name only "Kermit the Frog" it showed up as pending by Dev Performer. Those should just
  add with no approval.
- I approved the request, and similarly the frontend did nothing.
- Edits to the team do not seem to save. Ok I did get edits to save, but it did not go to a confirmation or a clear
  "this worked screen". It went to a blank edit screen. Then when I went back to the team page, they were there.
- Let's list the coaches on the team profile.
- The coaches and performers should all have a field that indicates if they are currently active or not. When
  listing performers and coaches, we should list the active ones first in one section, then another section for
  previous or alumni.

Let's update CLAUDE.md to reflect that whenever an action is taken by a user, the frontend should show a clear
result of the action, either a confirmation or an error message. We should also redirect when possible to the
logical "result" page. For example, when approving requests, refreshing the approvals page is fine. When editing a
team profile, redirecting to the view team page is better.

Testing:

- Let's create a lot more dev users for the `dev` testing mode for teams. Let's say 8 users. Let's use the muppets
  as examples so they are easy to remember but not just numbered users.
    - Let's pre-populate performer profiles for 3 of them.
    - Pre-populate one as a coach (maybe this is Statler)
- To verify this all works, run `pnpm dev` in your preview browser. Throughout, confirm the user experience works as
  specified
- Create a team as a dev user, add the 3 performers to the team. Also add 2 more performers by name only and a coach.
- Login as those performers/coaches and approve the requests.
- Check the team profile and make sure they all show up appropriately.
- Check all the other fixes.

Iterate on any errors until all checks are green.
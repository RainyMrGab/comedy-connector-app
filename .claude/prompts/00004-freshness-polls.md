Let's setup those freshness reminders!

A reminder:

- The app needs to send reminders to update profiles for performers, coaches, and teams. The reason: many of these
  tools have existed in various forms: spreadsheets, lists, etc. But they all get stale and out of date. The
  freshness polls help the app stay alive and usable.
- I want to take out the option to opt out of freshness polls. It is a requirement to use the app. Maybe we can add
  a notice about it to the bottom of the profile for both updates and signup, e.g. "I understand that this app will
  email me periodically... ". Let's make it clear we do not spam people and will not use their email for anything
  other than these reminders (and maybe leave some wiggle room for occassional other uses).
- Then let's implement the freshness polls:
    - Everyone gets polled at the same time, let's make it the first X of the month. We'll poll everyone unless they
      just signed up the previous month.
    - Let's pick a date and time that is likely to maximize people's attention.
    - Let's put this date and time in a config file (let's start one with other easy to udpate config) so that it is
      easy to change.
    - API limit: On my resend tier, I get a max of 100 emails per day, and I need to reserve some for day to day
      operations. So let's limit freshness polls to 50 per day 
    - Let's add that limit to the constants as well, and come up with a scheme to spread the polls over our user base
      50 at a time (I don't expect more than a few hundred users, e.g. 3-4 days)
    - Let's draft an email again to maximize:
        - Getting through spam filters
        - Getting opened and read
        - The email body should have all the info people need to verify and a link to update profiles easily
    - Let's send one email with all content:
        - User profile, performer profile (if applicable), coach profile (if applicable), teams the user owns (if
          applicable)
        - Let's send the major things that need to be validated, they can always update more. Please suggest if we need
          to update this list, but I expect these are the things that go stale:
            - Personal
                - Training
                - Looking for
            - Performer
                - Teams you are on
                    - Interest flags
                    - Looking for
            - Coach
                - Interest flags
                - Availability
            - Team
                - Form
                - Interest flags
                - Looking for
                - Members
                - Coaches
        - Links to update each profile (maybe at the top, maybe at the top of each section?)
        - The goal is to balance concision and informativeness
- Let's build a tool to simulate the time-trigger so we can test the triggering of these emails

To verify:

- Run `pnpm dev:netlify`
    - Login as each type of user using the dev login
    - Ensure the option to opt out of freshness polls is removed and there is a notice about the polls
- Trigger the simulator tool
- Pause for manual email verification

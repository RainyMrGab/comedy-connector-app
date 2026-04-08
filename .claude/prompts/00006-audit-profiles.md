Let's work on Issue #12. I am going to do an audit of each of the profiles with a bunch of nits and tweaks. Ask any
questions you have, make a plan, then let's implement these with 1
commit per heading below.

## Personal profile

- There's no place to change my photo. Let's add a URL option to avoid media hosting.
- Contact email:
    - says "shown to logged-in users". Is this true? We should only be using this to allow contact
      through the app, so it shouldn't be shown to users. Let's update wording to reflect that.
- Social links: way too many. For performers here, let's limit this to instagram, tiktok, website, and maybe twitter
  (can we accept bluesky there too?)
    - These appear on search results (public profile) but not when I just view "My Profile." Can we add these to the
      card at the top of the "My Profile" page as well?

## Performer profile

- Interest flags are wrong. Should be:
    - joining a practice group?
    - small group partners (e.g. duo, trio)
    - joining an indie team
- Can we change the Video section to just "Highlights" and allow more arbitrary links
    - If photos or videos are linked, these will display as such on the profile
    - Otherwise, we can link to external sites for articles, reviews, etc.
- The public performer profile should show the profile URL and have a copy button

## Coach profile

- Interest flags are wrong. The section should be called "Interested in..." and options are:
    - sub/one-off coaching
    - coaching a practice group
    - coaching a team
- Change the availability label to just "Availability"
- The public coach profile should show the profile URL and have a copy button


# Team profile

- Let's change the Practice Group label: remove "(not a performing team)"
- Change the Looking For placeholder: "e.g. two strong character improvisers"
- This also has no way to change the photo. Let's just add a URL option.
- Can we show the video as an embed?
- Adding members:
  - We will need photos in the auto suggest in case multiple users have the same name (or some other discriminator)


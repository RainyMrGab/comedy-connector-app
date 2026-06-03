Let's work on issue #29: Migrate to Supabase

This issue has no user-facing changes. For it, I want to plan first a migration of some infrastructure to Supabase. 
I use it for other projects, and think it will be a big help here. 

The plan should include updates to @README.md and also create a migration guide for me to use in this effort to 
migrate. I will likely need to update Netlify and Supabase, and we'll shutdown Neon once it's done.

Please ask any questions, let's iterate on the plan, then get to work.

## Design constraints

We must remain below the free tier limits of Supabase. This is a side project, and I don't want to spend money at 
this time.

## What to migrate

- Supabase postgres would replace Neon in production for sure
  - With Supabase, we could create a "staging" project to replace local PGLite. Let's think this through:
    - Overall, I like staging being closer to prod
    - That said, it is useful to seed with the Muppets dataset to test features
    - It is also useful to be able to switch logins to test different user flows
    - Let's think if we can set this up in an alternate supbase project, or just keep pglite??
- Let's use Supabase for auth. The Netlify auth just sort of sucks
- Let's plan to integrate using supabase-js for simplicity, unless they have a better way to integrate with a Svelte app
- Supabase is configured to enable the data API and RLS

As a stretch goal:
- I would love to allow users to upload images. Currently all the images are links, and uploads would be a better UX.
  I believe Supabase has this capacity through the Storage API. If so, let's replace all the image URLs with uploads
- Video can remain URLs

## Implementation

The planned implementation should go in phases: 
1. Database migration
2. Auth migration
3. Image uploads to storage

Each should have its own commit (conventional commit) and verification phase.

## Verification

Please verify by running `pnpm dev` and testing in the local browser. You will likely need to pause for me to make 
some config changes.

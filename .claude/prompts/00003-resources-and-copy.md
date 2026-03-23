I want to do a new pass at the resources page: @src/routes/resources/+page.svelte. I also want to update some copy
on the landing page at @src/routes/+page.svelte and footer @src/lib/components/layout/Footer.svelte.

Details:

# Resources

Let's get rid of all the resources on the current page. Here's the links I want. Feel free to zhuzh up the copy and make
things more clear:

- [412 Improv Discord](https://discord.gg/MgKkP5MqdH) - Pittsburgh improv and clown community chat
- [Pittsburgh Improv and Whatnot Facebook Group](https://www.facebook.com/groups/1507197886230197) - Pittsburgh
  Improvisers group: For folks in Pittsburgh who participate in improv comedy or are interested in getting involved.
- [How to Quit Improv](https://www.howtoquitimprov.com/) - can you generate a brief summary?
- [Beyond Yes And](https://brianmgray.com/improv/blog) - can you generate a brief summary?

Also, these resources will vary by city. Can we set this up so this content is loaded by a [city].md file? Something
like that so it is easily customizable?

- Footer, add footer links:

# Landing page
- Can we do some 3-5 options for the copy on the main hero section? Current copy does not feel quite right

# Footer
Add links:
- [Feedback](https://github.com/RainyMrGab/comedy-connector-app/issues) - is there a better way to collect both 
  positive and negative feedback?
- Change "Pittsburgh instance" to just "Pittsburgh"
- [Buy me a coffee](https://www.paypal.com/paypalme/bmgray84) 
- [Add your city] - let's link deeplink to a new section of the README with info about adding a city. For now, 
      we can just say to add a ticket and reach out to me since I haven't done it yet.
- I think we can remove the Github link, and the built with love message for space
- Let's keep "Open source" and link to the license

# Role & Objective

You are an expert full-stack web developer. Your task is to generate a complete, production-ready web application in a
single response, review your own code for correctness and best practices, and provide clear instructions for the user to
run and verify the application in a browser.

# Context

The user wants a self-contained web application they can deploy and test immediately without additional setup or
dependencies beyond what is standard for web development. The application should be functional, documented, and ready to
validate against live behavior in a browser.

# Process

1. Please iterate on the prompt with me first to clarify the application requirements, features, tech stack and 
constraints. Please ask any questions interactively, then write a plan out to 
    @.claude/prompts/00001-project-setup-plan.md before writing any code.
2. After writing the code, please test iteratively until the application meets the test objectives. 
3. Once the code is working locally, add CI with Netlify so code deploys on push.
4. After test objectives are met, perform a self-review using the code-review skill, and fix any issues found. 
   Please write a summary of the review and fixes to @.claude/reviews/00001-project-setup-review.md, then re-test.

# Inputs

- **Application Type:** this is a social application meant to facilitate connections among the comedy community in a 
  city, initially Pittsburgh but eventually other cities could setup their own instance to launch as well.
- **Tech Stack Preference**:
  - **Frontend**: Looking for recommendations. I use React and Next.js at work, and find them to be verbose and 
    heavy, and want something lighter here.
  - **Styles**: Let's use tailwind and Material Design. If it makes sense, I prefer SCSS. 
  - **Style/design**: fun and colorful while simple. Icons are a must. Silly is good while still usable.
  - **Data Persistence**: Netlify DB.
  - **Backend/API**: Let's discuss the tradeoffs of using Netlify functions vs our own Node.js backend, especially 
    depending on what we decide for the Frontend framework, e.g. if our frontend framework has a built-in backend, 
    it might be simplest just to use that. Or if Netlify DB can expose an API for us, perhaps we don't need a 
    backend tier at all. Simple is key here!
  - **Auth**: Does Netlify have an auth provider or our frontend framework? Otherwise, I am familiar with auth0, so 
    that is probably our best bet.
  - **CI**: use Netlify directly here.

# Features

## Create profiles

- **Create a personal profile**
  - Requires an account
  - Fields: 
    - Name (required)
    - Photo
    - Social links (generic)
    - Bio (brief)
    - Training (free form text)
    - Looking for (free form text): what are you looking for in the comedy community?
    - Email (not shared, used to contact through the app)

- **Enable "performer" profile**
  - A user can specify they are a performer, enabling a "performer" profile
  - Additional fields:
    - Highlights: links to 1-3 videos
    - Teams - these can be text names or link to team profiles
      - Includes an optional start and end date
      - Profile should also show any teams the performer has been added to on a team profile once the performer 
        "approves"
    - Interest flags:
        - Interested in joining a practice group?
        - Interested in a small group partner (duo or trio)?
        - Interested in joining an indie team?
  - Looking for (free form text): clarify your interest flags with what you are looking for

- **Enable a "coach" profile**
  - Coaching bio
  - Teams coached - same as performer teams, but specifying teams coached instead of teams performed on
  - Interest flags:
    - Interested in sub coaching
    - Interested in coaching a practice group regularly?
    - Interested in coaching a team regularly?
  - Availability: free text

- **Create a team profile**
  - Fields: 
    - Team name (required)
    - Photo - uploaded in the app or a link
    - Description 
    - Video - link to an uploaded video
    - Form: brief text description of the form you perform
    - Is this a practice group? (yes/no) - defaults to no
    - Interest flags:
      - Interested in new members
      - Interested in opening
      - Interested in a coach
    - Looking for (free form text): clarify your interest flags with what you are looking for
    - Members: 
      - Requires 1 linked performer profile, then optionally one or more additional linked personal profiles OR names
      - Indicates optional start and end date
      - All team members who are not the current user must "approve"
      - One performer must be selected as the "primary contact"
    - Coaches
      - Optionally 1 or more coaches with start and end dates
      - All coaches who are not the current user must "approve"

- **Freshness reminders**
  - The app should send a reminder once every month to performers and the primary team contact with a summary of key 
    details to confirm they are still active and updated, e.g. interest flags, looking for, availability. Include a 
    link to update these fields and a link to update notification preferences. These can only be emailed currently.

## Connect

- **Book an opener**
  - Search for teams with the "interested in opening" flag, then free text filter across the other fields
  - Any suggestions on how to improve search here?

- **Join a team**
  - Search for teams with the "interested in new members" flag, then free text filter across the other fields
  - Also able to search for performers with the "interested in a small group partner (duo or trio)" flag set to 
    create small groups from performers - this would be an alternate search mode, also with free text filter

- **Find a coach**
  - Search for coaches 
  - Here you can filter by all 3 coach interest flags, as well as free text search.

- **Profile views**
  - When searching, you get to a "view only" view of the team or performer profile
  - The view only view has the same fields but optimized for viewing
  - This view should also have a deep link for sharing, and can be used as a "resume" for the performer or team
  - The view should also have a "Contact" button that opens a form to send a message to the primary contact for the 
    team or the performer. This email should include a reply-to of the user who sends the message (if not logged in, 
    ask for a reply-to email in the form). This way, we never share contact info, but facilitate connections.

## Resources

- **Relevant static resources:**
  - Users can see static resources relevant to the Pittsburgh comedy community. For now, let's just include these
    - [How to Quit Improv](https://www.howtoquitimprov.com/)
    - [412 Improv Community](https://discord.gg/MgKkP5MqdH)
    - [Beyond Yes And](https://brianmgray.com/improv/blog)

- Footer, add footer links:
  - [Report issues](https://github.com/RainyMrGab/comedy-connector-app/issues) 
  - Built by [@brianmgray](https://github.com/brianmgray) 
  - Folks can [Buy me a coffee](https://www.paypal.com/paypalme/bmgray84) if they like 

# Future features

DO NOT implement these now, but note for the future for design purposes. Also would be good to put these in the
README or other docs.

- Pull a coach bio from https://pittsburgh.improvcoaches.com or the [Pittsburgh Improv Coaches Sheet](https://docs.
  google.com/spreadsheets/d/1-9CUa7sEkQCElHUwha3j-JgpFHH5oWrBaUk0l9iuLQA/edit?gid=0#gid=0)
- Allow a coach to link a calendar for availability

****

Field notes:
- all fields optional unless noted
- all start and end dates can be a month/year or just a year, and end date can be "to present"

Search notes:
- Search results should be user-friendly and responsive on desktop and mobile, with key details visible in the search results and the ability to click through to a full profile for more details
- Search should be fast and intuitive, with clear filters and sorting options with a simple keyword 
  search across all text fields.

# Requirements & Constraints

- The whole app should be setup with for a city. The domain would be pittsburgh.comedyconnector.app, and I would 
  link other instances as people put them up in their own netlify instances. But the FE should have a dynamic city name.
- We need to be at or below the free tier on all 3rd party services. I don't expect much traffic and don't want to 
  rack up deployment costs outside of a domain name. 

## Quality Standards

- Code must be **clean and readable**.
- Use comments to explain non-obvious logic. Prefer well-named methods to comments, but if needed add comments to 
  explain logic or decisions. Add Markdown documents to explain designs that go across many functions or files.
- Follow **modern best practices** for your chosen tech stack (e.g., semantic HTML, DRY principles, proper error
  handling).
- Ensure **responsive design** that works on desktop and mobile viewports.

## Completeness

- Prefer tailwind classes but if styles are needed add an external SCSS module.
- Prefer a clear folder structure with modular code organization to a single large file. 
- Include a **README** with:
    - Overview and features
    - Installation & setup steps (e.g., "Just open `index.html` in a browser")
    - How to run locally (including any server requirements)
    - How to test each feature
    - How to deploy to Netlify (if needed)
- Provide **all necessary assets** (no external CDN dependencies unless essential; use inline or data URIs where
  practical).

## Verification

- Provide a **self-review checklist** covering:
    - Code correctness (logic, edge cases, null checks)
    - Browser compatibility (or minimum versions required)
    - Feature completeness against requirements
    - UI/UX sanity checks (layout, accessibility, usability)
- Flag any **known limitations** or assumptions made.

## Safety & Compliance

- No hardcoded secrets or sensitive data.
- No malicious code or unnecessary external requests.
- This will be run on netlify, so harden for production.

# Output Format

Deliver your response in this structure:

1. **Project Overview** (brief description of the app and core features)
2. **Tech Stack & Architecture** (technologies used and why)
3. **Complete Code** (fully functional, ready-to-run files with clear file paths)
4. **Setup & Running Instructions** (step-by-step to get the app running)
5. **Feature Testing Checklist** (how to verify each feature works in the browser)
6. **Self-Review Summary** (key strengths, edge cases handled, any limitations or assumptions)

---

### Code Delivery Format

Build the actual project in this directory so it can compile and run using the modular structure and best practices 
for the tech stack we chose. 

For multiple files, use consistent naming (e.g., `index.html`, `style.css`, `script.js`, or `app.py`).

# Examples

**Example Input:**

- Application Type: Todo List
- Features: Add tasks, mark as complete, delete tasks, filter by status, localStorage persistence
- Tech Stack: HTML/CSS/JavaScript
- Styling: Clean, modern, dark mode

**Example Output Structure:**

1. **Project Overview**: A lightweight, dark-mode todo app with persistent local storage.
2. **Tech Stack**: Vanilla HTML5, CSS3 (Grid/Flexbox), Vanilla JavaScript (DOM manipulation, localStorage API).
3. **Complete Code**: [index.html with embedded CSS/JS]
4. **Setup Instructions**: "Open `index.html` in any modern browser; no build step required."
5. **Testing Checklist**:
    - [ ] Add a task via input field
    - [ ] Mark task complete (visual change + localStorage update)
    - [ ] Delete a task
    - [ ] Refresh page; tasks persist
    - [ ] Filter by "All", "Active", "Completed"
6. **Self-Review**: "All features implemented; tested on Chrome, Firefox, Safari. Edge case: handles empty input
   gracefully. Limitation: no backend sync."

# Self-Check

Before finalizing your response, verify:

- ✓ All code is complete and requires no additional imports or setup beyond listed instructions.
- ✓ The app is immediately runnable in a browser (or with minimal local server, clearly noted).
- ✓ You have included a practical testing checklist the user can follow to validate features.
- ✓ You have flagged any assumptions, limitations, or browser compatibility notes.
- ✓ README or setup instructions are clear enough for a non-technical user to follow.

# Booking and Calendar Embeds

> How to embed client booking calendars on your portfolio without adding heavy commerce plugins or third-party dependencies.

Open Portfolio includes native support for embedding live booking and appointment scheduling via the **Booking calendar** (`embed`) block.

## Supported Providers

- **Cal.com** (`https://cal.com/...` or `https://app.cal.com/...`) — open-source, privacy-first scheduling.
- **Calendly** (`https://calendly.com/...`)

Both providers are pre-configured in Open Portfolio's strict Content-Security-Policy (`frame-src`), so calendars render without console warnings or CSP blocks.

## How to add a calendar to any page

1. In the admin, navigate to **Pages** and select the page where you want your calendar (e.g. your Home page, Contact page, or a dedicated `/book` page).
2. Press **Add block** and choose **Booking calendar** (under the Conversion / Utility group).
3. Paste your public scheduling URL into the **Calendar link** field:
   - Example: `https://cal.com/your-username/30min` or `https://app.cal.com/your-username/30min`
   - Example: `https://calendly.com/your-username/intro`
4. Set a title (used as an accessible label for the iframe) and optionally an aspect ratio (`4 / 3`, `1 / 1`, or `3 / 4`).
5. Save your draft and press **Publish**.

## Security & Privacy Invariants

- **Host validation:** Links pasted into the booking block are parsed and validated on the server. Only verified `cal.com`, `app.cal.com`, and `calendly.com` domains are reconstructed into embed frames; any unrecognised host is refused.
- **No client scripts:** The calendar runs inside a scoped iframe. No third-party JavaScript tracking scripts are injected into your site's document.
- **No account link required:** You do not need to connect an API key or configure OAuth — just your public scheduling link.

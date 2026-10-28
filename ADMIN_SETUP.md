# Editing your portfolio without touching code

Everything on the site — text, projects, career records, images, colours, navigation, and custom pages — is edited
from the admin panel at `/admin`. You do not need to edit code files to update content.

---

## 1. Running it locally

```bash
npm ci
npm run dev
```

- Public site: http://localhost:3000/
- Admin panel: http://localhost:3000/admin

Nothing to sign up for and no keys to find. With no database configured, content is stored on
disk under `.opb/` — delete that folder to start over from a fresh install.

### Signing in

The first time you open the site you are sent to `/setup` to claim it. You choose
an email and a passphrase there, and that becomes the primary owner account that can edit
the site. Nobody else can claim it afterwards.

You can also enroll **WebAuthn passkeys** (Touch ID, Face ID, Windows Hello, security keys) and use
**emailed one-time codes (OTP)** for instant, passwordless sign-in once mail is configured.

The passphrase is hashed with scrypt and stored by whichever backend you are using; the session is an httpOnly cookie the browser cannot read.

On a public host you must set `OPB_SETUP_TOKEN` to any long random string before
deploying. The claim form asks for it, which is what stops a stranger who finds
your URL first from taking ownership. `npm run dev` does not need it.

**If you forget your passphrase**, click **Forgot your passphrase?** on the
sign-in screen and enter your email. If SMTP is configured (see
[.env.example](.env.example) or `/admin/services`), a secure reset link is emailed to the owner's address —
it works once, expires after 30 minutes, and signs out every session the moment it's used.

Without SMTP configured there is no reset link: delete the owner record and
claim the site again — `.opb/state/owner.json` on the local backend, or the
`opb_owner` row on a database backend. Your content is untouched either way.

## 2. How editing works

1. Open a screen in `/admin`, make your edits, and click **Save changes**. The editor detects unsaved changes and keyboard shortcuts (`Cmd+S` / `Ctrl+S`).
2. Edits are saved to your **draft snapshot on the server**. Visitors continue to see the previously published version.
3. Click **Preview** in the top bar to see the draft rendered in an integrated panel or separate tab.
4. Click **Publish Live** when you are ready. The button checks contrast accessibility, describes what changed, and updates public pages immediately.

Version history at `/admin/history` keeps published snapshots, and you can restore any of them into your draft at any time.

---

## 3. Where content lives

Content lives in whichever backend you configured — the local filesystem, Supabase, Neon, PostgreSQL, Firebase, PocketBase, Appwrite, Cloudflare, or Convex.

- **Drafts and published content live on the server.** Editing from a phone or second computer accesses the same draft.
- **Published changes are live immediately** with automated cache revalidation.
- **Uploads go straight to the storage backend**, referenced as `/api/media/<key>`. Images are checked for valid byte headers; HTML masquerading as `.pdf` and executable files are rejected. JPEG photos automatically extract safe camera settings (EXIF), and average-colour loading gradients are generated.
- `/admin/settings` → **Export Content** downloads a `.json` backup of your content and uploaded assets. **Import Bundle** restores it. Standard **JSON Resume** export and import are also supported.

---

## 4. What's on each screen

| Screen                 | What it controls                                                                                                                   |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Dashboard              | Site health and setup checklist, linking directly to screens that need attention.                                                  |
| Analytics              | First-party enquiry stats plus privacy-first audience, top pages, and classified recruiter/job-board traffic from Umami/Plausible. |
| Pages & visual builder | Create custom pages at any slug, arrange 28 block types, use the layer outline drawer and quick slash-filter insertion.            |
| Writing                | Long-form posts, articles and notes with RSS feed and Markdown `.md` import.                                                       |
| Selected work          | Projects and case studies: headlines, deliverables, metrics, live URLs, and media.                                                 |
| Brands                 | Client logos and partner wordmarks with CSV import.                                                                                |
| Experience & Education | Timeline records with LinkedIn and standard CSV import aliases. Powers `/cv`.                                                      |
| Process steps          | Numbered sprint and methodology steps.                                                                                             |
| Capabilities           | Skill groups and tool proficiencies.                                                                                               |
| Recommendations        | Testimonials, displaying with schema.org `Review` structured data on public pages.                                                 |
| Visual explorations    | Image gallery assets and creative experiments.                                                                                     |
| Media library          | Asset manager with dimension inspection, opt-in camera EXIF badges, resume PDF assignment, and usage counts.                       |
| Messages               | Enquiries submitted through the contact form, with optional Discord/Slack webhooks and Web Push alerts.                            |
| Newsletter             | Subscriber capture with double opt-in, verification tokens, CSV export, and Listmonk integration.                                  |
| Navigation             | Header menu links and validation.                                                                                                  |
| Footer & social        | Copyright line, social cards, and recruiter contact links.                                                                         |
| Microcopy              | Site wording and button labels.                                                                                                    |
| Appearance             | Six theme presets, typography pairings, and contrast-checked design tokens.                                                        |
| SEO                    | Site-wide Open Graph titles, descriptions, share images, and sitemap settings.                                                     |
| Services               | Secrets vault for zero-redeploy configuration of SMTP, Turnstile spam protection, analytics, and comments.                         |
| General & backup       | Identity info, JSON Resume import/export, content backup bundles, and factory reset.                                               |
| Version history        | Published snapshots and one-click rollback.                                                                                        |
| Your site              | Public URL, `/cv` recruiter card, `/bio` link-in-bio hub, and custom domain instructions.                                          |

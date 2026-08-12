---
title: Moving in, and moving out
summary: Bringing an existing site across, and taking everything with you.
group: Moving in and moving out
order: 90
---

# Moving in, and moving out

## Moving in

There is no automatic import, and be wary of anyone who claims one. The reason is on the other side: Wix has no export at all, and Squarespace's leaves out exactly the portfolio and gallery pages you would want to bring.

So it is by hand. For a portfolio that is an evening rather than a project:

1. **Open your old site next to the admin.** Copy the text across page by page.
2. **Save the images from your old site**, then upload them to the media library. Right-click and save, or use whatever export your old host gives you — the images are usually the one thing you can get out.
3. **Do the work records first, then the pages.** Projects, case studies, clients and jobs go in their own screens; then a page block places them. Doing it the other way round means typing everything twice.
4. **Keep your old addresses if people link to them.** If your old site had `/portfolio/thing`, make the new page use the same address and nothing anybody bookmarked breaks.

Leave the old site up until the new one is on your domain and you are happy with it.

## Moving out

**General & backup → Export** hands you one JSON file with every word, every setting, every link and every reference to every image.

That file is the answer to "what if this project stops". It is plain text, it is documented, and you can read it in any text editor. It is not a proprietary format waiting for our software to open it.

Two things it does not contain, on purpose:

- **The image files themselves.** They are on your storage — download them from there, or from your own site.
- **Anything about sign-in.** Sessions and your passphrase never travel inside a content export. That is enforced by a test, so a leaked backup is not a leaked account.

## Taking the whole thing

Beyond the export: the code is MIT. You can fork it, change it, sell what you build with it, and keep running the version you have for as long as you like — whatever happens to this project. Nobody can withdraw that from a version already released.

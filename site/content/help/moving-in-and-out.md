---
title: Moving in, and moving out
summary: Bringing an existing site across, and taking everything with you.
group: Moving in and moving out
order: 90
---

# Moving in, and moving out

## Moving in

There is no one-click Wix or Squarespace importer, and be wary of anyone who claims one. The reason is on the other side: Wix has no export at all, and Squarespace's leaves out exactly the portfolio and gallery pages you would want to bring.

What you can bring are the files those tools, LinkedIn and your writing platform already give you:

- **CSV into the collection screens.** Projects, experience, education, recommendations and brands each have an **Import CSV** button and a downloadable template. The importer also accepts common LinkedIn and Google export column names, so a spreadsheet you already have often works without renaming anything.
- **Markdown into Writing.** On **Writing**, choose **Import Markdown** and pick `.md` files. Front matter supplies the title, date, summary, tags and web address; the body becomes text blocks. Everything arrives as a draft in the list, and nothing is saved until you press Save.
- **JSON Resume into General & backup.** Export your career data from LinkedIn or Reactive Resume as standard JSON Resume, then choose **Import resume.json**. It replaces the experience, education, skills and social links in your draft, so review the result before publishing. Exporting the same file is how you leave again.

The rest is by hand, and for a portfolio that is an evening rather than a project:

1. **Open your old site next to the admin.** Copy the text across page by page.
2. **Save the images from your old site**, then upload them to the media library. Right-click and save, or use whatever export your old host gives you - the images are usually the one thing you can get out.
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

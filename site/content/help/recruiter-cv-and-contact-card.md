---
title: A CV and a contact card for recruiters
summary: The printable CV, the QR card, the vCard download and standard JSON Resume import and export.
group: Editing your site
order: 35
---

# A CV and a contact card for recruiters

You do not fill in a second CV. The page at `/cv` is built from the experience, education and skills already on your site, hidden records left out.

## The CV page

Open `your-address/cv`. It is a plain, readable page with a **Print** button. **Save as PDF** in the browser's print dialog is the PDF export, so there is no second file to keep in step.

The QR card on that page opens your public address, which is what a recruiter needs on a phone. The **Save .VCF** button downloads your contact details as a vCard that Apple Contacts, Google Contacts and Outlook can open. The same download is always available at `/api/contact/vcard`.

The card carries your name, role, email, location, site address, the first paragraph of your About story, and your visible social links. Change any of those in the admin and the card changes with them.

## Standard JSON Resume

**General & backup** has two buttons for the [JSON Resume](https://jsonresume.org) format:

- **JSON Resume (.json)** downloads your current draft's basics, work, education, skills, projects and profiles as `resume.json`.
- **Import resume.json** reads a file exported from LinkedIn, Reactive Resume or another JSON Resume tool.

Importing replaces the experience, education, skills and social links in your **draft** — it does not merge two lists or change your theme, pages or writing. Look at the result, then publish when it is right. If it is wrong, leave the draft unpublished or restore the previous published version from **Version history**.

The same data is available to a signed-in owner at `/api/admin/resume`: `GET` exports, `POST` imports.

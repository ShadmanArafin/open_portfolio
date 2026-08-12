---
title: Your domain, and your email
summary: Pointing a domain at the site, and what does and does not break without email.
group: Your domain and your email
order: 60
---

# Your domain, and your email

## The domain

You buy a domain from a registrar — anyone; we do not sell them and take no cut — and point it at your host. Roughly £10–15 a year.

On the one-click route, your host's dashboard has a **Domains** panel that tells you exactly which two records to add at your registrar, then waits for them. It usually takes minutes and can take a day.

Nothing you have written is affected. Your old `.vercel.app` address keeps working.

## Email is optional, and that is a real choice

The site works with no email configured at all. What changes:

**Works either way**

- The contact form. Messages are stored on the server and appear in **Messages** in your admin.
- Everything about editing and publishing.

**Needs email**

- **Being told an enquiry arrived.** Without it, you have to open the admin to notice. If you check once a day that is fine. If you are advertising for work it is not.
- **Resetting a forgotten passphrase.** Without email there is no reset. Losing the passphrase means losing access, and the only way back is somebody with access to the database.
- **Newsletter sign-ups.** Confirming a sign-up means emailing somebody a link. Without a mail server the form tells visitors honestly that it is not working.

## Connecting one

**Services → Email.** You need a host, a port, a username and a password from your mail provider. Most providers publish these on a page called something like "SMTP settings".

Press **Test**. It tells you in plain words what is wrong — wrong password, wrong port, host not answering — rather than showing you an error code.

Two notes worth having:

- **Use a provider built for sending, not your personal mailbox.** Sending from a personal Gmail account through its SMTP tends to get throttled, and it puts your own account at risk if the form is abused.
- **The address it sends from should match a domain you control**, or the notifications will go to spam.

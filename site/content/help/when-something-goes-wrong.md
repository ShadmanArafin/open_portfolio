---
title: When something goes wrong
summary: The twelve things that actually go wrong, and what fixes each one.
group: When something goes wrong
order: 80
---

# When something goes wrong

In rough order of how often each one happens.

## I published, and the site has not changed

Give it a minute and reload without the cache — hold Shift and press reload. Pages are cached for a short window on purpose, so a hundred visitors do not each cost a database query.

If it is still wrong after a few minutes, check you were editing the draft you think you were: the top bar says **Published** or **Unpublished changes**.

## Signing in does nothing

The page reloads and you are back at the sign-in form, with no error.

Nearly always a cookie problem. Check that you are on `https://`, not `http://`. The session cookie is marked secure and a browser silently drops it over plain HTTP, so nothing appears to happen at all.

If you are running it locally over `http://localhost`, whoever set it up needs to say so in the configuration — the [developer docs](/docs/configuration) cover it.

## I have forgotten my passphrase

If email is connected: **Forgot your passphrase?** on the sign-in screen.

If it is not, there is no way back in from the browser. Somebody with access to the database can clear the owner record so the site can be claimed again. Your content is untouched by that.

## Publishing is refused because of colours

Not a fault. A palette that fails the contrast check is refused rather than published, because unreadable text is worse than an unpublished change. The message names the two colours. Darken the text or lighten the background until it passes.

## A block I added is not on the page

Two likely reasons, and the editor should have said so:

- It is **hidden**. Check the eye control.
- It is a block that shows your own records, and there are none to show. A "Your work" block with no published projects renders nothing rather than an empty heading.

## Nobody is telling me about enquiries

Messages are always in **Messages** in the admin. Being _emailed_ about them needs a mail server — **Services → Email**, then press **Test**. See [your domain and your email](/help/domain-and-email).

## An image will not upload

Check the size first; there is a cap, and it is generous. If it is a `.svg`, that is refused on purpose: an SVG can carry code, and one served from your own address could run against your own admin session.

## My newsletter form says it is not working

It needs two things: the newsletter switched on under **Newsletter**, and a mail server connected under **Services**. Confirming a sign-up means emailing somebody a link, so without mail the form tells visitors honestly rather than collecting addresses it can never confirm.

## The site was fine and now it is blank

Almost always a deploy that failed. Your host's dashboard has a deployments list; open the most recent one and read the log. Rolling back to the previous deployment restores the site immediately, and your content is not affected either way — it is in the database, not the deployment.

## Two of us edited at once and something was lost

The site detects this rather than silently overwriting: whoever saves second is told their copy is out of date. If you saw no warning and something still went missing, **Version history** keeps the last twenty published snapshots and any of them can be restored.

## Everything looks unstyled

A stylesheet failed to load. Reload without the cache. If it persists after a fresh deploy, it is a build problem — open an issue with the address.

## Something else

**Help & feedback** in your own admin. It searches what has already been reported before you write anything, tells you if it is already fixed in a newer version, and attaches your version and setup so nobody has to ask.

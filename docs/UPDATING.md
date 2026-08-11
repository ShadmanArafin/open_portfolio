# Updating your site

**Your writing, pictures and settings are never touched by an update.**

That is not a promise, it is how the thing is built: everything you create lives
in your database, and an update only changes code. There is no path from one to
the other. You could update ten times in a row and your site would look exactly
as you left it, with more things you can do.

---

## The short version

1. Open **Help & feedback** in your admin. It tells you if there is a newer version.
2. Go to the **Actions** tab of your copy on GitHub.
3. Choose **Check for updates** on the left, then press **Run workflow**.
4. Wait about a minute. A pull request appears called "Update to v0.6.0".
5. Press **Merge pull request**.

Your host redeploys on its own. That's it.

If you would rather not think about it, leave it alone — the same thing runs by
itself on the first of every month and opens the pull request for you.

---

## What actually happens

|                                        | Where it lives           | What an update does to it |
| -------------------------------------- | ------------------------ | ------------------------- |
| Pages, blocks, projects, text          | Your database            | Nothing                   |
| Pictures                               | Your file storage        | Nothing                   |
| Colours, fonts, layout                 | Your database            | Nothing                   |
| Contact messages                       | Your database            | Nothing                   |
| Your login                             | Your database            | Nothing                   |
| Connected services and their passwords | Your database, encrypted | Nothing                   |
| The code that runs all of it           | Your GitHub repository   | **This is what changes**  |

New database columns, when a release needs them, are created automatically the
first time the site loads afterwards. There is nothing to run and nothing to
migrate by hand.

---

## Why there is no "Sync fork" button

The Deploy button _copies_ this project into your GitHub account rather than
forking it, so GitHub has no idea the two are related and offers no sync button.

That is why the **Check for updates** workflow ships inside your copy. It knows
where the original lives, fetches the newest release, and opens a pull request.
It needs no password, no token and no setup from you.

---

## If the pull request says "needs a hand first"

That means you (or someone) edited a file that the update also changes, so
somebody has to decide which version wins. GitHub calls this a conflict.

**Nothing is broken and your site is still running.** The pull request is a
proposal; until you merge it, nothing has happened.

If you have never edited the code yourself, this is unexpected — please
[open an issue](https://github.com/ShadmanArafin/open_portfolio_builder/issues)
and paste in the list of files the pull request names.

---

## If you want to change the code

You can. It is MIT-licensed and it is your copy. But it is worth knowing the
trade first:

**Most things people want to change are not code.** Colours, fonts, spacing,
what is on each page, the order of everything, your navigation — all of that is
in the admin, stored in your database, and updates can never disturb it.

**If you do edit files**, put your changes in `themes/custom/` where nothing
upstream will ever touch them. Edit anything else and you are choosing to
resolve a conflict every time that file changes upstream — which is a perfectly
reasonable choice, as long as it is a choice.

---

## Rolling back

If a release causes a problem:

- **On Vercel or Netlify**, open your deployments, find the previous one and
  promote it. It takes seconds and your content is unaffected.
- **Then** please [tell us what went wrong](https://github.com/ShadmanArafin/open_portfolio_builder/issues)
  — the Help & feedback screen in your admin fills in most of the report for you.

One caveat, stated plainly: if a release added new database columns, rolling the
code back leaves those columns in place. They are ignored by the older version
and cause no harm. Content written using a feature that only exists in the newer
version is kept rather than deleted, and reappears when you update again.

---

## Skipping versions

You do not have to update one release at a time. Going from v0.4.0 straight to
v0.9.0 works — every migration is written to run forward from wherever you are.

# Feedback and updates without leaving the admin

**Status:** design options, awaiting a decision. Nothing here is built yet — what
is built today is the pre-filled-GitHub-URL version described at the end.

The requirement: *"they will not need to visit GitHub — they will do everything
from the admin."*

That is achievable for both halves, but the two halves have different costs and
one of them is a decision only the maintainer can make. This document lays out
what each option really involves so the choice is made with the trade visible.

---

## Part 1 — Submitting a bug report or feature request

### What is built today

The admin composes the report, checks for duplicates, attaches diagnostics, and
opens a **pre-filled GitHub issue page** in a new tab. The person presses
"Submit" there.

It has real advantages that are easy to lose by accident:

- No token to ask anyone for.
- No service for the maintainer to run, pay for, or defend from abuse.
- The issue is authored **by the reporter's own account**, so a thank-you in the
  release notes is automatically correct.
- GitHub's own spam and abuse handling applies, at no cost to us.

The cost is the one being objected to: it requires a GitHub account and one
click on a page that is not the admin.

### Option A — An intake service (true zero-GitHub)

A small serverless function the **maintainer** hosts. The admin posts the report
to it; it creates the issue using its own credentials.

```
Admin  ──POST──▶  feedback.<your-domain>  ──GitHub API──▶  Issue in your repo
                  (holds a GitHub App token)
```

**What it makes possible**

- The reporter needs no GitHub account and never leaves the admin.
- **Duplicate search works even while the repository is private**, because the
  service is authenticated. Today's search cannot see a private repo at all.
- The service can rate-limit, deduplicate and reject junk centrally, before
  anything reaches the issue tracker.

**What it costs**

- **You are now running a public write endpoint.** It will be found and it will
  be abused if the project gets any traction. It needs rate limiting per IP and
  per install, a bot challenge (Turnstile is free), content limits, and a kill
  switch. This is not optional and it is not one afternoon.
- **Attribution becomes self-reported.** The issue is created by a bot, so the
  reporter's name is whatever they typed. Shout-outs get less reliable, and
  impersonation becomes possible ("reported by Linus Torvalds").
- One more thing that can be down. Feedback stops silently when it is.

**The point that makes this acceptable:** this service is not on the critical
path of anybody's website. Every deployed portfolio keeps working perfectly if
it is down. Hosting it does not compromise the no-SaaS promise, because nobody's
site depends on it — only the feedback form does.

### Option B — GitHub device flow, one sign-in ever

The admin shows a code; the person signs in to GitHub once, on any device; the
admin stores the resulting token in the vault built in Phase 8 and files issues
**as them** from then on.

- No service to host, no secret to ship (device flow needs no client secret).
- Attribution is real and unforgeable.
- Every subsequent report is entirely in-admin.

The catch: that one sign-in is still a trip to github.com, which is the thing
being ruled out. It is once per install rather than once per report — but it is
not zero.

### Option C — Email

The report is sent through the site's own SMTP to an address you watch. Works
with no GitHub account at all, and needs nothing new built.

But there is no duplicate detection, no public thread others can add to, no
voting, and every report becomes manual work for you. It does not scale past a
few dozen users, and it is exactly the workflow open-source projects moved off.

### Recommendation

**Option A, with Option B offered to anyone who wants their name on it.**

It is the only one that meets the requirement as stated, and the private-repo
problem it solves is otherwise blocking. Build it with the abuse controls from
day one, not after the first incident.

Realistic scope: an endpoint, a GitHub App, Turnstile, two rate limits, a
denylist, and a way to turn it off. Then the admin's "Open it on GitHub" button
becomes "Send", and the tab never opens.

---

## Part 2 — Updating without visiting GitHub

This one has a cleaner answer, because the update can happen **without anybody
pressing anything at all**.

### The obstacle

Merging a pull request from inside the admin needs write access to the owner's
repository, which needs a token, which means going to GitHub to create one. The
requirement defeats itself.

### The way around it: let the workflow finish the job

The `update.yml` workflow already merges the newest release into a branch. When
that merge is **clean**, there is nothing for a human to decide — so it can
simply push to the default branch. The host redeploys on its own, and the owner
finds out from the admin afterwards:

> Updated to v0.6.0 on 3 September. Here is what changed.

Nobody visits anything. A conflict still opens a pull request, because a
conflict is a real decision — but a conflict only happens to people who edited
the code, and those people are on GitHub already.

### What has to be true for that to be safe

- **Only released tags**, never the tip of the main branch.
- **Only clean merges.** Any conflict stops and asks.
- **Only after the build passes** in the workflow, so a release that cannot
  compile never reaches anyone's site.
- **Rollback stays one click** on Vercel or Netlify, and the admin says so.
- **The owner can turn it off**, and can see that it is on.

### The honest problem with auto-update

Changing somebody's live website without asking is a serious thing to do by
default, however good the intentions. Two positions are defensible:

**Auto-update on by default** — the security argument. Most owners will never
press an update button, and an un-updated self-hosted app is how installations
end up compromised years later. WordPress moved to automatic updates for exactly
this reason, and it is widely considered the right call.

**Auto-update off by default** — the consent argument. It is their site. A
release with a visual regression appears on a client-facing page while they are
asleep, and they never agreed to that.

**A middle position worth considering:** automatic for patch releases
(`0.6.0 → 0.6.1`, fixes and security only), a pull request for minor and major
ones. It is the split npm and Dependabot already use, most owners never think
about it, and nothing that changes how the site looks lands without a human.

### Where the setting lives

An awkward detail worth naming: the workflow runs on GitHub and cannot read the
owner's database, so an admin toggle cannot reach it directly. Options:

1. **A repository variable** — the honest place for it, but setting it means
   visiting GitHub, which is what we are avoiding.
2. **The workflow asks the site.** The Action calls a public, unauthenticated,
   read-only endpoint on the owner's own site — `/api/update-policy` returning
   `{"auto": "patch"}` — and obeys it. The admin writes that setting to the
   database like any other. It leaks nothing: a stranger learns only the update
   policy of a site whose source code is public anyway.
3. **A default with no setting.** Patch-automatic, minor-by-PR, for everybody.

**Recommendation: option 2**, with the patch-automatic default. The toggle lives
where every other setting lives, the workflow reads it, and nobody has to visit
GitHub to change their mind.

---

## What this needs from you

| Decision | Options | Recommended |
|---|---|---|
| How reports are sent | Intake service / device flow / email | Intake service, with device flow offered |
| Who the issue is attributed to | Bot with self-reported name / the real account | Real account when connected, bot otherwise |
| Auto-update policy | All / patch-only / never | Patch-only by default |
| Where the policy is stored | Repo variable / read from the site / fixed | Read from the site |
| Making the repository public | Now / at launch | **Now — several things are blocked on it** |

The last row is not really a decision about this feature. While the repository
is private the Deploy button cannot clone it, releases cannot be listed, issue
links 404 for everyone but you, and the update workflow cannot fetch from it.
Everything in this document assumes it is public.

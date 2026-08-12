---
title: What this is not
summary: Scope, and the things it will not become.
group: Get started
order: 20
---

# What this is not

Second on the page, following Coolify's example. A project that only describes what it does leaves the reader to discover the boundary themselves, usually after committing to it.

## Not a hosted service

There is no company, no support desk, no status page and nobody on call. Somebody deploying this is taking on operating it.

## Not a CMS

It fails the test that matters for the category: after installing a headless CMS you do not have a website. After installing this you do. It ships the front end, and that is the point of it — being filed with Strapi, Directus and Payload would lose the only thing that distinguishes it.

The corollary: it is not a general content platform. The content model knows about projects, case studies, clients, jobs, testimonials and writing. It is not a schema builder and there is no plan for one.

## Not a page builder in the Webflow sense

Blocks compose from a closed set of primitives and a fixed frame vocabulary — width, spacing, surface, divider, alignment — all enums. There is no path from the UI to arbitrary CSS, and that is a design decision rather than an unfinished feature. The whole reason a non-designer gets a usable result is that the range of expressible things is bounded.

If somebody wants unbounded control, Framer and Webflow are better answers and we should say so.

## Not commerce

No shop, no bookings, no memberships, no subscriber-only content, no events, no courses. Staying narrow is what keeps setup from becoming a project.

## Not a mailing-list sender

Newsletter capture exists — double opt-in, hashed tokens, one-click unsubscribe, CSV export. Sending does not, and is not planned. Deliverability, bounce handling and list hygiene are a product; shipping half of one leaves somebody with a list they cannot lawfully or practically mail.

## Not multi-tenant

One owner, one site, one deployment. The data model does not prevent multi-tenancy later, but nothing today implements or tests it, and running one instance for several clients is not supported.

## Not zero-effort

Somebody has to press deploy, own a domain, and keep an eye on a host. It is a button and a purchase, and it is still two more decisions than signing up for something.

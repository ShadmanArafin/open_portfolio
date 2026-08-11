# Research

Why this project is built and positioned the way it is, with the evidence.

It is here rather than in a private document for the same reason the plan is:
somebody deciding whether to trust this project should be able to check the
claims, and somebody contributing should not have to guess which decisions were
reasoned and which were habit.

## The documents

|                                                | What it decides                                                                         |
| ---------------------------------------------- | --------------------------------------------------------------------------------------- |
| [MARKET-RESEARCH.md](MARKET-RESEARCH.md)       | Who we beat, who beats us, and what people actually complain about                      |
| [LANDING-PAGE.md](LANDING-PAGE.md)             | Positioning, the homepage section by section with real copy, the demo, comparison pages |
| [SEO-STRATEGY.md](SEO-STRATEGY.md)             | Which pages to build, in what order, and which are not worth attempting yet             |
| [MOBILE-AND-PWA.md](MOBILE-AND-PWA.md)         | What to build for phones, and two hazards that must not be got wrong                    |
| [GOING-PUBLIC.md](GOING-PUBLIC.md)             | The pre-publication audit, and the one thing on a clock                                 |
| [IN-ADMIN-COMMUNITY.md](IN-ADMIN-COMMUNITY.md) | How feedback and updates work without leaving the admin                                 |

The `_raw-*.md` files are the dossiers those were written from — roughly 1,500
sources, kept because a synthesis you cannot check is an opinion. They are
working material, not documentation: expect duplication and dead ends.

## How to read them

**Every factual claim carries a source URL and the date it was checked.**
Prices, free-tier limits and browser support move; a claim without a date is
worth nothing a year later.

**`UNVERIFIED` means unverified.** It is used deliberately and often. Anything
carrying it must not be repeated as fact, in copy or anywhere else.

## Things that are not true, and must not be repeated

These came up during the research and would each be repeated by anyone working
from memory:

- **Coroflot has not shut down.** Its site still resolves. The verified
  shutdown example is Read.cv, whose domains now return HTTP 402.
- **Dunked is not dead**, and there is no Format ownership change.
- **"X% of hiring managers look at your portfolio" does not exist.** Neither
  does "recruiters spend N seconds on a portfolio" — the well-known six-second
  figure is about résumés.
- **The Core Web Vitals comparison figures are from April 2024**, roughly two
  years stale, and we have not measured our own. No speed comparison should be
  published on either basis.
- **There are no review-site ratings in this research at all.** Trustpilot, G2
  and Capterra blocked every attempt, including a real browser. The complaint
  quotes come from venues where complaining is the point, which is evidence that
  the pains exist and is not a measurement of satisfaction.

## The finding that changed the argument

A permissive licence is a promise about the code you can see, not about how much
code you will be able to see. Cal.com went closed source in April 2026 and
relicensed the reduced public product from AGPL-3.0 to **MIT** — more permissive,
not less.

So "it's MIT, you're safe" is not an argument, and we should not make it. What
can be promised is structural: an export that is tested in CI, no feature held
back from the open version, and a deployment that runs somewhere we do not
control.

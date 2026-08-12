import type { ClaimKey } from './facts';

/**
 * One comparison page per incumbent, as data.
 *
 * The same six sections every time, in the same order, with the concessions in
 * a fixed slot rather than wherever they happen to fit. That structure is doing
 * work: a comparison page that only lists things we win is read as an
 * advertisement, and the audience for these pages is a designer who has already
 * used the other product and knows exactly what it does well.
 *
 * **The concession rule, stated once.** Every page names at least two things the
 * other product does better, specifically, with no hedging clause afterwards.
 * If we cannot find two, the page does not ship.
 */

export interface Alternative {
  slug: string;
  brand: string;
  /** Title tag. Brand vocabulary, because that is what is being searched. */
  title: string;
  description: string;
  /** The one-sentence answer, before any table. */
  verdict: string;
  /** Who should read no further and stay where they are. */
  stayIf: string[];
  /** Who should keep reading. */
  switchIf: string[];
  /** Sourced claims from `facts.ts`, rendered with their stamps. */
  claims: ClaimKey[];
  /** Comparison rows. `them` and `us` are plain sentences, never adjectives. */
  rows: { question: string; them: string; us: string }[];
  /** At least two, specific, unhedged. */
  betterThere: { title: string; detail: string }[];
}

export const ALTERNATIVES: Alternative[] = [
  {
    slug: 'adobe-portfolio',
    brand: 'Adobe Portfolio',
    title: 'An open-source alternative to Adobe Portfolio',
    description:
      'Adobe Portfolio needs a Creative Cloud subscription and takes the site offline 14 days after it lapses. A self-hosted, MIT-licensed alternative — with every claim sourced and dated.',
    verdict:
      'If you are already paying Adobe every month for other reasons, Portfolio is free with it and simpler than this. If Portfolio is the only reason you are paying, you are renting a website from a company that will take it down fourteen days after you stop.',
    stayIf: [
      'You already pay for Creative Cloud and use it for the work itself.',
      'You want to publish today and never think about hosting again.',
      'Your Behance profile is where your audience already is.',
    ],
    switchIf: [
      'Portfolio is the only part of the subscription you use.',
      'You want the site to survive you cancelling something.',
      'You want to export your content and there is currently no export at all.',
    ],
    claims: ['adobeGracePeriod', 'adobeCheapestRoute', 'adobeStillDeveloped'],
    rows: [
      {
        question: 'Cheapest way to publish',
        them: 'A paid Adobe subscription. Cheapest verified route is Behance Pro at US$11.49/month.',
        us: '$0. A free hosting tier, or a server you already own. A domain is yours to buy either way.',
      },
      {
        question: 'What happens when you stop paying',
        them: 'The site stays live for 14 days, then comes offline.',
        us: 'Nothing happens. There is nobody to stop paying.',
      },
      {
        question: 'Export',
        them: 'None.',
        us: 'One JSON file with every word, setting and link, from a button in the admin.',
      },
      {
        question: 'Sites per account',
        them: 'Up to 5 on Behance Pro.',
        us: 'Unlimited — one deployment each.',
      },
      {
        question: 'Custom domain',
        them: 'Included.',
        us: 'Included. You buy the domain from anyone; we take no cut.',
      },
      {
        question: 'Is it actively developed',
        them: 'No deprecation notice. Open community threads asking whether it has been abandoned.',
        us: 'Alpha, one person, every commit public. Judge it from the repository.',
      },
    ],
    betterThere: [
      {
        title: 'It is genuinely zero-setup',
        detail:
          'No deploy step, no host to choose, no domain decision on day one. You get a live page in about ten minutes and never think about infrastructure again. Ours needs a button press and a host, and that is two real decisions more.',
      },
      {
        title: 'Lightroom and Behance sync',
        detail:
          'Portfolio pulls albums straight from Lightroom and your Behance projects with no re-uploading. If your work already lives in Adobe, that is a workflow we do not have and are not going to build.',
      },
      {
        title: 'It is finished',
        detail:
          'Portfolio is a mature product that does what it does. This is version 0.5 and the admin still moves between releases.',
      },
    ],
  },
  {
    slug: 'squarespace',
    brand: 'Squarespace',
    title: 'An open-source, self-hosted alternative to Squarespace',
    description:
      'Squarespace has no free plan, and its export leaves out portfolio pages, galleries and styling. A free, self-hosted alternative for portfolios — every claim sourced and dated.',
    verdict:
      'Squarespace is a better product than this one and sells things this will never sell. It is also the one whose export leaves behind exactly the pages a creative would want to take with them.',
    stayIf: [
      'You need to sell something, take bookings, or run a mailing list from the same place.',
      'You want templates designed by people who do this full time.',
      'You want somebody to phone when it breaks.',
    ],
    switchIf: [
      'You are paying monthly for what is, in practice, five pages and a contact form.',
      'You want your content in a format you can read without their software.',
      'You would rather the site outlive the subscription.',
    ],
    claims: ['squarespacePartialExport', 'squarespaceNoFree'],
    rows: [
      {
        question: 'Free tier',
        them: 'None. Trial content is marked for permanent deletion when the trial expires.',
        us: 'The software is free. Hosting can be free too, with the caveats on the cost page.',
      },
      {
        question: 'Export',
        them: 'A partial export, omitting portfolio pages, gallery pages, style settings and custom CSS.',
        us: 'One JSON file with everything, at any time.',
      },
      {
        question: 'Commerce, bookings, email campaigns',
        them: 'All sold, all mature.',
        us: 'None of them, ever. Staying narrow is the design.',
      },
      {
        question: 'Design range',
        them: 'A large template library, professionally made, with real visual variety.',
        us: 'Six themes that change colour, type, spacing and radius. They do not rearrange the page.',
      },
      {
        question: 'Support',
        them: 'A support team.',
        us: 'One person, GitHub issues, no promised response time.',
      },
    ],
    betterThere: [
      {
        title: 'The templates are simply better',
        detail:
          'Squarespace employs designers to make them and it shows. Six token themes are not a template library, and if the design *is* the work you are being hired for, you will feel that on day one.',
      },
      {
        title: 'It is one bill and one login',
        detail:
          'Site, domain, email campaigns, scheduling and payments in one account with one company responsible. That is worth real money to somebody who does not want to be their own IT department.',
      },
      {
        title: 'Commerce that works',
        detail:
          'If you sell prints, sessions or products, Squarespace does it today and this never will.',
      },
    ],
  },
  {
    slug: 'wix',
    brand: 'Wix',
    title: 'An open-source, self-hosted alternative to Wix',
    description:
      'Wix says outright that your site must run on Wix’s servers. A free, self-hosted portfolio builder you keep — every claim sourced and dated.',
    verdict:
      'Wix will publish a site today with less effort than anything here. It also states in its own support article that there is no way to take that site anywhere else, ever.',
    stayIf: [
      'You want a site published in the next hour with no decisions.',
      'You need a shop, bookings or a restaurant menu in the same place.',
      'You will never want to move it.',
    ],
    switchIf: [
      'The sentence "your site must run on Wix’s servers" bothers you as much as it should.',
      'You are on the free tier and the advertising banner is on your portfolio.',
      'You want the content in a file you own.',
    ],
    claims: ['wixNoExport', 'wixFreeTier', 'wixPricing'],
    rows: [
      {
        question: 'Export',
        them: 'None. "Since Wix is a SaaS solution, your site must run on Wix’s servers."',
        us: 'One JSON file with everything, at any time.',
      },
      {
        question: 'Free tier',
        them: 'Publishes on a Wix subdomain with an advertising banner that scrolls with the visitor. No custom domain.',
        us: 'No banner, no subdomain requirement, no upsell. Free hosting tiers have their own catches, listed plainly.',
      },
      {
        question: 'Paid plans',
        them: 'Roughly $17 to $159 a month, billed annually.',
        us: 'Nothing to us. You pay a host and a registrar.',
      },
      {
        question: 'Editing model',
        them: 'Drag anything anywhere, absolutely positioned.',
        us: 'Stacked blocks with a fixed set of arrangements. Less freedom, and much harder to produce something broken on a phone.',
      },
      {
        question: 'Apps and extensions',
        them: 'A large marketplace.',
        us: 'None. A short list of services you can connect, and no plugin system.',
      },
    ],
    betterThere: [
      {
        title: 'Nothing beats it for time-to-published',
        detail:
          'Sign up, pick a template, type, publish. No host, no domain, no setup phrase. For somebody who needs a page this afternoon and does not care what happens in three years, that is the right answer.',
      },
      {
        title: 'The drag-anywhere editor is more expressive',
        detail:
          'You can put anything anywhere. Ours cannot, on purpose — but "on purpose" does not make it more capable, and a designer who wants a specific arrangement will hit our limit and not theirs.',
      },
      {
        title: 'The app marketplace is real',
        detail:
          'Bookings, chat, forms, shops, memberships. If you need one of those, it exists there and does not exist here.',
      },
    ],
  },
  {
    slug: 'framer',
    brand: 'Framer',
    title: 'An open-source, self-hosted alternative to Framer',
    description:
      'Framer is a design tool that publishes. A free, self-hosted portfolio builder with content in your own database — every claim sourced and dated.',
    verdict:
      'Framer is the strongest product in this comparison and the one we lose to most clearly on design. It is also a subscription, and the site stops being yours when it lapses.',
    stayIf: [
      'The visual design is the work. Framer gives you range this does not.',
      'You want interactions and motion beyond what a fixed set of blocks allows.',
      'You already think in a canvas rather than a stack of sections.',
    ],
    switchIf: [
      'You want the site to keep working with no subscription attached.',
      'You want the content in your own database rather than theirs.',
      'The page count on your plan has started to matter.',
    ],
    claims: ['framerPricing'],
    rows: [
      {
        question: 'Price',
        them: 'Free / $10 / $30 a month billed annually, at 30 / 30 / 150 pages.',
        us: 'Nothing to us. Hosting and a domain are yours.',
      },
      {
        question: 'Page limits',
        them: 'Yes, by plan.',
        us: 'None.',
      },
      {
        question: 'Design freedom',
        them: 'A real design tool. Effects, motion, breakpoints, components.',
        us: 'A fixed set of blocks and a small vocabulary of arrangements. Deliberately bounded.',
      },
      {
        question: 'Where the content lives',
        them: 'Framer’s.',
        us: 'A database you provisioned, on a host you chose.',
      },
      {
        question: 'Who can edit it',
        them: 'Anyone comfortable in a canvas editor.',
        us: 'Anyone who can fill in a form. That is the trade we made for the row above.',
      },
    ],
    betterThere: [
      {
        title: 'It is a far better design tool',
        detail:
          'Not close. Framer gives a designer control over layout, motion and interaction that a block system cannot express, and it publishes what you drew. If your portfolio is being judged on visual range, use Framer.',
      },
      {
        title: 'Motion and interaction',
        detail:
          'Scroll effects, transitions, component states. We have none of that and are not building a canvas.',
      },
      {
        title: 'It is finished, and it is fast',
        detail:
          'A mature editor with a large template ecosystem, versus version 0.5 built by one person.',
      },
    ],
  },
];

export function getAlternative(slug: string): Alternative | undefined {
  return ALTERNATIVES.find((entry) => entry.slug === slug);
}

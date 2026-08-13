import type { PageBlock } from './types';

/**
 * Seven invented people, one per profession the product ships a preset for.
 *
 * Everything here is fictional and stays fictional — invented names, invented
 * studios, invented clients. That is the same rule the product's own demo
 * content follows, and it exists because a marketing demo full of real company
 * names is a trademark problem and a demo full of real people is a privacy one.
 *
 * The point of having seven rather than one is the strongest complaint in the
 * market research: *every portfolio looks the same*. A visitor who only ever
 * sees the designer layout has no way to know the product renames its own
 * sections and changes its whole vocabulary for a photographer. So the demo
 * lets them switch, and the switch is the argument.
 *
 * The wording of the section labels is **not** duplicated here. It comes from
 * `PROFESSIONS` in the product, so a rename over there shows up in the demo
 * without anybody remembering to copy it across.
 */

export type PersonaId =
  'photographer' | 'designer' | 'developer' | 'writer' | 'academic' | 'student' | 'other';

export interface Persona {
  id: PersonaId;
  /** What the picker calls it. */
  label: string;
  /** The one-line explanation under the picker. */
  hint: string;
  name: string;
  role: string;
  location: string;
  email: string;
  /** The theme the product's own preset would suggest for this profession. */
  themeId: string;
  /** The home page, as blocks. Exactly the shape the product stores. */
  blocks: PageBlock[];
  projects: { title: string; category: string; summary: string; year: string }[];
  timeline: { role: string; org: string; period: string; note: string }[];
  clients: string[];
  skills: { group: string; items: string[] }[];
  writing: { title: string; summary: string; date: string }[];
  testimonial: { quote: string; who: string; role: string };
}

/** Shared shapes, so seven personas are content rather than seven layouts. */
const home = (over: {
  eyebrow: string;
  headline: string;
  subhead: string;
  cta: { label: string; href: string }[];
  aboutHeading: string;
  about: string[];
  stats: { value: string; label: string }[];
  faq: { question: string; answer: string }[];
  services: { title: string; price: string; description: string }[];
}): PageBlock[] => [
  {
    id: 'b-hero',
    type: 'hero',
    v: 1,
    frame: { spacing: 'loose' },
    props: {
      eyebrow: over.eyebrow,
      headline: over.headline,
      subhead: over.subhead,
      cta: over.cta,
    },
  },
  {
    id: 'b-work',
    type: 'collection',
    v: 1,
    frame: { surface: 'sunken' },
    props: { heading: '', source: 'projects', limit: 4, columns: 2 },
  },
  {
    id: 'b-split',
    type: 'split',
    v: 1,
    props: {
      heading: over.aboutHeading,
      paragraphs: over.about,
      media: { src: '', alt: '' },
      ratio: '4 / 3',
    },
  },
  {
    id: 'b-stats',
    type: 'stats',
    v: 1,
    frame: { surface: 'raised' },
    props: { heading: '', items: over.stats },
  },
  {
    id: 'b-logos',
    type: 'logoWall',
    v: 1,
    props: { heading: '', limit: 0 },
  },
  {
    id: 'b-services',
    type: 'services',
    v: 1,
    props: { heading: 'How we could work together', items: over.services },
  },
  {
    id: 'b-testimonials',
    type: 'testimonials',
    v: 1,
    frame: { surface: 'sunken' },
    props: { heading: '', limit: 2 },
  },
  {
    id: 'b-writing',
    type: 'writingList',
    v: 1,
    props: { limit: 3, showSummaries: true, moreLink: true },
  },
  {
    id: 'b-faq',
    type: 'faq',
    v: 1,
    frame: { width: 'narrow' },
    props: { heading: 'Questions', items: over.faq },
  },
  {
    id: 'b-contact',
    type: 'contactForm',
    v: 1,
    frame: { width: 'narrow', surface: 'raised' },
    props: {
      heading: 'Get in touch',
      submitLabel: 'Send',
      successMessage: 'Thank you — your message has arrived.',
      askProjectType: true,
      projectTypes: ['A new project', 'A collaboration', 'Something else'],
    },
  },
];

export const PERSONAS: Persona[] = [
  {
    id: 'photographer',
    label: 'Photographer',
    hint: 'Portfolio, Brands I’ve shot for, Journal',
    name: 'Mira Halloran',
    role: 'Photographer',
    location: 'Bristol',
    email: 'hello@mirahalloran.example',
    themeId: 'gallery',
    projects: [
      {
        title: 'Saltmarsh, in winter',
        category: 'Landscape',
        summary: 'Eleven mornings on the same estuary, waiting for the tide to do something.',
        year: '2026',
      },
      {
        title: 'The Ferrier Kitchen',
        category: 'Food & interiors',
        summary: 'A restaurant that opens at five and cooks over fire. Shot entirely in service.',
        year: '2025',
      },
      {
        title: 'Northgate Foundry',
        category: 'Industrial',
        summary: 'Four generations of casting, photographed on the last week before it closed.',
        year: '2025',
      },
      {
        title: 'Ida, at ninety',
        category: 'Portrait',
        summary: 'One afternoon, one window, one roll of film.',
        year: '2024',
      },
    ],
    timeline: [
      {
        role: 'Independent photographer',
        org: 'Bristol',
        period: '2019 — now',
        note: 'Editorial, food and interiors. Regular work for three magazines.',
      },
      {
        role: 'Second shooter',
        org: 'Wren & Fell',
        period: '2016 — 2019',
        note: 'Weddings and commercial. Learned to light a room in four minutes.',
      },
    ],
    clients: ['Ferrier', 'Saltmarsh Kitchen', 'Northgate', 'Bell & Roe', 'Quarterly Table'],
    skills: [
      { group: 'Shooting', items: ['Editorial', 'Food', 'Interiors', 'Portrait', 'Film'] },
      { group: 'After', items: ['Colour grading', 'Retouching', 'Print preparation'] },
    ],
    writing: [
      {
        title: 'Why I stopped bringing a second body',
        summary: 'One camera, one lens, and what changed about the pictures.',
        date: '2026-05-04',
      },
      {
        title: 'Lighting a kitchen that is already on fire',
        summary: 'Working in a live service without becoming a nuisance.',
        date: '2026-02-18',
      },
      {
        title: 'On being paid for the edit',
        summary: 'The half of the job that is invisible on an invoice.',
        date: '2025-11-02',
      },
    ],
    testimonial: {
      quote:
        'Mira spent two days in our kitchen and nobody noticed she was there. The pictures are the only ones we have that look like the actual restaurant.',
      who: 'Elin Ferrier',
      role: 'Ferrier',
    },
    blocks: home({
      eyebrow: 'Photographer · Bristol',
      headline: 'Pictures of places that are about to change.',
      subhead:
        'Editorial, food and interiors, mostly on film. I work slowly and I stay out of the way.',
      cta: [
        { label: 'See the portfolio', href: '/work' },
        { label: 'Get in touch', href: '/contact' },
      ],
      aboutHeading: 'About',
      about: [
        'I photograph rooms and the people in them, usually just before something about them changes — a restaurant before it is reviewed, a foundry in its last week.',
        'Most of it is film, because it makes me slower and slower is the whole point. I print everything myself.',
      ],
      stats: [
        { value: '7 yrs', label: 'Working independently' },
        { value: '40+', label: 'Commissions' },
        { value: '3', label: 'Magazines on retainer' },
      ],
      services: [
        {
          title: 'A day',
          price: 'From £850',
          description: 'One location, one story. Edited and delivered inside a week.',
        },
        {
          title: 'A campaign',
          price: 'From £3,200',
          description: 'Several days, art direction, and a set built for a season of use.',
        },
      ],
      faq: [
        {
          question: 'Do you shoot digital?',
          answer: 'Yes, when the job needs it. I will tell you which I think is right and why.',
        },
        {
          question: 'How long until I see the pictures?',
          answer: 'A first selection in three days, the finished edit within a week.',
        },
        {
          question: 'Do you travel?',
          answer: 'Regularly. Travel and accommodation on top of the day rate, at cost.',
        },
      ],
    }),
  },

  {
    id: 'designer',
    label: 'Designer',
    hint: 'Selected work, Case studies, Capabilities',
    name: 'Tomas Vey',
    role: 'Product Designer',
    location: 'Lisbon',
    email: 'hello@tomasvey.example',
    themeId: 'editorial',
    projects: [
      {
        title: 'Rebuilding onboarding at Larkfield',
        category: 'Product',
        summary: 'Twelve screens down to four, and a 31% drop in first-week support tickets.',
        year: '2026',
      },
      {
        title: 'A design system for a 40-person team',
        category: 'Systems',
        summary: 'Tokens, primitives and the governance that stopped it rotting after six months.',
        year: '2025',
      },
      {
        title: 'Meridian, end to end',
        category: 'Brand & product',
        summary: 'Identity, marketing site and the first version of the app, in eleven weeks.',
        year: '2025',
      },
      {
        title: 'Making a pricing page honest',
        category: 'Product',
        summary: 'What happened when we published the number everybody was emailing to ask for.',
        year: '2024',
      },
    ],
    timeline: [
      {
        role: 'Principal Designer',
        org: 'Larkfield',
        period: '2023 — now',
        note: 'Design across three product teams. Owner of the system.',
      },
      {
        role: 'Product Designer',
        org: 'Meridian',
        period: '2020 — 2023',
        note: 'Second designer. Everything from onboarding to billing.',
      },
    ],
    clients: ['Larkfield', 'Meridian', 'Cobalt Row', 'Thames & Pine', 'Ostro'],
    skills: [
      { group: 'Design', items: ['Product', 'Design systems', 'Prototyping', 'Research'] },
      { group: 'Enough code to be useful', items: ['React', 'CSS', 'Figma plugins'] },
    ],
    writing: [
      {
        title: 'Design systems rot at month six',
        summary: 'Not because of the components. Because nobody owns the decisions.',
        date: '2026-06-11',
      },
      {
        title: 'The pricing page is a design problem',
        summary: 'And usually the most valuable one nobody is allowed to touch.',
        date: '2026-03-22',
      },
      {
        title: 'Against the redesign',
        summary: 'Almost every redesign I have shipped should have been four fixes.',
        date: '2025-12-09',
      },
    ],
    testimonial: {
      quote:
        'Tomas found the four screens that were actually the problem and left the rest alone. That is much harder than a redesign and it worked.',
      who: 'Priya Raman',
      role: 'Head of Product, Larkfield',
    },
    blocks: home({
      eyebrow: 'Product Designer · Lisbon',
      headline: 'I make software people can finish using.',
      subhead:
        'Product design and design systems for teams that have grown past the point where one person can hold it all.',
      cta: [
        { label: 'See selected work', href: '/work' },
        { label: 'Get in touch', href: '/contact' },
      ],
      aboutHeading: 'About',
      about: [
        'I have spent six years on products where the interesting problem was never the visual one — it was that nobody could agree what the thing was for.',
        'I like the unglamorous half: the empty state, the error message, the pricing page nobody wants to own.',
      ],
      stats: [
        { value: '6 yrs', label: 'In product' },
        { value: '31%', label: 'Fewer support tickets' },
        { value: '40', label: 'People on the system' },
      ],
      services: [
        {
          title: 'A design review',
          price: '£1,200',
          description: 'Two days on your product and a written list of what to fix, in order.',
        },
        {
          title: 'Embedded, part time',
          price: 'From £4,000/mo',
          description: 'Two or three days a week inside your team for a quarter.',
        },
      ],
      faq: [
        {
          question: 'Do you do brand work?',
          answer: 'Sometimes, alongside product. I am not the right person for brand alone.',
        },
        {
          question: 'Can you work with our engineers directly?',
          answer: 'That is the only way I work well. I write enough code to be dangerous.',
        },
        {
          question: 'What is your notice?',
          answer: 'Usually three to four weeks. Ask anyway — it changes.',
        },
      ],
    }),
  },

  {
    id: 'developer',
    label: 'Developer',
    hint: 'Projects, Stack, Writing',
    name: 'Aria Beck',
    role: 'Backend Engineer',
    location: 'Kraków',
    email: 'hi@ariabeck.example',
    themeId: 'terminal',
    projects: [
      {
        title: 'Cutting a build from 34 to 4 minutes',
        category: 'Infrastructure',
        summary: 'Where the time actually went, and the three changes that got 88% of it back.',
        year: '2026',
      },
      {
        title: 'quaystore',
        category: 'Open source',
        summary: 'A small, boring, well-tested key-value store. 2,400 stars and no roadmap.',
        year: '2025',
      },
      {
        title: 'Migrating 400M rows without downtime',
        category: 'Data',
        summary: 'Dual writes, a backfill nobody noticed, and the rollback we never needed.',
        year: '2025',
      },
      {
        title: 'An API that is hard to misuse',
        category: 'Design',
        summary: 'Making the wrong call impossible to write, rather than documenting it.',
        year: '2024',
      },
    ],
    timeline: [
      {
        role: 'Staff Engineer',
        org: 'Halden',
        period: '2022 — now',
        note: 'Platform. Builds, data, and whatever is on fire.',
      },
      {
        role: 'Backend Engineer',
        org: 'Torvik',
        period: '2018 — 2022',
        note: 'Payments. Learned to be afraid of floating point.',
      },
    ],
    clients: ['Halden', 'Torvik', 'Quay', 'Northline', 'Beacon Labs'],
    skills: [
      { group: 'Mostly', items: ['Go', 'Postgres', 'Kubernetes', 'gRPC'] },
      { group: 'Also', items: ['TypeScript', 'Terraform', 'ClickHouse'] },
    ],
    writing: [
      {
        title: 'Your build is not slow, your cache is wrong',
        summary: 'Thirty minutes of profiling beat six months of complaining.',
        date: '2026-07-01',
      },
      {
        title: 'Boring software',
        summary: 'In praise of libraries that have not changed in four years.',
        date: '2026-04-15',
      },
      {
        title: 'The migration that took a weekend and eleven months',
        summary: 'The weekend was the easy part.',
        date: '2026-01-20',
      },
    ],
    testimonial: {
      quote:
        'Aria rewrote our build pipeline in a week and then wrote the document explaining it, which is the part everybody skips.',
      who: 'Jonas Feld',
      role: 'CTO, Halden',
    },
    blocks: home({
      eyebrow: 'Backend Engineer · Kraków',
      headline: 'I make slow systems fast and complicated ones boring.',
      subhead:
        'Platform and data work — builds, migrations, and the APIs underneath everything else.',
      cta: [
        { label: 'See projects', href: '/work' },
        { label: 'Get in touch', href: '/contact' },
      ],
      aboutHeading: 'About',
      about: [
        'Eight years on backends, most of them on the parts nobody demos: the build, the migration, the queue that has to not lose anything.',
        'I write about it, mostly so I stop making the same mistake twice.',
      ],
      stats: [
        { value: '34 → 4', label: 'Minutes, build time' },
        { value: '400M', label: 'Rows migrated, no downtime' },
        { value: '2.4k', label: 'Stars on quaystore' },
      ],
      services: [
        {
          title: 'A week of triage',
          price: '€5,000',
          description: 'One week inside your system, and a written plan for the next six months.',
        },
        {
          title: 'Contract, part time',
          price: 'From €700/day',
          description: 'Two days a week. Platform, data or whatever is actually blocking you.',
        },
      ],
      faq: [
        {
          question: 'Do you do frontend?',
          answer: 'Enough to be useful and not enough to be trusted with it alone.',
        },
        {
          question: 'Will you work through an agency?',
          answer: 'Yes, though it is usually cheaper for everybody if you do not.',
        },
        { question: 'Remote?', answer: 'Always. I will travel for a kickoff.' },
      ],
    }),
  },

  {
    id: 'writer',
    label: 'Writer',
    hint: 'Published work, Essays, Clients',
    name: 'Devi Okonkwo',
    role: 'Writer & Editor',
    location: 'Edinburgh',
    email: 'devi@okonkwo.example',
    themeId: 'warm',
    projects: [
      {
        title: 'The Quiet Year',
        category: 'Long form',
        summary: 'Eleven thousand words on a town that voted to stop growing. Quarterly Table.',
        year: '2026',
      },
      {
        title: 'Rewriting a bank',
        category: 'Editorial',
        summary: 'Every word a customer reads, from the app to the letters. Eight months.',
        year: '2025',
      },
      {
        title: 'Salt',
        category: 'Essays',
        summary: 'A collection about coastlines and leaving. Bell & Roe, 2025.',
        year: '2025',
      },
      {
        title: 'What the manual will not say',
        category: 'Long form',
        summary: 'On documentation, and who it is really written for.',
        year: '2024',
      },
    ],
    timeline: [
      {
        role: 'Freelance writer and editor',
        org: 'Edinburgh',
        period: '2020 — now',
        note: 'Long form, essays, and content design for people who need fewer words.',
      },
      {
        role: 'Staff writer',
        org: 'Quarterly Table',
        period: '2017 — 2020',
        note: 'Features. Four cover stories.',
      },
    ],
    clients: ['Quarterly Table', 'Bell & Roe', 'Northline', 'Ostro', 'Thames & Pine'],
    skills: [
      { group: 'Writing', items: ['Long form', 'Essays', 'Interviews', 'Content design'] },
      { group: 'Editing', items: ['Structural', 'Line', 'Style guides'] },
    ],
    writing: [
      {
        title: 'Nobody reads the second paragraph',
        summary: 'What that should change about the first one.',
        date: '2026-06-30',
      },
      {
        title: 'On cutting your best sentence',
        summary: 'It is almost always the one doing the least work.',
        date: '2026-03-08',
      },
      {
        title: 'Writing for people who are frightened',
        summary: 'Error messages, medical letters, and the register they need.',
        date: '2025-10-14',
      },
    ],
    testimonial: {
      quote:
        'Devi cut a third of our words and the thing got clearer and warmer at the same time. Our complaints about the letters stopped.',
      who: 'Ruth Ellery',
      role: 'Northline',
    },
    blocks: home({
      eyebrow: 'Writer & Editor · Edinburgh',
      headline: 'Fewer words, in a better order.',
      subhead:
        'Long-form journalism, essays, and the unglamorous work of making an organisation sound like a person.',
      cta: [
        { label: 'Read published work', href: '/work' },
        { label: 'Get in touch', href: '/contact' },
      ],
      aboutHeading: 'About',
      about: [
        'I write long pieces about places and the decisions people make in them, and I edit organisations that have accumulated too many words.',
        'The two are more similar than they sound. Both are mostly deciding what to leave out.',
      ],
      stats: [
        { value: '9 yrs', label: 'Writing professionally' },
        { value: '4', label: 'Cover stories' },
        { value: '1', label: 'Collection published' },
      ],
      services: [
        {
          title: 'A piece',
          price: 'From £1.20/word',
          description: 'Commissioned long form. Reported, written and revised with you.',
        },
        {
          title: 'An edit',
          price: 'From £600',
          description: 'Structural or line editing on something you have already written.',
        },
      ],
      faq: [
        {
          question: 'Do you ghostwrite?',
          answer: 'Yes, and I will not tell anybody. It is about a third of my work.',
        },
        {
          question: 'How far ahead are you booked?',
          answer: 'Usually six to eight weeks for long form, sooner for edits.',
        },
        {
          question: 'Will you write to a brief I have already written?',
          answer: 'Happily — though I will probably ask to change it once.',
        },
      ],
    }),
  },

  {
    id: 'academic',
    label: 'Researcher',
    hint: 'Publications, Teaching, Talks',
    name: 'Dr Yusuf Adeyemi',
    role: 'Researcher, Urban Systems',
    location: 'Delft',
    email: 'y.adeyemi@example.ac',
    themeId: 'minimal',
    projects: [
      {
        title: 'Cooling the dense city',
        category: 'Publication',
        summary: 'Nature Cities, 2026. Street-level temperature across 41 European districts.',
        year: '2026',
      },
      {
        title: 'Who walks, and when',
        category: 'Publication',
        summary: 'Six years of movement data and what it says about a fifteen-minute city.',
        year: '2025',
      },
      {
        title: 'The Delft Atlas',
        category: 'Open data',
        summary: 'An open dataset of 2.1M street segments, used in nineteen papers since.',
        year: '2024',
      },
      {
        title: 'Urban Systems 301',
        category: 'Teaching',
        summary: 'A course rebuilt around one question: who is this city not for?',
        year: '2024',
      },
    ],
    timeline: [
      {
        role: 'Assistant Professor',
        org: 'TU Delft',
        period: '2023 — now',
        note: 'Urban systems. Two doctoral students.',
      },
      {
        role: 'Postdoctoral Researcher',
        org: 'ETH Zürich',
        period: '2020 — 2023',
        note: 'Thermal comfort and street morphology.',
      },
    ],
    clients: ['TU Delft', 'ETH Zürich', 'Nature Cities', 'Urban Atlas', 'Northline'],
    skills: [
      { group: 'Research', items: ['Spatial analysis', 'Field measurement', 'Open data'] },
      { group: 'Tools', items: ['R', 'Python', 'PostGIS', 'QGIS'] },
    ],
    writing: [
      {
        title: 'The fifteen-minute city is a measurement problem',
        summary: 'Everybody agrees on the idea and nobody agrees on the number.',
        date: '2026-05-19',
      },
      {
        title: 'Why I publish the dataset first',
        summary: 'The paper is the smaller half of the contribution.',
        date: '2026-02-02',
      },
      {
        title: 'Teaching a subject that keeps changing',
        summary: 'What to do when the reading list is out of date by March.',
        date: '2025-09-11',
      },
    ],
    testimonial: {
      quote:
        'Yusuf published the atlas before the paper, which is not how any of this normally works, and nineteen groups have built on it since.',
      who: 'Prof. Lena Marsh',
      role: 'ETH Zürich',
    },
    blocks: home({
      eyebrow: 'Urban Systems · TU Delft',
      headline: 'How cities hold heat, and who that falls on.',
      subhead:
        'Research on street-level climate and movement, with the datasets published before the papers.',
      cta: [
        { label: 'See publications', href: '/work' },
        { label: 'Get in touch', href: '/contact' },
      ],
      aboutHeading: 'About',
      about: [
        'I measure things at street level — temperature, movement, shade — and argue about what the measurements mean for who a city is liveable for.',
        'Everything I collect is published openly, usually before the paper it was collected for.',
      ],
      stats: [
        { value: '23', label: 'Peer-reviewed papers' },
        { value: '2.1M', label: 'Street segments, open' },
        { value: '19', label: 'Papers using the atlas' },
      ],
      services: [
        {
          title: 'Collaboration',
          price: 'Open',
          description: 'Always interested in field measurement across more cities.',
        },
        {
          title: 'Talks and teaching',
          price: 'By arrangement',
          description: 'Lectures, workshops and doctoral supervision.',
        },
      ],
      faq: [
        {
          question: 'Is the data really open?',
          answer: 'CC BY. No registration and no request form.',
        },
        {
          question: 'Will you supervise?',
          answer: 'Two students at a time. Write with a paragraph on what you want to measure.',
        },
        {
          question: 'Do you consult?',
          answer: 'For public bodies, occasionally. Not for developers.',
        },
      ],
    }),
  },

  {
    id: 'student',
    label: 'Student',
    hint: 'Projects, Education, Skills',
    name: 'Noor Haddad',
    role: 'Interaction Design student',
    location: 'Manchester',
    email: 'noor.haddad@example.ac.uk',
    themeId: 'bold',
    projects: [
      {
        title: 'Bramble',
        category: 'Final project',
        summary: 'A foraging app that refuses to identify anything it is not sure about.',
        year: '2026',
      },
      {
        title: 'Twelve bus stops',
        category: 'Field study',
        summary: 'What people actually do while waiting, and what the timetable assumes.',
        year: '2025',
      },
      {
        title: 'A keyboard for one hand',
        category: 'Coursework',
        summary: 'Built after breaking my wrist. Kept using it afterwards.',
        year: '2025',
      },
      {
        title: 'Placement: Ostro',
        category: 'Internship',
        summary: 'Ten weeks on a design team. Shipped two things and learned to ask sooner.',
        year: '2025',
      },
    ],
    timeline: [
      {
        role: 'BA Interaction Design',
        org: 'Manchester',
        period: '2023 — 2026',
        note: 'First class projected. Dissertation on refusal in interfaces.',
      },
      {
        role: 'Design intern',
        org: 'Ostro',
        period: 'Summer 2025',
        note: 'Ten weeks. Research, prototypes, and one shipped feature.',
      },
    ],
    clients: ['Ostro', 'Manchester', 'Bramble', 'Quay', 'Beacon Labs'],
    skills: [
      { group: 'Design', items: ['Prototyping', 'Research', 'Figma', 'Motion'] },
      { group: 'Building', items: ['React', 'Swift', 'Arduino'] },
    ],
    writing: [
      {
        title: 'What I got wrong on my placement',
        summary: 'Mostly: waiting three days to ask a two-minute question.',
        date: '2026-04-28',
      },
      {
        title: 'Interfaces that say no',
        summary: 'My dissertation topic, in nine hundred words.',
        date: '2026-01-16',
      },
      {
        title: 'Building a keyboard with one hand',
        summary: 'Six weeks, four prototypes, one broken wrist.',
        date: '2025-08-30',
      },
    ],
    testimonial: {
      quote:
        'Noor asked the question the rest of us had been avoiding for a month, in the second week of a ten-week placement.',
      who: 'Sam Iredale',
      role: 'Design Lead, Ostro',
    },
    blocks: home({
      eyebrow: 'Interaction Design · Manchester',
      headline: 'Final year, looking for the first proper job.',
      subhead:
        'Interaction design, with a bias towards things that admit what they do not know. Available from June.',
      cta: [
        { label: 'See projects', href: '/work' },
        { label: 'Get in touch', href: '/contact' },
      ],
      aboutHeading: 'About',
      about: [
        'I am in my final year, and most of what I have made comes from being annoyed by something — a foraging app that guesses, a keyboard that assumed two hands.',
        'I am looking for a junior role somewhere that will let me sit near the research.',
      ],
      stats: [
        { value: 'June', label: 'Available from' },
        { value: '10 wks', label: 'Placement at Ostro' },
        { value: '4', label: 'Projects worth showing' },
      ],
      services: [
        {
          title: 'Junior roles',
          price: 'Available June',
          description: 'Full time, UK or remote. Happy to start on research or support work.',
        },
        {
          title: 'Freelance, small',
          price: 'From £180/day',
          description: 'While I finish. Prototypes, research support, small builds.',
        },
      ],
      faq: [
        { question: 'Are you available now?', answer: 'From June, full time. Freelance before.' },
        {
          question: 'Will you relocate?',
          answer: 'Yes, within the UK. Happy with hybrid or remote.',
        },
        {
          question: 'Can I see your dissertation?',
          answer: 'Ask and I will send it. It is about interfaces that refuse.',
        },
      ],
    }),
  },

  {
    id: 'other',
    label: 'Something else',
    hint: 'The plain vocabulary, for everyone else',
    name: 'Rowan Ellis',
    role: 'Maker',
    location: 'Galway',
    email: 'rowan@rowanellis.example',
    themeId: 'editorial',
    projects: [
      {
        title: 'Chairs, sixteen of them',
        category: 'Furniture',
        summary: 'One design, sixteen times, until it stopped being awkward to sit in.',
        year: '2026',
      },
      {
        title: 'The long bench',
        category: 'Commission',
        summary: 'Four metres of ash for a school hall. Made to be climbed on.',
        year: '2025',
      },
      {
        title: 'Repair, not replace',
        category: 'Workshop',
        summary: 'A monthly session fixing furniture people were about to throw out.',
        year: '2025',
      },
      {
        title: 'Small things',
        category: 'Objects',
        summary: 'Spoons, boxes, handles. The offcuts, mostly.',
        year: '2024',
      },
    ],
    timeline: [
      {
        role: 'Independent maker',
        org: 'Galway',
        period: '2021 — now',
        note: 'Furniture and commissions. One-person workshop.',
      },
      {
        role: 'Cabinetmaker',
        org: 'Thames & Pine',
        period: '2016 — 2021',
        note: 'Bench joinery and fitted work.',
      },
    ],
    clients: ['Thames & Pine', 'Bell & Roe', 'Quay', 'Ostro', 'Northline'],
    skills: [
      { group: 'Making', items: ['Furniture', 'Bench joinery', 'Turning', 'Finishing'] },
      { group: 'Around it', items: ['Drawing', 'Commissions', 'Teaching'] },
    ],
    writing: [
      {
        title: 'Sixteen chairs',
        summary: 'What changed between the first and the last.',
        date: '2026-06-02',
      },
      {
        title: 'The repair session',
        summary: 'What people bring, and what it turns out they actually want.',
        date: '2026-02-24',
      },
      {
        title: 'On working alone',
        summary: 'Five years in. The quiet is the good part and the hard part.',
        date: '2025-09-01',
      },
    ],
    testimonial: {
      quote:
        'Rowan made a bench four hundred children have now climbed on. Four years later it does not wobble.',
      who: 'Aoife Nolan',
      role: 'Galway',
    },
    blocks: home({
      eyebrow: 'Maker · Galway',
      headline: 'Furniture made once, properly.',
      subhead: 'A one-person workshop. Commissions, repairs, and a monthly session fixing things.',
      cta: [
        { label: 'See the work', href: '/work' },
        { label: 'Get in touch', href: '/contact' },
      ],
      aboutHeading: 'About',
      about: [
        'I make furniture, mostly to commission and mostly in ash and oak, in a workshop with one bench and no employees.',
        'Once a month I open the door and fix whatever people bring, which is the best day of the month.',
      ],
      stats: [
        { value: '5 yrs', label: 'On my own' },
        { value: '60+', label: 'Commissions' },
        { value: '1', label: 'Bench, four metres' },
      ],
      services: [
        {
          title: 'A commission',
          price: 'From €900',
          description: 'Drawn, made and delivered. Usually eight to twelve weeks.',
        },
        {
          title: 'Repair',
          price: 'From €40',
          description: 'Bring it to the monthly session, or send a photograph first.',
        },
      ],
      faq: [
        { question: 'How long is the wait?', answer: 'Eight to twelve weeks, longer before June.' },
        { question: 'Will you ship?', answer: 'Within Ireland and the UK. Elsewhere, ask.' },
        {
          question: 'Do you teach?',
          answer: 'At the repair session, informally. No courses yet.',
        },
      ],
    }),
  },
];

export function getPersona(id: PersonaId): Persona {
  return PERSONAS.find((persona) => persona.id === id) ?? PERSONAS[0];
}

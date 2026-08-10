export interface DesignPrinciple {
  number: string;
  title: string;
  description: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  period: string;
  description: string;
  highlights: string[];
}

export interface GalleryMedia {
  id: string;
  type: 'image' | 'video';
  src: string;
  alt: string;
  title: string;
  caption: string;
  category: string;
  aspectClass: string; // Pinterest staggered aspect ratio class (e.g., aspect-[3/4], aspect-[4/5], aspect-square, aspect-video)
}

/** Demo about-page content. Replace from /admin/settings and /admin/artifacts. */
export const ABOUT_DATA = {
  sectionLabel: 'ABOUT',
  heroStatement: 'I care about making complex things feel simple.',
  headlineStatement: 'I turn complicated problems into clear, useful work.',
  introParagraphs: [
    'This is placeholder text. Write your own introduction from the admin — say who you are, what you do, and who you do it for.',
    'Two or three short paragraphs is usually enough. People skim this section; the work below it is what convinces them.',
    'Nothing here needs code. Sign in at /admin, edit, and publish.',
  ],
  philosophyStatement: 'Good work should feel obvious in hindsight.',
  philosophyParagraphs: [
    'Use this space for how you think about your craft — the principles behind the decisions rather than a list of tools.',
    'Keep it specific. Generic statements about passion and pixel-perfection are the fastest way to sound like everyone else.',
  ],
  outsidePixels:
    "And a line about what you do when you're not working. It makes the page feel like a person wrote it.",
  principlesHeader: 'HOW I THINK',
  principles: [
    {
      number: '01',
      title: 'UNDERSTAND BEFORE BUILDING',
      description:
        'Good solutions start with understanding the real problem — not jumping straight to a solution.',
    },
    {
      number: '02',
      title: 'SIMPLIFY WITHOUT LOSING DEPTH',
      description:
        'Remove unnecessary complexity while keeping the result useful, flexible and complete.',
    },
    {
      number: '03',
      title: 'THINK IN SYSTEMS',
      description:
        'Look past the individual piece and consider how patterns and decisions scale across the whole.',
    },
  ],
  educationHeader: 'EDUCATIONAL BACKGROUND',
  education: [
    {
      id: 'edu-01',
      degree: 'BSc in Computer Science',
      institution: 'Example University',
      period: 'IN PROGRESS',
      description: 'Placeholder description — replace with your own from the admin.',
      highlights: ['Computer science fundamentals', 'Human–computer interaction'],
    },
    {
      id: 'edu-02',
      degree: 'Diploma in Interaction Design',
      institution: 'Example Institute of Technology',
      period: 'JUN 2023',
      description: 'Placeholder description — replace with your own from the admin.',
      highlights: ['Graduated: June 2023', 'Interface and systems foundations'],
    },
  ],
  galleryHeader: 'SELECTED EXPLORATIONS',
  gallerySubheader: 'A visual collection of work in progress, explorations and finished pieces.',
  gallery: [
    {
      id: 'pin-01',
      type: 'image',
      src: '/demo/shots/dashboard.svg',
      alt: 'Abstract dashboard interface mockup',
      title: 'Dashboard & Data Density',
      caption: 'Placeholder caption — describe what this piece shows and why it mattered.',
      category: 'Interfaces',
      aspectClass: 'aspect-[4/5]',
    },
    {
      id: 'pin-02',
      type: 'image',
      src: '/demo/shots/editorial.svg',
      alt: 'Abstract editorial layout mockup',
      title: 'Editorial Layout & Typography',
      caption: 'Placeholder caption — describe what this piece shows and why it mattered.',
      category: 'Layout',
      aspectClass: 'aspect-[3/4]',
    },
    {
      id: 'pin-03',
      type: 'image',
      src: '/demo/shots/grid.svg',
      alt: 'Abstract image grid mockup',
      title: 'Grid & Composition Study',
      caption: 'Placeholder caption — describe what this piece shows and why it mattered.',
      category: 'Systems',
      aspectClass: 'aspect-video',
    },
    {
      id: 'pin-04',
      type: 'image',
      src: '/demo/shots/mobile.svg',
      alt: 'Abstract mobile app screens mockup',
      title: 'Mobile Flow Prototyping',
      caption: 'Placeholder caption — describe what this piece shows and why it mattered.',
      category: 'Mobile',
      aspectClass: 'aspect-square',
    },
  ] as GalleryMedia[],
};

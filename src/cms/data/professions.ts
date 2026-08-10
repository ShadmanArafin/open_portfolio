/**
 * Profession vocabulary packs.
 *
 * The whole information architecture was built for a designer: "Selected work",
 * "Case studies", "Visual explorations". A photographer, a developer and a
 * student all need the same underlying structure and completely different
 * nouns for it.
 *
 * These change wording only — never structure. That matters: switching packs
 * has to be safe at any point, and it is only safe if nothing a user has
 * written can be moved or dropped by it. The full preset system (different
 * section arrangements and demo content per profession) builds on top of this.
 */

export type ProfessionId =
  'designer' | 'developer' | 'photographer' | 'writer' | 'student' | 'other';

export interface ProfessionPack {
  id: ProfessionId;
  name: string;
  /** One-line hint shown under the name, so the choice is concrete. */
  example: string;
  /** Section id -> the label shown in navigation and section headers. */
  sectionLabels: Record<string, string>;
  /** Microcopy overrides, keyed exactly as in MicrocopySettings. */
  microcopy: Record<string, string>;
}

export const PROFESSIONS: ProfessionPack[] = [
  {
    id: 'designer',
    name: 'Design',
    example: 'Product, UI, brand',
    sectionLabels: {
      work: 'Selected work',
      'case-studies': 'Case studies',
      capabilities: 'Capabilities',
      brands: 'Clients',
    },
    microcopy: {
      selectedBrandsTitle: "SELECTED CLIENTS I'VE WORKED WITH",
      visualExplorationsTitle: 'VISUAL EXPLORATIONS',
      readCaseStudy: 'READ CASE STUDY',
    },
  },
  {
    id: 'developer',
    name: 'Software',
    example: 'Apps, systems, open source',
    sectionLabels: {
      work: 'Projects',
      'case-studies': 'Deep dives',
      capabilities: 'Stack',
      brands: 'Tools & platforms',
    },
    microcopy: {
      selectedBrandsTitle: 'TOOLS AND PLATFORMS I WORK WITH',
      visualExplorationsTitle: 'EXPERIMENTS',
      readCaseStudy: 'READ THE WRITE-UP',
      viewAllProjects: 'VIEW ALL PROJECTS',
    },
  },
  {
    id: 'photographer',
    name: 'Photography',
    example: 'Shoots, series, film',
    sectionLabels: {
      work: 'Portfolio',
      'case-studies': 'Behind the shoot',
      capabilities: 'Equipment & skills',
      brands: 'Brands shot',
    },
    microcopy: {
      selectedBrandsTitle: "BRANDS I'VE SHOT FOR",
      visualExplorationsTitle: 'SELECTED FRAMES',
      readCaseStudy: 'BEHIND THE SHOOT',
      viewAllProjects: 'VIEW THE FULL PORTFOLIO',
    },
  },
  {
    id: 'writer',
    name: 'Writing',
    example: 'Essays, journalism, copy',
    sectionLabels: {
      work: 'Published work',
      'case-studies': 'Long reads',
      capabilities: 'Areas I cover',
      brands: 'Publications',
    },
    microcopy: {
      selectedBrandsTitle: "PUBLICATIONS I'VE WRITTEN FOR",
      visualExplorationsTitle: 'NOTES',
      readCaseStudy: 'READ IN FULL',
      viewAllProjects: 'VIEW ALL WRITING',
    },
  },
  {
    id: 'student',
    name: 'Student',
    example: 'Coursework, first roles',
    sectionLabels: {
      work: 'Projects',
      'case-studies': 'Coursework',
      capabilities: 'Skills',
      brands: 'Institutions',
    },
    microcopy: {
      selectedBrandsTitle: 'WHERE I HAVE STUDIED AND WORKED',
      visualExplorationsTitle: 'WORK IN PROGRESS',
      readCaseStudy: 'SEE THE PROJECT',
      viewAllProjects: 'VIEW ALL PROJECTS',
    },
  },
  {
    id: 'other',
    name: 'Something else',
    example: 'Neutral wording',
    sectionLabels: {
      work: 'Selected work',
      'case-studies': 'In depth',
      capabilities: 'What I do',
      brands: 'Worked with',
    },
    microcopy: {
      selectedBrandsTitle: "WHO I'VE WORKED WITH",
      visualExplorationsTitle: 'SELECTED WORK',
      readCaseStudy: 'READ MORE',
    },
  },
];

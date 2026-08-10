export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  companyUrl: string;
  period: string;
  location: string;
  description: string;
  highlights: string[];
}

/** Demo work history. Replace from /admin/experience. */
export const EXPERIENCES: ExperienceItem[] = [
  {
    id: 'exp-01',
    role: 'Product Designer',
    company: 'Northwind',
    companyUrl: 'https://example.com',
    period: 'Jan 2024 — Present',
    location: 'Remote',
    description:
      'Working across a commerce platform and an internal admin suite, covering research, interface architecture, design systems and developer handoff.',
    highlights: [
      'Product flows and wireframes',
      'A component library used by three teams',
      'Responsive web and mobile interfaces',
      'Usability testing and iteration',
      'Close collaboration with engineering',
    ],
  },
  {
    id: 'exp-02',
    role: 'Interface Designer',
    company: 'Contoso',
    companyUrl: 'https://example.com',
    period: 'Mar 2022 — Dec 2023',
    location: 'Remote',
    description:
      'Improved interface consistency and visual hierarchy across a growing product suite, and introduced reusable patterns that cut design time on new screens.',
    highlights: [
      'Responsive web and mobile UI',
      'Visual hierarchy and layout systems',
      'Reusable pattern library',
      'Prototyping and handoff',
    ],
  },
];

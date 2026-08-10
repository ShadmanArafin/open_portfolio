export interface CapabilityGroup {
  number: string;
  category: string;
  items: string[];
}

export const CAPABILITIES_HEADER = {
  sectionLabel: 'CAPABILITIES',
  heading: 'What I bring to a project.',
  supportingCopy:
    'Placeholder copy. List what you actually do, grouped so someone can scan it in a few seconds. Edit these groups from /admin/capabilities.',
};

/** Demo capability groups. Rename the groups to match your own field. */
export const CAPABILITIES_DATA: CapabilityGroup[] = [
  {
    number: '01',
    category: 'STRATEGY & RESEARCH',
    items: [
      'Problem framing',
      'User research',
      'Information architecture',
      'Competitive analysis',
      'Requirements',
      'Prioritisation',
    ],
  },
  {
    number: '02',
    category: 'DESIGN & CRAFT',
    items: [
      'Interface design',
      'Interaction design',
      'Responsive layout',
      'Design systems',
      'Prototyping',
      'Accessibility',
    ],
  },
  {
    number: '03',
    category: 'DELIVERY',
    items: [
      'Web applications',
      'Mobile applications',
      'Dashboards',
      'Marketing sites',
      'Documentation',
      'Developer handoff',
    ],
  },
  {
    number: '04',
    category: 'TOOLS & WORKFLOW',
    items: [
      'Figma',
      'Version control',
      'Component libraries',
      'Design tokens',
      'Usability testing',
      'Async collaboration',
    ],
  },
];

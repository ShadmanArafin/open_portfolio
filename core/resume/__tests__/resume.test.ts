import { describe, expect, it } from 'vitest';
import { generateVCard } from '../vcard';
import { exportToJsonResume, importFromJsonResume } from '../json-resume';
import { encodeQrMatrix, generateQrSvg } from '../qr';
import type { CMSState } from '@/cms/types/cms';

const mockState: CMSState = {
  status: 'published',
  lastSavedAt: '2026-10-27T12:00:00Z',
  lastPublishedAt: '2026-10-27T12:00:00Z',
  settings: {
    fullName: 'Ada Lovelace',
    role: 'Computing Pioneer',
    location: 'London, UK',
    email: 'ada@example.com',
    whatsappNumber: '',
    whatsappFormatted: '',
    whatsappUrl: '',
    avatarPath: '/avatar.jpg',
    portraitPath: '/portrait.jpg',
    resumeUrl: '',
    resumeFilename: 'resume.pdf',
    availabilityStatus: 'Available',
    availableDotEnabled: true,
    copyrightText: '© 2026 Ada Lovelace',
    timezone: 'Europe/London',
    siteUrl: 'https://adalovelace.test',
    aboutStoryParagraphs: ['Pioneered algorithmic computing and analytical engine programs.'],
  },
  microcopy: {} as unknown as CMSState['microcopy'],
  appearance: {} as unknown as CMSState['appearance'],
  seo: {} as unknown as CMSState['seo'],
  sections: [],
  projects: [
    {
      id: 'proj_1',
      slug: 'analytical-engine',
      number: '01',
      title: 'Analytical Engine Algorithms',
      name: 'Analytical Engine',
      company: 'Babbage Labs',
      category: 'Computing',
      year: '1843',
      shortDescription: 'The world first published computer algorithm.',
      description: ['Created the Bernoulli numbers algorithm.'],
      heroHeadline: 'First Computer Algorithm',
      role: 'Lead Mathematician',
      deliverables: ['Bernoulli Sequence', 'Program Diagram'],
      industry: 'Science',
      timeline: '1842 - 1843',
      platform: 'Mechanical Engine',
      liveUrl: 'https://example.com/algorithm',
      featured: true,
      sortOrder: 1,
      status: 'published',
      visualPlaceholder: '',
      images: [],
      overview: [],
      challenge: '',
      approachSteps: [],
      keyScreensCount: 0,
      outcomeNote: '',
    },
  ],
  caseStudies: [],
  brands: [],
  experience: [
    {
      id: 'exp_1',
      period: '1842 — 1843',
      startDate: '1842-01-01',
      endDate: '1843-12-31',
      type: 'Full-time',
      role: 'Mathematician',
      company: 'Analytical Institute',
      current: false,
      summary: 'Translated Menabrea memoir and appended algorithmic notes.',
      highlights: ['Wrote Note G algorithm', 'Formulated symbolic logic'],
      sortOrder: 1,
      visible: true,
    },
  ],
  education: [
    {
      id: 'edu_1',
      number: '01',
      yearLabel: '1835',
      degree: 'Mathematics and Logic',
      institution: 'University of London Tutelage',
      status: 'Graduated',
      sortOrder: 1,
      visible: true,
    },
  ],
  processSteps: [],
  capabilityGroups: [
    {
      id: 'cap_1',
      number: '01',
      title: 'Mathematics',
      description: 'Core capabilities',
      capabilities: ['Calculus', 'Symbolic Logic', 'Algorithmic Notation'],
      sortOrder: 1,
      visible: true,
    },
  ],
  recommendations: [],
  artifacts: [],
  socialLinks: [
    {
      id: 'soc_1',
      label: 'GitHub',
      name: 'adalovelace',
      url: 'https://github.com/adalovelace',
      iconType: 'github',
      visible: true,
      sortOrder: 1,
    },
  ],
  navLinks: [],
  media: [],
  messages: [],
  versions: [],
  activityLogs: [],
};

describe('vCard 4.0 Generator (RFC 6350)', () => {
  it('generates compliant vCard with formatted name, title and contact info', () => {
    const vcard = generateVCard({
      settings: mockState.settings,
      socialLinks: mockState.socialLinks,
      siteUrl: 'https://adalovelace.test',
    });

    expect(vcard).toContain('BEGIN:VCARD');
    expect(vcard).toContain('VERSION:4.0');
    expect(vcard).toContain('FN:Ada Lovelace');
    expect(vcard).toContain('N:Lovelace;Ada;;;');
    expect(vcard).toContain('TITLE:Computing Pioneer');
    expect(vcard).toContain('EMAIL;TYPE=work:ada@example.com');
    expect(vcard).toContain('URL:https://adalovelace.test');
    expect(vcard).toContain('URL;TYPE=GitHub:https://github.com/adalovelace');
    expect(vcard).toContain('END:VCARD');
    expect(vcard).toContain('\r\n');
  });

  it('escapes special characters properly', () => {
    const vcard = generateVCard({
      settings: {
        fullName: 'Smith, Jr.; Dr.',
        role: 'Specialist, R&D; Tech',
      },
    });

    expect(vcard).toContain('FN:Smith\\, Jr.\\; Dr.');
  });
});

describe('JSON Resume Standard (schema.jsonresume.org)', () => {
  it('exports CMSState to JSON Resume 1.0 format', () => {
    const jsonResume = exportToJsonResume(mockState);

    expect(jsonResume.$schema).toContain('resume-schema');
    expect(jsonResume.basics?.name).toBe('Ada Lovelace');
    expect(jsonResume.basics?.label).toBe('Computing Pioneer');
    expect(jsonResume.basics?.email).toBe('ada@example.com');
    expect(jsonResume.work?.[0].name).toBe('Analytical Institute');
    expect(jsonResume.work?.[0].position).toBe('Mathematician');
    expect(jsonResume.work?.[0].highlights).toContain('Wrote Note G algorithm');
    expect(jsonResume.education?.[0].institution).toBe('University of London Tutelage');
    expect(jsonResume.skills?.[0].name).toBe('Mathematics');
    expect(jsonResume.skills?.[0].keywords).toContain('Calculus');
    expect(jsonResume.projects?.[0].name).toBe('Analytical Engine Algorithms');
  });

  it('imports JSON Resume data into existing CMSState without dropping configuration', () => {
    const incoming = {
      basics: {
        name: 'Grace Hopper',
        label: 'Rear Admiral & Compiler Inventor',
        email: 'grace@navy.mil',
        location: { city: 'New York', countryCode: 'US' },
        summary: 'Pioneered machine-independent programming languages and FLOW-MATIC.',
        profiles: [
          { network: 'GitHub', username: 'gracehopper', url: 'https://github.com/gracehopper' },
        ],
      },
      work: [
        {
          name: 'UNIVAC',
          position: 'Director of Automatic Programming',
          startDate: '1949-01-01',
          endDate: '1967-01-01',
          summary: 'Developed the A-0 compiler system.',
          highlights: ['Created COBOL compiler', 'Found first computer bug'],
        },
      ],
      education: [
        {
          institution: 'Yale University',
          studyType: 'Ph.D.',
          area: 'Mathematics',
          endDate: '1934',
        },
      ],
      skills: [
        {
          name: 'Compilers',
          level: 'Master',
          keywords: ['Compilers', 'Linkers', 'COBOL'],
        },
      ],
    };

    const updated = importFromJsonResume(incoming, mockState);

    expect(updated.settings.fullName).toBe('Grace Hopper');
    expect(updated.settings.role).toBe('Rear Admiral & Compiler Inventor');
    expect(updated.settings.email).toBe('grace@navy.mil');
    expect(updated.settings.location).toContain('New York');
    expect(updated.experience[0].company).toBe('UNIVAC');
    expect(updated.experience[0].role).toBe('Director of Automatic Programming');
    expect(updated.education[0].institution).toBe('Yale University');
    expect(updated.education[0].degree).toBe('Ph.D. in Mathematics');
    expect(updated.capabilityGroups[0].title).toBe('Compilers');
    expect(updated.socialLinks[0].url).toBe('https://github.com/gracehopper');
    // Existing projects and appearance preserved
    expect(updated.projects.length).toBe(mockState.projects.length);
  });
});

describe('Pure TypeScript QR Code Generator', () => {
  it('generates a 2D boolean matrix with finder patterns', () => {
    const matrix = encodeQrMatrix('https://example.com');
    expect(Array.isArray(matrix)).toBe(true);
    expect(matrix.length).toBeGreaterThan(20);
    expect(matrix[0].length).toBe(matrix.length);

    // Top-left finder pattern check (7x7)
    expect(matrix[0][0]).toBe(true);
    expect(matrix[0][6]).toBe(true);
    expect(matrix[6][0]).toBe(true);
    expect(matrix[6][6]).toBe(true);
  });

  it('renders a valid SVG string with crisp rendering', () => {
    const svg = generateQrSvg('https://getopenportfolio.vercel.app', { size: 200 });
    expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('viewBox="0 0');
    expect(svg).toContain('width="200"');
    expect(svg).toContain('<path d="M');
    expect(svg).toContain('shape-rendering="crispEdges"');
  });
});

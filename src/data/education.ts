export interface EducationEntry {
  id: string;
  number: string;
  degree: string;
  institution: string;
  status: string;
  url?: string;
}

/** Demo education. Replace from /admin/education. */
export const EDUCATION_DATA: EducationEntry[] = [
  {
    id: 'edu-01',
    number: '01',
    degree: 'BSc in Computer Science',
    institution: 'Example University',
    status: 'IN PROGRESS',
    url: 'https://example.com',
  },
  {
    id: 'edu-02',
    number: '02',
    degree: 'Diploma in Interaction Design',
    institution: 'Example Institute of Technology',
    status: 'JUN 2023',
    url: 'https://example.com',
  },
];

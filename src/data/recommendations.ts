export interface Recommendation {
  id: string;
  number: string;
  name: string;
  company: string;
  quote: string;
}

/**
 * Demo testimonials.
 *
 * The names are placeholders, not real people. Never seed this file with a real
 * person's name and words — a quote attributed to someone who never said it is
 * a problem no licence covers. Replace from /admin/recommendations.
 */
export const RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'rec-01',
    number: '01',
    name: 'A. Placeholder',
    company: 'Northwind',
    quote:
      '“A clear thinker who works from the problem outward rather than from the screen inward. Asks for feedback early and actually uses it.”',
  },
  {
    id: 'rec-02',
    number: '02',
    name: 'B. Placeholder',
    company: 'Contoso',
    quote:
      '“Kept both user and business goals in view, and turned a genuinely complicated feature set into something people could use without a manual.”',
  },
];

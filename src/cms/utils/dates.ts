/**
 * Dates in this CMS are display-first.
 *
 * The site renders things like "Dec 2024 — Present" and "2024 — 2025", which no
 * single date type expresses: one end can be open, and project years carry no
 * month at all. So the structured fields are the source of truth where they
 * exist, and the original free-text label stays as a fallback for content
 * authored before the structured fields were added.
 *
 * Nothing here parses user input at render time — parsing happens once, during
 * seeding/migration, and the editor writes structured values from then on.
 */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const MONTH_LOOKUP: Record<string, number> = {};
[
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
].forEach((name, index) => {
  MONTH_LOOKUP[name] = index;
  MONTH_LOOKUP[name.slice(0, 3)] = index;
});

/** An ISO `YYYY-MM-DD`. The day is not shown anywhere; it exists because the
 *  date control requires a full date. */
export type IsoDate = string;

/** "Dec 2024" from "2024-12-01". */
export function formatMonthYear(iso: IsoDate | undefined): string {
  if (!iso) return '';
  const [year, month] = iso.split('-');
  const monthIndex = Number(month) - 1;
  if (!year || Number.isNaN(monthIndex) || !MONTHS[monthIndex]) return '';
  return `${MONTHS[monthIndex]} ${year}`;
}

/** Turn "Dec 2024", "March 2024" or "2024" into `YYYY-MM-DD`. */
export function parseMonthYear(text: string): IsoDate | undefined {
  const cleaned = text.trim().toLowerCase();
  if (!cleaned) return undefined;

  const withMonth = cleaned.match(/^([a-z]+)\.?\s+(\d{4})$/);
  if (withMonth) {
    const month = MONTH_LOOKUP[withMonth[1]];
    if (month === undefined) return undefined;
    return `${withMonth[2]}-${String(month + 1).padStart(2, '0')}-01`;
  }

  const yearOnly = cleaned.match(/^(\d{4})$/);
  if (yearOnly) return `${yearOnly[1]}-01-01`;

  return undefined;
}

export interface PeriodParts {
  startDate?: IsoDate;
  endDate?: IsoDate;
  current: boolean;
}

/**
 * Split a written period such as "Dec 2024 — Present" or "March 2024 — Dec 2024".
 * Returns `current: true` when the end reads as open.
 */
export function parsePeriod(label: string): PeriodParts {
  const [rawStart, rawEnd] = label.split(/\s*[—–-]\s*/);
  const current = /present|current|now|ongoing/i.test(rawEnd ?? '');

  return {
    startDate: parseMonthYear(rawStart ?? ''),
    endDate: current ? undefined : parseMonthYear(rawEnd ?? ''),
    current,
  };
}

/**
 * The label the site shows for a role. Uses the structured dates when they are
 * set, and otherwise falls back to whatever text the entry already had.
 */
export function formatPeriod(parts: {
  startDate?: IsoDate;
  endDate?: IsoDate;
  current?: boolean;
  period?: string;
}): string {
  const start = formatMonthYear(parts.startDate);
  if (!start) return parts.period ?? '';

  const end = parts.current ? 'Present' : formatMonthYear(parts.endDate);
  return end ? `${start} — ${end}` : start;
}

/** Split "2024 — 2025" or "2024" into its year bounds. */
export function parseYearRange(label: string): { startYear?: string; endYear?: string } {
  const years = (label.match(/\d{4}/g) ?? []).slice(0, 2);
  return { startYear: years[0], endYear: years[1] };
}

/** The label the site shows for a project or case study year. */
export function formatYearRange(parts: {
  startYear?: string;
  endYear?: string;
  year?: string;
}): string {
  if (!parts.startYear) return parts.year ?? '';
  if (!parts.endYear || parts.endYear === parts.startYear) return parts.startYear;
  return `${parts.startYear} — ${parts.endYear}`;
}

/** Selectable years, newest first — wide enough for past work and near-future. */
export function yearOptions(span = 30): string[] {
  const now = new Date().getFullYear();
  return Array.from({ length: span }, (_, i) => String(now + 2 - i));
}

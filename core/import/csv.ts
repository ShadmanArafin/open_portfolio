/**
 * CSV in, records out — for people arriving with a spreadsheet.
 *
 * Moving to a new site usually starts in a spreadsheet: a list of roles, of
 * degrees, of quotes from people. Retyping thirty rows into a form is where
 * people give up. Each screen that takes CSV publishes one fixed template
 * (its columns and what goes in them), and a file is read against it: columns
 * match by name in any order and any case, unknown ones are named back
 * rather than silently dropped, and a row missing a required value is skipped
 * with its line number.
 *
 * The parser is RFC 4180: quoted fields, doubled quotes, commas and newlines
 * inside quotes, CRLF or LF, a leading byte-order mark (Excel writes one).
 * Semicolon files, which European Excel writes, are recognised by their header.
 */

export interface CsvColumn {
  key: string;
  /** A row without it is skipped. */
  required?: boolean;
  /** What goes in it, shown on the screen and written into the template. */
  hint: string;
  /** A sample value for the template's example row. */
  example: string;
}

export interface CsvTemplate {
  /** Used for the template's file name: `experience` → `experience-template.csv`. */
  name: string;
  columns: CsvColumn[];
}

export interface CsvReadResult {
  rows: Record<string, string>[];
  /** Plain-language reasons, one per skipped row or ignored column. */
  problems: string[];
}

/** Hard ceilings: a portfolio list is tens of rows, not a data warehouse. */
export const MAX_CSV_BYTES = 1024 * 1024;
export const MAX_CSV_ROWS = 500;

export function parseCsv(text: string): string[][] {
  const source = text.replace(/^\uFEFF/, '');
  const firstLine = source.slice(0, source.search(/\r?\n|$/));
  const delimiter =
    !firstLine.includes(',') && firstLine.includes(';')
      ? ';'
      : firstLine.includes('\t') && !firstLine.includes(',')
        ? '\t'
        : ',';

  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < source.length; index++) {
    const char = source[index];
    if (quoted) {
      if (char === '"') {
        if (source[index + 1] === '"') {
          field += '"';
          index++;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"' && field === '') {
      quoted = true;
    } else if (char === delimiter) {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && source[index + 1] === '\n') index++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  // Blank lines carry nothing; spreadsheets leave them at the end.
  return rows.filter((cells) => cells.some((cell) => cell.trim() !== ''));
}

const normalise = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '');

export function readCsv(text: string, template: CsvTemplate): CsvReadResult {
  const problems: string[] = [];
  const [header, ...body] = parseCsv(text);
  if (!header) return { rows: [], problems: ['The file is empty.'] };

  const byName = new Map(template.columns.map((column) => [normalise(column.key), column.key]));
  const keys = header.map((name) => byName.get(normalise(name)) ?? null);
  const unknown = header.filter((_, index) => keys[index] === null && header[index].trim());
  if (unknown.length > 0) {
    problems.push(
      `Ignored column${unknown.length === 1 ? '' : 's'} not in the template: ${unknown.join(', ')}.`
    );
  }
  const missing = template.columns.filter(
    (column) => column.required && !keys.includes(column.key)
  );
  if (missing.length > 0) {
    return {
      rows: [],
      problems: [
        ...problems,
        `The file has no ${missing.map((column) => `“${column.key}”`).join(' or ')} column. Start from the template.`,
      ],
    };
  }

  const rows: Record<string, string>[] = [];
  body.forEach((cells, index) => {
    const line = index + 2;
    if (rows.length >= MAX_CSV_ROWS) {
      if (rows.length === MAX_CSV_ROWS && index === MAX_CSV_ROWS) {
        problems.push(`Only the first ${MAX_CSV_ROWS} rows were read.`);
      }
      return;
    }
    const row: Record<string, string> = {};
    keys.forEach((key, column) => {
      if (key) row[key] = (cells[column] ?? '').trim();
    });
    const empty = template.columns.find((column) => column.required && !row[column.key]);
    if (empty) {
      problems.push(`Line ${line} skipped: “${empty.key}” is empty.`);
      return;
    }
    rows.push(row);
  });

  return { rows, problems };
}

function quote(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** The template as a file: the header and one example row. */
export function templateCsv(template: CsvTemplate): string {
  const header = template.columns.map((column) => quote(column.key)).join(',');
  const example = template.columns.map((column) => quote(column.example)).join(',');
  return `${header}\r\n${example}\r\n`;
}

/** Yes/no cells as people type them. Empty is the fallback. */
export function csvBoolean(value: string | undefined, fallback: boolean): boolean {
  const cell = (value ?? '').trim().toLowerCase();
  if (['yes', 'y', 'true', '1', 'x'].includes(cell)) return true;
  if (['no', 'n', 'false', '0'].includes(cell)) return false;
  return fallback;
}

/** A date cell as an ISO day: `2023-04-01`, `2023-04` and `2023` all work. */
export function csvDate(value: string | undefined): string | undefined {
  const cell = (value ?? '').trim();
  const match = /^(\d{4})(?:-(\d{1,2}))?(?:-(\d{1,2}))?$/.exec(cell);
  if (!match) return undefined;
  const [, year, month = '1', day = '1'] = match;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}
